import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@moonwitness/ui/components/page-header";
import { Panel } from "@moonwitness/ui/components/panel";
import { BookOpenIcon } from "@moonwitness/ui/icons/book-open";
import { ArrowRightIcon } from "@moonwitness/ui/icons/arrow-right";
import { getLocale } from "../lib/locale";

export const metadata: Metadata = { title: "The Living Knowledge Base" };

export default async function DocsPage() {
  const locale = await getLocale();
  const id = locale === "id";
  return (
    <main
      id="main"
      className="page-shell content-page destination-page docs-page"
    >
      <PageHeader
        className="content-page-header"
        title={
          id
            ? "Pusat Pengetahuan yang Terus Hidup."
            : "The Living Knowledge Base."
        }
        description={
          id
            ? "Pusat referensi untuk arsitektur, proyek, sistem, dan dokumentasi ekosistem yang terus berkembang."
            : "A reference center for the ecosystem's architecture, projects, systems and evolving documentation."
        }
        headingLevel={1}
      />
      <section className="docs-archive-layout">
        <Panel
          title={id ? "Indeks dokumentasi" : "Documentation index"}
          surface="ink"
          frame="scuffed"
          className="content-panel docs-index-panel"
        >
          <ol className="docs-index-list">
            {(id
              ? [
                  "Panduan",
                  "Arsitektur sistem",
                  "Referensi proyek",
                  "Dokumen kanonis",
                  "Pembaruan",
                ]
              : [
                  "Guides",
                  "System architecture",
                  "Project references",
                  "Canonical documents",
                  "Updates and changelog",
                ]
            ).map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
                <BookOpenIcon aria-hidden="true" size={17} />
              </li>
            ))}
          </ol>
        </Panel>
        <aside className="docs-margin-note">
          <span className="docs-stamp" aria-hidden="true">
            MW
            <br />
            DOCS
          </span>
          <p>
            {id
              ? "Dokumentasi harus dapat ditelusuri ke sumber dan konteksnya."
              : "Keep each guide traceable to its source and context."}
          </p>
          <Link
            href="https://github.com/A-L-L-A-H/mw-docs"
            target="_blank"
            rel="noreferrer"
            className="docs-repo-link"
          >
            {id ? "Buka repositori mw-docs" : "Open the mw-docs repository"}
            <ArrowRightIcon aria-hidden="true" size={19} />
          </Link>
        </aside>
      </section>
    </main>
  );
}
