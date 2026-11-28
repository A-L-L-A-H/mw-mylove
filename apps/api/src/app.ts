import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { resolveRidAuthConfig, verifyRidAccessToken } from "@mw/auth";
import {
  AQEL_DISCLAIMER,
  COMPLIANCE_STANDARDS,
  ECOSYSTEM_REPOS,
  EPISTEMIC_LAYERS,
  MTIME_PROFILE_BADGE,
  NON_NORMATIVE_ADVISORY_BADGE,
  checkCan0011Violation,
} from "@mw/portal";
import {
  AFFILIATE_COOKIE_NAME,
  AFFILIATE_COOKIE_TTL_SECONDS,
  appendAffiliateRef,
  buildAffiliateSetCookieHeader,
  buildSchemaOrgJsonLd,
  buildSitemapXml,
  resolveAffiliateContext,
  serializeJsonLdSafe,
} from "@mw/seo";
import {
  SlaTracker,
  buildSlaMizanWidgetPayload,
  renderSlaMizanWidgetHtml,
} from "@mw/sla";
import {
  DEFAULT_USD_TO_IDR_RATE,
  buildCheckoutIntentPayload,
  buildPaasCatalogResponsePayload,
  buildPricingResponsePayload,
  buildStatusResponsePayload,
} from "@mw/storefront";
import type { ApiConfig } from "./config";
import { fetchUpstreamJson, resolveUpstreamTimeoutMs } from "./upstream/fetch";
import { getUpstreamTargets } from "./upstream/targets";

function headerString(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

function requestAffinity(request: FastifyRequest, url: URL) {
  const headers = new Headers();
  const cookie = headerString(request.headers.cookie);
  if (cookie) {
    headers.set("cookie", cookie);
  }
  return resolveAffiliateContext(new Request(url.toString(), { headers }), url);
}

function sendJson(
  reply: FastifyReply,
  body: unknown,
  statusOrRef?: number | string | null,
): FastifyReply {
  const status = typeof statusOrRef === "number" ? statusOrRef : 200;
  const ref = typeof statusOrRef === "string" ? statusOrRef : null;
  const cookie = ref ? buildAffiliateSetCookieHeader(ref) : null;
  if (cookie) {
    reply.header("set-cookie", cookie);
  }
  return reply
    .code(status)
    .header("cache-control", "no-store")
    .header("x-content-type-options", "nosniff")
    .type("application/json; charset=utf-8")
    .send(body);
}

function sendHtml(
  reply: FastifyReply,
  body: string,
  statusOrRef?: number | string | null,
): FastifyReply {
  const status = typeof statusOrRef === "number" ? statusOrRef : 200;
  const ref = typeof statusOrRef === "string" ? statusOrRef : null;
  const cookie = ref ? buildAffiliateSetCookieHeader(ref) : null;
  if (cookie) {
    reply.header("set-cookie", cookie);
  }
  return reply
    .code(status)
    .header("x-content-type-options", "nosniff")
    .type("text/html; charset=utf-8")
    .send(body);
}

function sendXml(
  reply: FastifyReply,
  body: string,
  statusOrRef?: number | string | null,
): FastifyReply {
  const status = typeof statusOrRef === "number" ? statusOrRef : 200;
  const ref = typeof statusOrRef === "string" ? statusOrRef : null;
  const cookie = ref ? buildAffiliateSetCookieHeader(ref) : null;
  if (cookie) {
    reply.header("set-cookie", cookie);
  }
  return reply
    .code(status)
    .header("cache-control", "no-store")
    .header("x-content-type-options", "nosniff")
    .type("application/xml; charset=utf-8")
    .send(body);
}

function parseBody(request: FastifyRequest): Record<string, unknown> | null {
  if (
    !request.body ||
    typeof request.body !== "object" ||
    Array.isArray(request.body)
  ) {
    return null;
  }
  return request.body as Record<string, unknown>;
}

function makeUrl(request: FastifyRequest, config: ApiConfig): URL {
  return new URL(request.url, config.origin);
}

export function buildApp(app: FastifyInstance, config: ApiConfig): void {
  const slaTracker = new SlaTracker();
  const timeoutMs = resolveUpstreamTimeoutMs(process.env);

  const probe = (
    targetUrl: string,
    options: { method?: "GET" | "POST"; body?: unknown } = {},
  ) => fetchUpstreamJson(targetUrl, config, { ...options, timeoutMs });

  app.post("/api/pricing/checkout-intent", async (request, reply) => {
    const parsed = parseBody(request);
    if (!parsed) {
      return sendJson(
        reply,
        { error: "Request body must be a JSON object" },
        400,
      );
    }
    const url = makeUrl(request, config);
    const checkoutAffiliate = resolveAffiliateContext(
      new Request(url.toString(), {
        headers: { cookie: headerString(request.headers.cookie) ?? "" },
      }),
      url,
      parsed.ref,
    );
    try {
      const intent = buildCheckoutIntentPayload({
        tier: parsed.tier,
        currency: parsed.currency ?? "IDR",
        paymentMethod: parsed.paymentMethod ?? "QRIS",
        bankCode: parsed.bankCode,
        fxRateIdrPerUsd: DEFAULT_USD_TO_IDR_RATE,
        affiliateRef: checkoutAffiliate.attribution.ref,
      });
      return sendJson(
        reply,
        { ...intent, attribution: checkoutAffiliate.attribution },
        checkoutAffiliate.attribution.ref,
      );
    } catch (error) {
      return sendJson(
        reply,
        {
          error:
            error instanceof Error
              ? error.message
              : "Invalid checkout intent parameters",
        },
        400,
      );
    }
  });

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
      `${config.upstreamUrls.corpus}/api/aqel/analyze`,
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
      `${config.upstreamUrls.studio}/api/render/poster`,
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
      return sendJson(
        reply,
        {
          authenticated: false,
          error: error instanceof Error ? error.message : "Invalid token",
        },
        401,
      );
    }
  });

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
    const url = makeUrl(request, config);
    const query = url.searchParams.get("q") ?? "";
    const result = await probe(
      `${config.upstreamUrls.corpus}/api/search?q=${encodeURIComponent(query)}`,
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
    const result = await probe(`${config.upstreamUrls.nexus}/api/domains`);
    return sendJson(reply, {
      status: result.status,
      upstream: "mw-nexus",
      advisoryBadge: NON_NORMATIVE_ADVISORY_BADGE,
      domains: result.status === "online" ? result.payload : [],
      message: result.reason ?? "ok",
    });
  });

  app.get("/api/lore/eras", async (_request, reply) => {
    const result = await probe(`${config.upstreamUrls.lore}/api/eras`);
    return sendJson(reply, {
      status: result.status,
      upstream: "mw-lore",
      epistemicLayer: "L4/L7",
      eras: result.status === "online" ? result.payload : [],
      message: result.reason ?? "ok",
    });
  });

  app.get("/api/time/convert", async (request, reply) => {
    const url = makeUrl(request, config);
    const ts = url.searchParams.get("ts") ?? new Date().toISOString();
    const result = await probe(
      `${config.upstreamUrls.nexus}/api/time/convert?ts=${encodeURIComponent(ts)}`,
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
    const result = await probe(`${config.upstreamUrls.echo}/api/events`);
    return sendJson(reply, {
      status: result.status,
      upstream: "mw-echo",
      events: result.status === "online" ? result.payload : [],
      message: result.reason ?? "ok",
    });
  });

  app.get("/pricing", async (request, reply) => {
    const url = makeUrl(request, config);
    const affiliate = requestAffinity(request, url);
    try {
      const payload = buildPricingResponsePayload(COMPLIANCE_STANDARDS, {
        currency: url.searchParams.get("currency"),
        tier: url.searchParams.get("tier"),
        paymentMethod: url.searchParams.get("method"),
        bankCode: url.searchParams.get("bank"),
        affiliateRef: affiliate.attribution.ref,
        attributionSource: affiliate.attribution.source,
      });
      return sendJson(reply, payload, affiliate.attribution.ref);
    } catch (error) {
      return sendJson(
        reply,
        {
          error:
            error instanceof Error
              ? error.message
              : "Invalid pricing parameters",
        },
        400,
      );
    }
  });

  app.get("/status", async (request, reply) => {
    const payload = await buildStatusResponsePayload(
      getUpstreamTargets(config),
      probe,
    );
    slaTracker.record(payload.status, payload.upstreams);
    const affiliate = requestAffinity(request, makeUrl(request, config));
    return sendJson(reply, payload, affiliate.attribution.ref);
  });

  const widgetHandler = async (
    request: FastifyRequest,
    reply: FastifyReply,
    html: boolean,
  ) => {
    const statusPayload = await buildStatusResponsePayload(
      getUpstreamTargets(config),
      probe,
    );
    slaTracker.record(statusPayload.status, statusPayload.upstreams);
    const widget = buildSlaMizanWidgetPayload({
      statusPayload,
      sla30d: slaTracker.getSummary(),
      advisoryBadge: NON_NORMATIVE_ADVISORY_BADGE,
      compliance: COMPLIANCE_STANDARDS,
    });
    const affiliate = requestAffinity(request, makeUrl(request, config));
    if (html) {
      return sendHtml(
        reply,
        renderSlaMizanWidgetHtml(widget),
        affiliate.attribution.ref,
      );
    }
    return sendJson(
      reply,
      { ...widget, attribution: affiliate.attribution },
      affiliate.attribution.ref,
    );
  };

  app.get("/api/status/widget", async (request, reply) => {
    const url = makeUrl(request, config);
    return widgetHandler(
      request,
      reply,
      url.searchParams.get("format") === "html",
    );
  });
  app.get("/widgets/sla-mizan", async (request, reply) =>
    widgetHandler(request, reply, true),
  );

  app.get("/paas/catalog", async (request, reply) => {
    const url = makeUrl(request, config);
    const affiliate = requestAffinity(request, url);
    const payload = await buildPaasCatalogResponsePayload({
      cpUrl: config.upstreamUrls.cp,
      category: url.searchParams.get("category"),
      query: url.searchParams.get("q"),
      probeFn: probe,
    });
    return sendJson(
      reply,
      { ...payload, attribution: affiliate.attribution },
      affiliate.attribution.ref,
    );
  });

  app.get("/sitemap.xml", async (request, reply) => {
    const catalog = await buildPaasCatalogResponsePayload({
      cpUrl: config.upstreamUrls.cp,
      probeFn: probe,
    });
    const affiliate = requestAffinity(request, makeUrl(request, config));
    const xml = buildSitemapXml({
      origin: config.origin,
      templates: catalog.templates,
    });
    return sendXml(reply, xml, affiliate.attribution.ref);
  });

  app.get("/api/attribution", async (request, reply) => {
    const url = makeUrl(request, config);
    const affiliate = requestAffinity(request, url);
    return sendJson(reply, affiliate.attribution, affiliate.attribution.ref);
  });

  app.get("/api/schema-org", async (request, reply) => {
    const url = makeUrl(request, config);
    const affiliate = requestAffinity(request, url);
    const schema = buildSchemaOrgJsonLd({
      origin: config.origin,
      tiers: [],
      fxRateIdrPerUsd: DEFAULT_USD_TO_IDR_RATE,
      compliance: COMPLIANCE_STANDARDS,
    });
    return sendHtml(
      reply,
      `<script type="application/ld+json">${serializeJsonLdSafe(schema)}</script>`,
      affiliate.attribution.ref,
    );
  });

  app.get("/api/affiliate-link", async (request, reply) => {
    const url = makeUrl(request, config);
    const affiliate = requestAffinity(request, url);
    return sendJson(
      reply,
      {
        url: appendAffiliateRef("/pricing", affiliate.attribution.ref),
        cookieName: AFFILIATE_COOKIE_NAME,
        ttlSeconds: AFFILIATE_COOKIE_TTL_SECONDS,
      },
      affiliate.attribution.ref,
    );
  });
}
