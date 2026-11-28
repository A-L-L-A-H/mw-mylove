import { describe, expect, test } from "bun:test";
import type { ApiConfig } from "../../src/config";
import {
  DEFAULT_UPSTREAM_TIMEOUT_MS,
  fetchUpstreamJson,
  resolveUpstreamTimeoutMs,
  type UpstreamFetcher,
} from "../../src/upstream/fetch";

function config(): ApiConfig {
  return {
    port: 4490,
    origin: "http://localhost:4490",
    upstreamUrls: {
      corpus: "http://corpus",
      nexus: "http://nexus",
      lore: "http://lore",
      echo: "http://echo",
      studio: "http://studio",
      cp: "http://cp",
    },
  };
}

describe("fetchUpstreamJson", () => {
  test("returns parsed payload with online status", async () => {
    const fetcher: UpstreamFetcher = async () =>
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });

    const result = await fetchUpstreamJson("http://corpus/health", config(), {
      fetcher,
    });
    expect(result).toEqual({
      status: "online",
      httpStatus: 200,
      reason: null,
      payload: { ok: true },
    });
  });

  test("returns offline shape on non-2xx response", async () => {
    const fetcher: UpstreamFetcher = async () =>
      new Response("nope", { status: 503 });

    const result = await fetchUpstreamJson("http://nexus/health", config(), {
      fetcher,
    });
    expect(result).toEqual({
      status: "offline",
      httpStatus: 503,
      reason: "Upstream returned HTTP 503",
      payload: null,
    });
  });

  test("returns offline shape on network failure", async () => {
    const fetcher: UpstreamFetcher = async () => {
      throw new Error("ECONNREFUSED");
    };

    const result = await fetchUpstreamJson("http://echo/health", config(), {
      fetcher,
    });
    expect(result.status).toBe("offline");
    expect(result.httpStatus).toBeNull();
    expect(result.payload).toBeNull();
    expect(result.reason).toBe("ECONNREFUSED");
  });

  test("accepts SVG responses as a payload", async () => {
    const fetcher: UpstreamFetcher = async () =>
      new Response("<svg />", {
        status: 200,
        headers: { "content-type": "image/svg+xml" },
      });

    const result = await fetchUpstreamJson(
      "http://studio/api/render/poster",
      config(),
      { fetcher },
    );
    expect(result).toEqual({
      status: "online",
      httpStatus: 200,
      reason: null,
      payload: { svg: "<svg />" },
    });
  });
});

describe("resolveUpstreamTimeoutMs", () => {
  test("defaults to 250ms", () => {
    expect(resolveUpstreamTimeoutMs({})).toBe(DEFAULT_UPSTREAM_TIMEOUT_MS);
    expect(DEFAULT_UPSTREAM_TIMEOUT_MS).toBe(250);
  });

  test("reads a positive integer from the environment", () => {
    expect(resolveUpstreamTimeoutMs({ MW_UPSTREAM_TIMEOUT_MS: "750" })).toBe(
      750,
    );
  });

  test("falls back on invalid values", () => {
    expect(resolveUpstreamTimeoutMs({ MW_UPSTREAM_TIMEOUT_MS: "0" })).toBe(250);
    expect(resolveUpstreamTimeoutMs({ MW_UPSTREAM_TIMEOUT_MS: "abc" })).toBe(
      250,
    );
  });
});
