import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@moonwitness/ui/components/page-header";
import { getLocale } from "../lib/locale";
import { WORLDS } from "../world-data";
import { ExploreWorkbench } from "./explore-workbench";

export const metadata: Metadata = { title: "Explore the Empire" };

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [locale, params] = await Promise.all([getLocale(), searchParams]);
  const id = locale === "id";
  return (
    <main
      id="main"
      className="page-shell content-page destination-page explore-page"
    >
      <PageHeader
        className="content-page-header"
        title={
          id
            ? "Temukan Kaitan Tanpa Batas."
            : "Discover Connections Beyond Boundaries."
        }
        description={
          id
            ? "Cari pengetahuan, kisah, dunia, koleksi, dan sumber yang saling terhubung."
            : "Search knowledge, stories, worlds, collections and connected sources across the Empire."
        }
        headingLevel={1}
      />
      <div className="explore-route-mark" aria-hidden="true">
        <span>ONE QUERY</span>
        <i />
        <span>MANY PATHS</span>
      </div>
      <ExploreWorkbench locale={locale} initialQuery={params.q ?? ""} />
      <section
        className="explore-world-index"
        aria-labelledby="explore-world-title"
      >
        <div className="destination-section-heading">
          <p className="eyebrow">
            {id ? "TELUSURI BERDASARKAN DUNIA" : "BROWSE BY WORLD"}
          </p>
          <h2 id="explore-world-title">
            {id ? "Mulai dari satu gerbang." : "Start at a portal."}
          </h2>
        </div>
        <div className="explore-world-links">
          {WORLDS.map((world) => (
            <Link
              key={world.slug}
              href={`/worlds/${world.slug}`}
              data-accent={world.accent}
            >
              <span>{world.number}</span>
              <strong>{world.name}</strong>
              <small>{world.tagline[locale]}</small>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
