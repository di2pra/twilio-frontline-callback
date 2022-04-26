import { ErrorHandler } from "../../../helpers.js";
import { pgClient } from "../../providers/postgres.js";

export interface IConfigurationInfo {
  companyNameShort: string;
  companyNameLong: string;
}

export interface IConfiguration {
  id: number;
  info: IConfigurationInfo;
  updated_by: string;
}

export default class Configuration {

  static get = async () => {
    try {
      const request = await pgClient.query('SELECT * FROM configuration ORDER BY id DESC LIMIT 1');
      return request.rows[0] as IConfiguration;
    } catch (error) {
      throw new ErrorHandler(500, 'Internal DB Error')
    }
  };

  static add = async (info : string, updated_by: string) => {
    try {
      const request = await pgClient.query('INSERT INTO configuration (info, updated_on, updated_by) VALUES($1, NOW(), $2) RETURNING id', [info, "prajendirane@twilio.com"]);
      return this.get();
    } catch (error) {
      throw new ErrorHandler(500, 'Internal DB Error')
    }
  };

}