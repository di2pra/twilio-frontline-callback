import { pgClient } from "./routes/providers/postgres.js";
import fs from "fs";
import twilioClient from "./routes/providers/twilioClient.js";

(async () => {
  try {

    const sql = fs.readFileSync('./scripts/reset_script.sql').toString();
    const result = await pgClient.query(sql);

    if (process.env.TWILIO_CONVERSATION_SERVICE_SID) {
      const conversationService = await twilioClient.conversations.services(process.env.TWILIO_CONVERSATION_SERVICE_SID).fetch();

      const conversations = await conversationService.conversations().list();

      for (const conversation of conversations) {
        await conversation.remove();
      }
    }

  } catch (e: any) {
    console.log(e.message);
  }
})();