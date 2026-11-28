import type { PaasCatalogTemplate, PricingTier } from "./storefront.ts";

export const AFFILIATE_COOKIE_NAME = "mw_ref";
export const AFFILIATE_COOKIE_TTL_DAYS = 30;
export const AFFILIATE_COOKIE_TTL_SECONDS =
  AFFILIATE_COOKIE_TTL_DAYS * 24 * 60 * 60;

const AFFILIATE_REF_RE = /^[a-zA-Z0-9_-]{2,64}$/;

export type AffiliateAttributionSource = "body" | "query" | "cookie" | "none";

export interface AffiliateAttribution {
  readonly ref: string | null;
  readonly source: AffiliateAttributionSource;
  readonly cookieName: typeof AFFILIATE_COOKIE_NAME;
  readonly ttlDays: typeof AFFILIATE_COOKIE_TTL_DAYS;
}

export interface ResolvedAffiliateContext {
  readonly attribution: AffiliateAttribution;
  readonly shouldSetCookie: boolean;
}

export function sanitizeAffiliateRef(raw: unknown): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const trimmed = raw.trim();
  if (!AFFILIATE_REF_RE.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export function parseCookies(
  cookieHeader: string | null,
): Record<string, string> {
  if (!cookieHeader || cookieHeader.trim().length === 0) {
    return {};
  }
  const parsed: Record<string, string> = {};
  for (const part of cookieHeader.split(";")) {
    const eqIndex = part.indexOf("=");
    if (eqIndex <= 0) {
      continue;
    }
    const key = part.slice(0, eqIndex).trim();
    const rawValue = part.slice(eqIndex + 1).trim();
    if (!key) {
      continue;
    }
    try {
      parsed[key] = decodeURIComponent(rawValue);
    } catch {
      parsed[key] = rawValue;
    }
  }
  return parsed;
}

export function resolveAffiliateContext(
  request: Request,
  url: URL,
  bodyRef?: unknown,
): ResolvedAffiliateContext {
  const sanitizedBodyRef = sanitizeAffiliateRef(bodyRef);
  if (sanitizedBodyRef) {
    return {
      attribution: {
        ref: sanitizedBodyRef,
        source: "body",
        cookieName: AFFILIATE_COOKIE_NAME,
        ttlDays: AFFILIATE_COOKIE_TTL_DAYS,
      },
      shouldSetCookie: true,
    };
  }

  const sanitizedQueryRef = sanitizeAffiliateRef(url.searchParams.get("ref"));
  if (sanitizedQueryRef) {
    return {
      attribution: {
        ref: sanitizedQueryRef,
        source: "query",
        cookieName: AFFILIATE_COOKIE_NAME,
        ttlDays: AFFILIATE_COOKIE_TTL_DAYS,
      },
      shouldSetCookie: true,
    };
  }

  const cookies = parseCookies(request.headers.get("cookie"));
  const sanitizedCookieRef = sanitizeAffiliateRef(
    cookies[AFFILIATE_COOKIE_NAME],
  );
  if (sanitizedCookieRef) {
    return {
      attribution: {
        ref: sanitizedCookieRef,
        source: "cookie",
        cookieName: AFFILIATE_COOKIE_NAME,
        ttlDays: AFFILIATE_COOKIE_TTL_DAYS,
      },
      shouldSetCookie: false,
    };
  }

  return {
    attribution: {
      ref: null,
      source: "none",
      cookieName: AFFILIATE_COOKIE_NAME,
      ttlDays: AFFILIATE_COOKIE_TTL_DAYS,
    },
    shouldSetCookie: false,
  };
}

export function buildAffiliateSetCookieHeader(ref: string): string {
  return `${AFFILIATE_COOKIE_NAME}=${encodeURIComponent(ref)}; Path=/; Max-Age=${AFFILIATE_COOKIE_TTL_SECONDS}; SameSite=Lax; HttpOnly`;
}

export function appendAffiliateRef(
  pathOrUrl: string,
  ref: string | null,
): string {
  if (!ref) {
    return pathOrUrl;
  }
  const hasOrigin = /^https?:\/\//i.test(pathOrUrl);
  const parsed = new URL(pathOrUrl, "https://a-l-l-a-h.com");
  parsed.searchParams.set("ref", ref);
  return hasOrigin
    ? parsed.toString()
    : `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export interface SitemapUrlEntry {
  readonly loc: string;
  readonly lastmod: string;
  readonly changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly";
  readonly priority: string;
}

export function buildSitemapXml(options: {
  origin: string;
  templates: readonly PaasCatalogTemplate[];
  lastModIso?: string;
}): string {
  const normalizedOrigin = options.origin.replace(/\/+$/, "");
  const lastmod = options.lastModIso ?? new Date().toISOString().slice(0, 10);

  const entries: SitemapUrlEntry[] = [
    {
      loc: `${normalizedOrigin}/`,
      lastmod,
      changefreq: "daily",
      priority: "1.0",
    },
    {
      loc: `${normalizedOrigin}/worlds`,
      lastmod,
      changefreq: "weekly",
      priority: "0.9",
    },
    {
      loc: `${normalizedOrigin}/explore`,
      lastmod,
      changefreq: "weekly",
      priority: "0.8",
    },
    {
      loc: `${normalizedOrigin}/docs`,
      lastmod,
      changefreq: "weekly",
      priority: "0.7",
    },
    {
      loc: `${normalizedOrigin}/community`,
      lastmod,
      changefreq: "weekly",
      priority: "0.7",
    },
    {
      loc: `${normalizedOrigin}/about`,
      lastmod,
      changefreq: "monthly",
      priority: "0.6",
    },
    ...[
      "moonwitness",
      "arsy",
      "human-pen",
      "sidra",
      "rocksoul-dx",
      "crayon",
      "sin-can",
      "mythos",
      "angel-with-shotgun",
    ].map((slug) => ({
      loc: `${normalizedOrigin}/worlds/${slug}`,
      lastmod,
      changefreq: "weekly" as const,
      priority: "0.7",
    })),
    {
      loc: `${normalizedOrigin}/pricing`,
      lastmod,
      changefreq: "weekly",
      priority: "0.9",
    },
    {
      loc: `${normalizedOrigin}/pricing?currency=IDR`,
      lastmod,
      changefreq: "weekly",
      priority: "0.8",
    },
    {
      loc: `${normalizedOrigin}/paas/catalog`,
      lastmod,
      changefreq: "daily",
      priority: "0.9",
    },
    {
      loc: `${normalizedOrigin}/status`,
      lastmod,
      changefreq: "hourly",
      priority: "0.8",
    },
    {
      loc: `${normalizedOrigin}/api/status/widget`,
      lastmod,
      changefreq: "hourly",
      priority: "0.7",
    },
    {
      loc: `${normalizedOrigin}/widgets/sla-mizan`,
      lastmod,
      changefreq: "hourly",
      priority: "0.7",
    },
  ];

  const categories = new Set<string>();
  for (const template of options.templates) {
    categories.add(template.category.toLowerCase());
  }
  for (const category of Array.from(categories).sort()) {
    entries.push({
      loc: `${normalizedOrigin}/paas/catalog?category=${encodeURIComponent(category)}`,
      lastmod,
      changefreq: "weekly",
      priority: "0.7",
    });
  }

  for (const template of options.templates) {
    entries.push({
      loc: `${normalizedOrigin}/paas/catalog?q=${encodeURIComponent(template.id)}`,
      lastmod,
      changefreq: "weekly",
      priority: "0.6",
    });
  }

  const urlNodes = entries
    .map(
      (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${escapeXml(entry.lastmod)}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes}
</urlset>
`;
}

export function buildSchemaOrgJsonLd(options: {
  origin: string;
  tiers: readonly PricingTier[];
  fxRateIdrPerUsd: number;
  compliance: readonly string[];
}) {
  const normalizedOrigin = options.origin.replace(/\/+$/, "");

  const offers = options.tiers.flatMap((tier) => {
    const idrAmount = Math.round(tier.monthlyUsd * options.fxRateIdrPerUsd);
    return [
      {
        "@type": "Offer",
        name: `${tier.name} (USD)`,
        price: String(tier.monthlyUsd),
        priceCurrency: "USD",
        url: `${normalizedOrigin}/pricing?currency=USD&tier=${tier.tier}`,
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: `${tier.name} (IDR / QRIS & VA)`,
        price: String(idrAmount),
        priceCurrency: "IDR",
        url: `${normalizedOrigin}/pricing?currency=IDR&tier=${tier.tier}`,
        availability: "https://schema.org/InStock",
        acceptedPaymentMethod: [
          "https://schema.org/PaymentMethodCreditCard",
          "QRIS",
          "BankTransferVirtualAccount",
        ],
      },
    ];
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${normalizedOrigin}/#organization`,
        name: "A-L-L-A-H.COM — MoonWitness Sovereign Ecosystem",
        url: normalizedOrigin,
        description:
          "Sovereign epistemic research portal and riba-free PaaS infrastructure governed by CAN-0011..0014 and ADR-0005.",
      },
      {
        "@type": "WebSite",
        "@id": `${normalizedOrigin}/#website`,
        url: normalizedOrigin,
        name: "A-L-L-A-H.COM",
        publisher: { "@id": `${normalizedOrigin}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${normalizedOrigin}/api/corpus/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${normalizedOrigin}/#paas`,
        name: "MoonWitness Sovereign PaaS & Epistemic Portal",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Linux",
        url: `${normalizedOrigin}/paas/catalog`,
        provider: { "@id": `${normalizedOrigin}/#organization` },
        additionalProperty: options.compliance.map((standard) => ({
          "@type": "PropertyValue",
          name: "GovernanceStandard",
          value: standard,
        })),
        offers,
      },
    ],
  };
}

export function serializeJsonLdSafe(data: unknown): string {
  return JSON.stringify(data)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
}
