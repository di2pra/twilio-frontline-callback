import { ErrorHandler } from "../../../helpers.js";
import { pgClient } from "../../providers/postgres.js";

export default class Category {

  static getAll = async () => {
    try {
      const request = await pgClient.query('SELECT * FROM category');
      return request.rows;
    } catch (error: any) {
      throw new ErrorHandler(500, `Internal DB Error : ${error.message}`)
    }
  };

}