import { Request, Response } from "express";
import { getCustomerById, IFrontlineCustomer } from "./providers/customers.js";

const templatesCallbackHandler = async (req : Request, res : Response) => {
    const location = req.body.Location;

    // Location helps to determine which information was requested.
    // CRM callback is a general purpose tool and might be used to fetch different kind of information
    switch (location) {
        case 'GetTemplatesByCustomerId': {
            await handleGetTemplatesByCustomerIdCallback(req, res);
            return;
        }

        default: {
            console.log('Unknown location: ', location);
            res.sendStatus(422);
        }
    }
};

const handleGetTemplatesByCustomerIdCallback = async (req : Request, res : Response) => {
    const body = req.body
    console.log('Getting templates: ', body.CustomerId);

    const workerIdentity = body.Worker;
    const customerId = body.CustomerId;
    const conversationSid = body.ConversationSid;

    const customerDetails = await getCustomerById(customerId);

    if (!customerDetails) {
        return res.status(404).send("Customer not found");
    }

    // Prepare templates categories
    const openersCategory = {
        display_name: 'Démarrer une conversation', // Category name
        templates: [
            { content: compileTemplate(OPENER_NEXT_STEPS, customerDetails) },
            { content : compileTemplate(WHATSAPP_MSG, customerDetails), whatsAppApproved: true},
            { content : compileTemplate(WHATSAPP_MSG_2, customerDetails), whatsAppApproved: true}
        ]
    };
    const repliesCategory = {
        display_name: 'Répondre à un message',
        templates: [
            { content: compileTemplate(REPLY_SENT, customerDetails) }
        ]
    };
    const closingCategory = {
        display_name: 'Clore une conversation',
        templates: [
            { content: compileTemplate(CLOSING_ASK_REVIEW, customerDetails) },
        ]
    };

    // Respond with compiled Templates
    res.send([openersCategory, repliesCategory, closingCategory]);
};

const compileTemplate = (template : string, customer : IFrontlineCustomer) => {
    let compiledTemplate = template.replace(/{{Name}}/, customer.display_name);
    compiledTemplate = compiledTemplate.replace(/{{Author}}/, customer.hs_owner_name);

    compiledTemplate = compiledTemplate.replace(/{{customerFirstname}}/, customer.firstname);
    compiledTemplate = compiledTemplate.replace(/{{agentFirstname}}/, customer.hs_owner_firstname);
    compiledTemplate = compiledTemplate.replace(/{{agentLastname}}/, customer.hs_owner_lastname);
    compiledTemplate = compiledTemplate.replace(/{{companyName}}/, "MACSF");
    return compiledTemplate;
};

const OPENER_NEXT_STEPS = 'Bonjour {{Name}} nous avons traité vos documents, vous pouvez me contacter ici. {{Author}}.';
const WHATSAPP_MSG = `Bonjour {{customerFirstname}}, je suis {{agentFirstname}} {{agentLastname}}, votre conseiller chez {{companyName}}, je me permets de vous contacter pour qu'on puisse discuter de votre contrat. Envoyez moi un message dès que vous êtes disponible. Merci.`;
const WHATSAPP_MSG_2 = `Hi {{customerFirstname}}, were we able to solve the issue that you were facing?`;
/*const OPENER_NEW_PRODUCT = 'Hello {{Name}} we have a new product out which may be of interest to your business. Drop me a message. {{Author}}.';
const OPENER_ON_MY_WAY ='Just to confirm I am on my way to your office. {{Name}}.';*/

const REPLY_SENT = 'Toutes les réductions indiquées sont appliquées après signature. {{Author}}.';
/*const REPLY_RATES = 'Our rates for any loan are 20% or 30% over $30,000. You can read more at https://example.com. {{Author}}.';
const REPLY_OMW = 'Just to confirm I am on my way to your office. {{Author}}.';
const REPLY_OPTIONS = 'Would you like me to go over some options with you {{Name}}? {{Author}}.';
const REPLY_ASK_DOCUMENTS = 'We have a secure drop box for documents. Can you attach and upload them here: https://example.com. {{Author}}';*/

const CLOSING_ASK_REVIEW = 'Je vous remercie de m\'avoir contacté, {{Name}}. Si vous avez d\'autres questions, n\'hésitez à me recontacter sur ce même numéro. {{Author}}.';

export default templatesCallbackHandler;