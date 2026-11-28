import type { ApiConfig } from "../config";
import type { UpstreamTarget } from "./types";

export function getUpstreamTargets(config: ApiConfig): UpstreamTarget[] {
  return [
    { id: "mw-corpus", baseUrl: config.upstreamUrls.corpus ?? "" },
    { id: "mw-nexus", baseUrl: config.upstreamUrls.nexus ?? "" },
    { id: "mw-lore", baseUrl: config.upstreamUrls.lore ?? "" },
    { id: "mw-echo", baseUrl: config.upstreamUrls.echo ?? "" },
    { id: "mw-studio", baseUrl: config.upstreamUrls.studio ?? "" },
    { id: "mw-cp", baseUrl: config.upstreamUrls.cp ?? "" },
  ];
}
