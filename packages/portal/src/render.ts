import {
  appendAffiliateRef,
  buildSchemaOrgJsonLd,
  serializeJsonLdSafe,
} from "@mw/seo";
import { DEFAULT_USD_TO_IDR_RATE, PRICING_TIERS } from "@mw/storefront";
import {
  AQEL_DISCLAIMER,
  COMPLIANCE_STANDARDS,
  MTIME_PROFILE_BADGE,
  NON_NORMATIVE_ADVISORY_BADGE,
} from "./constants.ts";

function escapeHtmlAttr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
export interface RenderPortalHtmlOptions {
  readonly origin?: string;
  readonly usdToIdrRate?: number;
  readonly affiliateRef?: string | null;
}

export function renderPortalHtml(
  options: RenderPortalHtmlOptions = {},
): string {
  const origin = (options.origin ?? "https://a-l-l-a-h.com").replace(
    /\/+$/,
    "",
  );
  const usdToIdrRate = options.usdToIdrRate ?? DEFAULT_USD_TO_IDR_RATE;
  const affiliateRef = options.affiliateRef ?? null;
  const schemaOrg = buildSchemaOrgJsonLd({
    origin,
    tiers: PRICING_TIERS,
    fxRateIdrPerUsd: usdToIdrRate,
    compliance: COMPLIANCE_STANDARDS,
  });
  const jsonLdScript = `<script type="application/ld+json">${serializeJsonLdSafe(schemaOrg)}</script>`;
  const affiliateMeta = affiliateRef
    ? `\n  <meta name="mw-affiliate-ref" content="${escapeHtmlAttr(affiliateRef)}" />`
    : "";
  const pricingUsdHref = escapeHtmlAttr(
    appendAffiliateRef("/pricing?currency=USD", affiliateRef),
  );
  const pricingIdrHref = escapeHtmlAttr(
    appendAffiliateRef("/pricing?currency=IDR", affiliateRef),
  );
  const catalogHref = escapeHtmlAttr(
    appendAffiliateRef("/paas/catalog", affiliateRef),
  );
  const slaWidgetHref = escapeHtmlAttr(
    appendAffiliateRef("/widgets/sla-mizan", affiliateRef),
  );
  const statusHref = escapeHtmlAttr(
    appendAffiliateRef("/status", affiliateRef),
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>A-L-L-A-H.COM — MoonWitness Sovereign Ecosystem</title>${affiliateMeta}
  ${jsonLdScript}
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
    <nav class="compliance-strip" aria-label="Storefront and Transparency Links">
      <a class="badge" href="${pricingUsdHref}">Pricing (USD)</a>
      <a class="badge badge-emerald" href="${pricingIdrHref}">Pricing (IDR / QRIS)</a>
      <a class="badge" href="${catalogHref}">PaaS Catalog</a>
      <a class="badge badge-emerald" href="${slaWidgetHref}">30d SLA &amp; Sharia Mizan</a>
      <a class="badge" href="${statusHref}">Live Status</a>
      <a class="badge" href="/sitemap.xml">Sitemap XML</a>
    </nav>
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

    <section id="pricing-section">
      <h2>Sovereign PaaS Pricing (USD / IDR &amp; QRIS / VA)</h2>
      <p class="section-note">
        Riba-free, gharar-free transparent monthly billing (Ujrah / Ijarah · Zero late-payment penalty). Toggle currency between USD and IDR and generate QRIS or Virtual Account checkout payloads.
      </p>
      <div class="search-bar">
        <button id="currency-usd-btn" type="button">USD ($)</button>
        <button id="currency-idr-btn" type="button">IDR (Rp / QRIS)</button>
        <select id="checkout-tier">
          <option value="starter">Starter ($19/mo)</option>
          <option value="pro">Pro ($79/mo)</option>
          <option value="enterprise">Enterprise ($399/mo)</option>
        </select>
        <select id="checkout-method">
          <option value="QRIS">QRIS (EMVCo)</option>
          <option value="VA_BSI">VA Bank Syariah Indonesia (BSI)</option>
          <option value="VA_BCA">VA BCA</option>
          <option value="VA_MANDIRI">VA Mandiri</option>
        </select>
        <button id="checkout-intent-btn" type="button">Generate Checkout Intent</button>
      </div>
      <div id="pricing-tiers-grid" class="grid"></div>
      <div id="checkout-intent-results" class="status-box" style="margin-top: 1rem;">Select a tier and payment method to generate a QRIS / VA checkout intent.</div>
    </section>

    <section id="sla-mizan-section">
      <h2>30d SLA &amp; Sharia Mizan Transparency Widget</h2>
      <p class="section-note">
        Real observed 30-day upstream probe telemetry paired with CAN-0011..0014 and ADR-0005 Sharia Mizan compliance guarantees. <a href="${slaWidgetHref}" style="color: var(--emerald-soft);">Open standalone widget</a>
      </p>
      <div id="sla-mizan-results" class="status-box">Loading live 30d SLA &amp; Sharia Mizan status...</div>
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

    let activeCurrency = "USD";
    const activeAffiliateRef = (document.querySelector('meta[name="mw-affiliate-ref"]') || {}).content || "";

    async function loadPricing(currency) {
      activeCurrency = currency;
      const grid = document.getElementById("pricing-tiers-grid");
      const query = "/pricing?currency=" + encodeURIComponent(currency) + (activeAffiliateRef ? "&ref=" + encodeURIComponent(activeAffiliateRef) : "");
      const response = await fetch(query);
      const payload = await response.json();
      grid.innerHTML = payload.tiers.map((tier) =>
        '<div class="card"><h3>' + tier.name + ' — ' + tier.displayPrice + '/mo</h3><p>' + tier.summary + '</p></div>'
      ).join("");
    }

    async function generateCheckoutIntent() {
      const box = document.getElementById("checkout-intent-results");
      const tier = document.getElementById("checkout-tier").value;
      const paymentMethod = document.getElementById("checkout-method").value;
      const response = await fetch("/api/pricing/checkout-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          currency: activeCurrency,
          paymentMethod,
          ref: activeAffiliateRef || undefined,
        }),
      });
      const payload = await response.json();
      box.textContent = JSON.stringify(payload);
    }

    async function loadSlaMizanWidget() {
      const box = document.getElementById("sla-mizan-results");
      const response = await fetch("/api/status/widget");
      const payload = await response.json();
      const avail = payload.sla30d && payload.sla30d.observedAvailabilityPercent !== null
        ? payload.sla30d.observedAvailabilityPercent + "%"
        : "unobserved";
      box.textContent = "Status: " + payload.status.toUpperCase() + " | 30d Observed Availability: " + avail + " (target " + payload.sla30d.targetSlaPercent + "%) | Mizan Nexus: " + payload.shariaMizan.mizanNexusStatus + " | " + payload.shariaMizan.advisoryBadge;
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
    document.getElementById("currency-usd-btn").addEventListener("click", () => {
      loadPricing("USD");
    });
    document.getElementById("currency-idr-btn").addEventListener("click", () => {
      loadPricing("IDR");
    });
    document.getElementById("checkout-intent-btn").addEventListener("click", () => {
      generateCheckoutIntent();
    });

    loadEcosystem();
    searchCorpus("");
    loadLivePanels();
    convertMTime("");
    loadPricing("USD");
    loadSlaMizanWidget();
  </script>
</body>
</html>`;
}
