import type { FastifyInstance } from "fastify";
import { resolveRidAuthConfig, verifyRidAccessToken } from "@mw/auth";
import { COMPLIANCE_STANDARDS } from "@mw/portal";
import type { ApiConfig } from "../config";
import { headerString, sendJson } from "./shared";

export function registerAuthRoutes(
  app: FastifyInstance,
  config: ApiConfig,
): void {
  app.get("/health", async (_request, reply) =>
    sendJson(reply, {
      status: "ok",
      service: "mw-mylove",
      domain: "a-l-l-a-h.com",
      port: config.port,
      compliance: COMPLIANCE_STANDARDS,
      timestamp: new Date().toISOString(),
    }),
  );

  app.get("/api/auth/session", async (request, reply) => {
    const authHeader = headerString(request.headers.authorization);
    if (!authHeader || authHeader.trim().length === 0) {
      return sendJson(reply, { authenticated: false });
    }
    const bearer = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
    if (!bearer?.[1]) {
      return sendJson(
        reply,
        { authenticated: false, error: "Malformed Authorization header" },
        401,
      );
    }
    try {
      const session = await verifyRidAccessToken(
        bearer[1],
        resolveRidAuthConfig(),
      );
      return sendJson(reply, session);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid token";
      return sendJson(reply, { authenticated: false, error: message }, 401);
    }
  });
}
