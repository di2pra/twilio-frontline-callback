import * as hubspot from '@hubspot/api-client';
import { FilterGroup, PublicObjectSearchRequest } from '@hubspot/api-client/lib/codegen/crm/companies';
import { FilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/companies/models/Filter';
import { PublicOwner } from '@hubspot/api-client/lib/codegen/crm/owners';
const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_API_KEY })

export type IFrontlineCustomer = {
  customer_id: string | number,
  display_name: string,
  firstname: string,
  lastname: string,
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
  hs_owner_name: string;
  hs_owner_firstname: string;
  hs_owner_lastname: string;
  hs_owner_id: string;
  hs_owner_email: string;
}

export const findWorkerForCustomer = async (customerNumber: string): Promise<string | null> => {

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

      if (ownerData.email) {
        return ownerData.email
      } else {
        return null
      }


    } else {
      return null
    }

  } catch (e) {
    return null
  }

};

export const getCustomersList = async (worker: string, pageSize: number, anchor: string, query: string | undefined) => {

  let filterGroups : FilterGroup[] = [];

  if (query) {
    filterGroups = [
      {
        "filters": [
          {
            "propertyName": "firstname",
            "operator": "CONTAINS_TOKEN",
            "value": query
          }
        ]
      },
      {
        "filters": [
          {
            "propertyName": "lastname",
            "operator": "CONTAINS_TOKEN",
            "value": query
          }
        ]
      }
    ]
  }

  const publicObjectSearchRequest : PublicObjectSearchRequest = {
    filterGroups: filterGroups,
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

  const ownerList = await hubspotClient.crm.owners.ownersApi.getPage();

  const filteredOwner = ownerList.results.find((item) => item.email === worker);

  let list = result.results.map((customer: any) => ({
    display_name: `${customer.properties.firstname} ${customer.properties.lastname}`,
    customer_id: customer.id
  }));

  if (filteredOwner) {
    list = result.results.filter((item) => item.properties.hubspot_owner_id === filteredOwner.id).map((customer: any) => ({
      display_name: `${customer.properties.firstname} ${customer.properties.lastname}`,
      customer_id: customer.id
    }));
  }


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

export const getCustomerByNumber = async (customerNumber: string): Promise<IFrontlineCustomer | null> => {

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

      let ownerData: any = {};

      if (customerData.properties.hubspot_owner_id) {
        ownerData = await hubspotClient.crm.owners.ownersApi.getById(Number(customerData.properties.hubspot_owner_id));
      }

      return {
        customer_id: customerData.id,
        display_name: `${customerData.properties.firstname} ${customerData.properties.lastname}`,
        firstname: customerData.properties.firstname,
        lastname: customerData.properties.lastname,
        channels: [
          { type: 'email', value: customerData.properties.email },
          { type: 'sms', value: customerData.properties.hs_calculated_phone_number },
          { type: 'whatsapp', value: customerData.properties.hs_calculated_phone_number }
        ],
        worker: ownerData.email,
        hs_owner_name: `${ownerData.firstName} ${ownerData.lastName}`,
        hs_owner_firstname: ownerData.firstName,
        hs_owner_lastname: ownerData.lastName,
        hs_owner_email: ownerData.email,
        hs_owner_id: customerData.properties.hubspot_owner_id
      } as IFrontlineCustomer

    } else {
      return null
    }

  } catch (error) {
    return null
  }

};

export const getOwnerByEmail = async (email: string) : Promise<PublicOwner | undefined> => {
  const ownerList = await hubspotClient.crm.owners.ownersApi.getPage();
  return ownerList.results.find((item) => item.email === email);
}

export const getCustomerById = async (customerId: string): Promise<IFrontlineCustomer | null> => {

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

  try {

    const result = await hubspotClient.crm.contacts.searchApi.doSearch(publicObjectSearchRequest);

    if (result.results.length > 0) {

      const customerData = result.results[0];

      const ownerData = await hubspotClient.crm.owners.ownersApi.getById(Number(customerData.properties.hubspot_owner_id));

      return {
        customer_id: customerData.id,
        display_name: `${customerData.properties.firstname} ${customerData.properties.lastname}`,
        firstname: customerData.properties.firstname,
        lastname: customerData.properties.lastname,
        channels: [
          { type: 'email', value: customerData.properties.email },
          { type: 'sms', value: customerData.properties.hs_calculated_phone_number },
          { type: 'whatsapp', value: `whatsapp:${customerData.properties.hs_calculated_phone_number}` }
        ],
        details: {
          title: 'Commercial',
          content: `${ownerData.firstName} ${ownerData.lastName}`
        },
        links: [
          { type: 'Hubspot', value: `https://app-eu1.hubspot.com/contacts/25720060/contact/${customerData.id}`, display_name: `Fiche de ${customerData.properties.firstname} ${customerData.properties.lastname}` },
          { type: 'Commercial', value: `https://app-eu1.hubspot.com/contacts/25720060/contact/${customerData.id}`, display_name: `${ownerData.firstName} ${ownerData.lastName}` }
        ],
        worker: ownerData.email,
        hs_owner_email: ownerData.email,
        hs_owner_name: `${ownerData.firstName} ${ownerData.lastName}`,
        hs_owner_firstname: ownerData.firstName,
        hs_owner_lastname: ownerData.lastName,
        hs_owner_id: customerData.properties.hubspot_owner_id
      } as IFrontlineCustomer

    } else {
      return null
    }

  } catch (error) {
    return null
  }


};