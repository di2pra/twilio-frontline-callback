import { Request, Response } from "express";
import { getCustomerById, getCustomersList } from "../providers/customers.js";

const handleGetCustomerDetailsByCustomerIdCallback = async (req: Request, res: Response) => {
  const body = req.body;
  console.log('Getting Customer details: ', body.CustomerId);

  const customerId = body.CustomerId;

  // Fetch Customer Details based on his ID
  // and information about a worker, that requested that information
  const customerDetails = await getCustomerById(customerId);

  if (customerDetails) {
    // Respond with Contact object
    res.send({
      objects: {
        customer: {
          customer_id: customerDetails.customer_id,
          display_name: customerDetails.display_name,
          channels: customerDetails.channels,
          links: customerDetails.links,
          avatar: customerDetails.avatar,
          details: customerDetails.details
        }
      }
    });
  } else {
    res.send({})
  }


};

const handleGetCustomersListCallback = async (req: Request, res: Response) => {
  console.log('Getting Customers list');

  const body = req.body;
  const workerIdentity = req.body.Worker;
  const pageSize = parseInt(body.PageSize);
  const query : string | undefined = body.Query;
  const anchor = body.Anchor;

  // Fetch Customers list based on information about a worker, that requested it
  const customersList = await getCustomersList(workerIdentity, pageSize, anchor, query);

  // Respond with Customers object
  res.send({
    objects: {
      customers: customersList,
      searchable: true
    }
  });
};

const crmCallbackHandler = async (req: Request, res: Response) => {
  const location = req.body.Location;
  // Location helps to determine which information was requested.
  // CRM callback is a general purpose tool and might be used to fetch different kind of information

  switch (location) {
    case 'GetCustomerDetailsByCustomerId': {
      await handleGetCustomerDetailsByCustomerIdCallback(req, res);
      return;
    }
    case 'GetCustomersList': {
      await handleGetCustomersListCallback(req, res);
      return;
    }
    default: {
      console.log('Unknown location: ', location);
      res.sendStatus(422);
    }
  }
};

export default crmCallbackHandler;