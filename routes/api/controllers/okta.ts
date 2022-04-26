import OktaJwtVerifier from "@okta/jwt-verifier";
import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../../../helpers.js";
import oktaConfig from "../../../oktaConfig.js";

export default class OktaController {

  private oktaJwtVerifier: OktaJwtVerifier

  constructor() {
    this.oktaJwtVerifier = new OktaJwtVerifier({
      clientId: oktaConfig.resourceServer.oidc.clientId,
      issuer: oktaConfig.resourceServer.oidc.issuer,
      assertClaims: oktaConfig.resourceServer.assertClaims
    });
  }

  authenticationRequired = async (request: Request, response: Response, next: NextFunction) => {

    try {

      const authHeader = request.headers.authorization || '';
      const match = authHeader.match(/Bearer (.+)/);

      if (!match) {
        throw new ErrorHandler(401, 'Unauthorized');
      }

      const accessToken = match[1];
      const audience = oktaConfig.resourceServer.assertClaims.aud;

      const jwt = await this.oktaJwtVerifier.verifyAccessToken(accessToken, audience);

      response.locals.jwt = jwt;

      next();

    } catch (error) {
      next(error)
    }
  }

}