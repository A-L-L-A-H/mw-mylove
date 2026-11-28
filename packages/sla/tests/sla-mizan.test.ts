import { describe, expect, test } from "bun:test";
import {
  SlaTracker,
  THIRTY_DAYS_MS,
  buildSlaMizanWidgetPayload,
  renderSlaMizanWidgetHtml,
} from "../src/index.ts";

describe("SLA Mizan", () => {
  test("tracks 30-day availability and prunes old samples", () => {
    const tracker = new SlaTracker();
    const now = 1_700_000_000_000;
    const upstreams = [
      {
        id: "mw-nexus",
        url: "https://nexus",
        status: "online" as const,
        httpStatus: 200,
        reason: null,
      },
    ];
    tracker.record("ok", upstreams, now - THIRTY_DAYS_MS - 1);
    tracker.record("ok", upstreams, now);
    expect(tracker.getSummary(now).observedSampleCount).toBe(1);
    expect(tracker.getSummary(now).observedAvailabilityPercent).toBe(100);
  });

  test("builds payload and HTML", () => {
    const upstreams = [
      {
        id: "mw-nexus",
        url: "https://nexus",
        status: "online" as const,
        httpStatus: 200,
        reason: null,
      },
    ];
    const tracker = new SlaTracker();
    const summary = tracker.getSummary(1_700_000_000_000);
    const payload = buildSlaMizanWidgetPayload({
      statusPayload: {
        status: "ok",
        timestamp: "2023-11-14T22:13:20.000Z",
        upstreams,
      },
      sla30d: summary,
      advisoryBadge: "Advisory",
      compliance: ["CAN-0011"],
    });
    expect(payload.widget).toBe("sla-30d-sharia-mizan");
    expect(renderSlaMizanWidgetHtml(payload, { standalone: false })).toContain(
      "30d SLA",
    );
  });
});
