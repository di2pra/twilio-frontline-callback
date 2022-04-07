import { Request, Response } from "express";
import { getCustomerByNumber } from "./providers/customers.js";
import fetch from 'node-fetch';
import twilioClient from "./providers/twilioClient.js";

export const incomingVoiceCallbackHandler = async (req: Request, res: Response) => {

  const from = req.body.From;

  const customerDetails = await getCustomerByNumber(from);

  let responseBody = `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Lea" language="fr-FR" >Bonjour, bienvenue chez Mutuelle d'assurances du corps de santé français.</Say><Say voice="Polly.Lea" language="fr-FR" >Je vous redirige vers le premier conseiller disponible de notre centre d'appel.</Say><Dial>${process.env.FRONTLINE_CC_NUMBER}</Dial></Response>`;

  if (customerDetails) {
    responseBody = `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Lea" language="fr-FR" >Bonjour, bienvenue chez Mutuelle d'assurances du corps de santé français, je vous mets en relation avec votre conseiller.</Say><Connect action="https://${req.hostname}/frontline/callback/voiceAction"><Conversation serviceInstanceSid="ISa442c5ab66fc4935b3270d3b04c2f7bf" inboundTimeout="20"/></Connect></Response>`;
  }

  res.setHeader('Content-Type', 'text/xml').status(200).send(responseBody);

};

export const incomingVoiceActionHandler = async (req: Request, res: Response) => {

  let responseBody = `<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`;


  if (req.body.Result === "dialed-call-incomplete") {
    responseBody = `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Lea" language="fr-FR" >Votre conseiller est occupé, je vous redirige vers le centre d'appel</Say><Dial>${process.env.FRONTLINE_CC_NUMBER}</Dial></Response>`;
  } else if (req.body.Result === "no-other-participants" || req.body.Result === "internal-error") {
    responseBody = `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Lea" language="fr-FR" >Je vous redirige vers le premier conseiller disponible de notre centre d'appel.</Say><Dial>${process.env.FRONTLINE_CC_NUMBER}</Dial></Response>`;
  }

  res.setHeader('Content-Type', 'text/xml').status(200).send(responseBody);

};

export const incomingVoiceStatusCallbackHandler = async (req: Request, res: Response) => {

  if (req.body.CallStatus === 'completed') {

    let customerNumber = req.body.From

    const customerDetails = await getCustomerByNumber(customerNumber);

    if (customerDetails) {

      const createCallReq = await fetch('https://api.hubapi.com/crm/v3/objects/calls', {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.HUBSPOT_API_KEY
        },
        body: JSON.stringify({
          properties: {
            hs_timestamp: Date.now().toString(),
            hs_call_title: `Appel entrant avec ${customerDetails.display_name}`,
            hs_call_direction: "INBOUND",
            hs_call_disposition: "f240bbac-87c9-4f6e-bf70-924b57d47db7",
            hs_call_body: `Appel entrant avec ${customerDetails.display_name}`,
            hs_call_duration: req.body.CallDuration * 1000,
            hs_call_from_number: req.body.From,
            hs_call_to_number: req.body.To,
            hs_call_status: "COMPLETED"
          }
        })
      });

      const createCallResponse = await createCallReq.json() as any;

      await fetch(`https://api.hubapi.com/crm/v3/objects/calls/${createCallResponse.id}/associations/contact/${customerDetails.customer_id}/194`, {
        method: "PUT",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + process.env.HUBSPOT_API_KEY
        }
      });

    }

  }

  res.status(200).send();

};


export const outgoingVoiceStatusCallbackHandler = async (req: Request, res: Response) => {

  if (req.body.CallStatus === 'completed') {

    const callSid = req.body.CallSid;

    const childCall = await twilioClient.calls.list({
      parentCallSid: callSid,
      limit: 1
    });

    if(childCall.length > 0) {

      const callDetails = childCall[0];

      const customerNumber = callDetails.to;

      const customerDetails = await getCustomerByNumber(customerNumber);

      if (customerDetails) {

        const createCallReq = await fetch('https://api.hubapi.com/crm/v3/objects/calls', {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.HUBSPOT_API_KEY
          },
          body: JSON.stringify({
            properties: {
              hs_timestamp: Date.now().toString(),
              hs_call_title: `Appel sortant avec ${customerDetails.display_name}`,
              hs_call_direction: "OUTBOUND",
              hs_call_disposition: "f240bbac-87c9-4f6e-bf70-924b57d47db7",
              hs_call_body: `Appel sortant avec ${customerDetails.display_name}`,
              hs_call_duration: Number(callDetails.duration) * 1000,
              hs_call_from_number: callDetails.from,
              hs_call_to_number: callDetails.to,
              hs_call_status: "COMPLETED"
            }
          })
        });
  
        const createCallResponse = await createCallReq.json() as any;
  
        await fetch(`https://api.hubapi.com/crm/v3/objects/calls/${createCallResponse.id}/associations/contact/${customerDetails.customer_id}/194`, {
          method: "PUT",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.HUBSPOT_API_KEY
          }
        });
  
      }

    }

  }

  res.status(200).send();

};