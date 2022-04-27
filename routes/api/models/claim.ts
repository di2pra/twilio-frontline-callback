import { ErrorHandler } from "../../../helpers.js";
import { pgClient } from "../../providers/postgres.js";

export interface IClaim {
  id: number;
  user: string;
  started_at: Date;
  ended_at: Date;
}

export default class Claim {

  static get = async () => {
    try {
      const request = await pgClient.query('SELECT * FROM claim ORDER BY id DESC LIMIT 1');

      if (request.rows.length > 0) {
        return request.rows[0] as IClaim;
      } else {
        return null
      }

    } catch (error: any) {
      throw new ErrorHandler(500, `Internal DB Error : ${error.message}`)
    }
  };

  static getById = async (id: number) => {

    try {

      const request = await pgClient.query('SELECT * FROM claim WHERE id=$1', [id]);

      if (request.rows.length > 0) {
        return request.rows[0] as IClaim;
      } else {
        return null
      }

    } catch (error: any) {
      throw new ErrorHandler(500, `Internal DB Error : ${error.message}`)
    }


  };

  static add = async (user: string) => {
    try {
      const request = await pgClient.query('INSERT INTO claim ("user", started_at) VALUES($1, NOW()) RETURNING id', [user]);
      return this.getById(request.rows[0].id)
    } catch (error: any) {
      throw new ErrorHandler(500, `Internal DB Error : ${error.message}`)
    }
  };

  static close = async (id: number) => {
    try {
      const request = await pgClient.query('UPDATE claim SET ended_at = NOW() WHERE id = $1', [id]);
      return this.get();
    } catch (error: any) {
      throw new ErrorHandler(500, `Internal DB Error : ${error.message}`)
    }
  };

}