import { Express } from 'express';
import OktaController from './controllers/okta.js';
import pg from 'pg';
import TemplateController from './controllers/template.js';
import ConfigurationController from './controllers/configuration.js';
import ClaimController from './controllers/claim.js';

export default (router: Express) => {

  const oktaController = new OktaController();
  const templateController = new TemplateController();
  const configurationController = new ConfigurationController();
  const claimController = new ClaimController();
  

  router.use('/api', oktaController.authenticationRequired);

  router.get("/api/v1/template", templateController.get);
  router.post("/api/v1/template", claimController.validateClaim, templateController.add);
  router.delete("/api/v1/template/:id", claimController.validateClaim, templateController.delete);

  router.get("/api/v1/configuration", configurationController.get);
  router.post("/api/v1/configuration", claimController.validateClaim, configurationController.add);

  router.get("/api/v1/claim", claimController.get);
  router.post("/api/v1/claim", claimController.add);
  router.put("/api/v1/claim/:id", claimController.validateClaim, claimController.close);

};