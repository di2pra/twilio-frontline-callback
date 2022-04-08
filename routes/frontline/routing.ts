import { Request, Response } from "express";
import { findWorkerForCustomer } from "../providers/customers.js";
import twilioClient from "../providers/twilioClient.js";

const routingCallbackHandler = async (req : Request, res : Response) => {
    const conversationSid = req.body.ConversationSid;
    let customerNumber = req.body['MessagingBinding.Address'];
    customerNumber = (customerNumber.split(':').length > 1) ? customerNumber.split(':')[1] : customerNumber;

    await routeConversation(conversationSid, customerNumber);
    res.sendStatus(200);
};

const routeConversation = async (conversationSid : string, customerNumber : string) => {
    let workerIdentity = await findWorkerForCustomer(customerNumber);

    if (!workerIdentity) { // Customer doesn't have a worker

        // Or you can define default worker for unknown customers.
        //workerIdentity = 'prajendirane@twilio.com'

        console.warn("Routing failed, please add workers to customersToWorkersMap or define a default worker", { conversationSid: conversationSid });
        return;
    }

    await routeConversationToWorker(conversationSid, workerIdentity);
}

const routeConversationToWorker = async (conversationSid : string, workerIdentity : string) => {
    // Add worker to the conversation with a customer
    twilioClient.conversations
        .conversations(conversationSid)
        .participants
        .create({ identity: workerIdentity })
        .then(participant => console.log('Create agent participant: ', participant.sid))
        .catch(e => console.log('Create agent participant: ', e));
}

export default routingCallbackHandler;