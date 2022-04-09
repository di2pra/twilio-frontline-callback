import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../../helpers.js";
import { sqliteDb } from "../providers/sqlite.js";

export const getTemplateHandler = async (_: Request, res: Response) => {

  const categories = sqliteDb.prepare('SELECT * FROM category').all();

  const templates = sqliteDb.prepare('SELECT * FROM template').all();

  const data = categories.map(category => {
    return {
      ...category,
      ...{
        templates: templates.filter(item => item.category_id === category.id)
      }
    }
  })

  res.send(data);

};

export const addTemplateHandler = async (req: Request, res: Response, next: NextFunction) => {

  try {

    if (typeof req.body.category_id === "undefined" || typeof req.body.content === "undefined" || typeof req.body.whatsAppApproved === "undefined") {
      throw new ErrorHandler(400, 'Bad Request');
    }

    const category = sqliteDb.prepare('SELECT * FROM category WHERE id = ?').get(req.body.category_id);

    if (typeof category === "undefined") {
      throw new ErrorHandler(400, 'Category Id doesn\'t exist');
    }

    const insert = sqliteDb.prepare('INSERT INTO template (category_id, content, whatsAppApproved) VALUES (?, ?, ?)');

    const result = insert.run(req.body.category_id, req.body.content, req.body.whatsAppApproved ? 1 : 0);

    const newTemplate = sqliteDb.prepare('SELECT * FROM template WHERE id = ?').get(result.lastInsertRowid);

    res.status(200).json(newTemplate);

  } catch (error) {
    next(error)
  }

};


export const deleteTemplateHandler = async (req: Request, res: Response, next: NextFunction) => {

  try {

    if (!req.params.id) {
      throw new ErrorHandler(400, 'Bad Request');
    }

    const deleteStatement = sqliteDb.prepare('DELETE FROM template WHERE id = ?');

    const result = deleteStatement.run(req.params.id);

    res.status(204).json(null);

  } catch (error) {
    next(error)
  }

};