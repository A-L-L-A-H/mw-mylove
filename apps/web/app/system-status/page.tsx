import type { Metadata } from "next";
import { Badge } from "@moonwitness/ui/components/badge";
import { PageHeader } from "@moonwitness/ui/components/page-header";
import { Panel } from "@moonwitness/ui/components/panel";
import { dispatchPortalRequest } from "../lib/portal-handler";
import { getLocale } from "../lib/locale";

export const metadata: Metadata = { title: "System status" };
export const dynamic = "force-dynamic";

interface StatusPayload {
  status?: string;
  upstreams?: Array<{
    id: string;
    status: string;
    httpStatus: number | null;
    reason: string | null;
  }>;
}

export default async function SystemStatusPage() {
  const [locale, response] = await Promise.all([
    getLocale(),
    dispatchPortalRequest(new Request("http://localhost/status")),
  ]);
  const payload = (await response.json()) as StatusPayload;
  const indonesian = locale === "id";

  return (
    <main id="main" className="page-shell content-page">
      <PageHeader
        className="content-page-header"
        title={indonesian ? "Status Layanan" : "Service Status"}
        description={
          indonesian
            ? "Status ini berasal dari pemeriksaan upstream yang tercatat saat halaman dimuat."
            : "This status reflects upstream probes recorded when the page was rendered."
        }
        headingLevel={1}
        actions={
          <Badge variant={payload.status === "ok" ? "default" : "destructive"}>
            {payload.status ?? "unknown"}
          </Badge>
        }
      />
      <Panel
        title={indonesian ? "Upstream" : "Upstreams"}
        surface="ink"
        frame="scuffed"
        className="content-panel"
      >
        {payload.upstreams?.length ? (
          <ul className="status-list">
            {payload.upstreams.map((upstream) => (
              <li key={upstream.id}>
                <span>
                  {upstream.id}
                  {upstream.httpStatus ? ` · HTTP ${upstream.httpStatus}` : ""}
                </span>
                <span className="status-state" data-state={upstream.status}>
                  {upstream.status}
                </span>
                {upstream.reason ? <span>{upstream.reason}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p>
            {indonesian
              ? "Tidak ada data upstream."
              : "No upstream data is available."}
          </p>
        )}
      </Panel>
    </main>
  );
}
