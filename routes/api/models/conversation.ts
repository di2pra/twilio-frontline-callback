import { ErrorHandler } from "../../../helpers.js";
import twilioClient from "../../providers/twilioClient.js";

export default class Conversation {

  static getAll = async () => {
    try {
      
      const conversationService = await twilioClient.conversations.services(process.env.TWILIO_CONVERSATION_SERVICE_SID || '').fetch();
      return await conversationService.conversations().list();
      
    } catch (error: any) {
      throw new ErrorHandler(500, `Internal Error : ${error.message}`)
    }
  };

  static deleteAll = async () => {
    try {

      const conversationService = await twilioClient.conversations.services(process.env.TWILIO_CONVERSATION_SERVICE_SID || '').fetch();

      const conversations = await conversationService.conversations().list();

      for (const conversation of conversations) {
        await conversation.remove();
      }

    } catch (error: any) {
      throw new ErrorHandler(500, `Internal Error : ${error.message}`)
    }
  };

}