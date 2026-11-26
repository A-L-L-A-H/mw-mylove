import { describe, expect, test } from "bun:test";
import {
  AQEL_DISCLAIMER,
  ECOSYSTEM_REPOS,
  EPISTEMIC_LAYERS,
  MTIME_PROFILE_BADGE,
  NON_NORMATIVE_ADVISORY_BADGE,
  handleRequest,
  resolveConfig,
  type PortalConfig,
} from "../src/server.ts";

function makeOfflineConfig(): PortalConfig {
  return resolveConfig({
    port: 4460,
    corpusUrl: "http://127.0.0.1:19991",
    nexusUrl: "http://127.0.0.1:19992",
    loreUrl: "http://127.0.0.1:19993",
    echoUrl: "http://127.0.0.1:19994",
    studioUrl: "http://127.0.0.1:19995",
    upstreamTimeoutMs: 250,
    fetcher: (async () => {
      throw new Error("ECONNREFUSED");
    }) as unknown as typeof fetch,
  });
}

describe("mw-mylove Flagship Web Portal", () => {
  test("GET / serves typographic/geometric celestial HTML with CAN-0011..0014 & ADR 0005 labels", async () => {
    const response = await handleRequest(new Request("http://localhost:4460/"), makeOfflineConfig());
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    const html = await response.text();
    expect(html).toContain("A-L-L-A-H.COM");
    expect(html).toContain("CAN-0011..0014");
    expect(html).toContain("ADR 0005");
    expect(html).toContain(NON_NORMATIVE_ADVISORY_BADGE);
    expect(html).toContain("8-Layer Epistemic");
    expect(html).toContain(AQEL_DISCLAIMER);
    expect(html).toContain(MTIME_PROFILE_BADGE);
    expect(html).toContain("GOD PROMISE Typographic SVG Card Previewer");
    expect(html).not.toContain("<img");
  });

  test("GET /health reports ok status and compliance standards", async () => {
    const response = await handleRequest(new Request("http://localhost:4460/health"), makeOfflineConfig());
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      status: string;
      service: string;
      domain: string;
      compliance: string[];
    };
    expect(body.status).toBe("ok");
    expect(body.service).toBe("mw-mylove");
    expect(body.domain).toBe("a-l-l-a-h.com");
    expect(body.compliance).toEqual(["CAN-0011", "CAN-0012", "CAN-0013", "CAN-0014", "ADR-0005"]);
  });

  test("GET /api/ecosystem returns 13-repo directory and 8 epistemic layers", async () => {
    const response = await handleRequest(new Request("http://localhost:4460/api/ecosystem"), makeOfflineConfig());
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      repositoryCount: number;
      repositories: typeof ECOSYSTEM_REPOS;
      epistemicLayers: typeof EPISTEMIC_LAYERS;
    };
    expect(body.repositoryCount).toBe(13);
    expect(body.repositories.length).toBe(13);
    expect(body.epistemicLayers.length).toBe(8);
    expect(body.repositories.some((entry) => entry.id === "mw-mylove")).toBe(true);
  });

  test("offline upstream resilience returns empty arrays with zero fake data", async () => {
    const config = makeOfflineConfig();

    const corpusResp = await handleRequest(new Request("http://localhost:4460/api/corpus/search?q=promise"), config);
    const corpusBody = (await corpusResp.json()) as { status: string; results: unknown[]; epistemicLayers: unknown[] };
    expect(corpusResp.status).toBe(200);
    expect(corpusBody.status).toBe("offline");
    expect(corpusBody.results).toEqual([]);
    expect(corpusBody.epistemicLayers.length).toBe(8);

    const nexusResp = await handleRequest(new Request("http://localhost:4460/api/nexus/domains"), config);
    const nexusBody = (await nexusResp.json()) as { status: string; domains: unknown[]; advisoryBadge: string };
    expect(nexusResp.status).toBe(200);
    expect(nexusBody.status).toBe("offline");
    expect(nexusBody.domains).toEqual([]);
    expect(nexusBody.advisoryBadge).toBe(NON_NORMATIVE_ADVISORY_BADGE);

    const loreResp = await handleRequest(new Request("http://localhost:4460/api/lore/eras"), config);
    const loreBody = (await loreResp.json()) as { status: string; eras: unknown[] };
    expect(loreResp.status).toBe(200);
    expect(loreBody.status).toBe("offline");
    expect(loreBody.eras).toEqual([]);

    const radarResp = await handleRequest(new Request("http://localhost:4460/api/radar/events"), config);
    const radarBody = (await radarResp.json()) as { status: string; events: unknown[] };
    expect(radarResp.status).toBe(200);
    expect(radarBody.status).toBe("offline");
    expect(radarBody.events).toEqual([]);
  });

  test("live upstream proxy forwards JSON payload when upstream responds 200", async () => {
    const liveConfig = resolveConfig({
      fetcher: (async () =>
        new Response(JSON.stringify([{ id: "domain-1", label: "Mizan" }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })) as unknown as typeof fetch,
    });

    const nexusResp = await handleRequest(new Request("http://localhost:4460/api/nexus/domains"), liveConfig);
    const nexusBody = (await nexusResp.json()) as { status: string; domains: Array<{ id: string; label: string }> };
    expect(nexusResp.status).toBe(200);
    expect(nexusBody.status).toBe("online");
    expect(nexusBody.domains).toEqual([{ id: "domain-1", label: "Mizan" }]);
  });

  test("POST /api/aqel/analyze proxies to mw-corpus and handles offline resilience", async () => {
    let capturedUrl = "";
    let capturedBody = "";
    const liveConfig = resolveConfig({
      corpusUrl: "http://mw-corpus.local:4420",
      fetcher: (async (url: string | URL | Request, init?: RequestInit) => {
        capturedUrl = String(url);
        capturedBody = String(init?.body ?? "");
        return new Response(
          JSON.stringify({ tokens: [{ surface: "بسم", root: "س-م-و" }], particles: ["ب"] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }) as unknown as typeof fetch,
    });

    const onlineResp = await handleRequest(
      new Request("http://localhost:4460/api/aqel/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "بسم الله" }),
      }),
      liveConfig,
    );
    expect(onlineResp.status).toBe(200);
    expect(capturedUrl).toBe("http://mw-corpus.local:4420/api/aqel/analyze");
    expect(JSON.parse(capturedBody)).toEqual({ text: "بسم الله" });
    const onlineBody = (await onlineResp.json()) as {
      status: string;
      disclaimer: string;
      epistemicStatus: string;
      analysis: { particles: string[] };
    };
    expect(onlineBody.status).toBe("online");
    expect(onlineBody.epistemicStatus).toBe("computational_candidate");
    expect(onlineBody.disclaimer).toBe(AQEL_DISCLAIMER);
    expect(onlineBody.analysis.particles).toEqual(["ب"]);

    const offlineResp = await handleRequest(
      new Request("http://localhost:4460/api/aqel/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "الحمد لله" }),
      }),
      makeOfflineConfig(),
    );
    expect(offlineResp.status).toBe(200);
    const offlineBody = (await offlineResp.json()) as { status: string; analysis: unknown };
    expect(offlineBody.status).toBe("offline");
    expect(offlineBody.analysis).toBeNull();

    const invalidResp = await handleRequest(
      new Request("http://localhost:4460/api/aqel/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "   " }),
      }),
      makeOfflineConfig(),
    );
    expect(invalidResp.status).toBe(400);
  });

  test("GET /api/time/convert proxies ?ts to mw-nexus with profile stamp and offline resilience", async () => {
    let capturedUrl = "";
    const liveConfig = resolveConfig({
      nexusUrl: "http://mw-nexus.local:4430",
      fetcher: (async (url: string | URL | Request) => {
        capturedUrl = String(url);
        return new Response(
          JSON.stringify({ utc: "2026-11-26T12:00:00Z", hijri: "1448-06-16", lunarPhase: "waxing" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }) as unknown as typeof fetch,
    });

    const onlineResp = await handleRequest(
      new Request("http://localhost:4460/api/time/convert?ts=2026-11-26T12:00:00Z"),
      liveConfig,
    );
    expect(onlineResp.status).toBe(200);
    expect(capturedUrl).toBe("http://mw-nexus.local:4430/api/time/convert?ts=2026-11-26T12%3A00%3A00Z");
    const onlineBody = (await onlineResp.json()) as {
      status: string;
      profileBadge: string;
      conversion: { hijri: string };
    };
    expect(onlineBody.status).toBe("online");
    expect(onlineBody.profileBadge).toBe(MTIME_PROFILE_BADGE);
    expect(onlineBody.conversion.hijri).toBe("1448-06-16");

    const offlineResp = await handleRequest(
      new Request("http://localhost:4460/api/time/convert?ts=2026-11-26T12:00:00Z"),
      makeOfflineConfig(),
    );
    expect(offlineResp.status).toBe(200);
    const offlineBody = (await offlineResp.json()) as { status: string; conversion: unknown; profileBadge: string };
    expect(offlineBody.status).toBe("offline");
    expect(offlineBody.conversion).toBeNull();
    expect(offlineBody.profileBadge).toBe(MTIME_PROFILE_BADGE);
  });

  test("POST /api/poster/preview enforces CAN-0011 locally, proxies to mw-studio, and handles offline", async () => {
    let fetchCalled = false;
    const guardedConfig = resolveConfig({
      studioUrl: "http://mw-studio.local:4470",
      fetcher: (async () => {
        fetchCalled = true;
        return new Response(
          JSON.stringify({ svg: "<svg viewBox='0 0 100 100'><text>GOD PROMISE</text></svg>" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }) as unknown as typeof fetch,
    });

    const blockedResp = await handleRequest(
      new Request("http://localhost:4460/api/poster/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Portrait of Prophet Muhammad", subtitle: "drawing" }),
      }),
      guardedConfig,
    );
    expect(blockedResp.status).toBe(422);
    expect(fetchCalled).toBe(false);
    const blockedBody = (await blockedResp.json()) as { blocked: boolean; code: string; error: string };
    expect(blockedBody.blocked).toBe(true);
    expect(blockedBody.code).toBe("CAN-0011");
    expect(blockedBody.error).toBe("CAN-0011_VIOLATION");

    const allowedResp = await handleRequest(
      new Request("http://localhost:4460/api/poster/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Surah Al-Inshirah 94:5", subtitle: "Geometric celestial calligraphy" }),
      }),
      guardedConfig,
    );
    expect(allowedResp.status).toBe(200);
    expect(fetchCalled).toBe(true);
    const allowedBody = (await allowedResp.json()) as {
      status: string;
      compliance: string;
      poster: { svg: string };
    };
    expect(allowedBody.status).toBe("online");
    expect(allowedBody.compliance).toBe("CAN-0011");
    expect(allowedBody.poster.svg).toContain("<svg");

    const offlineResp = await handleRequest(
      new Request("http://localhost:4460/api/poster/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "GOD PROMISE", subtitle: "Rub el Hizb gold motif" }),
      }),
      makeOfflineConfig(),
    );
    expect(offlineResp.status).toBe(200);
    const offlineBody = (await offlineResp.json()) as { status: string; poster: unknown };
    expect(offlineBody.status).toBe("offline");
    expect(offlineBody.poster).toBeNull();
  });
});
