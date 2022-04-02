import { Express } from 'express';
import crmCallbackHandler from './crm.js';

//const conversationsCallbackHandler = require('./twilio-conversations');
//const routingCallbackHandler = require('./routing');
//const outgoingConversationCallbackHandler = require('./outgoing-conversation');
//const templatesCallbackHandler = require('./templates');

export default (router: Express) => {

  //router.post("/callbacks/conversations", conversationsCallbackHandler);
  //router.post("/callbacks/routing", routingCallbackHandler);
  //router.post("/callbacks/outgoing-conversation", outgoingConversationCallbackHandler);
  router.post("/frontline/callbacks/crm", crmCallbackHandler);
  //router.post("/callbacks/templates", templatesCallbackHandler);
};