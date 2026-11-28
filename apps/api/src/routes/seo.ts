import type { FastifyInstance } from "fastify";
import { COMPLIANCE_STANDARDS } from "@mw/portal";
import {
  AFFILIATE_COOKIE_NAME,
  AFFILIATE_COOKIE_TTL_SECONDS,
  appendAffiliateRef,
  buildSchemaOrgJsonLd,
  buildSitemapXml,
  serializeJsonLdSafe,
} from "@mw/seo";
import {
  DEFAULT_USD_TO_IDR_RATE,
  buildPaasCatalogResponsePayload,
} from "@mw/storefront";
import type { ApiConfig } from "../config";
import {
  makeUrl,
  requestAffinity,
  sendHtml,
  sendJson,
  sendXml,
  type ProbeFn,
} from "./shared";

export function registerSeoRoutes(
  app: FastifyInstance,
  config: ApiConfig,
  probe: ProbeFn,
): void {
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
    const affiliate = requestAffinity(request, makeUrl(request, config));
    return sendJson(reply, affiliate.attribution, affiliate.attribution.ref);
  });

  app.get("/api/schema-org", async (request, reply) => {
    const affiliate = requestAffinity(request, makeUrl(request, config));
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
    const affiliate = requestAffinity(request, makeUrl(request, config));
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
