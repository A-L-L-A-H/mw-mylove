import { describe, expect, test } from "bun:test";
import Fastify from "fastify";
import { buildApp } from "../../src/app";
import { loadConfig } from "../../src/config";

function makeConfig(): ReturnType<typeof loadConfig> {
  return loadConfig({
    MW_API_ORIGIN: "http://localhost:4490",
    MW_API_PORT: "4490",
    MW_CORPUS_URL: "http://127.0.0.1:19991",
    MW_NEXUS_URL: "http://127.0.0.1:19992",
    MW_LORE_URL: "http://127.0.0.1:19993",
    MW_ECHO_URL: "http://127.0.0.1:19994",
    MW_STUDIO_URL: "http://127.0.0.1:19995",
    MW_CP_URL: "http://127.0.0.1:19996",
    MW_UPSTREAM_TIMEOUT_MS: "20",
  });
}

describe("Fastify extracted API routes", () => {
  test("registers health, ecosystem, pricing, catalog, and widget routes", async () => {
    const app = Fastify();
    buildApp(app, makeConfig());
    await app.ready();

    const health = await app.inject({ method: "GET", url: "/health" });
    expect(health.statusCode).toBe(200);
    expect(health.json()).toMatchObject({ status: "ok", service: "mw-mylove" });

    const ecosystem = await app.inject({
      method: "GET",
      url: "/api/ecosystem",
    });
    expect(ecosystem.statusCode).toBe(200);
    expect(ecosystem.json().repositories.length).toBeGreaterThan(0);

    const pricing = await app.inject({
      method: "GET",
      url: "/pricing?currency=IDR",
    });
    expect(pricing.statusCode).toBe(200);
    expect(pricing.json().currency).toBe("IDR");

    const catalog = await app.inject({ method: "GET", url: "/paas/catalog" });
    expect(catalog.statusCode).toBe(200);
    expect(catalog.json().service).toBe("mw-mylove");

    const widget = await app.inject({
      method: "GET",
      url: "/widgets/sla-mizan",
    });
    expect(widget.statusCode).toBe(200);
    expect(widget.headers["content-type"]).toContain("text/html");

    const checkout = await app.inject({
      method: "POST",
      url: "/api/pricing/checkout-intent",
      payload: { tier: "starter", currency: "IDR", paymentMethod: "QRIS" },
    });
    expect(checkout.statusCode).toBe(200);
    expect(checkout.json().paymentMethod).toBe("QRIS");

    await app.close();
  });
});
