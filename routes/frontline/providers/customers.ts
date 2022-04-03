import * as hubspot from '@hubspot/api-client';
import { FilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/companies/models/Filter';
const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_API_KEY })

// Map between customer address and worker identity
// Used to determine to which worker route a new conversation with a particular customer
//
// {
//     customerAddress: workerIdentity
// }
//
// Example:
//     {
//         'whatsapp:+12345678': 'john@example.com'
//     }
export type IFrontlineCustomer = {
  customer_id: string | number,
  display_name: string,
  avatar?: string,
  channels: {
    type: string;
    value: string;
  }[],
  links: {
    type: string;
    value: string;
    display_name: string
  }[],
  details?: {
    [key: string]: string
  };
  worker: string;
  hs_owner_id: string;
  hs_owner_email: string;
}

// Customers list
// Example:
// [
//   {
//      customer_id: 98,
//      display_name: 'Bobby Shaftoe',
//      channels: [
//          { type: 'email', value: 'bobby@example.com' },
//          { type: 'sms', value: '+123456789' },
//          { type: 'whatsapp', value: 'whatsapp:+123456789' }
//      ],
//      links: [
//          { type: 'Facebook', value: 'https://facebook.com', display_name: 'Social Media Profile' }
//      ],
//      details:{
//          title: "Information",
//          content: "Status: Active" + "\n\n" + "Score: 100"
//      },
//      worker: 'john@example.com'
//   }
// ]

/*const customers = [
    {
        customer_id: 1,
        display_name: 'Jean-Pierre Foucault',
        channels: [
            { type: 'email', value: 'jpfoucault@tf1,fr' },
            { type: 'sms', value: '+14342018621' },
            { type: 'whatsapp', value: '+33644645117' }
        ],
        links: [
            { type: 'Facebook', value: 'https://facebook.com', display_name: 'Social Media Profile' }
        ],
        worker: 'prajendirane@twilio.com'
    },
    {
        customer_id: 2,
        display_name: 'Martine Marchand',
        channels: [
            { type: 'email', value: 'bobby@example.com' },
            { type: 'sms', value: '+16067555493' },
            { type: 'whatsapp', value: '+33644645117' }
        ],
        links: [
            { type: 'Facebook', value: 'https://facebook.com', display_name: 'Social Media Profile' }
        ],
        worker: 'prajendirane@twilio.com'
    }
];*/

export const findWorkerForCustomer = async (customerNumber: string): Promise<string | undefined> => {

  const publicObjectSearchRequest = {
    filterGroups: [
      { filters: [{ propertyName: 'hs_calculated_phone_number', operator: 'EQ' as FilterOperatorEnum, value: customerNumber }] }
    ],
    sorts: [JSON.stringify({ propertyName: 'lastmodifieddate', direction: 'ASCENDING' })],
    properties: [
      "email",
      "firstname",
      "lastname",
      "hs_calculated_phone_number",
      "hubspot_owner_id"
    ],
    limit: 1,
    after: 0
  }

  try {

    const result = await hubspotClient.crm.contacts.searchApi.doSearch(publicObjectSearchRequest);

    if (result.results.length > 0) {

      const customerData = result.results[0];

      const ownerData = await hubspotClient.crm.owners.ownersApi.getById(Number(customerData.properties.hubspot_owner_id));

      return ownerData.email


    } else {
      return undefined
    }

  } catch (e) {
    return undefined
  }

};

export const getCustomersList = async (worker: string, pageSize: number, anchor: string) => {

  const publicObjectSearchRequest = {
    filterGroups: [],
    sorts: [JSON.stringify([{ propertyName: 'lastmodifieddate', direction: 'ASCENDING' }])],
    properties: [
      "email",
      "firstname",
      "lastname",
      "hs_calculated_phone_number",
      "hubspot_owner_id"
    ],
    limit: pageSize,
    after: 0
  }

  const result = await hubspotClient.crm.contacts.searchApi.doSearch(publicObjectSearchRequest);

  const list = result.results.map((customer: any) => ({
    display_name: `${customer.properties.firstname} ${customer.properties.lastname}`,
    customer_id: customer.id
  }));

  if (!pageSize) {
    return list
  }

  if (anchor) {
    const lastIndex = list.findIndex((c: any) => String(c.customer_id) === String(anchor))
    const nextIndex = lastIndex + 1
    return list.slice(nextIndex, nextIndex + pageSize)
  } else {
    return list.slice(0, pageSize)
  }
};

export const getCustomerByNumber = async (customerNumber: string): Promise<IFrontlineCustomer> => {

  const publicObjectSearchRequest = {
    filterGroups: [
      { filters: [{ propertyName: 'hs_calculated_phone_number', operator: 'EQ' as FilterOperatorEnum, value: customerNumber }] }
    ],
    sorts: [JSON.stringify({ propertyName: 'lastmodifieddate', direction: 'ASCENDING' })],
    properties: [
      "email",
      "firstname",
      "lastname",
      "hs_calculated_phone_number",
      "hubspot_owner_id"
    ],
    limit: 1,
    after: 0
  }

  const result = await hubspotClient.crm.contacts.searchApi.doSearch(publicObjectSearchRequest);

  if (result.results.length > 0) {

    const customerData = result.results[0];

    const ownerData = await hubspotClient.crm.owners.ownersApi.getById(Number(customerData.properties.hubspot_owner_id));

    return {
      customer_id: customerData.id,
      display_name: `${customerData.properties.firstname} ${customerData.properties.lastname}`,
      channels: [
        { type: 'email', value: customerData.properties.email },
        { type: 'sms', value: customerData.properties.hs_calculated_phone_number },
        { type: 'whatsapp', value: customerData.properties.hs_calculated_phone_number }
      ],
      hs_owner_email: ownerData.email,
      hs_owner_id: customerData.properties.hubspot_owner_id
    } as IFrontlineCustomer

  } else {
    return {} as IFrontlineCustomer
  }
};

export const getCustomerById = async (customerId: string): Promise<IFrontlineCustomer> => {

  const filter = { propertyName: 'hs_object_id', operator: 'EQ' as FilterOperatorEnum, value: customerId }
  const filterGroup = { filters: [filter] }
  const properties = [
    "email",
    "firstname",
    "lastname",
    "hs_calculated_phone_number",
    "hubspot_owner_id"
  ];
  const limit = 1
  const after = 0

  const publicObjectSearchRequest = {
    filterGroups: [filterGroup],
    properties,
    limit,
    sorts: [],
    after
  }

  const result = await hubspotClient.crm.contacts.searchApi.doSearch(publicObjectSearchRequest);

  if (result.results.length > 0) {

    const customerData = result.results[0];

    return {
      customer_id: customerData.id,
      display_name: `${customerData.properties.firstname} ${customerData.properties.lastname}`,
      channels: [
        { type: 'email', value: customerData.properties.email },
        { type: 'sms', value: customerData.properties.hs_calculated_phone_number },
        { type: 'whatsapp', value: customerData.properties.hs_calculated_phone_number }
      ],
      links: [
        { type: 'Hubspot', value: `https://app-eu1.hubspot.com/contacts/25720060/contact/${customerData.id}`, display_name: `Fiche de ${customerData.properties.firstname} ${customerData.properties.lastname}` }
      ],
      worker: 'prajendirane@twilio.com'
    } as IFrontlineCustomer

  } else {
    return {} as IFrontlineCustomer
  }
};