import type { UpstreamHealthStatus } from "./storefront.ts";

export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_OBSERVED_SAMPLES = 10_000;

export interface SlaObservationSample {
  readonly timestampMs: number;
  readonly timestamp: string;
  readonly status: "ok" | "degraded";
  readonly onlineCount: number;
  readonly totalCount: number;
  readonly upstreamStatuses: Record<string, "online" | "offline">;
}

export interface UpstreamSlaAvailability {
  readonly observedSamples: number;
  readonly onlineSamples: number;
  readonly availabilityPercent: number | null;
}

export interface Sla30dSummary {
  readonly windowDays: 30;
  readonly windowStartIso: string;
  readonly windowEndIso: string;
  readonly targetSlaPercent: number;
  readonly observedSampleCount: number;
  readonly healthySampleCount: number;
  readonly degradedSampleCount: number;
  readonly observedAvailabilityPercent: number | null;
  readonly upstreamAvailability: Record<string, UpstreamSlaAvailability>;
}

export class SlaTracker {
  private readonly samples: SlaObservationSample[] = [];

  private prune(nowMs: number): void {
    const cutoff = nowMs - THIRTY_DAYS_MS;
    while (this.samples.length > 0 && this.samples[0]!.timestampMs < cutoff) {
      this.samples.shift();
    }
    while (this.samples.length > MAX_OBSERVED_SAMPLES) {
      this.samples.shift();
    }
  }

  record(
    status: "ok" | "degraded",
    upstreams: readonly UpstreamHealthStatus[],
    nowMs = Date.now(),
  ): SlaObservationSample {
    const upstreamStatuses: Record<string, "online" | "offline"> = {};
    let onlineCount = 0;
    for (const upstream of upstreams) {
      upstreamStatuses[upstream.id] = upstream.status;
      if (upstream.status === "online") {
        onlineCount += 1;
      }
    }
    const sample: SlaObservationSample = {
      timestampMs: nowMs,
      timestamp: new Date(nowMs).toISOString(),
      status,
      onlineCount,
      totalCount: upstreams.length,
      upstreamStatuses,
    };
    this.samples.push(sample);
    this.prune(nowMs);
    return sample;
  }

  getSummary(nowMs = Date.now()): Sla30dSummary {
    this.prune(nowMs);
    const windowEndIso = new Date(nowMs).toISOString();
    const windowStartIso = new Date(nowMs - THIRTY_DAYS_MS).toISOString();
    const observedSampleCount = this.samples.length;
    let healthySampleCount = 0;
    let degradedSampleCount = 0;

    const perUpstream = new Map<string, { observedSamples: number; onlineSamples: number }>();

    for (const sample of this.samples) {
      if (sample.status === "ok") {
        healthySampleCount += 1;
      } else {
        degradedSampleCount += 1;
      }
      for (const [id, state] of Object.entries(sample.upstreamStatuses)) {
        const current = perUpstream.get(id) ?? { observedSamples: 0, onlineSamples: 0 };
        current.observedSamples += 1;
        if (state === "online") {
          current.onlineSamples += 1;
        }
        perUpstream.set(id, current);
      }
    }

    const observedAvailabilityPercent =
      observedSampleCount > 0
        ? Number(((healthySampleCount / observedSampleCount) * 100).toFixed(2))
        : null;

    const upstreamAvailability: Record<string, UpstreamSlaAvailability> = {};
    for (const [id, stats] of perUpstream.entries()) {
      upstreamAvailability[id] = {
        observedSamples: stats.observedSamples,
        onlineSamples: stats.onlineSamples,
        availabilityPercent:
          stats.observedSamples > 0
            ? Number(((stats.onlineSamples / stats.observedSamples) * 100).toFixed(2))
            : null,
      };
    }

    return {
      windowDays: 30,
      windowStartIso,
      windowEndIso,
      targetSlaPercent: 99.9,
      observedSampleCount,
      healthySampleCount,
      degradedSampleCount,
      observedAvailabilityPercent,
      upstreamAvailability,
    };
  }
}

export interface ShariaMizanTransparency {
  readonly advisoryBadge: string;
  readonly standards: readonly string[];
  readonly epistemicSeparation: {
    readonly enforced: true;
    readonly layerCount: 8;
    readonly primaryTextLayer: "L1";
    readonly advisoryLayer: "L8";
  };
  readonly financialPrinciples: {
    readonly ribaFree: true;
    readonly ghararFree: true;
    readonly maysirFree: true;
    readonly latePenaltyIdr: 0;
    readonly akadModel: "Ujrah / Ijarah";
  };
  readonly iconographyGuard: "CAN-0011 typographic/geometric celestial only";
  readonly zeroFakeData: true;
  readonly mizanNexusStatus: "online" | "offline";
  readonly corpusStatus: "online" | "offline";
}

export interface SlaMizanWidgetPayload {
  readonly service: "mw-mylove";
  readonly domain: "a-l-l-a-h.com";
  readonly widget: "sla-30d-sharia-mizan";
  readonly status: "ok" | "degraded";
  readonly timestamp: string;
  readonly sla30d: Sla30dSummary;
  readonly shariaMizan: ShariaMizanTransparency;
  readonly upstreams: readonly UpstreamHealthStatus[];
}

export function buildSlaMizanWidgetPayload(options: {
  statusPayload: {
    readonly status: "ok" | "degraded";
    readonly timestamp: string;
    readonly upstreams: readonly UpstreamHealthStatus[];
  };
  sla30d: Sla30dSummary;
  advisoryBadge: string;
  compliance: readonly string[];
}): SlaMizanWidgetPayload {
  const nexusUpstream = options.statusPayload.upstreams.find((entry) => entry.id === "mw-nexus");
  const corpusUpstream = options.statusPayload.upstreams.find((entry) => entry.id === "mw-corpus");

  return {
    service: "mw-mylove",
    domain: "a-l-l-a-h.com",
    widget: "sla-30d-sharia-mizan",
    status: options.statusPayload.status,
    timestamp: options.statusPayload.timestamp,
    sla30d: options.sla30d,
    shariaMizan: {
      advisoryBadge: options.advisoryBadge,
      standards: options.compliance,
      epistemicSeparation: {
        enforced: true,
        layerCount: 8,
        primaryTextLayer: "L1",
        advisoryLayer: "L8",
      },
      financialPrinciples: {
        ribaFree: true,
        ghararFree: true,
        maysirFree: true,
        latePenaltyIdr: 0,
        akadModel: "Ujrah / Ijarah",
      },
      iconographyGuard: "CAN-0011 typographic/geometric celestial only",
      zeroFakeData: true,
      mizanNexusStatus: nexusUpstream?.status ?? "offline",
      corpusStatus: corpusUpstream?.status ?? "offline",
    },
    upstreams: options.statusPayload.upstreams,
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderSlaMizanWidgetHtml(
  payload: SlaMizanWidgetPayload,
  options: { standalone?: boolean } = {},
): string {
  const availabilityLabel =
    payload.sla30d.observedAvailabilityPercent === null
      ? "Unobserved (0 probes)"
      : `${payload.sla30d.observedAvailabilityPercent.toFixed(2)}%`;

  const upstreamRows = payload.upstreams
    .map((entry) => {
      const avail = payload.sla30d.upstreamAvailability[entry.id];
      const availText =
        avail && avail.availabilityPercent !== null
          ? `${avail.availabilityPercent.toFixed(2)}% (${avail.onlineSamples}/${avail.observedSamples})`
          : "n/a";
      const badgeClass = entry.status === "online" ? "mw-badge-ok" : "mw-badge-warn";
      return `<li>
        <span>${escapeHtml(entry.id)}</span>
        <span class="${badgeClass}">${escapeHtml(entry.status.toUpperCase())}</span>
        <span>30d: ${escapeHtml(availText)}</span>
      </li>`;
    })
    .join("");

  const cardBody = `<section class="mw-sla-mizan-widget" data-widget="sla-30d-sharia-mizan">
  <header class="mw-widget-head">
    <h2>30d SLA &amp; Sharia Mizan Transparency</h2>
    <span class="${payload.status === "ok" ? "mw-badge-ok" : "mw-badge-warn"}">${escapeHtml(payload.status.toUpperCase())}</span>
  </header>
  <p class="mw-advisory">${escapeHtml(payload.shariaMizan.advisoryBadge)}</p>
  <div class="mw-metrics">
    <div><strong>30d Observed Availability:</strong> ${escapeHtml(availabilityLabel)}</div>
    <div><strong>SLA Target:</strong> ${payload.sla30d.targetSlaPercent}%</div>
    <div><strong>Observed Probes (30d):</strong> ${payload.sla30d.observedSampleCount} (${payload.sla30d.healthySampleCount} ok / ${payload.sla30d.degradedSampleCount} degraded)</div>
    <div><strong>Sharia Mizan Financial Guard:</strong> Riba-Free · Gharar-Free · Maysir-Free · Zero Late Penalty (${escapeHtml(payload.shariaMizan.financialPrinciples.akadModel)})</div>
    <div><strong>Standards:</strong> ${escapeHtml(payload.shariaMizan.standards.join(" · "))}</div>
  </div>
  <ul class="mw-upstream-list">${upstreamRows}</ul>
</section>`;

  if (options.standalone === false) {
    return cardBody;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>30d SLA &amp; Sharia Mizan Transparency — A-L-L-A-H.COM</title>
  <style>
    body { margin: 0; padding: 1rem; background: #06090c; color: #eef2f5; font-family: system-ui, sans-serif; }
    .mw-sla-mizan-widget { max-width: 760px; margin: 0 auto; padding: 1.25rem; border-radius: 12px; background: #0c1318; border: 1px solid rgba(212, 175, 55, 0.34); }
    .mw-widget-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .mw-widget-head h2 { margin: 0; font-size: 1.05rem; color: #d4af37; text-transform: uppercase; letter-spacing: 0.06em; }
    .mw-advisory { font-size: 0.8rem; color: #fde68a; background: rgba(245, 158, 11, 0.14); border: 1px solid #f59e0b; border-radius: 6px; padding: 0.4rem 0.65rem; margin-bottom: 0.9rem; }
    .mw-metrics { display: grid; gap: 0.45rem; font-size: 0.88rem; color: #cbd5e1; margin-bottom: 0.9rem; }
    .mw-upstream-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.4rem; }
    .mw-upstream-list li { display: flex; justify-content: space-between; gap: 0.75rem; padding: 0.45rem 0.65rem; border-radius: 6px; background: #111b22; font-size: 0.84rem; }
    .mw-badge-ok { color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); padding: 0.1rem 0.45rem; border-radius: 999px; font-size: 0.75rem; }
    .mw-badge-warn { color: #fde68a; border: 1px solid rgba(245, 158, 11, 0.5); padding: 0.1rem 0.45rem; border-radius: 999px; font-size: 0.75rem; }
  </style>
</head>
<body>${cardBody}</body>
</html>`;
}
