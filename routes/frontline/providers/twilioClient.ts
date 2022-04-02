import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const twilioApiKey: string = process.env.TWILIO_API_KEY || '';
const twilioApiSecret: string = process.env.TWILIO_API_SECRET || '';

export default twilio(twilioApiKey, twilioApiSecret, { accountSid: accountSid });