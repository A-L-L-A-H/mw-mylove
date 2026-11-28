import { describe, expect, test } from "bun:test";
import {
  AQEL_DISCLAIMER,
  COMPLIANCE_STANDARDS,
  ECOSYSTEM_REPOS,
  EPISTEMIC_LAYERS,
  MTIME_PROFILE_BADGE,
  NON_NORMATIVE_ADVISORY_BADGE,
  checkCan0011Violation,
  renderPortalHtml,
  resolveConfig,
} from "../src/index.ts";

describe("@mw/portal constants", () => {
  test("compliance standards and epistemic layers preserve the canonical counts", () => {
    expect(COMPLIANCE_STANDARDS).toEqual([
      "CAN-0011",
      "CAN-0012",
      "CAN-0013",
      "CAN-0014",
      "ADR-0005",
    ]);
    expect(EPISTEMIC_LAYERS).toHaveLength(8);
    expect(EPISTEMIC_LAYERS.map((layer) => layer.code)).toEqual([
      "L1",
      "L2",
      "L3",
      "L4",
      "L5",
      "L6",
      "L7",
      "L8",
    ]);
    expect(ECOSYSTEM_REPOS).toHaveLength(13);
    expect(ECOSYSTEM_REPOS.some((entry) => entry.id === "mw-mylove")).toBe(
      true,
    );
  });

  test("compliance badges stay explicit and non-normative", () => {
    expect(AQEL_DISCLAIMER).toBe(
      "computational_candidate · not authoritative tafsir",
    );
    expect(MTIME_PROFILE_BADGE).toBe(
      "Software Profile · Not Religious Authority",
    );
    expect(NON_NORMATIVE_ADVISORY_BADGE).toContain("Not a Fatwa or Ruling");
  });

  test("CAN-0011 blocks figurative sacred depictions only", () => {
    expect(
      checkCan0011Violation({
        title: "Portrait of Prophet Muhammad",
        subtitle: "drawing",
      }).blocked,
    ).toBe(true);
    expect(
      checkCan0011Violation("geometric celestial calligraphy").blocked,
    ).toBe(false);
  });
});

describe("@mw/portal config", () => {
  test("resolveConfig applies overrides and strips trailing slashes", () => {
    const config = resolveConfig({
      port: 4460,
      publicOrigin: "https://a-l-l-a-h.com///",
      corpusUrl: "http://127.0.0.1:19991/",
      nexusUrl: "http://127.0.0.1:19992/",
      loreUrl: "http://127.0.0.1:19993/",
      echoUrl: "http://127.0.0.1:19994/",
      studioUrl: "http://127.0.0.1:19995/",
      upstreamTimeoutMs: 250,
    });
    expect(config.port).toBe(4460);
    expect(config.publicOrigin).toBe("https://a-l-l-a-h.com");
    expect(config.corpusUrl).toBe("http://127.0.0.1:19991");
    expect(config.nexusUrl).toBe("http://127.0.0.1:19992");
    expect(config.upstreamTimeoutMs).toBe(250);
    expect(config.usdToIdrRate).toBeGreaterThan(0);
  });
});

describe("@mw/portal renderPortalHtml", () => {
  test("renders compliance labels, badges, and affiliate links without images", () => {
    const html = renderPortalHtml({ affiliateRef: "partner_1" });
    expect(html).toContain("A-L-L-A-H.COM");
    expect(html).toContain("CAN-0011..0014");
    expect(html).toContain("ADR 0005");
    expect(html).toContain("8-Layer Epistemic");
    expect(html).toContain(NON_NORMATIVE_ADVISORY_BADGE);
    expect(html).toContain(AQEL_DISCLAIMER);
    expect(html).toContain(MTIME_PROFILE_BADGE);
    expect(html).toContain("GOD PROMISE Typographic SVG Card Previewer");
    expect(html).toContain('name="mw-affiliate-ref" content="partner_1"');
    expect(html).toContain("ref=partner_1");
    expect(html).not.toContain("<img");
  });
});
