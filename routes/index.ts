import { Express } from 'express';
import frontline from './frontline/index.js';

export default (app: Express) => {
  frontline(app);
};