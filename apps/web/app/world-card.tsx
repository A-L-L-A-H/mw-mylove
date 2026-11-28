import Image from "next/image";
import Link from "next/link";
import { Card } from "@moonwitness/ui/components/card";
import type { Locale } from "./lib/locale";
import type { WorldCardData } from "./world-data";

export function WorldCard({
  world,
  locale,
}: {
  world: WorldCardData;
  locale: Locale;
}) {
  return (
    <Link
      className="world-link"
      href={`/worlds/${world.slug}`}
      aria-label={`${world.name}: ${world.tagline[locale]}`}
    >
      <Card className="world-card" data-accent={world.accent}>
        <span className="world-card-art">
          <span className="world-number">{world.number}</span>
          {world.art ? (
            <Image
              src={world.art}
              alt={world.artAlt[locale]}
              fill
              sizes="(max-width: 480px) 38vw, 12vw"
            />
          ) : null}
        </span>
        <span className="world-card-copy">
          <strong>{world.name}</strong>
          <span>{world.tagline[locale]}</span>
        </span>
      </Card>
    </Link>
  );
}
