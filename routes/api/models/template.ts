import { ErrorHandler } from "../../../helpers.js";
import { pgClient } from "../../providers/postgres.js";
import Category from "./category.js";

export default class Template {

  static getAll = async () => {

    try {

      const request = await pgClient.query('SELECT * FROM template WHERE is_deleted is FALSE ORDER BY id ASC');
      return request.rows;

    } catch (error: any) {
      throw new ErrorHandler(500, `Internal DB Error : ${error.message}`)
    }


  };


  static getById = async (id: number) => {

    try {

      const request = await pgClient.query('SELECT * FROM template WHERE id=$1 AND is_deleted is FALSE', [id]);
      return request.rows[0];

    } catch (error: any) {
      throw new ErrorHandler(500, `Internal DB Error : ${error.message}`)
    }


  };


  static add = async ({
    category_id,
    content,
    whatsapp_approved
  }: {
    category_id: number,
    content: string,
    whatsapp_approved: boolean
  }) => {

    try {

      const request = await pgClient.query('INSERT INTO template (category_id, content, whatsapp_approved, is_deleted) VALUES ($1, $2, $3, FALSE) RETURNING id', [category_id, content, whatsapp_approved]);

      return this.getById(request.rows[0].id)

    } catch (error: any) {
      throw new ErrorHandler(500, `Internal DB Error : ${error.message}`)
    }

  };


  static update = async (id: number, {
    category_id,
    content,
    whatsapp_approved
  }: {
    category_id: number,
    content: string,
    whatsapp_approved: boolean
  }) => {
    
    try {

      const request = await pgClient.query('UPDATE template SET category_id = $1, content = $2, whatsapp_approved = $3 WHERE id = $4', [category_id, content, whatsapp_approved, id]);

      return this.getById(id);

    } catch (error: any) {
      throw new ErrorHandler(500, `Internal DB Error : ${error.message}`)
    }

  };



  static delete = async (id: number) => {

    try {
      const request = await pgClient.query('UPDATE template SET is_deleted = TRUE WHERE id = $1', [id]);
      return id;
    } catch (error: any) {
      throw new ErrorHandler(500, `Internal DB Error : ${error.message}`)
    }

  };

}