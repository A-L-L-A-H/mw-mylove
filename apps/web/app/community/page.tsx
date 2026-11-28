import type { Metadata } from "next";
import Link from "next/link";
import { ECOSYSTEM_REPOS } from "@mw/portal";
import { Card } from "@moonwitness/ui/components/card";
import { PageHeader } from "@moonwitness/ui/components/page-header";
import { getLocale } from "../lib/locale";
import { WORLDS } from "../world-data";

export const metadata: Metadata = { title: "Different People. Same Sky." };

export default async function CommunityPage() {
  const locale = await getLocale();
  const id = locale === "id";
  return (
    <main
      id="main"
      className="page-shell content-page destination-page community-page"
    >
      <PageHeader
        className="content-page-header"
        title={
          id
            ? "Orang Berbeda. Langit yang Sama."
            : "Different People. Same Sky."
        }
        description={
          id
            ? "Ruang bagi kontributor, kreator, peneliti, dan penjelajah untuk berbagi karya serta berkolaborasi."
            : "A place for contributors, creators, researchers and explorers to share their work and collaborate."
        }
        headingLevel={1}
      />
      <section className="community-invite">
        <div className="community-wall-copy">
          <p className="eyebrow">
            {id ? "KOMUNITAS EMPIRE" : "THE EMPIRE COMMUNITY"}
          </p>
          <h2>
            {id
              ? "Bawa karyamu ke ruang bersama."
              : "Bring your work into the shared space."}
          </h2>
          <p>
            {id
              ? "Repositori ekosistem menampung proyek dan perangkat yang dapat dijelajahi serta dikembangkan bersama."
              : "The ecosystem repositories hold projects and tools that people can explore and build on together."}
          </p>
        </div>
        <div className="community-world-scrawl" aria-hidden="true">
          SAME
          <br />
          MOON
          <br />
          <span>DIFFERENT STORIES</span>
        </div>
      </section>
      <section
        className="community-paths"
        aria-labelledby="community-paths-title"
      >
        <h2 id="community-paths-title">
          {id
            ? "Temukan ruang untuk berkontribusi"
            : "Find a place to contribute"}
        </h2>
        <div className="community-world-links">
          {WORLDS.slice(0, 5).map((world) => (
            <Link key={world.slug} href={`/worlds/${world.slug}`}>
              <span>{world.number}</span>
              {world.name}
              <i aria-hidden="true">↗</i>
            </Link>
          ))}
        </div>
      </section>
      <div className="content-grid">
        {ECOSYSTEM_REPOS.map((repo) => (
          <Card key={repo.id} className="content-panel repo-card" padding="md">
            <p className="eyebrow">
              {repo.category}
              {repo.port ? ` · :${repo.port}` : ""}
            </p>
            <h2>{repo.id}</h2>
            <p>{repo.summary}</p>
            <Link
              href={`https://github.com/${repo.repo}`}
              target="_blank"
              rel="noreferrer"
            >
              {id ? "Lihat repositori" : "View repository"}
            </Link>
          </Card>
        ))}
      </div>
    </main>
  );
}
