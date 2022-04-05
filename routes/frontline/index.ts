import { Express } from 'express';
import crmCallbackHandler from './crm.js';
import outgoingConversationCallbackHandler from './outgoing-conversation.js';
import routingCallbackHandler from './routing.js';
import templatesCallbackHandler from './templates.js';
import conversationsCallbackHandler from './twilio-conversations.js';
import { incomingVoiceActionHandler, incomingVoiceCallbackHandler, incomingVoiceStatusCallbackHandler } from './voice.js';

export default (router: Express) => {

  router.post("/frontline/callbacks/conversations", conversationsCallbackHandler);
  router.post("/frontline/callbacks/routing", routingCallbackHandler);
  router.post("/frontline/callbacks/outgoing-conversation", outgoingConversationCallbackHandler);
  router.post("/frontline/callbacks/crm", crmCallbackHandler);
  router.post("/frontline/callbacks/templates", templatesCallbackHandler);
  router.post("/frontline/callbacks/voiceIncoming", incomingVoiceCallbackHandler);
  router.post("/frontline/callback/voiceAction", incomingVoiceActionHandler);
  router.post("/frontline/callback/voiceStatus", incomingVoiceStatusCallbackHandler);
};