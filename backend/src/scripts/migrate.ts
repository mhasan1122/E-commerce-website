/**
 * Runs ordered SQL migrations from src/sql/migrations.
 * Usage: npm run db:migrate
 */
import fs from "fs";
import path from "path";
import { RowDataPacket } from "mysql2";
import { createRootPool } from "../config/db";
import { env } from "../config/env";

type MigrationFile = {
  file: string;
  fullPath: string;
  sql: string;
};

const MIGRATIONS_TABLE = "_migrations";

function getMigrationsDir(): string {
  return path.resolve(__dirname, "../sql/migrations");
}

function getMigrationFiles(migrationsDir: string): MigrationFile[] {
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  return files.map((file) => {
    const fullPath = path.join(migrationsDir, file);
    return {
      file,
      fullPath,
      sql: fs.readFileSync(fullPath, "utf8"),
    };
  });
}

async function main() {
  const rootPool = createRootPool();
  const dbName = env.mysql.database.replace(/`/g, "``");
  const migrationsDir = getMigrationsDir();
  const migrations = getMigrationFiles(migrationsDir);

  if (migrations.length === 0) {
    console.log(`[migrate] no .sql files found in ${migrationsDir}`);
    await rootPool.end();
    return;
  }

  console.log(`[migrate] target: ${env.mysql.host}:${env.mysql.port}/${env.mysql.database}`);
  console.log(`[migrate] found ${migrations.length} migration(s)`);

  const conn = await rootPool.getConnection();
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await conn.query(`USE \`${dbName}\``);

    await conn.query(
      `CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    );

    const [appliedRows] = await conn.query<Array<RowDataPacket & { filename: string }>>(
      `SELECT filename FROM ${MIGRATIONS_TABLE}`
    );
    const applied = new Set(appliedRows.map((r) => r.filename));

    for (const migration of migrations) {
      if (applied.has(migration.file)) {
        console.log(`[migrate] skip ${migration.file} (already applied)`);
        continue;
      }

      console.log(`[migrate] applying ${migration.file}`);
      await conn.beginTransaction();
      try {
        await conn.query(migration.sql);
        await conn.query(`INSERT INTO ${MIGRATIONS_TABLE} (filename) VALUES (?)`, [
          migration.file,
        ]);
        await conn.commit();
        console.log(`[migrate] applied ${migration.file}`);
      } catch (err) {
        await conn.rollback();
        throw new Error(
          `[migrate] failed on ${migration.file} (${migration.fullPath}): ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      }
    }

    console.log("[migrate] done ✓");
  } finally {
    conn.release();
    await rootPool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
