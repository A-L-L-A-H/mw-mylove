import type { FastifyInstance } from "fastify";
import type { ApiConfig } from "./config";
import { registerAuthRoutes } from "./routes/auth";
import { registerEpistemicRoutes } from "./routes/epistemic";
import { registerSeoRoutes } from "./routes/seo";
import { createProbe } from "./routes/shared";
import { registerStatusRoutes } from "./routes/status";
import { registerStorefrontRoutes } from "./routes/storefront";
import { resolveUpstreamTimeoutMs } from "./upstream/fetch";

export function buildApp(app: FastifyInstance, config: ApiConfig): void {
  const probe = createProbe(config, resolveUpstreamTimeoutMs(process.env));
  registerAuthRoutes(app, config);
  registerEpistemicRoutes(app, config, probe);
  registerStorefrontRoutes(app, config, probe);
  registerStatusRoutes(app, config, probe);
  registerSeoRoutes(app, config, probe);
}
