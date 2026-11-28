export type UpstreamStatus = "online" | "offline";

export interface UpstreamProbeResult<T = unknown> {
  readonly status: UpstreamStatus;
  readonly httpStatus: number | null;
  readonly reason: string | null;
  readonly payload: T | null;
}

export type UpstreamId =
  "mw-corpus" | "mw-nexus" | "mw-lore" | "mw-echo" | "mw-studio" | "mw-cp";

export interface UpstreamTarget {
  readonly id: UpstreamId;
  readonly baseUrl: string;
  readonly healthPath?: string;
}

export interface UpstreamRequest {
  readonly method?: "GET" | "POST";
  readonly body?: unknown;
}
