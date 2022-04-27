import { ErrorHandler } from "../../../helpers.js";
import { pgClient } from "../../providers/postgres.js";

export interface IConfigurationInfo {
  companyNameShort: string;
  companyNameLong: string;
  welcomeKnownContact: string;
  welcomeUnknownContact: string;
  agentBusyAnswer: string;
  agentNotFoundAnswer: string
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

      if(request.rows.length > 0) {
        return request.rows[0] as IConfiguration;
      } else {
        return null;
      }

      
    } catch (error: any) {
      throw new ErrorHandler(500, `Internal DB Error : ${error.message}`)
    }
  };

  static add = async (info : string, updated_by: string) => {
    try {
      const request = await pgClient.query('INSERT INTO configuration (info, updated_on, updated_by) VALUES($1, NOW(), $2) RETURNING id', [info, updated_by]);
      return this.get();
    } catch (error: any) {
      throw new ErrorHandler(500, `Internal DB Error : ${error.message}`)
    }
  };

}