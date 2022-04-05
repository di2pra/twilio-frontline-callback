import * as hubspot from '@hubspot/api-client';
import { FilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/companies/models/Filter';
const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_API_KEY })

const HubspotFrontlineUserMapping : {
  [key: string] : {
    hs_owner_id: string;
    name: string;
  }
} = {
  'prajendirane@twilio.com': {
    hs_owner_id: '297097185',
    name: 'Pradheep Rajendirane'
  },
  'razrhar+frontline@twilio.com': {
    hs_owner_id: '300681927',
    name: 'Radia Azrhar'
  },
  'spaltrie+frontline@twilio.com': {
    hs_owner_id: '301488375',
    name: 'Sébastien Paltrié'
  }
}

const FrontlineHubspotUserMapping : {
  [key: string] : {
    frontline_id: string;
    name: string;
  }
} = {
  '297097185': {
    frontline_id: 'prajendirane@twilio.com',
    name: 'Pradheep Rajendirane'
  },
  '300681927': {
    frontline_id: 'razrhar+frontline@twilio.com',
    name: 'Radia Azrhar'
  },
  '301488375': {
    frontline_id: 'spaltrie+frontline@twilio.com',
    name: 'Sébastien Paltrié'
  }
}

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
  hs_owner_id?: string;
  hs_owner_email?: string;
}

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
    limit: 100,
    after: 0
  }

  const result = await hubspotClient.crm.contacts.searchApi.doSearch(publicObjectSearchRequest);

  const list = result.results.filter((item) => item.properties.hubspot_owner_id === HubspotFrontlineUserMapping[worker].hs_owner_id).map((customer: any) => ({
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
      details: {
        title: 'Commercial',
        content: FrontlineHubspotUserMapping[customerData.properties.hubspot_owner_id].name
      },
      links: [
        { type: 'Hubspot', value: `https://app-eu1.hubspot.com/contacts/25720060/contact/${customerData.id}`, display_name: `Fiche de ${customerData.properties.firstname} ${customerData.properties.lastname}` },
        { type: 'Commercial', value: `https://app-eu1.hubspot.com/contacts/25720060/contact/${customerData.id}`, display_name: FrontlineHubspotUserMapping[customerData.properties.hubspot_owner_id].name }
      ],
      worker: 'prajendirane@twilio.com'
    } as IFrontlineCustomer

  } else {
    return {} as IFrontlineCustomer
  }
};