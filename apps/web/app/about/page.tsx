import type { Metadata } from "next";
import {
  COMPLIANCE_STANDARDS,
  EPISTEMIC_LAYERS,
  NON_NORMATIVE_ADVISORY_BADGE,
} from "@mw/portal";
import { PageHeader } from "@moonwitness/ui/components/page-header";
import { Panel } from "@moonwitness/ui/components/panel";
import { getLocale } from "../lib/locale";
import Link from "next/link";
import { WORLDS } from "../world-data";

export const metadata: Metadata = { title: "A Universe With a Purpose" };

export default async function AboutPage() {
  const locale = await getLocale();
  const id = locale === "id";
  return (
    <main
      id="main"
      className="page-shell content-page destination-page about-page"
    >
      <PageHeader
        className="content-page-header"
        title={id ? "Semesta dengan Tujuan." : "A Universe With a Purpose."}
        description={
          id
            ? "A-L-L-A-H.COM menghubungkan pengetahuan, kisah, teknologi, imajinasi, kreasi, eksplorasi, dan pengalaman manusia."
            : "A-L-L-A-H.COM connects knowledge, stories, technology, imagination, creation, exploration and human experience."
        }
        headingLevel={1}
      />
      <section className="about-manifesto">
        <p className="eyebrow">{id ? "EMPIRE OF LIGHT" : "EMPIRE OF LIGHT"}</p>
        <h2>
          {id
            ? "Sembilan dunia. Satu semesta yang saling terhubung."
            : "Nine worlds. One connected universe."}
        </h2>
        <p>
          {id
            ? "Setiap dunia membawa cara pandang dan cara berkarya yang berbeda. Bersama-sama, semuanya membentuk ruang untuk belajar, membuat, dan memahami."
            : "Each world brings a different way to discover and create. Together, they make room to learn, make and understand."}
        </p>
        <nav
          className="about-world-ribbon"
          aria-label={id ? "Sembilan dunia" : "Nine worlds"}
        >
          {WORLDS.map((world) => (
            <Link href={`/worlds/${world.slug}`} key={world.slug}>
              {world.number} {world.name}
            </Link>
          ))}
        </nav>
      </section>
      <div className="about-layout">
        <Panel
          title={id ? "Pemisahan epistemik" : "Epistemic separation"}
          surface="ink"
          frame="scuffed"
          className="content-panel"
        >
          <p>
            {id
              ? "Delapan lapisan mengelompokkan materi berdasarkan jenis sumber dan kewenangannya."
              : "Eight layers group material by source type and authority."}
          </p>
          <ol className="epistemic-list">
            {EPISTEMIC_LAYERS.map((layer) => (
              <li key={layer.code}>
                <strong>
                  {layer.code} · {layer.title}
                </strong>
                <span>{layer.description}</span>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel
          title={id ? "Standar" : "Standards"}
          surface="ink"
          frame="scuffed"
          className="content-panel"
        >
          <p className="compliance-codes">{COMPLIANCE_STANDARDS.join(" · ")}</p>
          <p>{NON_NORMATIVE_ADVISORY_BADGE}</p>
          <p>
            {id
              ? "Hasil analisis komputasional bersifat non-normatif dan memerlukan verifikasi manusia."
              : "Computational analysis is non-normative and requires human verification."}
          </p>
        </Panel>
      </div>
    </main>
  );
}
