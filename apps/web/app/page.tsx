import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@moonwitness/ui/components/button";
import { ArrowRightIcon } from "@moonwitness/ui/icons/arrow-right";
import { GlobeIcon } from "@moonwitness/ui/icons/globe";
import { SparkleIcon } from "@moonwitness/ui/icons/sparkle";
import { UsersIcon } from "@moonwitness/ui/icons/users";
import homeHeroDesktop from "@moonwitness/assets/illustrations/home-hero-desktop.webp";
import homeHeroMobile from "@moonwitness/assets/illustrations/home-hero-mobile.webp";
import { buildSchemaOrgJsonLd, serializeJsonLdSafe } from "@mw/seo";
import { DEFAULT_USD_TO_IDR_RATE, PRICING_TIERS } from "@mw/storefront";
import { COMPLIANCE_STANDARDS } from "@mw/portal";
import { getLocale } from "./lib/locale";
import { WORLDS } from "./world-data";
import { WorldCard } from "./world-card";

export const metadata: Metadata = {
  title: "A-L-L-A-H.COM | Empire of Light",
  description:
    "A universe of knowledge, stories, and creation. Explore the nine worlds of A-L-L-A-H.COM.",
};

export default async function HomePage() {
  const locale = await getLocale();
  const id = locale === "id";
  const schemaOrg = buildSchemaOrgJsonLd({
    origin: process.env.MW_PUBLIC_ORIGIN ?? "https://a-l-l-a-h.com",
    tiers: PRICING_TIERS,
    fxRateIdrPerUsd: DEFAULT_USD_TO_IDR_RATE,
    compliance: COMPLIANCE_STANDARDS,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLdSafe(schemaOrg) }}
      />
      <main id="main" className="front-poster">
        <section className="front-scene" aria-labelledby="front-title">
          <div className="front-art" aria-hidden="true">
            <picture>
              <source media="(max-width: 820px)" srcSet={homeHeroMobile.src} />
              <Image src={homeHeroDesktop} alt="" fill priority sizes="100vw" />
            </picture>
          </div>

          <aside
            className="front-index-rail"
            aria-label={id ? "Bidang ekosistem" : "Ecosystem fields"}
          >
            {(id
              ? [
                  "PENGETAHUAN",
                  "KISAH",
                  "KREASI",
                  "RISET",
                  "PROYEK",
                  "PERANGKAT",
                ]
              : [
                  "KNOWLEDGE",
                  "STORIES",
                  "CREATION",
                  "RESEARCH",
                  "PROJECTS",
                  "TOOLS",
                ]
            ).map((item, index) => (
              <span key={item}>
                <i aria-hidden="true">{index < 3 ? "☑" : "□"}</i>
                {item}
              </span>
            ))}
            <small>CONNECT · EXPLORE · DREAM</small>
          </aside>

          <div className="front-brand-lockup">
            <span className="front-crown" aria-hidden="true">
              ♛
            </span>
            <h1 id="front-title" className="front-title">
              A-L-L-A-H<span>.COM</span>
            </h1>
            <p className="front-slogan">
              {id ? "KEKAISARAN CAHAYA" : "EMPIRE OF LIGHT"}
            </p>
            <p className="front-tagline">
              {id ? (
                <>
                  SEMESTA PENGETAHUAN,
                  <br />
                  PERJALANAN IMAN
                </>
              ) : (
                <>
                  A UNIVERSE OF KNOWLEDGE,
                  <br />A JOURNEY OF FAITH
                </>
              )}
            </p>
            <span className="front-pink-stroke" aria-hidden="true" />
          </div>

          <blockquote className="front-quote">
            {id
              ? "Pada akhirnya, kita semua adalah saksi."
              : "In the end, we are all witnesses."}
            <span>{id ? "MOONWITNESS" : "MOONWITNESS"}</span>
          </blockquote>

          <Link
            href="/explore"
            className="front-action-list"
            aria-label={id ? "Jelajahi ekosistem" : "Explore the ecosystem"}
          >
            <span>☑ {id ? "JELAJAHI" : "EXPLORE"}</span>
            <span>☑ {id ? "PELAJARI" : "LEARN"}</span>
            <span>☑ {id ? "KREASIKAN" : "CREATE"}</span>
            <span>☑ {id ? "BAGIKAN" : "SHARE"}</span>
            <span>☑ {id ? "BANGUN" : "BUILD"}</span>
          </Link>

          <section
            id="worlds"
            className="front-worlds"
            aria-labelledby="worlds-title"
          >
            <div className="front-worlds-heading">
              <h2 id="worlds-title">
                {id ? "SEMBILAN DUNIA" : "THE NINE WORLDS"}
              </h2>
              <ArrowRightIcon aria-hidden="true" size={29} />
            </div>
            <div className="front-world-strip">
              {WORLDS.map((world) => (
                <WorldCard key={world.slug} world={world} locale={locale} />
              ))}
              <Link href="/community" className="front-join-card">
                <UsersIcon aria-hidden="true" size={42} />
                <strong>{id ? "GABUNG KE EMPIRE" : "JOIN THE EMPIRE"}</strong>
                <span>
                  {id
                    ? "Bersama membangun dunia yang lebih cerah."
                    : "Together we build a brighter world."}
                </span>
                <ArrowRightIcon aria-hidden="true" size={28} />
              </Link>
            </div>
          </section>

          <div
            className="front-bottom-values"
            aria-label={id ? "Nilai ekosistem" : "Ecosystem values"}
          >
            <div>
              <span className="value-symbol">∞</span>
              <span>{id ? "ILMU TAK TERBATAS" : "INFINITE KNOWLEDGE"}</span>
            </div>
            <div>
              <GlobeIcon aria-hidden="true" size={30} />
              <span>{id ? "HIKMAH LINTAS MASA" : "TIMELESS WISDOM"}</span>
            </div>
            <div>
              <SparkleIcon aria-hidden="true" size={29} />
              <span>{id ? "SATU KEMANUSIAAN" : "ONE HUMANITY"}</span>
            </div>
            <div>
              <span className="value-symbol" aria-hidden="true">
                ▱
              </span>
              <span>{id ? "KREASI MULTISEMESTA" : "MULTIVERSE CREATION"}</span>
            </div>
          </div>

          <div className="front-closer">
            <p>
              {id ? "JELAJAHI TANPA BATAS" : "EXPLORE THE LIMITLESS"}
              <span>WITH A-L-L-A-H</span>
            </p>
          </div>

          <div className="front-enter">
            <Button asChild variant="default">
              <Link href="/worlds">
                {id ? "MASUK KE SEMBILAN DUNIA" : "ENTER THE NINE WORLDS"}
                <ArrowRightIcon aria-hidden="true" size={23} />
              </Link>
            </Button>
          </div>

          <div className="front-signoff">
            <span className="front-signoff-crown" aria-hidden="true">
              ♛
            </span>
            <span>
              A-L-L-A-H.COM <i /> Empire of Light
            </span>
          </div>
        </section>
        <section
          className="front-discovery-strip"
          aria-labelledby="front-discovery-title"
        >
          <div className="front-discovery-heading">
            <p className="eyebrow">{id ? "JALUR PILIHAN" : "SELECTED PATHS"}</p>
            <h2 id="front-discovery-title">
              {id
                ? "Satu jejak membuka jalan berikutnya."
                : "One trace opens the next path."}
            </h2>
          </div>
          <div className="front-discovery-links">
            {[
              {
                slug: "moonwitness",
                title: id ? "Kisah dan kesaksian" : "Stories and witness",
                text: WORLDS[0].description[locale],
              },
              {
                slug: "sidra",
                title: id ? "Jaringan pengetahuan" : "Connected knowledge",
                text: WORLDS[3].description[locale],
              },
              {
                slug: "rocksoul-dx",
                title: id ? "Meja eksperimen" : "The workbench",
                text: WORLDS[4].description[locale],
              },
            ].map((item, index) => (
              <Link
                key={item.slug}
                href={`/worlds/${item.slug}`}
                className="front-discovery-link"
                data-index={`0${index + 1}`}
              >
                <span>{item.title}</span>
                <p>{item.text}</p>
                <ArrowRightIcon aria-hidden="true" size={20} />
              </Link>
            ))}
          </div>
          <Link href="/community" className="front-community-invite">
            <span>
              {id ? "BERGABUNG DENGAN KOMUNITAS" : "JOIN THE COMMUNITY"}
            </span>
            <strong>
              {id
                ? "Bersama membangun dunia yang lebih cerah."
                : "Together we build a brighter world."}
            </strong>
            <ArrowRightIcon aria-hidden="true" size={22} />
          </Link>
          <div className="front-discovery-signoff">
            <span aria-hidden="true">♛</span>A-L-L-A-H.COM <i /> Empire of Light
          </div>
        </section>
      </main>
    </>
  );
}
