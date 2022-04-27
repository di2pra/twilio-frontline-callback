import { PublicOwner } from "@hubspot/api-client/lib/codegen/crm/owners";
import { Request, Response } from "express";
import Category from "../api/models/category.js";
import Configuration, { IConfiguration } from "../api/models/configuration.js";
import Template from "../api/models/template.js";
import { getCustomerById, getOwnerByEmail, IFrontlineCustomer } from "../providers/customers.js";

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

    const categories = await Category.getAll();
    const templates = await Template.getAll();
    const configuration = await Configuration.get();

    const data = categories.map(category => {
        return {
            display_name: category.display_name,
            templates: templates.filter(item => item.category_id === category.id).map(item => {
                return {
                    content: compileTemplate(item.content, customerDetails, workerDetails, configuration),
                    whatsAppApproved: item.whatsapp_approved
                }
            })
        }
    })

    // Respond with compiled Templates
    res.send(data);
};

const compileTemplate = (template: string, customer: IFrontlineCustomer, workerDetails: PublicOwner, configuration: IConfiguration | null): string => {

    let compiledTemplate = template.replace(/{{customerFirstname}}/, customer.firstname);
    compiledTemplate = compiledTemplate.replace(/{{customerLastname}}/, customer.lastname);
    compiledTemplate = compiledTemplate.replace(/{{agentFirstname}}/, workerDetails.firstName || '');
    compiledTemplate = compiledTemplate.replace(/{{agentLastname}}/, workerDetails.lastName || '');
    
    if (configuration) {
        compiledTemplate = compiledTemplate.replace(/{{companyNameLong}}/, configuration.info.companyNameLong);
        compiledTemplate = compiledTemplate.replace(/{{companyNameShort}}/, configuration.info.companyNameShort);
    }

    return compiledTemplate;
};

export default templatesCallbackHandler;