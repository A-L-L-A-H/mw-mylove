import { describe, expect, test } from "bun:test";
import { handleRequest, resolveConfig, type PortalConfig } from "../src/server.ts";
import { SlaTracker, THIRTY_DAYS_MS } from "../src/sla-mizan.ts";
import { crc16CcittFalse } from "../src/storefront.ts";

function makeOfflineConfig(overrides: Partial<PortalConfig> = {}): PortalConfig {
  return resolveConfig({
    port: 4460,
    publicOrigin: "https://a-l-l-a-h.com",
    usdToIdrRate: 16000,
    corpusUrl: "http://127.0.0.1:19991",
    nexusUrl: "http://127.0.0.1:19992",
    loreUrl: "http://127.0.0.1:19993",
    echoUrl: "http://127.0.0.1:19994",
    studioUrl: "http://127.0.0.1:19995",
    cpUrl: "http://127.0.0.1:19996",
    upstreamTimeoutMs: 250,
    fetcher: (async () => {
      throw new Error("ECONNREFUSED");
    }) as unknown as typeof fetch,
    ...overrides,
  });
}

function makeOnlineConfig(
  customFetcher?: typeof fetch,
  overrides: Partial<PortalConfig> = {},
): PortalConfig {
  return resolveConfig({
    port: 4460,
    publicOrigin: "https://a-l-l-a-h.com",
    usdToIdrRate: 16000,
    corpusUrl: "http://mw-corpus.local:4420",
    nexusUrl: "http://mw-nexus.local:4430",
    loreUrl: "http://mw-lore.local:4450",
    echoUrl: "http://mw-echo.local:4310",
    studioUrl: "http://mw-studio.local:4470",
    cpUrl: "http://mw-cp.local:4440",
    fetcher:
      customFetcher ??
      ((async () =>
        new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })) as unknown as typeof fetch),
    ...overrides,
  });
}

describe("V16: IDR pricing toggle & structured QRIS/VA checkout intent", () => {
  test("CRC-16/CCITT-FALSE matches standard EMVCo test vector", () => {
    expect(crc16CcittFalse("123456789")).toBe("29B1");
  });

  test("GET /pricing?currency=IDR toggles currency and exposes IDR amounts & QRIS preview", async () => {
    const response = await handleRequest(
      new Request("http://localhost:4460/pricing?currency=idr&tier=pro"),
      makeOfflineConfig(),
    );
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      currency: string;
      supportedCurrencies: string[];
      fxRateIdrPerUsd: number;
      tiers: Array<{
        tier: string;
        monthlyUsd: number;
        monthlyIdr: number;
        formattedUsd: string;
        formattedIdr: string;
        displayPrice: string;
      }>;
      paymentMethods: string[];
      toggleUrls: { USD: string; IDR: string };
      checkoutIntent: {
        tier: string;
        amountIdr: number;
        paymentMethod: string;
        qris: { emvCoString: string; crc16: string; currencyNumericCode: string; countryCode: string } | null;
        shariaCompliance: { ribaFree: boolean; latePenaltyIdr: number; akad: string };
      };
    };

    expect(body.currency).toBe("IDR");
    expect(body.supportedCurrencies).toEqual(["USD", "IDR"]);
    expect(body.fxRateIdrPerUsd).toBe(16000);
    expect(body.paymentMethods).toContain("QRIS");
    expect(body.paymentMethods).toContain("VA_BSI");
    expect(body.toggleUrls).toEqual({
      USD: "/pricing?currency=USD",
      IDR: "/pricing?currency=IDR",
    });

    const proTier = body.tiers.find((t) => t.tier === "pro");
    expect(proTier?.monthlyUsd).toBe(79);
    expect(proTier?.monthlyIdr).toBe(1264000);
    expect(proTier?.formattedUsd).toBe("$79");
    expect(proTier?.formattedIdr).toBe("Rp 1.264.000");
    expect(proTier?.displayPrice).toBe("Rp 1.264.000");

    expect(body.checkoutIntent.tier).toBe("pro");
    expect(body.checkoutIntent.amountIdr).toBe(1264000);
    expect(body.checkoutIntent.paymentMethod).toBe("QRIS");
    expect(body.checkoutIntent.shariaCompliance.ribaFree).toBe(true);
    expect(body.checkoutIntent.shariaCompliance.latePenaltyIdr).toBe(0);
    expect(body.checkoutIntent.qris).not.toBeNull();
    const emv = body.checkoutIntent.qris!.emvCoString;
    expect(emv.endsWith(body.checkoutIntent.qris!.crc16)).toBe(true);
    expect(crc16CcittFalse(emv.slice(0, -4))).toBe(body.checkoutIntent.qris!.crc16);
    expect(body.checkoutIntent.qris!.currencyNumericCode).toBe("360");
    expect(body.checkoutIntent.qris!.countryCode).toBe("ID");
  });

  test("GET /pricing rejects unsupported currency and serves HTML toggle view when ?format=html", async () => {
    const config = makeOfflineConfig();
    const badResp = await handleRequest(
      new Request("http://localhost:4460/pricing?currency=EUR"),
      config,
    );
    expect(badResp.status).toBe(400);

    const htmlResp = await handleRequest(
      new Request("http://localhost:4460/pricing?currency=IDR&format=html"),
      config,
    );
    expect(htmlResp.status).toBe(200);
    expect(htmlResp.headers.get("content-type")).toContain("text/html");
    const html = await htmlResp.text();
    expect(html).toContain("MoonWitness PaaS Pricing (IDR)");
    expect(html).toContain("/pricing?currency=USD");
    expect(html).toContain("/pricing?currency=IDR");
    expect(html).toContain('type="application/ld+json"');
    expect(html).not.toContain("<img");
  });

  test("POST /api/pricing/checkout-intent creates QRIS and VA checkout payloads and validates inputs", async () => {
    const config = makeOfflineConfig();

    const qrisResp = await handleRequest(
      new Request("http://localhost:4460/api/pricing/checkout-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "starter", currency: "IDR", paymentMethod: "QRIS" }),
      }),
      config,
    );
    expect(qrisResp.status).toBe(200);
    const qrisBody = (await qrisResp.json()) as {
      status: string;
      tier: string;
      amountUsd: number;
      amountIdr: number;
      paymentMethod: string;
      qris: { amountIdr: number; emvCoString: string; crc16: string } | null;
      virtualAccount: unknown;
    };
    expect(qrisBody.status).toBe("pending_payment");
    expect(qrisBody.tier).toBe("starter");
    expect(qrisBody.amountUsd).toBe(19);
    expect(qrisBody.amountIdr).toBe(304000);
    expect(qrisBody.paymentMethod).toBe("QRIS");
    expect(qrisBody.qris?.amountIdr).toBe(304000);
    expect(qrisBody.virtualAccount).toBeNull();

    const vaResp = await handleRequest(
      new Request("http://localhost:4460/api/pricing/checkout-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "enterprise", paymentMethod: "VA", bankCode: "BSI" }),
      }),
      config,
    );
    expect(vaResp.status).toBe(200);
    const vaBody = (await vaResp.json()) as {
      paymentMethod: string;
      amountIdr: number;
      qris: unknown;
      virtualAccount: { bankCode: string; bankName: string; accountNumber: string; amountIdr: number } | null;
    };
    expect(vaBody.paymentMethod).toBe("VA");
    expect(vaBody.amountIdr).toBe(399 * 16000);
    expect(vaBody.qris).toBeNull();
    expect(vaBody.virtualAccount?.bankCode).toBe("BSI");
    expect(vaBody.virtualAccount?.accountNumber.startsWith("45100")).toBe(true);
    expect(vaBody.virtualAccount?.amountIdr).toBe(399 * 16000);

    const freeResp = await handleRequest(
      new Request("http://localhost:4460/api/pricing/checkout-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "free", paymentMethod: "QRIS" }),
      }),
      config,
    );
    expect(freeResp.status).toBe(400);

    const invalidBankResp = await handleRequest(
      new Request("http://localhost:4460/api/pricing/checkout-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: "starter", paymentMethod: "VA", bankCode: "UNKNOWN" }),
      }),
      config,
    );
    expect(invalidBankResp.status).toBe(400);

    const getResp = await handleRequest(
      new Request("http://localhost:4460/api/pricing/checkout-intent"),
      config,
    );
    expect(getResp.status).toBe(405);
  });
});

describe("V23: 30d SLA & Sharia Mizan transparency widget", () => {
  test("SlaTracker prunes samples older than 30 days and calculates exact availability", () => {
    const tracker = new SlaTracker();
    const now = Date.parse("2026-11-27T12:00:00Z");
    const expiredTs = now - THIRTY_DAYS_MS - 1000;

    tracker.record("degraded", [{ id: "mw-nexus", url: "http://mw-nexus/health", status: "offline", httpStatus: null, reason: "old" }], expiredTs);
    tracker.record("ok", [{ id: "mw-nexus", url: "http://mw-nexus/health", status: "online", httpStatus: 200, reason: null }], now - 60_000);
    tracker.record("degraded", [{ id: "mw-nexus", url: "http://mw-nexus/health", status: "offline", httpStatus: 503, reason: "down" }], now);

    const summary = tracker.getSummary(now);
    expect(summary.windowDays).toBe(30);
    expect(summary.observedSampleCount).toBe(2);
    expect(summary.healthySampleCount).toBe(1);
    expect(summary.degradedSampleCount).toBe(1);
    expect(summary.observedAvailabilityPercent).toBe(50);
    expect(summary.upstreamAvailability["mw-nexus"]).toEqual({
      observedSamples: 2,
      onlineSamples: 1,
      availabilityPercent: 50,
    });
  });

  test("GET /api/status/widget exposes real 30d SLA telemetry & Sharia Mizan transparency", async () => {
    const tracker = new SlaTracker();
    const onlineConfig = makeOnlineConfig(undefined, { slaTracker: tracker });
    const offlineConfig = makeOfflineConfig({ slaTracker: tracker });

    // First probe online via /status
    const statusResp = await handleRequest(new Request("http://localhost:4460/status"), onlineConfig);
    expect(statusResp.status).toBe(200);

    // Second probe offline via /api/status/widget
    const widgetResp = await handleRequest(
      new Request("http://localhost:4460/api/status/widget"),
      offlineConfig,
    );
    expect(widgetResp.status).toBe(200);

    const body = (await widgetResp.json()) as {
      widget: string;
      status: string;
      sla30d: {
        windowDays: number;
        targetSlaPercent: number;
        observedSampleCount: number;
        healthySampleCount: number;
        degradedSampleCount: number;
        observedAvailabilityPercent: number | null;
      };
      shariaMizan: {
        advisoryBadge: string;
        standards: string[];
        epistemicSeparation: { enforced: boolean; layerCount: number; primaryTextLayer: string; advisoryLayer: string };
        financialPrinciples: { ribaFree: boolean; ghararFree: boolean; maysirFree: boolean; latePenaltyIdr: number };
        zeroFakeData: boolean;
        mizanNexusStatus: string;
      };
    };

    expect(body.widget).toBe("sla-30d-sharia-mizan");
    expect(body.status).toBe("degraded");
    expect(body.sla30d.windowDays).toBe(30);
    expect(body.sla30d.targetSlaPercent).toBe(99.9);
    expect(body.sla30d.observedSampleCount).toBe(2);
    expect(body.sla30d.healthySampleCount).toBe(1);
    expect(body.sla30d.degradedSampleCount).toBe(1);
    expect(body.sla30d.observedAvailabilityPercent).toBe(50);

    expect(body.shariaMizan.standards).toEqual(["CAN-0011", "CAN-0012", "CAN-0013", "CAN-0014", "ADR-0005"]);
    expect(body.shariaMizan.epistemicSeparation).toEqual({
      enforced: true,
      layerCount: 8,
      primaryTextLayer: "L1",
      advisoryLayer: "L8",
    });
    expect(body.shariaMizan.financialPrinciples.ribaFree).toBe(true);
    expect(body.shariaMizan.financialPrinciples.ghararFree).toBe(true);
    expect(body.shariaMizan.financialPrinciples.maysirFree).toBe(true);
    expect(body.shariaMizan.financialPrinciples.latePenaltyIdr).toBe(0);
    expect(body.shariaMizan.zeroFakeData).toBe(true);
    expect(body.shariaMizan.mizanNexusStatus).toBe("offline");
  });

  test("GET /widgets/sla-mizan renders HTML widget component without <img> tags and rejects non-GET", async () => {
    const config = makeOnlineConfig();
    const htmlResp = await handleRequest(
      new Request("http://localhost:4460/widgets/sla-mizan"),
      config,
    );
    expect(htmlResp.status).toBe(200);
    expect(htmlResp.headers.get("content-type")).toContain("text/html");
    const html = await htmlResp.text();
    expect(html).toContain("30d SLA &amp; Sharia Mizan Transparency");
    expect(html).toContain("Riba-Free");
    expect(html).toContain("100.00%");
    expect(html).not.toContain("<img");

    const postResp = await handleRequest(
      new Request("http://localhost:4460/widgets/sla-mizan", { method: "POST" }),
      config,
    );
    expect(postResp.status).toBe(405);
  });
});

describe("V66: Dynamic XML sitemap, schema.org JSON-LD, and ?ref= affiliate attribution", () => {
  test("GET /sitemap.xml dynamically includes core routes and live+curated PaaS catalog templates", async () => {
    const liveConfig = makeOnlineConfig((async (url: string | URL | Request) => {
      if (String(url).includes("/paas/templates")) {
        return new Response(
          JSON.stringify({
            templates: [
              {
                id: "redis-cache",
                name: "Redis Cache",
                category: "database",
                description: "In-memory cache",
                image: "redis:7-alpine",
                minPlan: "starter",
                port: 6379,
                tags: ["redis"],
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as unknown as typeof fetch);

    const response = await handleRequest(
      new Request("http://localhost:4460/sitemap.xml"),
      liveConfig,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/xml");
    const xml = await response.text();
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain("<loc>https://a-l-l-a-h.com/</loc>");
    expect(xml).toContain("<loc>https://a-l-l-a-h.com/pricing</loc>");
    expect(xml).toContain("<loc>https://a-l-l-a-h.com/pricing?currency=IDR</loc>");
    expect(xml).toContain("<loc>https://a-l-l-a-h.com/widgets/sla-mizan</loc>");
    expect(xml).toContain("<loc>https://a-l-l-a-h.com/paas/catalog?category=database</loc>");
    expect(xml).toContain("<loc>https://a-l-l-a-h.com/paas/catalog?q=redis-cache</loc>");
    expect(xml).toContain("<loc>https://a-l-l-a-h.com/paas/catalog?q=wordpress</loc>");

    // Graceful offline fallback still serves curated templates
    const offlineResp = await handleRequest(
      new Request("http://localhost:4460/sitemap.xml"),
      makeOfflineConfig(),
    );
    expect(offlineResp.status).toBe(200);
    const offlineXml = await offlineResp.text();
    expect(offlineXml).toContain("<loc>https://a-l-l-a-h.com/paas/catalog?q=wordpress</loc>");
  });

  test("GET / includes valid schema.org JSON-LD metadata with Organization, WebSite, and USD/IDR Offers", async () => {
    const response = await handleRequest(
      new Request("http://localhost:4460/"),
      makeOfflineConfig(),
    );
    expect(response.status).toBe(200);
    const html = await response.text();
    const match = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html);
    expect(match).not.toBeNull();

    const jsonLd = JSON.parse(match![1]!) as {
      "@context": string;
      "@graph": Array<{
        "@type": string;
        offers?: Array<{ priceCurrency: string; price: string }>;
      }>;
    };
    expect(jsonLd["@context"]).toBe("https://schema.org");
    const types = jsonLd["@graph"].map((node) => node["@type"]);
    expect(types).toContain("Organization");
    expect(types).toContain("WebSite");
    expect(types).toContain("SoftwareApplication");

    const appNode = jsonLd["@graph"].find((node) => node["@type"] === "SoftwareApplication");
    const currencies = new Set(appNode?.offers?.map((offer) => offer.priceCurrency));
    expect(currencies.has("USD")).toBe(true);
    expect(currencies.has("IDR")).toBe(true);
  });

  test("?ref= affiliate attribution is captured, persisted via cookie, sanitized, and propagated across portal & checkout", async () => {
    const config = makeOfflineConfig();

    // 1. Capture via GET /?ref=partner_alpha_7
    const portalResp = await handleRequest(
      new Request("http://localhost:4460/?ref=partner_alpha_7"),
      config,
    );
    expect(portalResp.status).toBe(200);
    const setCookie = portalResp.headers.get("set-cookie");
    expect(setCookie).toContain("mw_ref=partner_alpha_7");
    expect(setCookie).toContain("Max-Age=2592000");

    const portalHtml = await portalResp.text();
    expect(portalHtml).toContain('<meta name="mw-affiliate-ref" content="partner_alpha_7" />');
    expect(portalHtml).toContain("/pricing?currency=IDR&amp;ref=partner_alpha_7");
    expect(portalHtml).toContain("/paas/catalog?ref=partner_alpha_7");

    // 2. Propagate via Cookie on GET /pricing
    const pricingResp = await handleRequest(
      new Request("http://localhost:4460/pricing?currency=IDR", {
        headers: { Cookie: "mw_ref=partner_alpha_7" },
      }),
      config,
    );
    expect(pricingResp.status).toBe(200);
    expect(pricingResp.headers.get("set-cookie")).toBeNull();
    const pricingBody = (await pricingResp.json()) as {
      toggleUrls: { USD: string; IDR: string };
      checkoutIntent: { affiliateRef: string | null };
      attribution: { ref: string | null; source: string; cookieName: string; ttlDays: number };
    };
    expect(pricingBody.attribution).toEqual({
      ref: "partner_alpha_7",
      source: "cookie",
      cookieName: "mw_ref",
      ttlDays: 30,
    });
    expect(pricingBody.toggleUrls.IDR).toBe("/pricing?currency=IDR&ref=partner_alpha_7");
    expect(pricingBody.checkoutIntent.affiliateRef).toBe("partner_alpha_7");

    // 3. Propagate into POST /api/pricing/checkout-intent from cookie & override with body.ref
    const cookieCheckoutResp = await handleRequest(
      new Request("http://localhost:4460/api/pricing/checkout-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "mw_ref=partner_alpha_7",
        },
        body: JSON.stringify({ tier: "starter", paymentMethod: "QRIS" }),
      }),
      config,
    );
    const cookieCheckoutBody = (await cookieCheckoutResp.json()) as {
      affiliateRef: string | null;
      attribution: { ref: string | null; source: string };
    };
    expect(cookieCheckoutBody.affiliateRef).toBe("partner_alpha_7");
    expect(cookieCheckoutBody.attribution.source).toBe("cookie");

    const overrideCheckoutResp = await handleRequest(
      new Request("http://localhost:4460/api/pricing/checkout-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "mw_ref=partner_alpha_7",
        },
        body: JSON.stringify({ tier: "starter", paymentMethod: "QRIS", ref: "partner_beta_9" }),
      }),
      config,
    );
    expect(overrideCheckoutResp.headers.get("set-cookie")).toContain("mw_ref=partner_beta_9");
    const overrideCheckoutBody = (await overrideCheckoutResp.json()) as {
      affiliateRef: string | null;
      attribution: { ref: string | null; source: string };
    };
    expect(overrideCheckoutBody.affiliateRef).toBe("partner_beta_9");
    expect(overrideCheckoutBody.attribution.source).toBe("body");

    // 4. Reject / ignore unsafe ref payloads
    const unsafeResp = await handleRequest(
      new Request("http://localhost:4460/api/attribution?ref=%3Cscript%3Ealert(1)%3C/script%3E"),
      config,
    );
    expect(unsafeResp.status).toBe(200);
    expect(unsafeResp.headers.get("set-cookie")).toBeNull();
    const unsafeBody = (await unsafeResp.json()) as { ref: string | null; source: string };
    expect(unsafeBody.ref).toBeNull();
    expect(unsafeBody.source).toBe("none");
  });
});
