import { Express } from 'express';
import OktaController from './okta.js';
import pg from 'pg';
import TemplateController from './template.js';

export default (router: Express) => {

  const pgClient = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  const oktaController = new OktaController();
  const templateController = new TemplateController();
  

  router.use('/api', oktaController.authenticationRequired);

  router.get("/api/v1/template", templateController.get);
  router.post("/api/v1/template", templateController.add);
  router.delete("/api/v1/template/:id", templateController.delete);

};