import { Request, Response } from "express";

export const incomingVoiceCallbackHandler = async (req : Request, res : Response) => {

  const responseBody = `<?xml version="1.0" encoding="UTF-8"?><Response><Connect action="https://${req.hostname}/frontline/callback/voiceAction"><Conversation serviceInstanceSid="ISa442c5ab66fc4935b3270d3b04c2f7bf" inboundTimeout="20"/></Connect></Response>`;

  res.setHeader('Content-Type', 'text/xml').status(200).send(responseBody);

};

export const incomingVoiceActionHandler = async (req : Request, res : Response) => {

  let responseBody = `<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`;


  if(req.body.Result === "dialed-call-incomplete") {
    responseBody = `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Lea" language="fr-FR" >Votre conseiller est occupé, je vous redirige vers le centre d'appel</Say><Dial>${process.env.FRONTLINE_CC_NUMBER}</Dial></Response>`;
  } else if (req.body.Result === "failed-create-conversation") {
    responseBody = `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Lea" language="fr-FR" >Je vous redirige vers le premier conseiller disponible de notre centre d'appel.</Say><Dial>${process.env.FRONTLINE_CC_NUMBER}</Dial></Response>`;
  }

  res.setHeader('Content-Type', 'text/xml').status(200).send(responseBody);

};