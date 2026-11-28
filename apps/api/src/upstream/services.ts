import type { ApiConfig } from "../config";
import { fetchUpstreamJson, type FetchUpstreamOptions } from "./fetch";
import type { UpstreamProbeResult, UpstreamRequest } from "./types";

export type ServiceFetchOptions = FetchUpstreamOptions;

export interface CorpusService {
  search(
    query: string,
    options?: ServiceFetchOptions,
  ): Promise<UpstreamProbeResult>;
  analyzeAqel(
    text: string,
    options?: ServiceFetchOptions,
  ): Promise<UpstreamProbeResult>;
}

export interface NexusService {
  domains(options?: ServiceFetchOptions): Promise<UpstreamProbeResult>;
  convertTime(
    timestamp: string,
    options?: ServiceFetchOptions,
  ): Promise<UpstreamProbeResult>;
}

export interface SimpleUpstreamService {
  list(options?: ServiceFetchOptions): Promise<UpstreamProbeResult>;
}

export interface UpstreamServices {
  readonly corpus: CorpusService;
  readonly nexus: NexusService;
  readonly lore: SimpleUpstreamService;
  readonly echo: SimpleUpstreamService;
  readonly studio: SimpleUpstreamService;
  readonly cp: SimpleUpstreamService;
}

function url(baseUrl: string | undefined, path: string): string {
  return `${(baseUrl ?? "").replace(/\/+$/, "")}${path}`;
}

export function createUpstreamServices(config: ApiConfig): UpstreamServices {
  const corpus = config.upstreamUrls.corpus;
  const nexus = config.upstreamUrls.nexus;
  const lore = config.upstreamUrls.lore;
  const echo = config.upstreamUrls.echo;
  const studio = config.upstreamUrls.studio;
  const cp = config.upstreamUrls.cp;

  const request = (
    targetUrl: string,
    options: ServiceFetchOptions = {},
    method?: "GET" | "POST",
    body?: unknown,
  ): Promise<UpstreamProbeResult> => {
    const requestOptions: UpstreamRequest & ServiceFetchOptions = {
      ...options,
      ...(method === undefined ? {} : { method }),
      ...(body === undefined ? {} : { body }),
    };
    return fetchUpstreamJson(targetUrl, config, requestOptions);
  };

  return {
    corpus: {
      search: (query, options) =>
        request(
          url(corpus, `/api/search?q=${encodeURIComponent(query)}`),
          options,
          "GET",
        ),
      analyzeAqel: (text, options) =>
        request(url(corpus, "/api/aqel/analyze"), options, "POST", { text }),
    },
    nexus: {
      domains: (options) => request(url(nexus, "/api/domains"), options, "GET"),
      convertTime: (timestamp, options) =>
        request(
          url(nexus, `/api/time/convert?ts=${encodeURIComponent(timestamp)}`),
          options,
          "GET",
        ),
    },
    lore: {
      list: (options) => request(url(lore, "/api/eras"), options, "GET"),
    },
    echo: {
      list: (options) => request(url(echo, "/api/events"), options, "GET"),
    },
    studio: {
      list: (options) =>
        request(url(studio, "/api/render/poster"), options, "GET"),
    },
    cp: {
      list: (options) => request(url(cp, "/paas/templates"), options, "GET"),
    },
  };
}
