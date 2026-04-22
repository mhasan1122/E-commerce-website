import mysql, { Pool, PoolOptions } from "mysql2/promise";
import { env } from "./env";

const poolOptions: PoolOptions = {
  host: env.mysql.host,
  port: env.mysql.port,
  user: env.mysql.user,
  password: env.mysql.password,
  database: env.mysql.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: false,
  decimalNumbers: true,
  charset: "utf8mb4",
};

export const pool: Pool = mysql.createPool(poolOptions);

export async function connectMySQL(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    console.log(
      `[mysql] connected to ${env.mysql.host}:${env.mysql.port}/${env.mysql.database}`
    );
  } finally {
    conn.release();
  }
}

/** Convenience: create a pool WITHOUT a database (used by initDb script). */
export function createRootPool() {
  return mysql.createPool({
    host: env.mysql.host,
    port: env.mysql.port,
    user: env.mysql.user,
    password: env.mysql.password,
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 4,
  });
}
