import type { RidAuthConfig } from "@mw/auth";
import { resolveRidAuthConfig } from "@mw/auth";
import { SlaTracker } from "@mw/sla";
import { DEFAULT_USD_TO_IDR_RATE } from "@mw/storefront";

export interface PortalConfig {
  readonly port: number;
  readonly publicOrigin: string;
  readonly usdToIdrRate: number;
  readonly corpusUrl: string;
  readonly nexusUrl: string;
  readonly loreUrl: string;
  readonly echoUrl: string;
  readonly studioUrl: string;
  readonly cpUrl?: string;
  readonly upstreamTimeoutMs: number;
  readonly fetcher: typeof fetch;
  readonly ridAuth: RidAuthConfig;
  readonly slaTracker: SlaTracker;
}

export function resolveConfig(
  overrides: Partial<PortalConfig> = {},
): PortalConfig {
  const rawPort = Number(
    process.env.MW_MYLOVE_PORT ?? process.env.PORT ?? 4460,
  );
  const rawCpUrl =
    overrides.cpUrl ?? process.env.MW_CP_URL ?? "http://mw-cp:4440";
  const rawOrigin =
    overrides.publicOrigin ??
    process.env.MW_PUBLIC_ORIGIN ??
    "https://a-l-l-a-h.com";
  const rawUsdToIdr = Number(
    overrides.usdToIdrRate ??
      process.env.MW_USD_TO_IDR_RATE ??
      DEFAULT_USD_TO_IDR_RATE,
  );
  return {
    port:
      overrides.port ??
      (Number.isFinite(rawPort) && rawPort > 0 ? rawPort : 4460),
    publicOrigin: rawOrigin.replace(/\/+$/, ""),
    usdToIdrRate:
      Number.isFinite(rawUsdToIdr) && rawUsdToIdr > 0
        ? Math.round(rawUsdToIdr)
        : DEFAULT_USD_TO_IDR_RATE,
    corpusUrl: (
      overrides.corpusUrl ??
      process.env.MW_CORPUS_URL ??
      "http://mw-corpus:4420"
    ).replace(/\/+$/, ""),
    nexusUrl: (
      overrides.nexusUrl ??
      process.env.MW_NEXUS_URL ??
      "http://mw-nexus:4430"
    ).replace(/\/+$/, ""),
    loreUrl: (
      overrides.loreUrl ??
      process.env.MW_LORE_URL ??
      "http://mw-lore:4450"
    ).replace(/\/+$/, ""),
    echoUrl: (
      overrides.echoUrl ??
      process.env.MW_ECHO_URL ??
      "http://mw-echo:4310"
    ).replace(/\/+$/, ""),
    studioUrl: (
      overrides.studioUrl ??
      process.env.MW_STUDIO_URL ??
      "http://mw-studio:4470"
    ).replace(/\/+$/, ""),
    cpUrl: rawCpUrl.replace(/\/+$/, ""),
    upstreamTimeoutMs: overrides.upstreamTimeoutMs ?? 3000,
    fetcher: overrides.fetcher ?? fetch,
    ridAuth: resolveRidAuthConfig(overrides.ridAuth),
    slaTracker: overrides.slaTracker ?? new SlaTracker(),
  };
}
