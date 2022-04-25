import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../../helpers.js";
import Category from "./models/category.js";
import Template from "./models/template.js";

export default class TemplateController {

  get = async (_: Request, res: Response, next: NextFunction) => {

    try {

      const categories = await Category.getAll();
      const templates = await Template.getAll();

      const data = categories.map(category => {
        return {
          ...category,
          ...{
            templates: templates.filter(item => item.category_id === category.id)
          }
        }
      })

      res.status(200).json(data);

    } catch (error) {
      next(error)
    }

  };

  add = async (req: Request, res: Response, next: NextFunction) => {

    try {

      if (typeof req.body.category_id === "undefined" || typeof req.body.content === "undefined" || typeof req.body.whatsapp_approved === "undefined") {
        throw new ErrorHandler(400, 'Bad Request');
      }

      const newTemplate = await Template.add(req.body)

      res.status(200).json(newTemplate);

    } catch (error) {
      next(error)
    }

  };


  delete = async (req: Request, res: Response, next: NextFunction) => {

    try {

      if (!req.params.id) {
        throw new ErrorHandler(400, 'Bad Request');
      }

      const deleteStatement = await Template.delete(Number(req.params.id));

      res.status(204).json(null);

    } catch (error) {
      next(error)
    }

  };

}