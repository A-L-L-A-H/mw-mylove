export interface ApiConfig {
  readonly port: number;
  readonly origin: string;
  readonly upstreamUrls: Readonly<Record<string, string>>;
}

function normalizeUrl(value: string, fallback: string): string {
  return value.replace(/\/+$/, "") || fallback;
}

function readPort(value: string | undefined, fallback: number): number {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const port = Number(value);
  return Number.isInteger(port) && port > 0 && port <= 65_535 ? port : fallback;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ApiConfig {
  return {
    port: readPort(env.MW_API_PORT, 4490),
    origin: normalizeUrl(
      env.MW_API_ORIGIN ?? "http://localhost:4490",
      "http://localhost:4490",
    ),
    upstreamUrls: {
      corpus: normalizeUrl(
        env.MW_CORPUS_URL ?? "http://mw-corpus:4420",
        "http://mw-corpus:4420",
      ),
      nexus: normalizeUrl(
        env.MW_NEXUS_URL ?? "http://mw-nexus:4430",
        "http://mw-nexus:4430",
      ),
      lore: normalizeUrl(
        env.MW_LORE_URL ?? "http://mw-lore:4450",
        "http://mw-lore:4450",
      ),
      echo: normalizeUrl(
        env.MW_ECHO_URL ?? "http://mw-echo:4310",
        "http://mw-echo:4310",
      ),
      studio: normalizeUrl(
        env.MW_STUDIO_URL ?? "http://mw-studio:4470",
        "http://mw-studio:4470",
      ),
      cp: normalizeUrl(
        env.MW_CP_URL ?? "http://mw-cp:4440",
        "http://mw-cp:4440",
      ),
    },
  };
}
