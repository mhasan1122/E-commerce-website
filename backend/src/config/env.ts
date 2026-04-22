import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "5000", 10),
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  mysql: {
    host: required("MYSQL_HOST", "localhost"),
    port: parseInt(process.env.MYSQL_PORT || "3306", 10),
    user: required("MYSQL_USER", "root"),
    password: process.env.MYSQL_PASSWORD ?? "",
    database: required("MYSQL_DATABASE", "e-commerce"),
  },

  jwt: {
    secret: required("JWT_SECRET", "dev-secret"),
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL || "admin@antigravity.io",
    adminPassword: process.env.SEED_ADMIN_PASSWORD || "admin12345",
    adminName: process.env.SEED_ADMIN_NAME || "Super Admin",
  },
};
