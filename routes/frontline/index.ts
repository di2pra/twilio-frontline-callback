import { Express } from 'express';
import crmCallbackHandler from './crm.js';
import outgoingConversationCallbackHandler from './outgoing-conversation.js';
import routingCallbackHandler from './routing.js';
import templatesCallbackHandler from './templates.js';
import conversationsCallbackHandler from './twilio-conversations.js';
import twilio from 'twilio';
import { incomingVoiceActionHandler, incomingVoiceCallbackHandler, incomingVoiceStatusCallbackHandler, outgoingVoiceStatusCallbackHandler } from './voice.js';

export default (router: Express) => {

  if (process.env.NODE_ENV != 'development') {
    router.use('/frontline', twilio.webhook({protocol: 'https'}));
  }

  router.post("/frontline/callbacks/conversations", conversationsCallbackHandler);
  router.post("/frontline/callbacks/routing", routingCallbackHandler);
  router.post("/frontline/callbacks/outgoing-conversation", outgoingConversationCallbackHandler);
  router.post("/frontline/callbacks/crm", crmCallbackHandler);
  router.post("/frontline/callbacks/templates", templatesCallbackHandler);
  router.post("/frontline/callbacks/voiceIncoming", incomingVoiceCallbackHandler);
  router.post("/frontline/callback/voiceAction", incomingVoiceActionHandler);
  router.post("/frontline/callback/incomingVoiceStatus", incomingVoiceStatusCallbackHandler);
  router.post("/frontline/callback/outgoingVoiceStatus", outgoingVoiceStatusCallbackHandler);
};