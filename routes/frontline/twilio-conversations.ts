import { Request, Response } from "express";
import { getCustomerByNumber } from "./providers/customers.js";
import twilioClient from "./providers/twilioClient.js";
import fetch from 'node-fetch';

const conversationsCallbackHandler = async (req : Request, res : Response) => {
    //res.locals.log("Conversations Callback");
    //res.locals.log(JSON.stringify(req.body));

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
            const customerNumber = req.body['MessagingBinding.Address'];
            const isIncomingConversation = !!customerNumber

            if (isIncomingConversation) {
                let customerDetails = await getCustomerByNumber(customerNumber) || {};

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
            const customerNumber = req.body['MessagingBinding.Address'];
            const isCustomer = customerNumber && !req.body.Identity;

            if (isCustomer) {
                const customerParticipant = await twilioClient.conversations
                    .conversations(conversationSid)
                    .participants
                    .get(participantSid)
                    .fetch();

                const customerDetails = await getCustomerByNumber(customerNumber) || {};

                await setCustomerParticipantProperties(customerParticipant, customerDetails);
            }

            break;
        }
        case "onConversationAdded": {


            const conversationSid = req.body.ConversationSid;
            const conversation = await twilioClient.conversations
            .conversations(conversationSid)
            .fetch();


            const conversationData = JSON.parse(conversation.attributes);

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
                        hs_note_body: `Une nouvelle conversation avec ${conversationData.hs_name}.`,
                        hubspot_owner_id: conversationData.hs_customer_owner_id
                    }
                })
            });

            const createNoteResponse = await createNoteReq.json() as any;

            console.log(`https://api.hubapi.com/crm/v3/objects/notes/${createNoteResponse.id}/associations/contact/${conversationData.hs_customer_id}/202`);

            const addNoteToContactReq = await fetch(`https://api.hubapi.com/crm/v3/objects/notes/${createNoteResponse.id}/associations/contact/${conversationData.hs_customer_id}/202`, {
                method: "PUT",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + process.env.HUBSPOT_API_KEY
                }
            });

            //console.log(createNoteResponse);
            
            
            break;
        }
    }
    res.sendStatus(200);
};

const setCustomerParticipantProperties = async (customerParticipant : any, customerDetails : any) => {
    const participantAttributes = JSON.parse(customerParticipant.attributes);
    const customerProperties = {
        attributes: JSON.stringify({
            ...participantAttributes,
            avatar: participantAttributes.avatar || customerDetails.avatar,
            customer_id: participantAttributes.customer_id || customerDetails.customer_id,
            display_name: participantAttributes.display_name || customerDetails.display_name
        })
    };

    // If there is difference, update participant
    if (customerParticipant.attributes !== customerProperties.attributes) {
        // Update attributes of customer to include customer_id
        await customerParticipant
            .update(customerProperties)
            .catch((e : any ) => console.log("Update customer participant failed: ", e));
    }
}

export default conversationsCallbackHandler;