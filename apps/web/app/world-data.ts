import type { StaticImageData } from "next/image";
import type { Locale } from "./lib/locale";
import archiveArt from "@moonwitness/assets/illustrations/editorial-archive.webp";
import knowledgeArt from "@moonwitness/assets/illustrations/editorial-knowledge.webp";
import peopleArt from "@moonwitness/assets/illustrations/editorial-people.webp";
import rainArt from "@moonwitness/assets/illustrations/editorial-rain.webp";
import signalArt from "@moonwitness/assets/illustrations/editorial-signal.webp";
import storiesArt from "@moonwitness/assets/illustrations/editorial-stories.webp";
import rocksoulArt from "@moonwitness/assets/illustrations/rocksoul-universe/rocksoul/rocksoul-black-resolve-overdrive-cel.webp";
import sidraArt from "@moonwitness/assets/illustrations/moon-city-orbit.webp";
import crayonArt from "@moonwitness/assets/illustrations/ui-state-pack/state-desk-writing.webp";

export interface WorldCardData {
  slug: string;
  number: string;
  name: string;
  tagline: Record<Locale, string>;
  description: Record<Locale, string>;
  accent: "yellow" | "cyan" | "magenta" | "paper";
  art?: StaticImageData;
  artAlt: Record<Locale, string>;
}

export const WORLDS: readonly WorldCardData[] = [
  {
    slug: "moonwitness",
    number: "01",
    name: "MOONWITNESS",
    tagline: {
      en: "Stories · Knowledge · Archive",
      id: "Cerita · Ilmu · Arsip",
    },
    description: {
      en: "A living index for knowledge and recorded stories.",
      id: "Indeks hidup untuk pengetahuan dan kisah yang tercatat.",
    },
    accent: "magenta",
    art: storiesArt,
    artAlt: {
      en: "Illustrated archive of stories",
      id: "Ilustrasi arsip cerita",
    },
  },
  {
    slug: "arsy",
    number: "02",
    name: "ARSY",
    tagline: {
      en: "Radio · Technology · Infrastructure",
      id: "Radio · Teknologi · Infrastruktur",
    },
    description: {
      en: "Signals and systems that connect the wider ecosystem.",
      id: "Sinyal dan sistem yang menghubungkan ekosistem.",
    },
    accent: "cyan",
    art: signalArt,
    artAlt: {
      en: "Signal lines across a night scene",
      id: "Garis sinyal di suasana malam",
    },
  },
  {
    slug: "human-pen",
    number: "03",
    name: "HUMAN-PEN",
    tagline: {
      en: "Think · Write · Create · Share",
      id: "Pikir · Tulis · Cipta · Bagikan",
    },
    description: {
      en: "A space for thought, writing, and shared work.",
      id: "Ruang untuk berpikir, menulis, dan berbagi karya.",
    },
    accent: "yellow",
    art: knowledgeArt,
    artAlt: {
      en: "Editorial illustration about knowledge",
      id: "Ilustrasi editorial tentang pengetahuan",
    },
  },
  {
    slug: "sidra",
    number: "04",
    name: "SIDRA",
    tagline: {
      en: "Connect · Explore · Learn",
      id: "Terhubung · Jelajahi · Pelajari",
    },
    description: {
      en: "Follow connections across people, ideas, and time.",
      id: "Telusuri hubungan antara manusia, gagasan, dan waktu.",
    },
    accent: "cyan",
    art: sidraArt,
    artAlt: {
      en: "Moonlit orbital scene",
      id: "Adegan orbit di bawah cahaya bulan",
    },
  },
  {
    slug: "rocksoul-dx",
    number: "05",
    name: "ROCKSOUL DX",
    tagline: {
      en: "Play · Create · Dream",
      id: "Bermain · Berkarya · Bermimpi",
    },
    description: {
      en: "A creative world for play and self-expression.",
      id: "Dunia kreatif untuk bermain dan mengekspresikan diri.",
    },
    accent: "magenta",
    art: rocksoulArt,
    artAlt: {
      en: "RockSoul character in an overdrive pose",
      id: "Karakter RockSoul dalam pose overdrive",
    },
  },
  {
    slug: "crayon",
    number: "06",
    name: "CRAYON",
    tagline: {
      en: "Imagine · Draw · Inspire",
      id: "Bayangkan · Gambar · Inspirasikan",
    },
    description: {
      en: "A studio for visual ideas and careful creation.",
      id: "Studio untuk gagasan visual dan proses berkarya.",
    },
    accent: "yellow",
    art: crayonArt,
    artAlt: {
      en: "Illustration of a writing desk",
      id: "Ilustrasi meja untuk menulis",
    },
  },
  {
    slug: "sin-can",
    number: "07",
    name: "SIN CAN",
    tagline: { en: "Canon Explorer", id: "Penjelajah Kanon" },
    description: {
      en: "Browse primary texts with clear source context.",
      id: "Jelajahi teks primer dengan konteks sumber yang jelas.",
    },
    accent: "cyan",
    art: archiveArt,
    artAlt: { en: "Archive illustration", id: "Ilustrasi arsip" },
  },
  {
    slug: "mythos",
    number: "08",
    name: "MYTHOS",
    tagline: { en: "Canon Explorer", id: "Penjelajah Kanon" },
    description: {
      en: "Read historical context and chronology records.",
      id: "Baca konteks sejarah dan catatan kronologi.",
    },
    accent: "magenta",
    art: rainArt,
    artAlt: {
      en: "Rain over an illustrated city",
      id: "Hujan di atas ilustrasi kota",
    },
  },
  {
    slug: "angel-with-shotgun",
    number: "09",
    name: "ANGEL WITH SHOTGUN",
    tagline: {
      en: "Law · Justice · Society",
      id: "Hukum · Keadilan · Masyarakat",
    },
    description: {
      en: "A semantic domain for law, justice, and society.",
      id: "Domain semantik untuk hukum, keadilan, dan masyarakat.",
    },
    accent: "paper",
    art: peopleArt,
    artAlt: {
      en: "People in an editorial illustration",
      id: "Orang-orang dalam ilustrasi editorial",
    },
  },
];
