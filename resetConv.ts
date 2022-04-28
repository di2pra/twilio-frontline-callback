import twilioClient from "./routes/providers/twilioClient";


(async () => {
  try {

    const conversationService = await twilioClient.conversations.services('ISa442c5ab66fc4935b3270d3b04c2f7bf').fetch();

    console.log(conversationService.friendlyName);

  } catch (e) {
    // Deal with the fact the chain failed
  }
  // `text` is not available here
})();