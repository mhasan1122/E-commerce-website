/**
 * Creates the database (if missing) and applies schema.sql.
 * Usage: npm run db:init
 */
import fs from "fs";
import path from "path";
import { createRootPool } from "../config/db";
import { env } from "../config/env";

async function main() {
  const rootPool = createRootPool();
  const schemaPath = path.resolve(__dirname, "../sql/schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  console.log(`[init-db] applying schema from ${schemaPath}`);
  console.log(`[init-db] target: ${env.mysql.host}:${env.mysql.port}`);

  const conn = await rootPool.getConnection();
  try {
    await conn.query(sql);
    console.log("[init-db] done ✓");
  } finally {
    conn.release();
    await rootPool.end();
  }
}

main().catch((e) => {
  console.error("[init-db] failed:", e);
  process.exit(1);
});
