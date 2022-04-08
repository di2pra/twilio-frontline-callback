import { Express } from 'express';
import OktaController from './okta.js';
import { addTemplateHandler, deleteTemplateHandler, getTemplateHandler } from './templates.js';

export default (router: Express) => {

  const oktaController = new OktaController();

  router.use('/api', oktaController.authenticationRequired);

  router.get("/api/v1/template", getTemplateHandler);
  router.post("/api/v1/template", addTemplateHandler);
  router.delete("/api/v1/template/:id", deleteTemplateHandler);

};