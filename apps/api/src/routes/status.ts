import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { COMPLIANCE_STANDARDS, NON_NORMATIVE_ADVISORY_BADGE } from "@mw/portal";
import {
  SlaTracker,
  buildSlaMizanWidgetPayload,
  renderSlaMizanWidgetHtml,
} from "@mw/sla";
import { buildStatusResponsePayload } from "@mw/storefront";
import type { ApiConfig } from "../config";
import { getUpstreamTargets } from "../upstream/targets";
import {
  makeUrl,
  requestAffinity,
  sendHtml,
  sendJson,
  type ProbeFn,
} from "./shared";

export function registerStatusRoutes(
  app: FastifyInstance,
  config: ApiConfig,
  probe: ProbeFn,
): void {
  const slaTracker = new SlaTracker();

  app.get("/status", async (request, reply) => {
    const payload = await buildStatusResponsePayload(
      getUpstreamTargets(config),
      probe,
    );
    slaTracker.record(payload.status, payload.upstreams);
    const affiliate = requestAffinity(request, makeUrl(request, config));
    return sendJson(reply, payload, affiliate.attribution.ref);
  });

  const handleWidget = async (
    request: FastifyRequest,
    reply: FastifyReply,
    html: boolean,
  ) => {
    const statusPayload = await buildStatusResponsePayload(
      getUpstreamTargets(config),
      probe,
    );
    slaTracker.record(statusPayload.status, statusPayload.upstreams);
    const widget = buildSlaMizanWidgetPayload({
      statusPayload,
      sla30d: slaTracker.getSummary(),
      advisoryBadge: NON_NORMATIVE_ADVISORY_BADGE,
      compliance: COMPLIANCE_STANDARDS,
    });
    const affiliate = requestAffinity(request, makeUrl(request, config));
    if (html) {
      return sendHtml(
        reply,
        renderSlaMizanWidgetHtml(widget),
        affiliate.attribution.ref,
      );
    }
    return sendJson(
      reply,
      { ...widget, attribution: affiliate.attribution },
      affiliate.attribution.ref,
    );
  };

  app.get("/api/status/widget", async (request, reply) => {
    const html = makeUrl(request, config).searchParams.get("format") === "html";
    return handleWidget(request, reply, html);
  });

  app.get("/widgets/sla-mizan", async (request, reply) =>
    handleWidget(request, reply, true),
  );
}
