import { describe, expect, test } from "bun:test";
import {
  ECOSYSTEM_REPOS,
  EPISTEMIC_LAYERS,
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
});
