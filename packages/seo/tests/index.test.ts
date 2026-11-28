import { describe, it, expect } from "bun:test";
import {
  AFFILIATE_COOKIE_NAME,
  AFFILIATE_COOKIE_TTL_DAYS,
  AFFILIATE_COOKIE_TTL_SECONDS,
  sanitizeAffiliateRef,
  parseCookies,
  resolveAffiliateContext,
  buildAffiliateSetCookieHeader,
  appendAffiliateRef,
  escapeXml,
  buildSitemapXml,
  buildSchemaOrgJsonLd,
  serializeJsonLdSafe,
} from "../src/index.ts";
import type { PaasCatalogTemplate, PricingTier } from "../src/storefront.ts";

describe("@mw/seo", () => {
  describe("constants", () => {
    it("exports AFFILIATE_COOKIE_NAME", () => {
      expect(AFFILIATE_COOKIE_NAME).toBe("mw_ref");
    });

    it("exports AFFILIATE_COOKIE_TTL_DAYS", () => {
      expect(AFFILIATE_COOKIE_TTL_DAYS).toBe(30);
    });

    it("exports AFFILIATE_COOKIE_TTL_SECONDS", () => {
      expect(AFFILIATE_COOKIE_TTL_SECONDS).toBe(30 * 24 * 60 * 60);
    });
  });

  describe("sanitizeAffiliateRef", () => {
    it("returns null for non-string input", () => {
      expect(sanitizeAffiliateRef(null)).toBeNull();
      expect(sanitizeAffiliateRef(undefined)).toBeNull();
      expect(sanitizeAffiliateRef(123)).toBeNull();
      expect(sanitizeAffiliateRef({})).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(sanitizeAffiliateRef("")).toBeNull();
      expect(sanitizeAffiliateRef("   ")).toBeNull();
    });

    it("returns null for invalid characters", () => {
      expect(sanitizeAffiliateRef("ab@cd")).toBeNull();
      expect(sanitizeAffiliateRef("ab cd")).toBeNull();
      expect(sanitizeAffiliateRef("ab.cd")).toBeNull();
    });

    it("returns null for too short", () => {
      expect(sanitizeAffiliateRef("a")).toBeNull();
    });

    it("returns null for too long", () => {
      expect(sanitizeAffiliateRef("a".repeat(65))).toBeNull();
    });

    it("returns trimmed valid ref", () => {
      expect(sanitizeAffiliateRef("  valid_ref-123  ")).toBe("valid_ref-123");
    });

    it("accepts valid ref with underscore and hyphen", () => {
      expect(sanitizeAffiliateRef("abc_def-ghi")).toBe("abc_def-ghi");
    });
  });

  describe("parseCookies", () => {
    it("returns empty object for null", () => {
      expect(parseCookies(null)).toEqual({});
    });

    it("returns empty object for empty string", () => {
      expect(parseCookies("")).toEqual({});
    });

    it("parses single cookie", () => {
      expect(parseCookies("foo=bar")).toEqual({ foo: "bar" });
    });

    it("parses multiple cookies", () => {
      expect(parseCookies("foo=bar; baz=qux")).toEqual({
        foo: "bar",
        baz: "qux",
      });
    });

    it("handles spaces", () => {
      expect(parseCookies("foo=bar; baz=qux")).toEqual({
        foo: "bar",
        baz: "qux",
      });
    });

    it("ignores malformed parts", () => {
      expect(parseCookies("=value; key=")).toEqual({ key: "" });
    });
  });

  describe("resolveAffiliateContext", () => {
    const makeRequest = (url: string, cookie?: string) =>
      new Request(url, cookie ? { headers: { cookie } } : undefined);

    it("returns none when no ref provided", () => {
      const req = makeRequest("https://example.com/");
      const ctx = resolveAffiliateContext(req, new URL("https://example.com/"));
      expect(ctx.attribution.ref).toBeNull();
      expect(ctx.attribution.source).toBe("none");
      expect(ctx.shouldSetCookie).toBe(false);
      expect(ctx.attribution.cookieName).toBe(AFFILIATE_COOKIE_NAME);
      expect(ctx.attribution.ttlDays).toBe(AFFILIATE_COOKIE_TTL_DAYS);
    });

    it("uses query param ref", () => {
      const req = makeRequest("https://example.com/?ref=abc123");
      const ctx = resolveAffiliateContext(
        req,
        new URL("https://example.com/?ref=abc123"),
      );
      expect(ctx.attribution.ref).toBe("abc123");
      expect(ctx.attribution.source).toBe("query");
      expect(ctx.shouldSetCookie).toBe(true);
    });

    it("uses cookie ref when no query", () => {
      const req = makeRequest("https://example.com/", "mw_ref=cookie123");
      const ctx = resolveAffiliateContext(req, new URL("https://example.com/"));
      expect(ctx.attribution.ref).toBe("cookie123");
      expect(ctx.attribution.source).toBe("cookie");
      expect(ctx.shouldSetCookie).toBe(false);
    });

    it("prefers query over cookie", () => {
      const req = makeRequest(
        "https://example.com/?ref=query123",
        "mw_ref=cookie123",
      );
      const ctx = resolveAffiliateContext(
        req,
        new URL("https://example.com/?ref=query123"),
      );
      expect(ctx.attribution.ref).toBe("query123");
      expect(ctx.attribution.source).toBe("query");
      expect(ctx.shouldSetCookie).toBe(true);
    });

    it("uses body ref with highest priority", () => {
      const req = makeRequest(
        "https://example.com/?ref=query123",
        "mw_ref=cookie123",
      );
      const ctx = resolveAffiliateContext(
        req,
        new URL("https://example.com/?ref=query123"),
        "body123",
      );
      expect(ctx.attribution.ref).toBe("body123");
      expect(ctx.attribution.source).toBe("body");
      expect(ctx.shouldSetCookie).toBe(true);
    });

    it("sanitizes body ref", () => {
      const req = makeRequest("https://example.com/");
      const ctx = resolveAffiliateContext(
        req,
        new URL("https://example.com/"),
        "  body123  ",
      );
      expect(ctx.attribution.ref).toBe("body123");
      expect(ctx.attribution.source).toBe("body");
      expect(ctx.shouldSetCookie).toBe(true);
    });

    it("falls back to query when body ref invalid", () => {
      const req = makeRequest("https://example.com/");
      const ctx = resolveAffiliateContext(
        req,
        new URL("https://example.com/?ref=valid123"),
        "invalid@ref",
      );
      expect(ctx.attribution.ref).toBe("valid123");
      expect(ctx.attribution.source).toBe("query");
    });

    it("returns null for invalid ref everywhere", () => {
      const req = makeRequest("https://example.com/", "mw_ref=invalid@ref");
      const ctx = resolveAffiliateContext(
        req,
        new URL("https://example.com/?ref=bad@ref"),
        "also@bad",
      );
      expect(ctx.attribution.ref).toBeNull();
      expect(ctx.attribution.source).toBe("none");
      expect(ctx.shouldSetCookie).toBe(false);
    });
  });

  describe("buildAffiliateSetCookieHeader", () => {
    it("builds correct cookie header", () => {
      const header = buildAffiliateSetCookieHeader("test123");
      expect(header).toContain("mw_ref=test123");
      expect(header).toContain("Path=/");
      expect(header).toContain(`Max-Age=${AFFILIATE_COOKIE_TTL_SECONDS}`);
      expect(header).toContain("SameSite=Lax");
      expect(header).toContain("HttpOnly");
    });

    it("URL-encodes ref", () => {
      const header = buildAffiliateSetCookieHeader("test ref");
      expect(header).toContain("mw_ref=test%20ref");
    });
  });

  describe("appendAffiliateRef", () => {
    it("returns original path when ref is null", () => {
      expect(appendAffiliateRef("/path", null)).toBe("/path");
    });

    it("appends ref to relative path", () => {
      const result = appendAffiliateRef("/path", "abc123");
      expect(result).toBe("/path?ref=abc123");
    });

    it("preserves existing query params on relative path", () => {
      const result = appendAffiliateRef("/path?currency=USD", "abc123");
      expect(result).toContain("currency=USD");
      expect(result).toContain("ref=abc123");
    });

    it("appends ref to full URL", () => {
      const result = appendAffiliateRef("https://example.com/path", "abc123");
      expect(result).toContain("https://example.com/path?ref=abc123");
    });

    it("replaces existing ref param", () => {
      const result = appendAffiliateRef("/path?ref=old", "new123");
      expect(result).toBe("/path?ref=new123");
    });

    it("preserves hash on relative path", () => {
      const result = appendAffiliateRef("/path#section", "abc123");
      expect(result).toBe("/path?ref=abc123#section");
    });
  });

  describe("escapeXml", () => {
    it("escapes &", () => {
      expect(escapeXml("a & b")).toBe("a &amp; b");
    });

    it("escapes <", () => {
      expect(escapeXml("a < b")).toBe("a &lt; b");
    });

    it("escapes >", () => {
      expect(escapeXml("a > b")).toBe("a &gt; b");
    });

    it("escapes double quotes", () => {
      expect(escapeXml('a " b')).toBe("a &quot; b");
    });

    it("escapes single quotes", () => {
      expect(escapeXml("a ' b")).toBe("a &apos; b");
    });
  });

  describe("buildSitemapXml", () => {
    const makeTemplates = (): PaasCatalogTemplate[] => [
      {
        id: "template-1",
        name: "Template 1",
        category: "Web",
        description: "Test template",
        image: "/img.png",
        minPlan: "free",
        ports: [3000],
        tags: ["test"],
      },
      {
        id: "template-2",
        name: "Template 2",
        category: "API",
        description: "Test template 2",
        image: "/img2.png",
        minPlan: "starter",
        ports: [8080],
        tags: ["api"],
      },
    ];

    it("generates valid sitemap XML with fixed routes", () => {
      const xml = buildSitemapXml({
        origin: "https://example.com",
        templates: [],
        lastModIso: "2024-01-01",
      });
      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain(
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      );
      expect(xml).toContain("<loc>https://example.com/</loc>");
      expect(xml).toContain("<loc>https://example.com/worlds</loc>");
      expect(xml).toContain("<loc>https://example.com/pricing</loc>");
      expect(xml).toContain("<lastmod>2024-01-01</lastmod>");
      expect(xml).toContain("<changefreq>daily</changefreq>");
      expect(xml).toContain("<priority>1.0</priority>");
    });

    it("normalizes origin with trailing slashes", () => {
      const xml = buildSitemapXml({
        origin: "https://example.com///",
        templates: [],
        lastModIso: "2024-01-01",
      });
      expect(xml).toContain("<loc>https://example.com/</loc>");
      expect(xml).not.toContain("example.com///");
    });

    it("includes categories and template URLs", () => {
      const xml = buildSitemapXml({
        origin: "https://example.com",
        templates: makeTemplates(),
        lastModIso: "2024-01-01",
      });
      expect(xml).toContain("/paas/catalog?category=api");
      expect(xml).toContain("/paas/catalog?category=web");
      expect(xml).toContain("/paas/catalog?q=template-1");
      expect(xml).toContain("/paas/catalog?q=template-2");
    });

    it("uses current date when lastModIso not provided", () => {
      const xml = buildSitemapXml({
        origin: "https://example.com",
        templates: [],
      });
      const today = new Date().toISOString().slice(0, 10);
      expect(xml).toContain(`<lastmod>${today}</lastmod>`);
    });
  });

  describe("buildSchemaOrgJsonLd", () => {
    const makeTiers = (): PricingTier[] => [
      {
        tier: "pro",
        name: "Pro",
        summary: "Pro plan",
        monthlyUsd: 19,
        monthlyBaseCents: 1900,
        included: {
          containerHours: 720,
          ramGbHours: 360,
          storageGb: 5,
          egressGb: 10,
        },
        overageCents: {
          containerHour: 2,
          ramGbHour: 3,
          storageGb: 15,
          egressGb: 12,
        },
        quotaLimits: {
          maxApps: 1,
          maxRamMb: 512,
          maxCustomDomains: 0,
          allowDedicatedMesh: false,
        },
      },
    ];

    it("returns object with Organization, WebSite and SoftwareApplication", () => {
      const obj = buildSchemaOrgJsonLd({
        origin: "https://example.com",
        tiers: [],
        fxRateIdrPerUsd: 16000,
        compliance: [],
      });
      expect(obj["@context"]).toBe("https://schema.org");
      expect(obj["@graph"]).toHaveLength(3);
      expect(obj["@graph"][0]?.["@type"]).toBe("Organization");
      expect(obj["@graph"][1]?.["@type"]).toBe("WebSite");
      expect(obj["@graph"][2]?.["@type"]).toBe("SoftwareApplication");
    });

    it("includes offers for both USD and IDR", () => {
      const obj = buildSchemaOrgJsonLd({
        origin: "https://example.com",
        tiers: makeTiers(),
        fxRateIdrPerUsd: 16000,
        compliance: ["CAN-0011"],
      });
      const app = obj["@graph"][2] as Record<string, any>;
      expect(app.offers).toHaveLength(2);
      expect(app.offers[0].priceCurrency).toBe("USD");
      expect(app.offers[1].priceCurrency).toBe("IDR");
      expect(app.offers[1].price).toBe("304000");
    });

    it("includes compliance standards", () => {
      const obj = buildSchemaOrgJsonLd({
        origin: "https://example.com",
        tiers: [],
        fxRateIdrPerUsd: 16000,
        compliance: ["CAN-0011", "ADR-0005"],
      });
      const app = obj["@graph"][2] as Record<string, any>;
      expect(app.additionalProperty).toHaveLength(2);
      expect(app.additionalProperty[0].value).toBe("CAN-0011");
    });
  });

  describe("serializeJsonLdSafe", () => {
    it("escapes HTML characters", () => {
      const result = serializeJsonLdSafe({
        html: "<script>alert(1) & more</script>",
      });
      expect(result).toContain("\\u003c");
      expect(result).toContain("\\u003e");
      expect(result).toContain("\\u0026");
    });

    it("serializes plain objects normally", () => {
      expect(serializeJsonLdSafe({ a: 1 })).toBe('{"a":1}');
    });
  });
});
