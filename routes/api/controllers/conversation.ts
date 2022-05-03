import { NextFunction, Request, Response } from "express";
import Conversation from "../models/conversation.js";

export default class ConversationController {

  get = async (_: Request, res: Response, next: NextFunction) => {

    try {

      const conversations = await Conversation.getAll();

      res.status(200).json(conversations);

    } catch (error) {
      next(error)
    }

  };

  deleteAll = async (req: Request, res: Response, next: NextFunction) => {

    try {

      await Conversation.deleteAll();

      res.status(200).json({});

    } catch (error) {
      next(error)
    }

  };

}