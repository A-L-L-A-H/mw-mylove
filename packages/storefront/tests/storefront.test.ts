import { describe, expect, test } from "bun:test";
import {
  PRICING_TIERS,
  PAAS_CATALOG_TEMPLATES,
  DEFAULT_USD_TO_IDR_RATE,
  buildCheckoutIntentPayload,
  buildPricingResponsePayload,
  buildStatusResponsePayload,
  buildPaasCatalogResponsePayload,
  crc16CcittFalse,
} from "../src/index.ts";

describe("PRICING_TIERS", () => {
  test("exports exactly 4 canonical tiers", () => {
    expect(PRICING_TIERS.length).toBe(4);
    expect(PRICING_TIERS.map((t) => t.tier)).toEqual([
      "free",
      "starter",
      "pro",
      "enterprise",
    ]);
  });

  test("each tier has required fields", () => {
    for (const tier of PRICING_TIERS) {
      expect(typeof tier.tier).toBe("string");
      expect(typeof tier.name).toBe("string");
      expect(typeof tier.monthlyUsd).toBe("number");
      expect(typeof tier.monthlyBaseCents).toBe("number");
      expect(typeof tier.included.containerHours).toBe("number");
      expect(typeof tier.quotaLimits.maxApps).toBe("number");
    }
  });

  test("free tier has zero cost", () => {
    const free = PRICING_TIERS[0];
    expect(free.tier).toBe("free");
    expect(free.monthlyUsd).toBe(0);
    expect(free.monthlyBaseCents).toBe(0);
  });

  test("enterprise tier allows dedicated mesh", () => {
    const enterprise = PRICING_TIERS[3];
    expect(enterprise.tier).toBe("enterprise");
    expect(enterprise.quotaLimits.allowDedicatedMesh).toBe(true);
  });
});

describe("PAAS_CATALOG_TEMPLATES", () => {
  test("exports canonical PaaS templates", () => {
    expect(PAAS_CATALOG_TEMPLATES.length).toBeGreaterThan(0);
    const ids = PAAS_CATALOG_TEMPLATES.map((t) => t.id);
    expect(ids).toContain("wordpress");
    expect(ids).toContain("n8n");
    expect(ids).toContain("pocketbase");
  });

  test("each template has required fields", () => {
    for (const template of PAAS_CATALOG_TEMPLATES) {
      expect(typeof template.id).toBe("string");
      expect(typeof template.name).toBe("string");
      expect(typeof template.category).toBe("string");
      expect(typeof template.minPlan).toBe("string");
      expect(Array.isArray(template.ports)).toBe(true);
      expect(Array.isArray(template.tags)).toBe(true);
    }
  });
});

describe("DEFAULT_USD_TO_IDR_RATE", () => {
  test("is 16000", () => {
    expect(DEFAULT_USD_TO_IDR_RATE).toBe(16000);
  });
});

describe("crc16CcittFalse", () => {
  test("matches standard EMVCo test vector", () => {
    expect(crc16CcittFalse("123456789")).toBe("29B1");
  });

  test("returns uppercase 4-char hex", () => {
    const result = crc16CcittFalse("test");
    expect(/^[0-9A-F]{4}$/.test(result)).toBe(true);
  });
});

describe("buildCheckoutIntentPayload", () => {
  test("builds QRIS checkout intent for starter tier", () => {
    const result = buildCheckoutIntentPayload({
      tier: "starter",
      paymentMethod: "QRIS",
      fxRateIdrPerUsd: 16000,
    });

    expect(result.tier).toBe("starter");
    expect(result.paymentMethod).toBe("QRIS");
    expect(result.currency).toBe("IDR");
    expect(result.amountUsd).toBe(19);
    expect(result.amountIdr).toBe(304000);
    expect(result.qris).not.toBeNull();
    expect(result.qris!.emvCoString.endsWith(result.qris!.crc16)).toBe(true);
    expect(result.qris!.currencyNumericCode).toBe("360");
    expect(result.qris!.countryCode).toBe("ID");
    expect(result.virtualAccount).toBeNull();
  });

  test("builds VA checkout intent for enterprise tier", () => {
    const result = buildCheckoutIntentPayload({
      tier: "enterprise",
      paymentMethod: "VA_BSI",
      fxRateIdrPerUsd: 16000,
    });

    expect(result.tier).toBe("enterprise");
    expect(result.paymentMethod).toBe("VA");
    expect(result.amountUsd).toBe(399);
    expect(result.amountIdr).toBe(6384000);
    expect(result.virtualAccount).not.toBeNull();
    expect(result.virtualAccount!.bankCode).toBe("BSI");
    expect(result.virtualAccount!.accountNumber.startsWith("45100")).toBe(true);
    expect(result.qris).toBeNull();
  });

  test("throws for free tier", () => {
    expect(() =>
      buildCheckoutIntentPayload({ tier: "free", paymentMethod: "QRIS" }),
    ).toThrow("Free tier does not require QRIS or Virtual Account payment");
  });

  test("throws for invalid tier", () => {
    expect(() => buildCheckoutIntentPayload({ tier: "invalid" })).toThrow(
      "Invalid tier",
    );
  });

  test("throws for unsupported bank", () => {
    expect(() =>
      buildCheckoutIntentPayload({ tier: "starter", paymentMethod: "VA_XYZ" }),
    ).toThrow("Unsupported bankCode");
  });
});

describe("buildPricingResponsePayload", () => {
  test("returns USD pricing by default", () => {
    const result = buildPricingResponsePayload([]);
    expect(result.currency).toBe("USD");
    expect(result.tiers.length).toBe(4);
    expect(result.supportedCurrencies).toEqual(["USD", "IDR"]);
    expect(result.paymentMethods).toContain("QRIS");
    expect(result.paymentMethods).toContain("VA_BSI");
  });

  test("returns IDR pricing when currency=IDR", () => {
    const result = buildPricingResponsePayload([], { currency: "IDR" });
    expect(result.currency).toBe("IDR");
    expect(result.fxRateIdrPerUsd).toBe(16000);
    const proTier = result.tiers.find((t) => t.tier === "pro");
    expect(proTier?.monthlyIdr).toBe(79 * 16000);
    expect(proTier?.displayPrice).toBe("Rp 1.264.000");
  });

  test("includes checkout intent by default", () => {
    const result = buildPricingResponsePayload([], {
      currency: "IDR",
      tier: "pro",
      paymentMethod: "QRIS",
    });
    expect(result.checkoutIntent.tier).toBe("pro");
    expect(result.checkoutIntent.amountIdr).toBe(79 * 16000);
  });

  test("passes compliance metadata through", () => {
    const compliance = ["CAN-0011", "ADR-0005"];
    const result = buildPricingResponsePayload(compliance);
    expect(result.compliance).toEqual(compliance);
  });
});

describe("buildStatusResponsePayload", () => {
  test("reports ok when all upstreams are online", async () => {
    const result = await buildStatusResponsePayload(
      [{ id: "mw-cp", baseUrl: "http://mw-cp.local:4440" }],
      async () => ({
        status: "online",
        httpStatus: 200,
        payload: null,
        reason: null,
      }),
    );

    expect(result.status).toBe("ok");
    expect(result.upstreams.length).toBe(1);
    expect(result.upstreams[0].status).toBe("online");
  });

  test("reports degraded when an upstream is offline", async () => {
    const result = await buildStatusResponsePayload(
      [{ id: "mw-cp", baseUrl: "http://mw-cp.local:4440" }],
      async () => ({
        status: "offline",
        httpStatus: null,
        payload: null,
        reason: "ECONNREFUSED",
      }),
    );

    expect(result.status).toBe("degraded");
    expect(result.upstreams[0].status).toBe("offline");
    expect(result.upstreams[0].reason).toBe("ECONNREFUSED");
  });

  test("reports degraded when probes return offline", async () => {
    const result = await buildStatusResponsePayload(
      [{ id: "mw-cp", baseUrl: "http://mw-cp.local:4440" }],
      async () => ({
        status: "offline",
        httpStatus: null,
        payload: null,
        reason: "ECONNREFUSED",
      }),
    );

    expect(result.status).toBe("degraded");
    expect(result.upstreams[0].status).toBe("offline");
    expect(result.upstreams[0].reason).toBe("ECONNREFUSED");
  });
});

describe("buildPaasCatalogResponsePayload", () => {
  test("returns curated fallback when cpUrl is not configured", async () => {
    const result = await buildPaasCatalogResponsePayload({
      probeFn: async () => ({
        status: "offline",
        httpStatus: null,
        payload: null,
        reason: "ECONNREFUSED",
      }),
    });
    expect(result.source).toBe("curated");
    expect(result.upstreamStatus).toBe("offline");
    expect(result.total).toBe(PAAS_CATALOG_TEMPLATES.length);
  });

  test("supports category filtering", async () => {
    const result = await buildPaasCatalogResponsePayload({
      category: "CMS",
      probeFn: async () => ({
        status: "offline",
        httpStatus: null,
        payload: null,
        reason: "ECONNREFUSED",
      }),
    });
    expect(result.filters.category).toBe("cms");
    for (const template of result.templates) {
      expect(template.category.toLowerCase()).toBe("cms");
    }
  });

  test("supports q search filtering", async () => {
    const result = await buildPaasCatalogResponsePayload({
      query: "sqlite",
      probeFn: async () => ({
        status: "offline",
        httpStatus: null,
        payload: null,
        reason: "ECONNREFUSED",
      }),
    });
    expect(result.filters.q).toBe("sqlite");
    expect(result.templates.map((t) => t.id)).toContain("pocketbase");
  });

  test("merges live remote templates when probe is online", async () => {
    const result = await buildPaasCatalogResponsePayload({
      cpUrl: "http://mw-cp.local:4440",
      query: "redis",
      probeFn: async (url) => {
        expect(url).toBe("http://mw-cp.local:4440/paas/templates");
        return {
          status: "online",
          httpStatus: 200,
          payload: {
            templates: [
              {
                id: "redis-cache",
                name: "Redis Cache",
                category: "database",
                description: "In-memory cache",
                image: "redis:7-alpine",
                minPlan: "starter",
                port: 6379,
                tags: ["redis", "cache"],
              },
            ],
          },
          reason: null,
        };
      },
    });

    expect(result.source).toBe("live+curated");
    expect(result.upstreamStatus).toBe("online");
    expect(result.total).toBe(1);
    expect(result.templates[0]?.id).toBe("redis-cache");
    expect(result.templates[0]?.ports).toEqual([6379]);
    expect(result.templates[0]?.minPlan).toBe("starter");
  });
});
