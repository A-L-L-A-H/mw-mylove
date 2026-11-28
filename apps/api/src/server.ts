import Fastify, { type FastifyInstance } from "fastify";
import { loadConfig, type ApiConfig } from "./config";
import { buildApp } from "./app";

export function createServer(
  config: ApiConfig = loadConfig(),
): FastifyInstance {
  const app = Fastify({ logger: false });
  app.decorate("mwApiConfig", config);
  buildApp(app, config);
  return app;
}

export async function startServer(
  config: ApiConfig = loadConfig(),
): Promise<FastifyInstance> {
  const app = createServer(config);
  try {
    await app.listen({ port: config.port, host: "0.0.0.0" });
  } catch (error) {
    await app.close();
    throw error;
  }
  return app;
}

if (import.meta.main) {
  startServer().catch((error: unknown) => {
    console.error("Failed to start @mw/api", error);
    process.exitCode = 1;
  });
}
