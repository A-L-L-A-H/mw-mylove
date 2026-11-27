export type PricingTierId = "free" | "starter" | "pro" | "enterprise";

export interface PricingTierQuotaLimits {
  readonly maxApps: number;
  readonly maxRamMb: number;
  readonly maxCustomDomains: number;
  readonly allowDedicatedMesh: boolean;
}

export interface PricingTierIncludedUsage {
  readonly containerHours: number;
  readonly ramGbHours: number;
  readonly storageGb: number;
  readonly egressGb: number;
}

export interface PricingTierOverageRatesCents {
  readonly containerHour: number;
  readonly ramGbHour: number;
  readonly storageGb: number;
  readonly egressGb: number;
}

export interface PricingTier {
  readonly tier: PricingTierId;
  readonly name: string;
  readonly summary: string;
  readonly monthlyUsd: number;
  readonly monthlyBaseCents: number;
  readonly included: PricingTierIncludedUsage;
  readonly overageCents: PricingTierOverageRatesCents;
  readonly quotaLimits: PricingTierQuotaLimits;
}

export interface PaasCatalogTemplate {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly image: string;
  readonly minPlan: PricingTierId;
  readonly ports: readonly number[];
  readonly tags: readonly string[];
}

export interface StorefrontProbeResult {
  readonly status: "online" | "offline";
  readonly httpStatus: number | null;
  readonly payload: unknown;
  readonly reason: string | null;
}

export type StorefrontProbeFn = (targetUrl: string) => Promise<StorefrontProbeResult>;

export interface UpstreamTarget {
  readonly id: string;
  readonly baseUrl: string;
  readonly healthPath?: string;
}

export interface UpstreamHealthStatus {
  readonly id: string;
  readonly url: string;
  readonly status: "online" | "offline";
  readonly httpStatus: number | null;
  readonly reason: string | null;
}

export const PRICING_TIERS: readonly PricingTier[] = Object.freeze([
  Object.freeze({
    tier: "free",
    name: "Free",
    summary: "Sandbox and single-app evaluation on MoonWitness PaaS",
    monthlyUsd: 0,
    monthlyBaseCents: 0,
    included: Object.freeze({
      containerHours: 720,
      ramGbHours: 360,
      storageGb: 5,
      egressGb: 10,
    }),
    overageCents: Object.freeze({
      containerHour: 2,
      ramGbHour: 3,
      storageGb: 15,
      egressGb: 12,
    }),
    quotaLimits: Object.freeze({
      maxApps: 1,
      maxRamMb: 512,
      maxCustomDomains: 0,
      allowDedicatedMesh: false,
    }),
  }),
  Object.freeze({
    tier: "starter",
    name: "Starter",
    summary: "Production-ready hosting for UMKM, blogs, and focused APIs",
    monthlyUsd: 19,
    monthlyBaseCents: 1900,
    included: Object.freeze({
      containerHours: 2160,
      ramGbHours: 2160,
      storageGb: 25,
      egressGb: 100,
    }),
    overageCents: Object.freeze({
      containerHour: 2,
      ramGbHour: 2,
      storageGb: 10,
      egressGb: 9,
    }),
    quotaLimits: Object.freeze({
      maxApps: 3,
      maxRamMb: 1024,
      maxCustomDomains: 1,
      allowDedicatedMesh: false,
    }),
  }),
  Object.freeze({
    tier: "pro",
    name: "Pro",
    summary: "Multi-service SaaS teams with custom domains and higher RAM limits",
    monthlyUsd: 79,
    monthlyBaseCents: 7900,
    included: Object.freeze({
      containerHours: 10800,
      ramGbHours: 16200,
      storageGb: 150,
      egressGb: 1000,
    }),
    overageCents: Object.freeze({
      containerHour: 1,
      ramGbHour: 2,
      storageGb: 8,
      egressGb: 7,
    }),
    quotaLimits: Object.freeze({
      maxApps: 15,
      maxRamMb: 8192,
      maxCustomDomains: 10,
      allowDedicatedMesh: false,
    }),
  }),
  Object.freeze({
    tier: "enterprise",
    name: "Enterprise",
    summary: "Dedicated mesh isolation, high-scale fleets, and SLA priority",
    monthlyUsd: 399,
    monthlyBaseCents: 39900,
    included: Object.freeze({
      containerHours: 72000,
      ramGbHours: 144000,
      storageGb: 1000,
      egressGb: 10000,
    }),
    overageCents: Object.freeze({
      containerHour: 1,
      ramGbHour: 1,
      storageGb: 5,
      egressGb: 5,
    }),
    quotaLimits: Object.freeze({
      maxApps: 100,
      maxRamMb: 65536,
      maxCustomDomains: 100,
      allowDedicatedMesh: true,
    }),
  }),
]);

export const PAAS_CATALOG_TEMPLATES: readonly PaasCatalogTemplate[] = Object.freeze([
  Object.freeze({
    id: "wordpress",
    name: "WordPress",
    category: "cms",
    description: "UMKM company site / blog",
    image: "wordpress:6-apache",
    minPlan: "starter",
    ports: Object.freeze([80]),
    tags: Object.freeze(["cms", "blog", "php", "umkm"]),
  }),
  Object.freeze({
    id: "n8n",
    name: "n8n",
    category: "automation",
    description: "Workflow automation",
    image: "n8nio/n8n:latest",
    minPlan: "starter",
    ports: Object.freeze([5678]),
    tags: Object.freeze(["automation", "workflows", "webhooks"]),
  }),
  Object.freeze({
    id: "ghost",
    name: "Ghost",
    category: "publishing",
    description: "Publishing and newsletters",
    image: "ghost:5-alpine",
    minPlan: "starter",
    ports: Object.freeze([2368]),
    tags: Object.freeze(["publishing", "newsletter", "blog"]),
  }),
  Object.freeze({
    id: "uptime-kuma",
    name: "Uptime Kuma",
    category: "monitoring",
    description: "Uptime monitoring",
    image: "louislam/uptime-kuma:1",
    minPlan: "starter",
    ports: Object.freeze([3001]),
    tags: Object.freeze(["monitoring", "status", "alerts"]),
  }),
  Object.freeze({
    id: "umami",
    name: "Umami",
    category: "analytics",
    description: "Privacy-first web analytics",
    image: "ghcr.io/umami-software/umami:postgresql-latest",
    minPlan: "starter",
    ports: Object.freeze([3000]),
    tags: Object.freeze(["analytics", "privacy", "telemetry"]),
  }),
  Object.freeze({
    id: "gitea",
    name: "Gitea",
    category: "devtools",
    description: "Lightweight git hosting",
    image: "gitea/gitea:1-rootless",
    minPlan: "starter",
    ports: Object.freeze([3000]),
    tags: Object.freeze(["git", "scm", "devtools"]),
  }),
  Object.freeze({
    id: "miniflux",
    name: "Miniflux",
    category: "rss",
    description: "Minimal RSS reader",
    image: "miniflux/miniflux:latest",
    minPlan: "starter",
    ports: Object.freeze([8080]),
    tags: Object.freeze(["rss", "feed", "reader"]),
  }),
  Object.freeze({
    id: "pocketbase",
    name: "PocketBase",
    category: "backend",
    description: "Single-file backend for apps",
    image: "ghcr.io/muchobien/pocketbase:latest",
    minPlan: "starter",
    ports: Object.freeze([8090]),
    tags: Object.freeze(["backend", "sqlite", "realtime"]),
  }),
  Object.freeze({
    id: "static-nginx",
    name: "Static Nginx",
    category: "web",
    description: "Static site hosting",
    image: "nginx:alpine",
    minPlan: "free",
    ports: Object.freeze([80]),
    tags: Object.freeze(["static", "nginx", "web"]),
  }),
  Object.freeze({
    id: "bun-api",
    name: "Bun API",
    category: "runtime",
    description: "Bun HTTP API runtime",
    image: "oven/bun:1-alpine",
    minPlan: "free",
    ports: Object.freeze([3000]),
    tags: Object.freeze(["bun", "api", "typescript"]),
  }),
]);

export function buildPricingResponsePayload(compliance: readonly string[]) {
  return {
    domain: "a-l-l-a-h.com",
    service: "mw-mylove",
    currency: "USD",
    billingCycle: "monthly",
    tiers: PRICING_TIERS,
    compliance,
  };
}

export async function buildStatusResponsePayload(
  targets: readonly UpstreamTarget[],
  probeFn: StorefrontProbeFn,
) {
  const upstreams: UpstreamHealthStatus[] = await Promise.all(
    targets.map(async (target) => {
      const normalizedBase = target.baseUrl.replace(/\/+$/, "");
      const healthPath = target.healthPath ?? "/health";
      const url = `${normalizedBase}${healthPath}`;
      const probe = await probeFn(url);
      return {
        id: target.id,
        url,
        status: probe.status,
        httpStatus: probe.httpStatus,
        reason: probe.reason,
      };
    }),
  );

  const allOnline = upstreams.length > 0 && upstreams.every((entry) => entry.status === "online");

  return {
    status: allOnline ? ("ok" as const) : ("degraded" as const),
    service: "mw-mylove",
    domain: "a-l-l-a-h.com",
    timestamp: new Date().toISOString(),
    upstreams,
  };
}

function isPricingTierId(value: unknown): value is PricingTierId {
  return value === "free" || value === "starter" || value === "pro" || value === "enterprise";
}

function normalizeRemoteTemplate(raw: unknown): PaasCatalogTemplate | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const rawId = typeof record.id === "string"
    ? record.id
    : typeof record.slug === "string"
      ? record.slug
      : "";
  const id = rawId.trim().toLowerCase();
  if (!id) {
    return null;
  }
  const name = typeof record.name === "string" && record.name.trim().length > 0
    ? record.name.trim()
    : id;
  const category = typeof record.category === "string" && record.category.trim().length > 0
    ? record.category.trim().toLowerCase()
    : "general";
  const description = typeof record.description === "string" ? record.description.trim() : "";
  const image = typeof record.image === "string" ? record.image.trim() : "";
  const minPlan: PricingTierId = isPricingTierId(record.minPlan) ? record.minPlan : "starter";

  let ports: number[] = [];
  if (Array.isArray(record.ports)) {
    ports = record.ports.filter((port): port is number => typeof port === "number" && Number.isInteger(port) && port > 0);
  } else if (typeof record.port === "number" && Number.isInteger(record.port) && record.port > 0) {
    ports = [record.port];
  }

  const tags = Array.isArray(record.tags)
    ? record.tags
      .filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
      .map((tag) => tag.trim().toLowerCase())
    : [category];

  return {
    id,
    name,
    category,
    description,
    image,
    minPlan,
    ports,
    tags,
  };
}

function extractRemoteTemplates(payload: unknown): PaasCatalogTemplate[] {
  const list = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as Record<string, unknown>).templates)
      ? ((payload as Record<string, unknown>).templates as unknown[])
      : [];
  const normalized: PaasCatalogTemplate[] = [];
  for (const item of list) {
    const parsed = normalizeRemoteTemplate(item);
    if (parsed) {
      normalized.push(parsed);
    }
  }
  return normalized;
}

export async function buildPaasCatalogResponsePayload(options: {
  cpUrl?: string;
  category?: string | null;
  query?: string | null;
  probeFn: StorefrontProbeFn;
}) {
  const normalizedCategory = options.category?.trim().toLowerCase() || null;
  const normalizedQuery = options.query?.trim().toLowerCase() || null;

  const catalogById = new Map<string, PaasCatalogTemplate>();
  for (const template of PAAS_CATALOG_TEMPLATES) {
    catalogById.set(template.id, template);
  }

  let upstreamStatus: "online" | "offline" = "offline";
  let upstreamReason: string | null = "mw-cp URL is not configured";
  let source: "curated" | "live+curated" = "curated";

  const trimmedCpUrl = options.cpUrl?.trim().replace(/\/+$/, "");
  if (trimmedCpUrl) {
    const probe = await options.probeFn(`${trimmedCpUrl}/paas/templates`);
    upstreamStatus = probe.status;
    upstreamReason = probe.reason;
    if (probe.status === "online") {
      const remoteTemplates = extractRemoteTemplates(probe.payload);
      if (remoteTemplates.length > 0) {
        source = "live+curated";
        for (const remote of remoteTemplates) {
          const existing = catalogById.get(remote.id);
          if (existing) {
            catalogById.set(remote.id, {
              ...existing,
              name: remote.name || existing.name,
              category: remote.category || existing.category,
              description: remote.description || existing.description,
              image: remote.image || existing.image,
              ports: remote.ports.length > 0 ? remote.ports : existing.ports,
              tags: remote.tags.length > 0 ? remote.tags : existing.tags,
            });
          } else {
            catalogById.set(remote.id, remote);
          }
        }
      }
    }
  }

  const filtered = Array.from(catalogById.values()).filter((template) => {
    if (normalizedCategory && template.category.toLowerCase() !== normalizedCategory) {
      return false;
    }
    if (normalizedQuery) {
      const haystack = [
        template.id,
        template.name,
        template.category,
        template.description,
        template.image,
        ...template.tags,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(normalizedQuery)) {
        return false;
      }
    }
    return true;
  });

  return {
    domain: "a-l-l-a-h.com",
    service: "mw-mylove",
    upstream: "mw-cp",
    upstreamStatus,
    upstreamReason,
    source,
    filters: {
      category: normalizedCategory,
      q: normalizedQuery,
    },
    total: filtered.length,
    templates: filtered,
  };
}
