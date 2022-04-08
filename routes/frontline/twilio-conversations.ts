import { Request, Response } from "express";
import { getCustomerByNumber } from "../providers/customers.js";
import twilioClient from "../providers/twilioClient.js";
import fetch from 'node-fetch';

const conversationsCallbackHandler = async (req: Request, res: Response) => {

	const eventType = req.body.EventType;

	switch (eventType) {
		case "onConversationAdd": {
			/* PRE-WEBHOOK
			 *
			 * This webhook will be called before creating a conversation.
			 * 
			 * It is required especially if Frontline Inbound Routing is enabled
			 * so that when the worker will be added to the conversation, they will
			 * see the friendly_name and avatar of the conversation.
			 * 
			 * More info about the `onConversationAdd` webhook: https://www.twilio.com/docs/conversations/conversations-webhooks#onconversationadd
			 * More info about handling incoming conversations: https://www.twilio.com/docs/frontline/handle-incoming-conversations
			 */
			let customerNumber = req.body['MessagingBinding.Address'];

			if (customerNumber) {

				customerNumber = (customerNumber.split(':').length > 1) ? customerNumber.split(':')[1] : customerNumber;
				const isIncomingConversation = !!customerNumber;


				if (isIncomingConversation) {
					let customerDetails = await getCustomerByNumber(customerNumber);

					if (customerDetails) {
						const conversationProperties = {
							friendly_name: customerDetails.display_name || customerNumber,
							attributes: JSON.stringify({
								avatar: customerDetails.avatar,
								hs_customer_id: customerDetails.customer_id,
								hs_customer_owner_email: customerDetails.hs_owner_email,
								hs_customer_owner_id: customerDetails.hs_owner_id,
								hs_name: customerDetails.display_name
							})
						};

						return res.status(200).send(conversationProperties)
					} else {
						return res.status(200).send({})
					}
				} else {
					return res.status(200).send({})
				}

			} else {
				return res.status(200).send({})
			}

			break;
		}
		case "onParticipantAdded": {
			/* POST-WEBHOOK
			 *
			 * This webhook will be called when a participant added to a conversation
			 * including customer in which we are interested in.
			 * 
			 * It is required to add customer_id information to participant and
			 * optionally his display_name and avatar.
			 * 
			 * More info about the `onParticipantAdded` webhook: https://www.twilio.com/docs/conversations/conversations-webhooks#onparticipantadded
			 * More info about the customer_id: https://www.twilio.com/docs/frontline/my-customers#customer-id
			 * And more here you can see all the properties of a participant which you can set: https://www.twilio.com/docs/frontline/data-transfer-objects#participant
			 */
			const conversationSid = req.body.ConversationSid;
			const participantSid = req.body.ParticipantSid;
			let customerNumber = req.body['MessagingBinding.Address'];
			const isCustomer = customerNumber && !req.body.Identity;

			if (isCustomer) {

				customerNumber = (customerNumber.split(':').length > 1) ? customerNumber.split(':')[1] : customerNumber;

				/* ================
				UPDATE PARTICIPANT CUSTOMER ATTRIBUTES
				================ */

				const customerParticipant = await twilioClient.conversations
					.conversations(conversationSid)
					.participants
					.get(participantSid)
					.fetch();

				const customerDetails = await getCustomerByNumber(customerNumber);

				if (customerDetails) {
					await setCustomerParticipantProperties(customerParticipant, customerDetails);

					const createNoteReq = await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
						method: "POST",
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
							'Authorization': 'Bearer ' + process.env.HUBSPOT_API_KEY
						},
						body: JSON.stringify({
							properties: {
								hs_timestamp: Date.now().toString(),
								hs_note_body: `Une nouvelle conversation avec ${customerDetails.display_name}.`,
								hubspot_owner_id: customerDetails.hs_owner_id
							}
						})
					});

					const createNoteResponse = await createNoteReq.json() as any;

					const addNoteToContactReq = await fetch(`https://api.hubapi.com/crm/v3/objects/notes/${createNoteResponse.id}/associations/contact/${customerDetails.customer_id}/202`, {
						method: "PUT",
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json',
							'Authorization': 'Bearer ' + process.env.HUBSPOT_API_KEY
						}
					});
				}


			}

			break;
		}
		case "onConversationAdded": {

			break;
		}
	}
	res.sendStatus(200);
};

const setCustomerParticipantProperties = async (customerParticipant: any, customerDetails: any) => {
	const participantAttributes = JSON.parse(customerParticipant.attributes);
	const customerProperties = {
		attributes: JSON.stringify({
			...participantAttributes,
			avatar: customerDetails.avatar,
			customer_id: customerDetails.customer_id,
			display_name: customerDetails.display_name,
			hs_owner_id: customerDetails.hs_owner_id,
			hs_owner_email: customerDetails.hs_owner_email
		})
	};

	// If there is difference, update participant
	if (customerParticipant.attributes !== customerProperties.attributes) {
		// Update attributes of customer to include customer_id
		await customerParticipant
			.update(customerProperties)
			.catch((e: any) => console.log("Update customer participant failed: ", e));
	}
}

export default conversationsCallbackHandler;