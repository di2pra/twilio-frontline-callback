import { PublicOwner } from "@hubspot/api-client/lib/codegen/crm/owners";
import { Request, Response } from "express";
import { getCustomerById, getOwnerByEmail, IFrontlineCustomer } from "../providers/customers.js";
import { sqliteDb } from "../providers/sqlite.js";

const templatesCallbackHandler = async (req: Request, res: Response) => {
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

const handleGetTemplatesByCustomerIdCallback = async (req: Request, res: Response) => {
    const body = req.body
    console.log('Getting templates: ', body.CustomerId);

    const workerIdentity = body.Worker;
    const customerId = body.CustomerId;

    const customerDetails = await getCustomerById(customerId);

    if (!customerDetails) {
        return res.status(404).send("Customer not found");
    }

    const workerDetails = await getOwnerByEmail(workerIdentity);

    if (!workerDetails) {
        return res.status(404).send("Worker not found");
    }

    const categories = sqliteDb.prepare('SELECT * FROM category').all();

    const templates = sqliteDb.prepare('SELECT * FROM template').all();

    const data = categories.map(category => {
        return {
            display_name: category.display_name,
            templates: templates.filter(item => item.category_id === category.id).map(item => {
                return {
                    content: compileTemplate(item.content, customerDetails, workerDetails),
                    whatsAppApproved: item.whatsAppApproved === 0 ? false : true
                }
            })
        }
    })

    // Respond with compiled Templates
    res.send(data);
};

const compileTemplate = (template: string, customer: IFrontlineCustomer, workerDetails: PublicOwner): string => {
    let compiledTemplate = template.replace(/{{customerFirstname}}/, customer.firstname);
    compiledTemplate = compiledTemplate.replace(/{{customerLastname}}/, customer.lastname);
    compiledTemplate = compiledTemplate.replace(/{{agentFirstname}}/, workerDetails.firstName || '');
    compiledTemplate = compiledTemplate.replace(/{{agentLastname}}/, workerDetails.lastName || '');
    compiledTemplate = compiledTemplate.replace(/{{companyNameLong}}/, "Macsf");
    compiledTemplate = compiledTemplate.replace(/{{companyNameShort}}/, "Macsf");
    return compiledTemplate;
};

export default templatesCallbackHandler;