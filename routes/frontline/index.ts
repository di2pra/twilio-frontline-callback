import { Express } from 'express';
import crmCallbackHandler from './crm.js';
import routingCallbackHandler from './routing.js';
import conversationsCallbackHandler from './twilio-conversations.js';
import { incomingVoiceActionHandler, incomingVoiceCallbackHandler } from './voice.js';

//const routingCallbackHandler = require('./routing');
//const outgoingConversationCallbackHandler = require('./outgoing-conversation');
//const templatesCallbackHandler = require('./templates');

export default (router: Express) => {

  router.post("/frontline/callbacks/conversations", conversationsCallbackHandler);
  router.post("/frontline/callbacks/routing", routingCallbackHandler);
  //router.post("/callbacks/outgoing-conversation", outgoingConversationCallbackHandler);
  router.post("/frontline/callbacks/crm", crmCallbackHandler);
  //router.post("/callbacks/templates", templatesCallbackHandler);
  router.post("/frontline/callbacks/voiceIncoming", incomingVoiceCallbackHandler);
  router.post("/frontline/callback/voiceAction", incomingVoiceActionHandler);
};