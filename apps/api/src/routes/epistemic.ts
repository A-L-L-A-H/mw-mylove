import type { FastifyInstance } from "fastify";
import {
  AQEL_DISCLAIMER,
  COMPLIANCE_STANDARDS,
  ECOSYSTEM_REPOS,
  EPISTEMIC_LAYERS,
  MTIME_PROFILE_BADGE,
  NON_NORMATIVE_ADVISORY_BADGE,
  checkCan0011Violation,
} from "@mw/portal";
import type { ApiConfig } from "../config";
import { makeUrl, parseBody, sendJson, type ProbeFn } from "./shared";

function registerEpistemicReads(
  app: FastifyInstance,
  config: ApiConfig,
  probe: ProbeFn,
): void {
  app.get("/api/ecosystem", async (_request, reply) =>
    sendJson(reply, {
      domain: "a-l-l-a-h.com",
      service: "mw-mylove",
      compliance: COMPLIANCE_STANDARDS,
      advisoryBadge: NON_NORMATIVE_ADVISORY_BADGE,
      repositoryCount: ECOSYSTEM_REPOS.length,
      repositories: ECOSYSTEM_REPOS,
      epistemicLayers: EPISTEMIC_LAYERS,
    }),
  );

  app.get("/api/corpus/search", async (request, reply) => {
    const query = makeUrl(request, config).searchParams.get("q") ?? "";
    const base = config.upstreamUrls.corpus ?? "";
    const result = await probe(
      `${base}/api/search?q=${encodeURIComponent(query)}`,
    );
    return sendJson(reply, {
      status: result.status,
      upstream: "mw-corpus",
      query,
      epistemicLayers: EPISTEMIC_LAYERS,
      results: result.status === "online" ? result.payload : [],
      message: result.reason ?? "ok",
    });
  });

  app.get("/api/nexus/domains", async (_request, reply) => {
    const result = await probe(
      `${config.upstreamUrls.nexus ?? ""}/api/domains`,
    );
    return sendJson(reply, {
      status: result.status,
      upstream: "mw-nexus",
      advisoryBadge: NON_NORMATIVE_ADVISORY_BADGE,
      domains: result.status === "online" ? result.payload : [],
      message: result.reason ?? "ok",
    });
  });

  app.get("/api/lore/eras", async (_request, reply) => {
    const result = await probe(`${config.upstreamUrls.lore ?? ""}/api/eras`);
    return sendJson(reply, {
      status: result.status,
      upstream: "mw-lore",
      epistemicLayer: "L4/L7",
      eras: result.status === "online" ? result.payload : [],
      message: result.reason ?? "ok",
    });
  });

  app.get("/api/time/convert", async (request, reply) => {
    const ts =
      makeUrl(request, config).searchParams.get("ts") ??
      new Date().toISOString();
    const base = config.upstreamUrls.nexus ?? "";
    const result = await probe(
      `${base}/api/time/convert?ts=${encodeURIComponent(ts)}`,
    );
    return sendJson(reply, {
      status: result.status,
      upstream: "mw-nexus",
      profileBadge: MTIME_PROFILE_BADGE,
      ts,
      conversion: result.status === "online" ? result.payload : null,
      message: result.reason ?? "ok",
    });
  });

  app.get("/api/radar/events", async (_request, reply) => {
    const result = await probe(`${config.upstreamUrls.echo ?? ""}/api/events`);
    return sendJson(reply, {
      status: result.status,
      upstream: "mw-echo",
      events: result.status === "online" ? result.payload : [],
      message: result.reason ?? "ok",
    });
  });
}

export function registerEpistemicRoutes(
  app: FastifyInstance,
  config: ApiConfig,
  probe: ProbeFn,
): void {
  registerEpistemicReads(app, config, probe);

  app.post("/api/aqel/analyze", async (request, reply) => {
    const parsed = parseBody(request);
    if (typeof parsed?.text !== "string" || parsed.text.trim().length === 0) {
      return sendJson(
        reply,
        { error: "Field 'text' must be a non-empty string" },
        400,
      );
    }
    const result = await probe(
      `${config.upstreamUrls.corpus ?? ""}/api/aqel/analyze`,
      {
        method: "POST",
        body: { text: parsed.text },
      },
    );
    return sendJson(reply, {
      status: result.status,
      upstream: "mw-corpus",
      epistemicStatus: "computational_candidate",
      disclaimer: AQEL_DISCLAIMER,
      advisoryBadge: NON_NORMATIVE_ADVISORY_BADGE,
      analysis: result.status === "online" ? result.payload : null,
      message: result.reason ?? "ok",
    });
  });

  app.post("/api/poster/preview", async (request, reply) => {
    const parsed = parseBody(request);
    if (!parsed) {
      return sendJson(
        reply,
        { error: "Request body must be a JSON object" },
        400,
      );
    }
    const violation = checkCan0011Violation(parsed);
    if (violation.blocked) {
      return sendJson(
        reply,
        {
          status: "blocked",
          blocked: true,
          code: "CAN-0011",
          error: "CAN-0011_VIOLATION",
          reason: violation.reason,
        },
        422,
      );
    }
    const result = await probe(
      `${config.upstreamUrls.studio ?? ""}/api/render/poster`,
      {
        method: "POST",
        body: parsed,
      },
    );
    return sendJson(reply, {
      status: result.status,
      upstream: "mw-studio",
      compliance: "CAN-0011",
      poster: result.status === "online" ? result.payload : null,
      message: result.reason ?? "ok",
    });
  });
}
