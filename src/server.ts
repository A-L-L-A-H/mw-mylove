import {
  resolveRidAuthConfig,
  verifyRidAccessToken,
  type RidAuthConfig,
} from "./rid-auth.ts";
import {
  buildPaasCatalogResponsePayload,
  buildPricingResponsePayload,
  buildStatusResponsePayload,
  type UpstreamTarget,
} from "./storefront.ts";

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
  readonly authority: "primary-text" | "graded-transmission" | "classical-scholarship" | "historical-record" | "empirical-observation" | "analytical-synthesis" | "contextual-narrative" | "non-normative-advisory";
  readonly description: string;
}

export interface PortalConfig {
  readonly port: number;
  readonly corpusUrl: string;
  readonly nexusUrl: string;
  readonly loreUrl: string;
  readonly echoUrl: string;
  readonly studioUrl: string;
  readonly cpUrl?: string;
  readonly upstreamTimeoutMs: number;
  readonly fetcher: typeof fetch;
  readonly ridAuth: RidAuthConfig;
}

export const AQEL_DISCLAIMER = "computational_candidate · not authoritative tafsir";
export const MTIME_PROFILE_BADGE = "Software Profile · Not Religious Authority";

const CAN_0011_SACRED_SUBJECT_RE =
  /\b(allah|god|prophet|muhammad|mohammed|nabi|rasul|messenger|jesus|isa|moses|musa|abraham|ibrahim|noah|nuh|adam|david|dawud|solomon|sulaiman|joseph|yusuf|gabriel|jibril|angel|angels)\b/i;

const CAN_0011_DEPICTION_RE =
  /\b(depict|depiction|portrait|face|likeness|statue|idol|figurative|anthropomorphic|caricature|cartoon|illustrat(?:e|ion)|draw(?:ing)?|paint(?:ing)?|photo(?:graph)?|render\s+(?:a\s+)?(?:face|person|figure|body|human))\b/i;

export function checkCan0011Violation(input: unknown): { blocked: boolean; reason: string | null } {
  const serialized = typeof input === "string" ? input : JSON.stringify(input ?? "");
  if (CAN_0011_SACRED_SUBJECT_RE.test(serialized) && CAN_0011_DEPICTION_RE.test(serialized)) {
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
    description: "Verbatim Arabic revelation with canonical orthography and surah:ayah provenance.",
  },
  {
    code: "L2",
    title: "Prophetic Tradition (Hadith — Graded Isnad)",
    authority: "graded-transmission",
    description: "Attributed narrations carrying explicit collection, isnad, and authenticity grading.",
  },
  {
    code: "L3",
    title: "Classical Exegesis & Jurisprudence (Tafsir / Fiqh)",
    authority: "classical-scholarship",
    description: "Attributed scholarly commentary and legal methodology with madhhab provenance.",
  },
  {
    code: "L4",
    title: "Historical & Comparative Records (Tarikh / Chronology)",
    authority: "historical-record",
    description: "Dated historical chronicles, manuscript witnesses, and comparative textual records.",
  },
  {
    code: "L5",
    title: "Empirical & Scientific Observation (Afaq / Anfus)",
    authority: "empirical-observation",
    description: "Reproducible physical, astronomical, and empirical measurements.",
  },
  {
    code: "L6",
    title: "Analytical Synthesis & Cross-Reference (Mizan / Nexus)",
    authority: "analytical-synthesis",
    description: "Structured domain mappings and cross-references; explicitly separated from L1-L3.",
  },
  {
    code: "L7",
    title: "Contextual Commentary & Lore (Non-Binding Narrative)",
    authority: "contextual-narrative",
    description: "Era timelines, geographic context, and cultural background notes.",
  },
  {
    code: "L8",
    title: "AI / Advisory Projection (Non-Normative — Human Verification Required)",
    authority: "non-normative-advisory",
    description: "Machine-assisted summaries or CRAYON projections; strictly non-normative under ADR 0005.",
  },
] as const;

export const ECOSYSTEM_REPOS: readonly EcosystemRepo[] = [
  {
    id: "mw-mylove",
    repo: "A-L-L-A-H/mw-mylove",
    category: "portal",
    port: 4460,
    summary: "Flagship Public Web Portal for A-L-L-A-H.COM & MoonWitness Sovereign Ecosystem",
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

export function resolveConfig(overrides: Partial<PortalConfig> = {}): PortalConfig {
  const rawPort = Number(process.env.MW_MYLOVE_PORT ?? process.env.PORT ?? 4460);
  const rawCpUrl = overrides.cpUrl ?? process.env.MW_CP_URL ?? "http://mw-cp:4440";
  return {
    port: overrides.port ?? (Number.isFinite(rawPort) && rawPort > 0 ? rawPort : 4460),
    corpusUrl: (overrides.corpusUrl ?? process.env.MW_CORPUS_URL ?? "http://mw-corpus:4420").replace(/\/+$/, ""),
    nexusUrl: (overrides.nexusUrl ?? process.env.MW_NEXUS_URL ?? "http://mw-nexus:4430").replace(/\/+$/, ""),
    loreUrl: (overrides.loreUrl ?? process.env.MW_LORE_URL ?? "http://mw-lore:4450").replace(/\/+$/, ""),
    echoUrl: (overrides.echoUrl ?? process.env.MW_ECHO_URL ?? "http://mw-echo:4310").replace(/\/+$/, ""),
    studioUrl: (overrides.studioUrl ?? process.env.MW_STUDIO_URL ?? "http://mw-studio:4470").replace(/\/+$/, ""),
    cpUrl: rawCpUrl.replace(/\/+$/, ""),
    upstreamTimeoutMs: overrides.upstreamTimeoutMs ?? 3000,
    fetcher: overrides.fetcher ?? fetch,
    ridAuth: resolveRidAuthConfig(overrides.ridAuth),
  };
}

interface UpstreamProbeResult {
  readonly status: "online" | "offline";
  readonly httpStatus: number | null;
  readonly payload: unknown;
  readonly reason: string | null;
}

async function fetchUpstreamJson(
  targetUrl: string,
  config: PortalConfig,
  options: { method?: "GET" | "POST"; body?: unknown } = {},
): Promise<UpstreamProbeResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.upstreamTimeoutMs);
  const method = options.method ?? "GET";
  try {
    const headers: Record<string, string> = { Accept: "application/json, image/svg+xml" };
    let serializedBody: string | undefined;
    if (method === "POST" && options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      serializedBody = JSON.stringify(options.body);
    }
    const upstreamResponse = await config.fetcher(targetUrl, {
      method,
      headers,
      body: serializedBody,
      signal: controller.signal,
    });
    if (!upstreamResponse.ok) {
      return {
        status: "offline",
        httpStatus: upstreamResponse.status,
        payload: null,
        reason: `Upstream returned HTTP ${upstreamResponse.status}`,
      };
    }
    const contentType = upstreamResponse.headers.get("content-type") ?? "";
    const parsedBody = contentType.includes("image/svg+xml")
      ? { svg: await upstreamResponse.text() }
      : await upstreamResponse.json();
    return {
      status: "online",
      httpStatus: upstreamResponse.status,
      payload: parsedBody,
      reason: null,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upstream unreachable";
    return {
      status: "offline",
      httpStatus: null,
      payload: null,
      reason: message,
    };
  } finally {
    clearTimeout(timer);
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function renderPortalHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>A-L-L-A-H.COM — MoonWitness Sovereign Ecosystem</title>
  <style>
    :root {
      --bg-void: #06090c;
      --bg-panel: #0c1318;
      --bg-card: #111b22;
      --border-gold: rgba(212, 175, 55, 0.34);
      --border-emerald: rgba(16, 185, 129, 0.34);
      --gold: #d4af37;
      --gold-soft: #f0d78c;
      --emerald: #10b981;
      --emerald-soft: #6ee7b7;
      --text-primary: #eef2f5;
      --text-muted: #93a4b3;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      background:
        radial-gradient(circle at 20% 0%, rgba(16, 185, 129, 0.12), transparent 45%),
        radial-gradient(circle at 80% 10%, rgba(212, 175, 55, 0.12), transparent 40%),
        var(--bg-void);
      color: var(--text-primary);
      line-height: 1.6;
      min-height: 100vh;
    }
    header {
      border-bottom: 1px solid var(--border-gold);
      padding: 2.5rem 1.5rem 2rem;
      text-align: center;
      background: linear-gradient(180deg, rgba(12, 19, 24, 0.92), rgba(6, 9, 12, 0.98));
    }
    .star-emblem {
      width: 56px;
      height: 56px;
      margin: 0 auto 1rem;
      display: block;
    }
    h1 {
      font-size: clamp(1.9rem, 4vw, 3rem);
      letter-spacing: 0.22em;
      color: var(--gold);
      font-weight: 700;
    }
    .subtitle {
      color: var(--emerald-soft);
      margin-top: 0.45rem;
      font-size: 0.95rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .compliance-strip {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1.1rem;
    }
    .badge {
      display: inline-block;
      padding: 0.22rem 0.65rem;
      border-radius: 999px;
      font-size: 0.74rem;
      letter-spacing: 0.05em;
      border: 1px solid var(--border-gold);
      color: var(--gold-soft);
      background: rgba(212, 175, 55, 0.08);
    }
    .badge-emerald {
      border-color: var(--border-emerald);
      color: var(--emerald-soft);
      background: rgba(16, 185, 129, 0.09);
    }
    .badge-advisory {
      border-color: #f59e0b;
      color: #fde68a;
      background: rgba(245, 158, 11, 0.14);
      font-weight: 600;
    }
    main {
      max-width: 1180px;
      margin: 0 auto;
      padding: 2rem 1.25rem 4rem;
      display: grid;
      gap: 2rem;
    }
    section {
      background: var(--bg-panel);
      border: 1px solid var(--border-gold);
      border-radius: 12px;
      padding: 1.5rem;
    }
    h2 {
      color: var(--gold);
      font-size: 1.15rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
    }
    .section-note {
      color: var(--text-muted);
      font-size: 0.88rem;
      margin-bottom: 1rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 0.9rem;
    }
    .card {
      background: var(--bg-card);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 0.95rem;
    }
    .card h3 {
      font-size: 0.96rem;
      color: var(--gold-soft);
      margin-bottom: 0.3rem;
    }
    .card p {
      font-size: 0.84rem;
      color: var(--text-muted);
    }
    .search-bar {
      display: flex;
      gap: 0.6rem;
      margin-bottom: 1rem;
    }
    .search-bar input {
      flex: 1;
      background: var(--bg-void);
      border: 1px solid var(--border-emerald);
      color: var(--text-primary);
      padding: 0.6rem 0.85rem;
      border-radius: 8px;
      font-size: 0.92rem;
    }
    .search-bar button {
      background: linear-gradient(135deg, var(--gold), #b58d22);
      color: #06090c;
      border: none;
      border-radius: 8px;
      padding: 0.6rem 1.15rem;
      font-weight: 700;
      cursor: pointer;
    }
    .status-box {
      padding: 0.85rem 1rem;
      border-radius: 8px;
      border: 1px dashed var(--border-emerald);
      color: var(--text-muted);
      font-size: 0.86rem;
      background: rgba(6, 9, 12, 0.65);
    }
    footer {
      text-align: center;
      padding: 1.5rem;
      color: var(--text-muted);
      font-size: 0.8rem;
      border-top: 1px solid rgba(212, 175, 55, 0.18);
    }
  </style>
</head>
<body>
  <header>
    <!-- Pure geometric Rub el Hizb 8-point star (CAN-0011..0014: typographic/geometric/celestial ONLY) -->
    <svg class="star-emblem" viewBox="0 0 100 100" aria-hidden="true">
      <rect x="20" y="20" width="60" height="60" fill="none" stroke="#d4af37" stroke-width="2.5" />
      <rect x="20" y="20" width="60" height="60" fill="none" stroke="#10b981" stroke-width="2.5" transform="rotate(45 50 50)" />
      <circle cx="50" cy="50" r="8" fill="none" stroke="#d4af37" stroke-width="2" />
    </svg>
    <h1>A-L-L-A-H.COM</h1>
    <p class="subtitle">MoonWitness Sovereign Ecosystem — Flagship Public Web Portal</p>
    <div class="compliance-strip">
      <span class="badge">CAN-0011..0014: Typographic &amp; Geometric Celestial UI Only</span>
      <span class="badge badge-emerald">ADR 0005: 8-Layer Epistemic Separation</span>
      <span class="badge badge-advisory">${NON_NORMATIVE_ADVISORY_BADGE}</span>
    </div>
  </header>

  <main>
    <section id="corpus-section">
      <h2>GOD PROMISE &amp; 8-Layer Epistemic Corpus</h2>
      <p class="section-note">
        Every record is tagged with its exact epistemic layer (L1–L8). Primary revelation (L1) is strictly separated from commentary (L3), analytical synthesis (L6), and AI advisory projections (L8).
      </p>
      <div class="search-bar">
        <input id="corpus-query" type="search" placeholder="Search GOD PROMISE / Corpus (live upstream mw-corpus)..." />
        <button id="corpus-search-btn" type="button">Search</button>
      </div>
      <div id="corpus-results" class="status-box">Querying live upstream mw-corpus...</div>
      <div id="epistemic-layers" class="grid" style="margin-top: 1rem;"></div>
    </section>

    <section id="nexus-section">
      <h2>Mizan &amp; CRAYON Cross-Domain Nexus</h2>
      <p class="section-note">
        <span class="badge badge-advisory">${NON_NORMATIVE_ADVISORY_BADGE}</span>
      </p>
      <div id="nexus-results" class="status-box">Connecting to live upstream mw-nexus...</div>
    </section>

    <section id="aqel-section">
      <h2>AQEL Arabic Lexical &amp; Particle Inspector</h2>
      <p class="section-note">
        <span class="badge badge-advisory">${AQEL_DISCLAIMER}</span>
      </p>
      <div class="search-bar">
        <input id="aqel-input" type="text" dir="rtl" placeholder="أدخل نصًا عربيًا للتحليل الصرفي والنحوي (live upstream mw-corpus)..." />
        <button id="aqel-analyze-btn" type="button">Analyze</button>
      </div>
      <div id="aqel-results" class="status-box">Enter Arabic text and click Analyze to query live upstream mw-corpus/api/aqel/analyze.</div>
    </section>

    <section id="mtime-section">
      <h2>Antikythera M-Time Astronomical / Hijri-UTC Clock</h2>
      <p class="section-note">
        <span class="badge badge-advisory">${MTIME_PROFILE_BADGE}</span>
      </p>
      <div class="search-bar">
        <input id="mtime-input" type="text" placeholder="ISO-8601 UTC timestamp (e.g. 2026-11-26T12:00:00Z) — blank for current UTC" />
        <button id="mtime-convert-btn" type="button">Convert</button>
      </div>
      <div id="mtime-results" class="status-box">Connecting to live upstream mw-nexus/api/time/convert...</div>
    </section>

    <section id="poster-section">
      <h2>GOD PROMISE Typographic SVG Card Previewer</h2>
      <p class="section-note">
        <span class="badge">CAN-0011 Enforced Locally: Typographic &amp; Geometric Celestial SVG Only — Zero Figurative Depiction</span>
      </p>
      <div class="search-bar">
        <input id="poster-title" type="text" placeholder="Card title (e.g. Surah Al-Inshirah 94:5)" />
        <input id="poster-subtitle" type="text" placeholder="Typographic verse or geometric theme..." />
        <button id="poster-preview-btn" type="button">Preview SVG</button>
      </div>
      <div id="poster-results" class="status-box">Enter typographic card text to preview via live upstream mw-studio/api/render/poster.</div>
    </section>

    <section id="lore-radar-section">
      <h2>Chronological Lore &amp; Sovereign Radar</h2>
      <div class="grid">
        <div class="card">
          <h3>Historical Eras (mw-lore — L4 / L7)</h3>
          <div id="lore-results" class="status-box">Connecting to live upstream mw-lore...</div>
        </div>
        <div class="card">
          <h3>Sovereign Radar Events (mw-echo)</h3>
          <div id="radar-results" class="status-box">Connecting to live upstream mw-echo...</div>
        </div>
      </div>
    </section>

    <section id="ecosystem-section">
      <h2>MoonWitness 13-Repository Sovereign Directory</h2>
      <p class="section-note">Live directory of all 13 repositories powering the A-L-L-A-H.COM sovereign stack.</p>
      <div id="ecosystem-grid" class="grid"></div>
    </section>
  </main>

  <footer>
    A-L-L-A-H.COM · MoonWitness Sovereign Ecosystem · CAN-0011..0014 &amp; ADR 0005 Compliant · Zero Fake Data
  </footer>

  <script>
    async function loadEcosystem() {
      const response = await fetch("/api/ecosystem");
      const payload = await response.json();
      const layerGrid = document.getElementById("epistemic-layers");
      layerGrid.innerHTML = payload.epistemicLayers.map((layer) =>
        '<div class="card"><h3>' + layer.code + ': ' + layer.title + '</h3><p>' + layer.description + '</p></div>'
      ).join("");
      const repoGrid = document.getElementById("ecosystem-grid");
      repoGrid.innerHTML = payload.repositories.map((entry) =>
        '<div class="card"><h3>' + entry.repo + '</h3><p>' + entry.summary + (entry.port ? ' (:' + entry.port + ')' : '') + '</p></div>'
      ).join("");
    }

    async function searchCorpus(queryText) {
      const box = document.getElementById("corpus-results");
      const response = await fetch("/api/corpus/search?q=" + encodeURIComponent(queryText || ""));
      const payload = await response.json();
      if (payload.status === "offline") {
        box.textContent = "Upstream mw-corpus offline (" + payload.message + "). Zero fake data displayed.";
        return;
      }
      box.textContent = JSON.stringify(payload.results);
    }

    async function loadLivePanels() {
      const [nexusResp, loreResp, radarResp] = await Promise.all([
        fetch("/api/nexus/domains").then((r) => r.json()),
        fetch("/api/lore/eras").then((r) => r.json()),
        fetch("/api/radar/events").then((r) => r.json()),
      ]);
      document.getElementById("nexus-results").textContent =
        nexusResp.status === "offline"
          ? "Upstream mw-nexus offline (" + nexusResp.message + "). Zero fake data displayed."
          : JSON.stringify(nexusResp.domains);
      document.getElementById("lore-results").textContent =
        loreResp.status === "offline"
          ? "Upstream mw-lore offline (" + loreResp.message + ")."
          : JSON.stringify(loreResp.eras);
      document.getElementById("radar-results").textContent =
        radarResp.status === "offline"
          ? "Upstream mw-echo offline (" + radarResp.message + ")."
          : JSON.stringify(radarResp.events);
    }

    async function analyzeAqel(text) {
      const box = document.getElementById("aqel-results");
      if (!text || !text.trim()) {
        box.textContent = "Enter Arabic text to analyze (computational_candidate · not authoritative tafsir).";
        return;
      }
      const response = await fetch("/api/aqel/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const payload = await response.json();
      if (payload.status === "offline") {
        box.textContent = "Upstream mw-corpus offline (" + payload.message + "). Zero fake data displayed.";
        return;
      }
      box.textContent = JSON.stringify(payload.analysis);
    }

    async function convertMTime(tsValue) {
      const box = document.getElementById("mtime-results");
      const queryParam = tsValue && tsValue.trim() ? "?ts=" + encodeURIComponent(tsValue.trim()) : "";
      const response = await fetch("/api/time/convert" + queryParam);
      const payload = await response.json();
      if (payload.status === "offline") {
        box.textContent = "Upstream mw-nexus offline (" + payload.message + "). Zero fake data displayed.";
        return;
      }
      box.textContent = JSON.stringify(payload.conversion);
    }

    async function previewPoster(title, subtitle) {
      const box = document.getElementById("poster-results");
      const response = await fetch("/api/poster/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title || "GOD PROMISE", subtitle: subtitle || "" }),
      });
      const payload = await response.json();
      if (response.status === 422 || payload.blocked) {
        box.textContent = "Blocked by CAN-0011: " + payload.reason;
        return;
      }
      if (payload.status === "offline") {
        box.textContent = "Upstream mw-studio offline (" + payload.message + "). Zero fake data displayed.";
        return;
      }
      if (payload.poster && typeof payload.poster.svg === "string") {
        box.innerHTML = payload.poster.svg;
        return;
      }
      box.textContent = JSON.stringify(payload.poster);
    }

    document.getElementById("corpus-search-btn").addEventListener("click", () => {
      searchCorpus(document.getElementById("corpus-query").value);
    });
    document.getElementById("aqel-analyze-btn").addEventListener("click", () => {
      analyzeAqel(document.getElementById("aqel-input").value);
    });
    document.getElementById("mtime-convert-btn").addEventListener("click", () => {
      convertMTime(document.getElementById("mtime-input").value);
    });
    document.getElementById("poster-preview-btn").addEventListener("click", () => {
      previewPoster(
        document.getElementById("poster-title").value,
        document.getElementById("poster-subtitle").value,
      );
    });

    loadEcosystem();
    searchCorpus("");
    loadLivePanels();
    convertMTime("");
  </script>
</body>
</html>`;
}

export async function handleRequest(
  request: Request,
  config: PortalConfig,
): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;

  if (pathname === "/api/aqel/analyze") {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }
    let parsed: { text?: unknown };
    try {
      parsed = (await request.json()) as { text?: unknown };
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }
    if (typeof parsed.text !== "string" || parsed.text.trim().length === 0) {
      return jsonResponse({ error: "Field 'text' must be a non-empty string" }, 400);
    }
    const targetUrl = `${config.corpusUrl}/api/aqel/analyze`;
    const probe = await fetchUpstreamJson(targetUrl, config, {
      method: "POST",
      body: { text: parsed.text },
    });
    return jsonResponse({
      status: probe.status,
      upstream: "mw-corpus",
      epistemicStatus: "computational_candidate",
      disclaimer: AQEL_DISCLAIMER,
      advisoryBadge: NON_NORMATIVE_ADVISORY_BADGE,
      analysis: probe.status === "online" ? probe.payload : null,
      message: probe.reason ?? "ok",
    });
  }

  if (pathname === "/api/poster/preview") {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }
    let parsed: Record<string, unknown>;
    try {
      const raw = await request.json();
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return jsonResponse({ error: "Request body must be a JSON object" }, 400);
      }
      parsed = raw as Record<string, unknown>;
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }
    const can0011Check = checkCan0011Violation(parsed);
    if (can0011Check.blocked) {
      return jsonResponse(
        {
          status: "blocked",
          blocked: true,
          code: "CAN-0011",
          error: "CAN-0011_VIOLATION",
          reason: can0011Check.reason,
        },
        422,
      );
    }
    const targetUrl = `${config.studioUrl}/api/render/poster`;
    const probe = await fetchUpstreamJson(targetUrl, config, {
      method: "POST",
      body: parsed,
    });
    return jsonResponse({
      status: probe.status,
      upstream: "mw-studio",
      compliance: "CAN-0011",
      poster: probe.status === "online" ? probe.payload : null,
      message: probe.reason ?? "ok",
    });
  }

  if (request.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (pathname === "/") {
    return new Response(renderPortalHtml(), {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  if (pathname === "/health") {
    return jsonResponse({
      status: "ok",
      service: "mw-mylove",
      domain: "a-l-l-a-h.com",
      port: config.port,
      compliance: COMPLIANCE_STANDARDS,
      timestamp: new Date().toISOString(),
    });
  }

  if (pathname === "/api/auth/session") {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader.trim().length === 0) {
      return jsonResponse({ authenticated: false }, 200);
    }
    const bearerMatch = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
    if (!bearerMatch || !bearerMatch[1]) {
      return jsonResponse(
        { authenticated: false, error: "Malformed Authorization header; expected Bearer token" },
        401,
      );
    }
    try {
      const session = await verifyRidAccessToken(bearerMatch[1], config.ridAuth);
      return jsonResponse(session, 200);
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Invalid mw-rid access token";
      return jsonResponse({ authenticated: false, error: reason }, 401);
    }
  }

  if (pathname === "/api/ecosystem") {
    return jsonResponse({
      domain: "a-l-l-a-h.com",
      service: "mw-mylove",
      compliance: COMPLIANCE_STANDARDS,
      advisoryBadge: NON_NORMATIVE_ADVISORY_BADGE,
      repositoryCount: ECOSYSTEM_REPOS.length,
      repositories: ECOSYSTEM_REPOS,
      epistemicLayers: EPISTEMIC_LAYERS,
    });
  }

  if (pathname === "/api/corpus/search") {
    const query = url.searchParams.get("q") ?? "";
    const targetUrl = `${config.corpusUrl}/api/search?q=${encodeURIComponent(query)}`;
    const probe = await fetchUpstreamJson(targetUrl, config);
    return jsonResponse({
      status: probe.status,
      upstream: "mw-corpus",
      query,
      epistemicLayers: EPISTEMIC_LAYERS,
      results: probe.status === "online" ? probe.payload : [],
      message: probe.reason ?? "ok",
    });
  }

  if (pathname === "/api/nexus/domains") {
    const targetUrl = `${config.nexusUrl}/api/domains`;
    const probe = await fetchUpstreamJson(targetUrl, config);
    return jsonResponse({
      status: probe.status,
      upstream: "mw-nexus",
      advisoryBadge: NON_NORMATIVE_ADVISORY_BADGE,
      domains: probe.status === "online" ? probe.payload : [],
      message: probe.reason ?? "ok",
    });
  }

  if (pathname === "/api/lore/eras") {
    const targetUrl = `${config.loreUrl}/api/eras`;
    const probe = await fetchUpstreamJson(targetUrl, config);
    return jsonResponse({
      status: probe.status,
      upstream: "mw-lore",
      epistemicLayer: "L4/L7",
      eras: probe.status === "online" ? probe.payload : [],
      message: probe.reason ?? "ok",
    });
  }

  if (pathname === "/api/time/convert") {
    const ts = url.searchParams.get("ts") ?? new Date().toISOString();
    const targetUrl = `${config.nexusUrl}/api/time/convert?ts=${encodeURIComponent(ts)}`;
    const probe = await fetchUpstreamJson(targetUrl, config);
    return jsonResponse({
      status: probe.status,
      upstream: "mw-nexus",
      profileBadge: MTIME_PROFILE_BADGE,
      ts,
      conversion: probe.status === "online" ? probe.payload : null,
      message: probe.reason ?? "ok",
    });
  }

  if (pathname === "/api/radar/events") {
    const targetUrl = `${config.echoUrl}/api/events`;
    const probe = await fetchUpstreamJson(targetUrl, config);
    return jsonResponse({
      status: probe.status,
      upstream: "mw-echo",
      events: probe.status === "online" ? probe.payload : [],
      message: probe.reason ?? "ok",
    });
  }

  if (pathname === "/pricing") {
    return jsonResponse(buildPricingResponsePayload(COMPLIANCE_STANDARDS));
  }

  if (pathname === "/status") {
    const targets: UpstreamTarget[] = [
      { id: "mw-corpus", baseUrl: config.corpusUrl },
      { id: "mw-nexus", baseUrl: config.nexusUrl },
      { id: "mw-lore", baseUrl: config.loreUrl },
      { id: "mw-echo", baseUrl: config.echoUrl },
      { id: "mw-studio", baseUrl: config.studioUrl },
    ];
    if (config.cpUrl && config.cpUrl.trim().length > 0) {
      targets.push({ id: "mw-cp", baseUrl: config.cpUrl });
    }
    const payload = await buildStatusResponsePayload(
      targets,
      (targetUrl) => fetchUpstreamJson(targetUrl, config),
    );
    return jsonResponse(payload);
  }

  if (pathname === "/paas/catalog") {
    const payload = await buildPaasCatalogResponsePayload({
      cpUrl: config.cpUrl,
      category: url.searchParams.get("category"),
      query: url.searchParams.get("q"),
      probeFn: (targetUrl) => fetchUpstreamJson(targetUrl, config),
    });
    return jsonResponse(payload);
  }

  return jsonResponse({ error: "Not found", path: pathname }, 404);
}

export function startServer(overrides: Partial<PortalConfig> = {}) {
  const config = resolveConfig(overrides);
  return Bun.serve({
    port: config.port,
    fetch(request) {
      return handleRequest(request, config);
    },
  });
}
