import { describe, expect, test } from "bun:test";
import { handleRequest, resolveConfig, type PortalConfig } from "../src/server.ts";
import { PAAS_CATALOG_TEMPLATES, PRICING_TIERS } from "../src/storefront.ts";

function makeOfflineConfig(cpUrl = "http://127.0.0.1:19996"): PortalConfig {
  return resolveConfig({
    port: 4460,
    corpusUrl: "http://127.0.0.1:19991",
    nexusUrl: "http://127.0.0.1:19992",
    loreUrl: "http://127.0.0.1:19993",
    echoUrl: "http://127.0.0.1:19994",
    studioUrl: "http://127.0.0.1:19995",
    cpUrl,
    upstreamTimeoutMs: 250,
    fetcher: (async () => {
      throw new Error("ECONNREFUSED");
    }) as unknown as typeof fetch,
  });
}

describe("mw-mylove Storefront Routes (/pricing, /status, /paas/catalog)", () => {
  test("GET /pricing returns canonical 4-tier pricing and compliance metadata", async () => {
    const response = await handleRequest(
      new Request("http://localhost:4460/pricing"),
      makeOfflineConfig(),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(response.headers.get("cache-control")).toBe("no-store");

    const body = (await response.json()) as {
      domain: string;
      service: string;
      currency: string;
      billingCycle: string;
      tiers: typeof PRICING_TIERS;
      compliance: string[];
    };
    expect(body.domain).toBe("a-l-l-a-h.com");
    expect(body.service).toBe("mw-mylove");
    expect(body.currency).toBe("USD");
    expect(body.billingCycle).toBe("monthly");
    expect(body.compliance).toEqual(["CAN-0011", "CAN-0012", "CAN-0013", "CAN-0014", "ADR-0005"]);
    expect(body.tiers.map((t) => t.tier)).toEqual(["free", "starter", "pro", "enterprise"]);
    expect(body.tiers.map((t) => t.monthlyUsd)).toEqual([0, 19, 79, 399]);

    for (const tier of body.tiers) {
      expect(tier.included.containerHours).toBeGreaterThan(0);
      expect(tier.quotaLimits.maxApps).toBeGreaterThan(0);
      expect(tier.quotaLimits.maxRamMb).toBeGreaterThan(0);
    }
  });

  test("GET /status probes configured upstreams in parallel and reports ok when all are online", async () => {
    const probedUrls: string[] = [];
    const onlineConfig = resolveConfig({
      corpusUrl: "http://mw-corpus.local:4420",
      nexusUrl: "http://mw-nexus.local:4430",
      loreUrl: "http://mw-lore.local:4450",
      echoUrl: "http://mw-echo.local:4310",
      studioUrl: "http://mw-studio.local:4470",
      cpUrl: "http://mw-cp.local:4440",
      fetcher: (async (url: string | URL | Request) => {
        probedUrls.push(String(url));
        return new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }) as unknown as typeof fetch,
    });

    const response = await handleRequest(new Request("http://localhost:4460/status"), onlineConfig);
    expect(response.status).toBe(200);

    const body = (await response.json()) as {
      status: "ok" | "degraded";
      service: string;
      domain: string;
      timestamp: string;
      upstreams: Array<{
        id: string;
        url: string;
        status: "online" | "offline";
        httpStatus: number | null;
        reason: string | null;
      }>;
    };

    expect(body.status).toBe("ok");
    expect(body.service).toBe("mw-mylove");
    expect(body.domain).toBe("a-l-l-a-h.com");
    expect(Number.isNaN(Date.parse(body.timestamp))).toBe(false);
    expect(body.upstreams.length).toBe(6);
    expect(probedUrls.sort()).toEqual([
      "http://mw-corpus.local:4420/health",
      "http://mw-cp.local:4440/health",
      "http://mw-echo.local:4310/health",
      "http://mw-lore.local:4450/health",
      "http://mw-nexus.local:4430/health",
      "http://mw-studio.local:4470/health",
    ]);
    for (const upstream of body.upstreams) {
      expect(upstream.status).toBe("online");
      expect(upstream.httpStatus).toBe(200);
      expect(upstream.reason).toBeNull();
    }
  });

  test("GET /status reports degraded with exact offline reasons when all or some upstreams fail", async () => {
    const offlineResp = await handleRequest(
      new Request("http://localhost:4460/status"),
      makeOfflineConfig(),
    );
    expect(offlineResp.status).toBe(200);
    const offlineBody = (await offlineResp.json()) as {
      status: string;
      upstreams: Array<{ id: string; status: string; httpStatus: number | null; reason: string | null }>;
    };
    expect(offlineBody.status).toBe("degraded");
    expect(offlineBody.upstreams.length).toBe(6);
    for (const upstream of offlineBody.upstreams) {
      expect(upstream.status).toBe("offline");
      expect(upstream.httpStatus).toBeNull();
      expect(upstream.reason).toBe("ECONNREFUSED");
    }

    const partialConfig = resolveConfig({
      cpUrl: "http://mw-cp.local:4440",
      echoUrl: "http://mw-echo.local:4310",
      fetcher: (async (url: string | URL | Request) => {
        const target = String(url);
        if (target.includes("mw-cp.local")) {
          return new Response("Service Unavailable", { status: 503 });
        }
        if (target.includes("mw-echo.local")) {
          throw new Error("connect ETIMEDOUT");
        }
        return new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }) as unknown as typeof fetch,
    });

    const partialResp = await handleRequest(new Request("http://localhost:4460/status"), partialConfig);
    expect(partialResp.status).toBe(200);
    const partialBody = (await partialResp.json()) as {
      status: string;
      upstreams: Array<{ id: string; status: string; httpStatus: number | null; reason: string | null }>;
    };
    expect(partialBody.status).toBe("degraded");

    const cpEntry = partialBody.upstreams.find((u) => u.id === "mw-cp");
    const echoEntry = partialBody.upstreams.find((u) => u.id === "mw-echo");
    const corpusEntry = partialBody.upstreams.find((u) => u.id === "mw-corpus");
    expect(cpEntry).toMatchObject({ status: "offline", httpStatus: 503, reason: "Upstream returned HTTP 503" });
    expect(echoEntry).toMatchObject({ status: "offline", httpStatus: null, reason: "connect ETIMEDOUT" });
    expect(corpusEntry).toMatchObject({ status: "online", httpStatus: 200, reason: null });
  });

  test("GET /paas/catalog supports ?category and ?q filtering with graceful offline fallback", async () => {
    const offlineConfig = makeOfflineConfig();

    const allResp = await handleRequest(new Request("http://localhost:4460/paas/catalog"), offlineConfig);
    expect(allResp.status).toBe(200);
    const allBody = (await allResp.json()) as {
      domain: string;
      service: string;
      upstream: string;
      upstreamStatus: string;
      upstreamReason: string | null;
      source: string;
      total: number;
      templates: Array<{ id: string; category: string; tags: string[] }>;
    };
    expect(allBody.domain).toBe("a-l-l-a-h.com");
    expect(allBody.service).toBe("mw-mylove");
    expect(allBody.upstream).toBe("mw-cp");
    expect(allBody.upstreamStatus).toBe("offline");
    expect(allBody.upstreamReason).toBe("ECONNREFUSED");
    expect(allBody.source).toBe("curated");
    expect(allBody.total).toBe(PAAS_CATALOG_TEMPLATES.length);
    expect(allBody.templates.length).toBe(PAAS_CATALOG_TEMPLATES.length);

    const catResp = await handleRequest(
      new Request("http://localhost:4460/paas/catalog?category=AUTOMATION"),
      offlineConfig,
    );
    expect(catResp.status).toBe(200);
    const catBody = (await catResp.json()) as {
      filters: { category: string | null; q: string | null };
      total: number;
      templates: Array<{ id: string; category: string }>;
    };
    expect(catBody.filters).toEqual({ category: "automation", q: null });
    expect(catBody.total).toBe(1);
    expect(catBody.templates[0]?.id).toBe("n8n");

    const queryResp = await handleRequest(
      new Request("http://localhost:4460/paas/catalog?q=sqlite"),
      offlineConfig,
    );
    expect(queryResp.status).toBe(200);
    const queryBody = (await queryResp.json()) as {
      filters: { category: string | null; q: string | null };
      total: number;
      templates: Array<{ id: string }>;
    };
    expect(queryBody.filters).toEqual({ category: null, q: "sqlite" });
    expect(queryBody.total).toBe(1);
    expect(queryBody.templates[0]?.id).toBe("pocketbase");

    const emptyResp = await handleRequest(
      new Request("http://localhost:4460/paas/catalog?category=cms&q=nonexistent-xyz"),
      offlineConfig,
    );
    expect(emptyResp.status).toBe(200);
    const emptyBody = (await emptyResp.json()) as { total: number; templates: unknown[] };
    expect(emptyBody.total).toBe(0);
    expect(emptyBody.templates).toEqual([]);
  });

  test("GET /paas/catalog merges live mw-cp /paas/templates when upstream is online", async () => {
    let requestedUrl = "";
    const liveConfig = resolveConfig({
      cpUrl: "http://mw-cp.local:4440",
      fetcher: (async (url: string | URL | Request) => {
        requestedUrl = String(url);
        return new Response(
          JSON.stringify({
            templates: [
              {
                id: "wordpress",
                description: "Managed WordPress live from mw-cp",
                ports: [80, 443],
              },
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
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }) as unknown as typeof fetch,
    });

    const response = await handleRequest(
      new Request("http://localhost:4460/paas/catalog?q=redis"),
      liveConfig,
    );
    expect(response.status).toBe(200);
    expect(requestedUrl).toBe("http://mw-cp.local:4440/paas/templates");

    const body = (await response.json()) as {
      upstreamStatus: string;
      upstreamReason: string | null;
      source: string;
      total: number;
      templates: Array<{ id: string; ports: number[]; minPlan: string }>;
    };
    expect(body.upstreamStatus).toBe("online");
    expect(body.upstreamReason).toBeNull();
    expect(body.source).toBe("live+curated");
    expect(body.total).toBe(1);
    expect(body.templates[0]?.id).toBe("redis-cache");
    expect(body.templates[0]?.ports).toEqual([6379]);
    expect(body.templates[0]?.minPlan).toBe("starter");
  });

  test("non-GET methods on /pricing, /status, and /paas/catalog return 405 Method Not Allowed", async () => {
    const config = makeOfflineConfig();
    for (const path of ["/pricing", "/status", "/paas/catalog"]) {
      for (const method of ["POST", "PUT", "DELETE"]) {
        const response = await handleRequest(
          new Request(`http://localhost:4460${path}`, { method }),
          config,
        );
        expect(response.status).toBe(405);
        const body = (await response.json()) as { error: string };
        expect(body.error).toBe("Method not allowed");
      }
    }
  });
});
