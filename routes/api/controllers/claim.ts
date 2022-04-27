import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../../../helpers.js";
import Claim from "../models/claim.js";

export default class ClaimController {

  get = async (_: Request, res: Response, next: NextFunction) => {

    try {

      const claim = await Claim.get();

      res.status(200).json(claim);

    } catch (error) {
      next(error)
    }

  };

  add = async (_: Request, res: Response, next: NextFunction) => {

    try {

      if (typeof res.locals.jwt.claims.sub === "undefined") {
        throw new ErrorHandler(400, 'Bad Request');
      }

      const newClaim = await Claim.add(res.locals.jwt.claims.sub);

      res.status(200).json(newClaim);

    } catch (error) {
      next(error)
    }

  };


  close = async (req: Request, res: Response, next: NextFunction) => {

    try {

      if (!req.params.id) {
        throw new ErrorHandler(400, 'Bad Request');
      }

      const currentClaim = await Claim.getById(Number(req.params.id));

      if(currentClaim?.user != res.locals.jwt.claims.sub) {
        throw new ErrorHandler(500, 'Unauthorized');
      }

      const claim = Claim.close(Number(req.params.id));

      res.status(200).json(claim);

    } catch (error) {
      next(error)
    }

  };

}