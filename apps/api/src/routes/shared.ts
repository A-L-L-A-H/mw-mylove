import type { FastifyReply, FastifyRequest } from "fastify";
import {
  buildAffiliateSetCookieHeader,
  resolveAffiliateContext,
} from "@mw/seo";
import type { ApiConfig } from "../config";
import { fetchUpstreamJson } from "../upstream/fetch";

export type ProbeFn = (
  targetUrl: string,
  options?: { method?: "GET" | "POST"; body?: unknown },
) => ReturnType<typeof fetchUpstreamJson>;

export function createProbe(config: ApiConfig, timeoutMs: number): ProbeFn {
  return (targetUrl, options = {}) =>
    fetchUpstreamJson(targetUrl, config, { ...options, timeoutMs });
}

export function headerString(
  value: string | string[] | undefined,
): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

export function makeUrl(request: FastifyRequest, config: ApiConfig): URL {
  return new URL(request.url, config.origin);
}

export function requestAffinity(request: FastifyRequest, url: URL) {
  const headers = new Headers();
  const cookie = headerString(request.headers.cookie);
  if (cookie) {
    headers.set("cookie", cookie);
  }
  return resolveAffiliateContext(new Request(url.toString(), { headers }), url);
}

function withAffiliateCookie(
  reply: FastifyReply,
  statusOrRef?: number | string | null,
): number {
  const status = typeof statusOrRef === "number" ? statusOrRef : 200;
  const ref = typeof statusOrRef === "string" ? statusOrRef : null;
  const cookie = ref ? buildAffiliateSetCookieHeader(ref) : null;
  if (cookie) {
    reply.header("set-cookie", cookie);
  }
  return status;
}

export function sendJson(
  reply: FastifyReply,
  body: unknown,
  statusOrRef?: number | string | null,
): FastifyReply {
  const status = withAffiliateCookie(reply, statusOrRef);
  return reply
    .code(status)
    .header("cache-control", "no-store")
    .header("x-content-type-options", "nosniff")
    .type("application/json; charset=utf-8")
    .send(body);
}

export function sendHtml(
  reply: FastifyReply,
  body: string,
  statusOrRef?: number | string | null,
): FastifyReply {
  const status = withAffiliateCookie(reply, statusOrRef);
  return reply
    .code(status)
    .header("x-content-type-options", "nosniff")
    .type("text/html; charset=utf-8")
    .send(body);
}

export function sendXml(
  reply: FastifyReply,
  body: string,
  statusOrRef?: number | string | null,
): FastifyReply {
  const status = withAffiliateCookie(reply, statusOrRef);
  return reply
    .code(status)
    .header("cache-control", "no-store")
    .header("x-content-type-options", "nosniff")
    .type("application/xml; charset=utf-8")
    .send(body);
}

export function parseBody(
  request: FastifyRequest,
): Record<string, unknown> | null {
  if (
    !request.body ||
    typeof request.body !== "object" ||
    Array.isArray(request.body)
  ) {
    return null;
  }
  return request.body as Record<string, unknown>;
}
