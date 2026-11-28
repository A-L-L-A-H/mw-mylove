import type { ApiConfig } from "../config";
import type { UpstreamProbeResult, UpstreamRequest } from "./types";

export const DEFAULT_UPSTREAM_TIMEOUT_MS = 250;

export type UpstreamFetcher = (
  url: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export interface FetchUpstreamOptions {
  readonly fetcher?: UpstreamFetcher;
  readonly timeoutMs?: number;
}

export function resolveUpstreamTimeoutMs(
  env: NodeJS.ProcessEnv = process.env,
  timeoutMs?: number,
): number {
  if (timeoutMs !== undefined && Number.isInteger(timeoutMs) && timeoutMs > 0) {
    return timeoutMs;
  }

  const raw = env.MW_UPSTREAM_TIMEOUT_MS;
  if (raw === undefined || raw.trim() === "") {
    return DEFAULT_UPSTREAM_TIMEOUT_MS;
  }

  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : DEFAULT_UPSTREAM_TIMEOUT_MS;
}

export async function fetchUpstreamJson<T = unknown>(
  targetUrl: string,
  _config: ApiConfig,
  options: UpstreamRequest & FetchUpstreamOptions = {},
): Promise<UpstreamProbeResult<T>> {
  const fetcher = options.fetcher ?? fetch;
  const controller = new AbortController();
  const timeoutMs = resolveUpstreamTimeoutMs(process.env, options.timeoutMs);
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const method = options.method ?? "GET";

  try {
    const headers: Record<string, string> = {
      Accept: "application/json, image/svg+xml",
    };
    let body: string | undefined;
    if (method === "POST" && options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.body);
    }

    const upstreamResponse = await fetcher(targetUrl, {
      method,
      headers,
      body,
      signal: controller.signal,
    });
    if (!upstreamResponse.ok) {
      return {
        status: "offline",
        httpStatus: upstreamResponse.status,
        reason: `Upstream returned HTTP ${upstreamResponse.status}`,
        payload: null,
      };
    }

    const contentType = upstreamResponse.headers.get("content-type") ?? "";
    const payload = contentType.includes("image/svg+xml")
      ? ({ svg: await upstreamResponse.text() } as T)
      : ((await upstreamResponse.json()) as T);
    return {
      status: "online",
      httpStatus: upstreamResponse.status,
      reason: null,
      payload,
    };
  } catch (error) {
    return {
      status: "offline",
      httpStatus: null,
      reason: error instanceof Error ? error.message : "Upstream unreachable",
      payload: null,
    };
  } finally {
    clearTimeout(timer);
  }
}
