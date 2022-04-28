import { pgClient } from "./routes/providers/postgres.js";
import fs from "fs";

(async () => {
  try {

    var sql = fs.readFileSync('./scripts/reset_script.sql').toString();
    const result = await pgClient.query(sql);

  } catch (e) {
  }
})();