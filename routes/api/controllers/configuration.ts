import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../../../helpers.js";
import Configuration from "../models/configuration.js";

export default class ConfigurationController {

  get = async (_: Request, res: Response, next: NextFunction) => {

    try {

      const configuration = await Configuration.get();

      res.status(200).json(configuration);

    } catch (error) {
      next(error)
    }

  };

  add = async (req: Request, res: Response, next: NextFunction) => {

    try {

      if (typeof req.body.info === "undefined") {
        throw new ErrorHandler(400, 'Bad Request');
      }

      const newConfiguration = await Configuration.add(req.body.info, res.locals.jwt.claims.sub);

      res.status(200).json(newConfiguration);

    } catch (error) {
      next(error)
    }

  };

}