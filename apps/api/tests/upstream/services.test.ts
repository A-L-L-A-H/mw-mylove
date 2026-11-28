import { describe, expect, test } from "bun:test";
import type { ApiConfig } from "../../src/config";
import type { UpstreamFetcher } from "../../src/upstream/fetch";
import { createUpstreamServices } from "../../src/upstream/services";
import { getUpstreamTargets } from "../../src/upstream/targets";

function config(): ApiConfig {
  return {
    port: 4490,
    origin: "http://localhost:4490",
    upstreamUrls: {
      corpus: "http://corpus/",
      nexus: "http://nexus/",
      lore: "http://lore/",
      echo: "http://echo/",
      studio: "http://studio/",
      cp: "http://cp/",
    },
  };
}

function capture(): {
  calls: Array<{ url: string; init?: RequestInit }>;
  fetcher: UpstreamFetcher;
} {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetcher: UpstreamFetcher = async (url, init) => {
    calls.push({ url: String(url), ...(init ? { init } : {}) });
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  return { calls, fetcher };
}

describe("createUpstreamServices", () => {
  test("routes every service to its upstream endpoint", async () => {
    const { calls, fetcher } = capture();
    const services = createUpstreamServices(config());
    const options = { fetcher };

    await services.corpus.search("a b", options);
    await services.corpus.analyzeAqel("نص", options);
    await services.nexus.domains(options);
    await services.nexus.convertTime("2026-11-28T12:00:00Z", options);
    await services.lore.list(options);
    await services.echo.list(options);
    await services.studio.list(options);
    await services.cp.list(options);

    expect(calls.map((call) => call.url)).toEqual([
      "http://corpus/api/search?q=a%20b",
      "http://corpus/api/aqel/analyze",
      "http://nexus/api/domains",
      "http://nexus/api/time/convert?ts=2026-11-28T12%3A00%3A00Z",
      "http://lore/api/eras",
      "http://echo/api/events",
      "http://studio/api/render/poster",
      "http://cp/paas/templates",
    ]);
    expect(calls[1]?.init?.method).toBe("POST");
    expect(calls[1]?.init?.body).toBe(JSON.stringify({ text: "نص" }));
  });

  test("returns an offline result when an upstream is empty", async () => {
    const fetcher: UpstreamFetcher = async () => {
      throw new Error("offline");
    };
    const services = createUpstreamServices(config());

    const result = await services.lore.list({ fetcher });
    expect(result).toEqual({
      status: "offline",
      httpStatus: null,
      reason: "offline",
      payload: null,
    });
  });
});

describe("getUpstreamTargets", () => {
  test("includes all six upstream services", () => {
    expect(getUpstreamTargets(config()).map((target) => target.id)).toEqual([
      "mw-corpus",
      "mw-nexus",
      "mw-lore",
      "mw-echo",
      "mw-studio",
      "mw-cp",
    ]);
  });
});
