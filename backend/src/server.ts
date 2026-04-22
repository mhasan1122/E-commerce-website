import { createApp } from "./app";
import { connectMySQL } from "./config/db";
import { env } from "./config/env";

async function main() {
  // Connect to MySQL (fail fast on bad credentials / db)
  await connectMySQL();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port}`);
    console.log(`[server] env = ${env.nodeEnv}`);
    console.log(`[server] cors origins = ${env.corsOrigin.join(", ")}`);
  });
}

main().catch((err) => {
  console.error("[server] fatal startup error:", err);
  process.exit(1);
});
