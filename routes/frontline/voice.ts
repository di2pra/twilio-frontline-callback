import { Request, Response } from "express";

export const incomingVoiceCallbackHandler = async (req : Request, res : Response) => {

  const responseBody = `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Lea" language="fr-FR" ><prosody rate="medium">Bonjour bienvenue chez Mutuelle d'assurances du corps de santé français, je vous mets en relation avec votre conseiller.</prosody></Say><Connect action="https://${req.hostname}/frontline/callback/voiceAction"><Conversation serviceInstanceSid="ISa442c5ab66fc4935b3270d3b04c2f7bf" inboundTimeout="20"/></Connect></Response>`;

  res.setHeader('Content-Type', 'text/xml').status(200).send(responseBody);

};

export const incomingVoiceActionHandler = async (req : Request, res : Response) => {

  let responseBody = `<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`;


  if(req.body.Result === "dialed-call-incomplete") {
    responseBody = `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Lea" language="fr-FR" >Votre conseiller est occupé, je vous redirige vers le centre d'appel</Say><Dial>${process.env.FRONTLINE_CC_NUMBER}</Dial></Response>`;
  }

  res.setHeader('Content-Type', 'text/xml').status(200).send(responseBody);

};