import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon } from "@moonwitness/ui/icons/arrow-right";
import { PageHeader } from "@moonwitness/ui/components/page-header";
import { getLocale } from "../lib/locale";
import { WORLDS } from "../world-data";

export const metadata: Metadata = {
  title: "Nine Worlds. One Connected Universe.",
};

export default async function WorldsPage() {
  const locale = await getLocale();
  const id = locale === "id";
  return (
    <main id="main" className="page-shell content-page worlds-atlas">
      <PageHeader
        className="content-page-header"
        title={
          id
            ? "Sembilan Dunia. Satu Semesta yang Terhubung."
            : "Nine Worlds. One Connected Universe."
        }
        description={
          id
            ? "Sembilan dunia, sembilan cara menjelajah. Pilih satu gerbang, lalu lihat bagaimana ia terhubung dengan yang lain."
            : "Nine worlds, nine ways in. Choose a portal and follow its connections through the Empire."
        }
        headingLevel={1}
      />
      <section
        className="atlas-route"
        aria-label={
          id ? "Peta hubungan sembilan dunia" : "Nine worlds connection map"
        }
      >
        <div className="atlas-spine" aria-hidden="true">
          <span>EMPIRE OF LIGHT</span>
        </div>
        <svg
          className="atlas-connections"
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M160 92 C330 180 330 220 160 292 S330 420 160 508" />
          <path d="M500 92 C670 180 670 220 500 292 S670 420 500 508" />
          <path d="M840 92 C670 180 670 220 840 292 S670 420 840 508" />
          <path d="M160 292 C330 270 410 270 500 292 M500 292 C620 315 735 315 840 292" />
        </svg>
        <div className="atlas-portals">
          {WORLDS.map((world, index) => (
            <Link
              key={world.slug}
              className="atlas-portal"
              data-accent={world.accent}
              href={`/worlds/${world.slug}`}
            >
              <span className="atlas-portal-art">
                {world.art ? (
                  <Image
                    src={world.art}
                    alt=""
                    fill
                    sizes="(max-width: 720px) 80vw, 28vw"
                  />
                ) : null}
                <span className="atlas-portal-index">{world.number}</span>
              </span>
              <span className="atlas-portal-copy">
                <span>{id ? `JALUR ${index + 1}` : `PATH ${index + 1}`}</span>
                <strong>{world.name}</strong>
                <small>{world.tagline[locale]}</small>
                <ArrowRightIcon size={21} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section
        className="atlas-spotlight"
        aria-labelledby="atlas-spotlight-title"
      >
        <p className="eyebrow">
          {id ? "JALUR YANG TERHUBUNG" : "CONNECTED PATHS"}
        </p>
        <h2 id="atlas-spotlight-title">
          {id
            ? "Satu dunia bisa membuka dunia lain."
            : "One world can lead into another."}
        </h2>
        <p>
          {id
            ? "Mulai dari kisah, sinyal, tulisan, atau pengetahuan. Setiap portal membawa fokusnya sendiri."
            : "Start with a story, a signal, a page, or a question. Each portal keeps its own point of view."}
        </p>
        <Link href="/explore" className="atlas-spotlight-link">
          {id ? "Telusuri lintas dunia" : "Browse across worlds"}
          <ArrowRightIcon size={19} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
