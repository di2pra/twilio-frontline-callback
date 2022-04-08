import { Express, NextFunction, Request, Response } from 'express';
import { handleError } from '../helpers.js';
import api from './api/index.js';
import frontline from './frontline/index.js';

export default (app: Express) => {
  frontline(app);
  api(app);

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    handleError(err, res);
  });

};