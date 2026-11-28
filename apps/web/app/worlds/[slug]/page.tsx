import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "../../lib/locale";
import { WORLDS } from "../../world-data";
import { WorldDetailContent } from "../../world-detail-content";

export function generateStaticParams() {
  return WORLDS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const world = WORLDS.find((entry) => entry.slug === slug);
  return { title: world?.name ?? "World" };
}

export default async function WorldPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const world = WORLDS.find((entry) => entry.slug === slug);
  if (!world) notFound();
  return (
    <main
      id="main"
      data-accent={world.accent}
      className="page-shell content-page world-detail-page"
    >
      <WorldDetailContent world={world} locale={locale} />
    </main>
  );
}
