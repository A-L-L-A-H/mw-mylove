export interface EcosystemRepo {
  readonly id: string;
  readonly repo: string;
  readonly category: "portal" | "core" | "ops" | "epistemic" | "saas" | "infra";
  readonly port: number | null;
  readonly summary: string;
}

export interface EpistemicLayer {
  readonly code: string;
  readonly title: string;
  readonly authority:
    | "primary-text"
    | "graded-transmission"
    | "classical-scholarship"
    | "historical-record"
    | "empirical-observation"
    | "analytical-synthesis"
    | "contextual-narrative"
    | "non-normative-advisory";
  readonly description: string;
}

export const AQEL_DISCLAIMER =
  "computational_candidate · not authoritative tafsir";
export const MTIME_PROFILE_BADGE = "Software Profile · Not Religious Authority";

const CAN_0011_SACRED_SUBJECT_RE =
  /\b(allah|god|prophet|muhammad|mohammed|nabi|rasul|messenger|jesus|isa|moses|musa|abraham|ibrahim|noah|nuh|adam|david|dawud|solomon|sulaiman|joseph|yusuf|gabriel|jibril|angel|angels)\b/i;

const CAN_0011_DEPICTION_RE =
  /\b(depict|depiction|portrait|face|likeness|statue|idol|figurative|anthropomorphic|caricature|cartoon|illustrat(?:e|ion)|draw(?:ing)?|paint(?:ing)?|photo(?:graph)?|render\s+(?:a\s+)?(?:face|person|figure|body|human))\b/i;

export function checkCan0011Violation(input: unknown): {
  blocked: boolean;
  reason: string | null;
} {
  const serialized =
    typeof input === "string" ? input : JSON.stringify(input ?? "");
  if (
    CAN_0011_SACRED_SUBJECT_RE.test(serialized) &&
    CAN_0011_DEPICTION_RE.test(serialized)
  ) {
    return {
      blocked: true,
      reason:
        "CAN-0011 policy violation: visual or figurative depiction of Allah, Prophets, or Angels is strictly prohibited. Use typographic, geometric, or celestial motifs only.",
    };
  }
  return { blocked: false, reason: null };
}

export const COMPLIANCE_STANDARDS = [
  "CAN-0011",
  "CAN-0012",
  "CAN-0013",
  "CAN-0014",
  "ADR-0005",
] as const;

export const NON_NORMATIVE_ADVISORY_BADGE =
  "NON-NORMATIVE ADVISORY — ADR 0005 (Mizan / CRAYON Analytical Output Only; Not a Fatwa or Ruling)";

export const EPISTEMIC_LAYERS: readonly EpistemicLayer[] = [
  {
    code: "L1",
    title: "Primary Revelation (Qur'an — Mutawatir Text)",
    authority: "primary-text",
    description:
      "Verbatim Arabic revelation with canonical orthography and surah:ayah provenance.",
  },
  {
    code: "L2",
    title: "Prophetic Tradition (Hadith — Graded Isnad)",
    authority: "graded-transmission",
    description:
      "Attributed narrations carrying explicit collection, isnad, and authenticity grading.",
  },
  {
    code: "L3",
    title: "Classical Exegesis & Jurisprudence (Tafsir / Fiqh)",
    authority: "classical-scholarship",
    description:
      "Attributed scholarly commentary and legal methodology with madhhab provenance.",
  },
  {
    code: "L4",
    title: "Historical & Comparative Records (Tarikh / Chronology)",
    authority: "historical-record",
    description:
      "Dated historical chronicles, manuscript witnesses, and comparative textual records.",
  },
  {
    code: "L5",
    title: "Empirical & Scientific Observation (Afaq / Anfus)",
    authority: "empirical-observation",
    description:
      "Reproducible physical, astronomical, and empirical measurements.",
  },
  {
    code: "L6",
    title: "Analytical Synthesis & Cross-Reference (Mizan / Nexus)",
    authority: "analytical-synthesis",
    description:
      "Structured domain mappings and cross-references; explicitly separated from L1-L3.",
  },
  {
    code: "L7",
    title: "Contextual Commentary & Lore (Non-Binding Narrative)",
    authority: "contextual-narrative",
    description:
      "Era timelines, geographic context, and cultural background notes.",
  },
  {
    code: "L8",
    title:
      "AI / Advisory Projection (Non-Normative — Human Verification Required)",
    authority: "non-normative-advisory",
    description:
      "Machine-assisted summaries or CRAYON projections; strictly non-normative under ADR 0005.",
  },
] as const;

export const ECOSYSTEM_REPOS: readonly EcosystemRepo[] = [
  {
    id: "mw-mylove",
    repo: "A-L-L-A-H/mw-mylove",
    category: "portal",
    port: 4460,
    summary:
      "Flagship Public Web Portal for A-L-L-A-H.COM & MoonWitness Sovereign Ecosystem",
  },
  {
    id: "mw-echo",
    repo: "A-L-L-A-H/mw-echo",
    category: "core",
    port: 4310,
    summary: "Sovereign Core Node, Event Telemetry & Radar Gateway",
  },
  {
    id: "mw-lab",
    repo: "A-L-L-A-H/mw-lab",
    category: "ops",
    port: 4400,
    summary: "Fleet Operations Laboratory & Verification Harness",
  },
  {
    id: "mw-mission",
    repo: "A-L-L-A-H/mw-mission",
    category: "ops",
    port: 4410,
    summary: "Autonomous Mission Orchestrator & Task Pipeline",
  },
  {
    id: "mw-cp",
    repo: "A-L-L-A-H/mw-cp",
    category: "ops",
    port: 4440,
    summary: "Sovereign Control Plane & Policy Governance",
  },
  {
    id: "mw-corpus",
    repo: "A-L-L-A-H/mw-corpus",
    category: "epistemic",
    port: 4420,
    summary: "GOD PROMISE & 8-Layer Epistemic Corpus Index",
  },
  {
    id: "mw-nexus",
    repo: "A-L-L-A-H/mw-nexus",
    category: "epistemic",
    port: 4430,
    summary: "Mizan & CRAYON Cross-Domain Analytical Nexus",
  },
  {
    id: "mw-lore",
    repo: "A-L-L-A-H/mw-lore",
    category: "epistemic",
    port: 4450,
    summary: "Historical Era & Chronological Lore Engine",
  },
  {
    id: "mw-dock",
    repo: "A-L-L-A-H/mw-dock",
    category: "saas",
    port: 3000,
    summary: "Sovereign Application Dock & Identity Workspace",
  },
  {
    id: "mw-design",
    repo: "A-L-L-A-H/mw-design",
    category: "saas",
    port: 8080,
    summary: "Geometric & Typographic Design Studio",
  },
  {
    id: "mw-xv",
    repo: "A-L-L-A-H/mw-xv",
    category: "saas",
    port: 3001,
    summary: "Sovereign Board, Knowledge Graph & Workspace Engine",
  },
  {
    id: "mw-isp",
    repo: "A-L-L-A-H/mw-isp",
    category: "infra",
    port: 8091,
    summary: "Sovereign ISP, Network Access & RADIUS AAA",
  },
  {
    id: "mw-stack",
    repo: "A-L-L-A-H/mw-stack",
    category: "infra",
    port: null,
    summary: "Docker Compose Profiles & Caddy Automatic HTTPS Stack",
  },
] as const;
