import { Request, Response } from "express";

const outgoingConversationCallbackHandler = (req: Request, res: Response) => {
  console.log('outgoingConversationCallbackHandler');

  const location = req.body.Location;

  // Location helps to determine which action to perform.
  switch (location) {
    case 'GetProxyAddress': {
      handleGetProxyAddress(req, res);
      return;
    }

    default: {
      console.log('Unknown location: ', location);
      res.sendStatus(422);
    }
  }
};

const handleGetProxyAddress = (req: Request, res: Response) => {
  console.log('Getting Proxy Address');

  const body = req.body;
  const channelName = body.ChannelType;

  const proxyAddress = getCustomerProxyAddress(channelName);

  // In order to start a new conversation ConversationsApp need a proxy address
  // otherwise the app doesn't know from which number send a message to a customer
  if (proxyAddress) {

    console.log({ proxy_address: proxyAddress })

    res.status(200).send({ proxy_address: proxyAddress });
    console.log("Got proxy address!");
    return;
  }

  console.log("Proxy address not found");
  res.sendStatus(403);
};

const getCustomerProxyAddress = (channelName: string) => {
  if (channelName === 'whatsapp') {
    return process.env.FRONTLINE_NUMBER;
  } else {
    return process.env.FRONTLINE_NUMBER;
  }
};

export default outgoingConversationCallbackHandler;