import type { FastifyInstance } from "fastify";
import { COMPLIANCE_STANDARDS } from "@mw/portal";
import { resolveAffiliateContext } from "@mw/seo";
import {
  DEFAULT_USD_TO_IDR_RATE,
  buildCheckoutIntentPayload,
  buildPaasCatalogResponsePayload,
  buildPricingResponsePayload,
} from "@mw/storefront";
import type { ApiConfig } from "../config";
import {
  headerString,
  makeUrl,
  parseBody,
  requestAffinity,
  sendJson,
  type ProbeFn,
} from "./shared";

export function registerStorefrontRoutes(
  app: FastifyInstance,
  config: ApiConfig,
  probe: ProbeFn,
): void {
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
    const cookieHeader = headerString(request.headers.cookie) ?? "";
    const checkoutAffiliate = resolveAffiliateContext(
      new Request(url.toString(), { headers: { cookie: cookieHeader } }),
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
      const message =
        error instanceof Error
          ? error.message
          : "Invalid checkout intent parameters";
      return sendJson(reply, { error: message }, 400);
    }
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
      const message =
        error instanceof Error ? error.message : "Invalid pricing parameters";
      return sendJson(reply, { error: message }, 400);
    }
  });

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
}
