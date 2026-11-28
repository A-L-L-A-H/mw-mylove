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

export type StorefrontProbeFn = (
  targetUrl: string,
) => Promise<StorefrontProbeResult>;

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
    summary:
      "Multi-service SaaS teams with custom domains and higher RAM limits",
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

export const PAAS_CATALOG_TEMPLATES: readonly PaasCatalogTemplate[] =
  Object.freeze([
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

export type PricingCurrency = "USD" | "IDR";
export type PaymentMethod = "QRIS" | "VA";
export type VaBankCode = "BSI" | "BCA" | "MANDIRI" | "BNI" | "BRI";

export const DEFAULT_USD_TO_IDR_RATE = 16000;

export const SUPPORTED_VA_BANKS: Record<
  VaBankCode,
  { readonly name: string; readonly prefix: string }
> = Object.freeze({
  BSI: Object.freeze({ name: "Bank Syariah Indonesia (BSI)", prefix: "45100" }),
  BCA: Object.freeze({ name: "Bank Central Asia (BCA)", prefix: "39010" }),
  MANDIRI: Object.freeze({ name: "Bank Mandiri", prefix: "88010" }),
  BNI: Object.freeze({ name: "Bank Negara Indonesia (BNI)", prefix: "88020" }),
  BRI: Object.freeze({ name: "Bank Rakyat Indonesia (BRI)", prefix: "88030" }),
});

export interface QrisPaymentPayload {
  readonly payloadFormatIndicator: "01";
  readonly pointOfInitiation: "12";
  readonly currencyNumericCode: "360";
  readonly countryCode: "ID";
  readonly nmid: string;
  readonly merchantName: string;
  readonly merchantCity: string;
  readonly amountIdr: number;
  readonly referenceLabel: string;
  readonly emvCoString: string;
  readonly crc16: string;
}

export interface VirtualAccountPaymentPayload {
  readonly bankCode: VaBankCode;
  readonly bankName: string;
  readonly accountNumber: string;
  readonly accountName: string;
  readonly currency: "IDR";
  readonly amountIdr: number;
}

export interface CheckoutIntentPayload {
  readonly intentId: string;
  readonly service: "mw-mylove";
  readonly domain: "a-l-l-a-h.com";
  readonly status: "pending_payment";
  readonly tier: PricingTierId;
  readonly tierName: string;
  readonly currency: "IDR";
  readonly requestedDisplayCurrency: PricingCurrency;
  readonly fxRateIdrPerUsd: number;
  readonly amountUsd: number;
  readonly amountIdr: number;
  readonly formattedIdr: string;
  readonly paymentMethod: PaymentMethod;
  readonly affiliateRef: string | null;
  readonly expiresAt: string;
  readonly shariaCompliance: {
    readonly ribaFree: true;
    readonly ghararFree: true;
    readonly maysirFree: true;
    readonly latePenaltyIdr: 0;
    readonly akad: "Ujrah / Ijarah";
  };
  readonly qris: QrisPaymentPayload | null;
  readonly virtualAccount: VirtualAccountPaymentPayload | null;
}

export function formatUsd(amountUsd: number): string {
  return `$${amountUsd}`;
}

export function formatIdr(amountIdr: number): string {
  const rounded = Math.round(amountIdr);
  const grouped = String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp ${grouped}`;
}

export function normalizePricingCurrency(raw: unknown): PricingCurrency {
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return "USD";
  }
  const upper = String(raw).trim().toUpperCase();
  if (upper === "USD" || upper === "IDR") {
    return upper;
  }
  throw new Error("Unsupported currency; expected USD or IDR");
}

function formatTlv(tag: string, value: string): string {
  const len = String(value.length).padStart(2, "0");
  return `${tag}${len}${value}`;
}

export function crc16CcittFalse(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i += 1) {
    crc ^= input.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildEmvCoQrisPayload(options: {
  referenceLabel: string;
  amountIdr: number;
  merchantName?: string;
  merchantCity?: string;
  nmid?: string;
}): QrisPaymentPayload {
  const nmid = options.nmid ?? "ID1020260000446";
  const merchantName = (options.merchantName ?? "ALLAH.COM MW").slice(0, 25);
  const merchantCity = (options.merchantCity ?? "JAKARTA").slice(0, 15);
  const amountStr = String(Math.round(options.amountIdr));
  const referenceLabel = options.referenceLabel.slice(0, 25);

  const merchantAccountInfo =
    formatTlv("00", "ID.CO.QRIS.WWW") +
    formatTlv("01", nmid) +
    formatTlv("03", "UMI");
  const additionalData = formatTlv("05", referenceLabel);

  const bodyWithoutCrc =
    formatTlv("00", "01") +
    formatTlv("01", "12") +
    formatTlv("26", merchantAccountInfo) +
    formatTlv("52", "5734") +
    formatTlv("53", "360") +
    formatTlv("54", amountStr) +
    formatTlv("58", "ID") +
    formatTlv("59", merchantName) +
    formatTlv("60", merchantCity) +
    formatTlv("62", additionalData) +
    "6304";

  const crc16 = crc16CcittFalse(bodyWithoutCrc);
  return {
    payloadFormatIndicator: "01",
    pointOfInitiation: "12",
    currencyNumericCode: "360",
    countryCode: "ID",
    nmid,
    merchantName,
    merchantCity,
    amountIdr: Math.round(options.amountIdr),
    referenceLabel,
    emvCoString: `${bodyWithoutCrc}${crc16}`,
    crc16,
  };
}

function buildDeterministicVaDigits(seed: string): string {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return String(hash).padStart(10, "0").slice(0, 10);
}

export function buildCheckoutIntentPayload(options: {
  tier: unknown;
  currency?: unknown;
  paymentMethod?: unknown;
  bankCode?: unknown;
  fxRateIdrPerUsd?: number;
  affiliateRef?: string | null;
  now?: Date;
}): CheckoutIntentPayload {
  const tierId =
    typeof options.tier === "string" ? options.tier.trim().toLowerCase() : "";
  if (!isPricingTierId(tierId)) {
    throw new Error(
      "Invalid tier; expected one of free, starter, pro, enterprise",
    );
  }
  const tierSpec = PRICING_TIERS.find((entry) => entry.tier === tierId)!;
  if (tierSpec.monthlyUsd <= 0) {
    throw new Error(
      "Free tier does not require QRIS or Virtual Account payment",
    );
  }

  const requestedDisplayCurrency = normalizePricingCurrency(
    options.currency ?? "IDR",
  );
  const rawMethod =
    options.paymentMethod === undefined ||
    options.paymentMethod === null ||
    String(options.paymentMethod).trim() === ""
      ? "QRIS"
      : String(options.paymentMethod).trim().toUpperCase();

  let paymentMethod: PaymentMethod;
  let inferredBankCode: string | undefined;
  if (rawMethod === "QRIS") {
    paymentMethod = "QRIS";
  } else if (rawMethod === "VA") {
    paymentMethod = "VA";
  } else if (rawMethod.startsWith("VA_")) {
    paymentMethod = "VA";
    inferredBankCode = rawMethod.slice(3);
  } else {
    throw new Error("Unsupported paymentMethod; expected QRIS or VA");
  }

  const rawBank = options.bankCode ?? inferredBankCode ?? "BSI";
  const bankUpper = String(rawBank).trim().toUpperCase() as VaBankCode;
  if (paymentMethod === "VA" && !(bankUpper in SUPPORTED_VA_BANKS)) {
    throw new Error(
      "Unsupported bankCode; expected one of BSI, BCA, MANDIRI, BNI, BRI",
    );
  }

  const fxRate =
    typeof options.fxRateIdrPerUsd === "number" &&
    Number.isFinite(options.fxRateIdrPerUsd) &&
    options.fxRateIdrPerUsd > 0
      ? Math.round(options.fxRateIdrPerUsd)
      : DEFAULT_USD_TO_IDR_RATE;

  const amountIdr = Math.round(tierSpec.monthlyUsd * fxRate);
  const now = options.now ?? new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const timestampCompact = now
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
  const refSuffix = options.affiliateRef
    ? `-${options.affiliateRef.slice(0, 8)}`
    : "";
  const intentId = `mw-pay-${tierSpec.tier}-${timestampCompact}${refSuffix}`;
  const referenceLabel = `MW-${tierSpec.tier.toUpperCase()}-${timestampCompact.slice(-6)}`;

  const qris =
    paymentMethod === "QRIS"
      ? buildEmvCoQrisPayload({ referenceLabel, amountIdr })
      : null;

  const virtualAccount =
    paymentMethod === "VA"
      ? {
          bankCode: bankUpper,
          bankName: SUPPORTED_VA_BANKS[bankUpper].name,
          accountNumber: `${SUPPORTED_VA_BANKS[bankUpper].prefix}${buildDeterministicVaDigits(intentId)}`,
          accountName: "MOONWITNESS SOVEREIGN PAAS",
          currency: "IDR" as const,
          amountIdr,
        }
      : null;

  return {
    intentId,
    service: "mw-mylove",
    domain: "a-l-l-a-h.com",
    status: "pending_payment",
    tier: tierSpec.tier,
    tierName: tierSpec.name,
    currency: "IDR",
    requestedDisplayCurrency,
    fxRateIdrPerUsd: fxRate,
    amountUsd: tierSpec.monthlyUsd,
    amountIdr,
    formattedIdr: formatIdr(amountIdr),
    paymentMethod,
    affiliateRef: options.affiliateRef ?? null,
    expiresAt,
    shariaCompliance: {
      ribaFree: true,
      ghararFree: true,
      maysirFree: true,
      latePenaltyIdr: 0,
      akad: "Ujrah / Ijarah",
    },
    qris,
    virtualAccount,
  };
}

export function buildPricingResponsePayload(
  compliance: readonly string[],
  options: {
    currency?: unknown;
    fxRateIdrPerUsd?: number;
    tier?: unknown;
    paymentMethod?: unknown;
    bankCode?: unknown;
    affiliateRef?: string | null;
    attributionSource?: "body" | "query" | "cookie" | "none";
  } = {},
) {
  const currency = normalizePricingCurrency(options.currency);
  const fxRateIdrPerUsd =
    typeof options.fxRateIdrPerUsd === "number" &&
    Number.isFinite(options.fxRateIdrPerUsd) &&
    options.fxRateIdrPerUsd > 0
      ? Math.round(options.fxRateIdrPerUsd)
      : DEFAULT_USD_TO_IDR_RATE;

  const tiers = PRICING_TIERS.map((tier) => {
    const monthlyIdr = Math.round(tier.monthlyUsd * fxRateIdrPerUsd);
    return {
      ...tier,
      monthlyIdr,
      formattedUsd: formatUsd(tier.monthlyUsd),
      formattedIdr: formatIdr(monthlyIdr),
      displayPrice:
        currency === "IDR" ? formatIdr(monthlyIdr) : formatUsd(tier.monthlyUsd),
    };
  });

  const previewTier =
    typeof options.tier === "string" &&
    isPricingTierId(options.tier.trim().toLowerCase()) &&
    options.tier.trim().toLowerCase() !== "free"
      ? options.tier.trim().toLowerCase()
      : "starter";

  const checkoutIntent = buildCheckoutIntentPayload({
    tier: previewTier,
    currency,
    paymentMethod: options.paymentMethod ?? "QRIS",
    bankCode: options.bankCode,
    fxRateIdrPerUsd,
    affiliateRef: options.affiliateRef ?? null,
  });

  const refQuery = options.affiliateRef
    ? `&ref=${encodeURIComponent(options.affiliateRef)}`
    : "";

  return {
    domain: "a-l-l-a-h.com",
    service: "mw-mylove",
    currency,
    supportedCurrencies: ["USD", "IDR"] as const,
    fxRateIdrPerUsd,
    billingCycle: "monthly",
    tiers,
    paymentMethods: [
      "QRIS",
      "VA_BSI",
      "VA_BCA",
      "VA_MANDIRI",
      "VA_BNI",
      "VA_BRI",
    ] as const,
    checkoutEndpoint: "/api/pricing/checkout-intent",
    toggleUrls: {
      USD: `/pricing?currency=USD${refQuery}`,
      IDR: `/pricing?currency=IDR${refQuery}`,
    },
    checkoutIntent,
    attribution: {
      ref: options.affiliateRef ?? null,
      source: options.attributionSource ?? "none",
      cookieName: "mw_ref",
      ttlDays: 30,
    },
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

  const allOnline =
    upstreams.length > 0 &&
    upstreams.every((entry) => entry.status === "online");

  return {
    status: allOnline ? ("ok" as const) : ("degraded" as const),
    service: "mw-mylove",
    domain: "a-l-l-a-h.com",
    timestamp: new Date().toISOString(),
    upstreams,
  };
}

function isPricingTierId(value: unknown): value is PricingTierId {
  return (
    value === "free" ||
    value === "starter" ||
    value === "pro" ||
    value === "enterprise"
  );
}

function normalizeRemoteTemplate(raw: unknown): PaasCatalogTemplate | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const record = raw as Record<string, unknown>;
  const rawId =
    typeof record.id === "string"
      ? record.id
      : typeof record.slug === "string"
        ? record.slug
        : "";
  const id = rawId.trim().toLowerCase();
  if (!id) {
    return null;
  }
  const name =
    typeof record.name === "string" && record.name.trim().length > 0
      ? record.name.trim()
      : id;
  const category =
    typeof record.category === "string" && record.category.trim().length > 0
      ? record.category.trim().toLowerCase()
      : "general";
  const description =
    typeof record.description === "string" ? record.description.trim() : "";
  const image = typeof record.image === "string" ? record.image.trim() : "";
  const minPlan: PricingTierId = isPricingTierId(record.minPlan)
    ? record.minPlan
    : "starter";

  let ports: number[] = [];
  if (Array.isArray(record.ports)) {
    ports = record.ports.filter(
      (port): port is number =>
        typeof port === "number" && Number.isInteger(port) && port > 0,
    );
  } else if (
    typeof record.port === "number" &&
    Number.isInteger(record.port) &&
    record.port > 0
  ) {
    ports = [record.port];
  }

  const tags = Array.isArray(record.tags)
    ? record.tags
        .filter(
          (tag): tag is string =>
            typeof tag === "string" && tag.trim().length > 0,
        )
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
    : payload &&
        typeof payload === "object" &&
        Array.isArray((payload as Record<string, unknown>).templates)
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
    if (
      normalizedCategory &&
      template.category.toLowerCase() !== normalizedCategory
    ) {
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
