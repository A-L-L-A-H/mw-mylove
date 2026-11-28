import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@moonwitness/ui/icons/arrow-right";
import type { Locale } from "./lib/locale";
import type { WorldCardData } from "./world-data";
import { WORLDS } from "./world-data";

type EditorialItem = { title: string; detail: string };
type WorldStory = {
  title: Record<Locale, string>;
  intro: Record<Locale, string>;
  layout: string;
  items: Record<Locale, EditorialItem[]>;
};

const STORIES: Record<string, WorldStory> = {
  moonwitness: {
    title: { en: "Stories. Knowledge. Archive.", id: "Cerita. Ilmu. Arsip." },
    intro: {
      en: "Every human experience leaves a trace. MoonWitness gathers stories, observations and fragments into a living human archive.",
      id: "Setiap pengalaman manusia meninggalkan jejak. MoonWitness mengumpulkan cerita, pengamatan, dan fragmen ke dalam arsip manusia yang hidup.",
    },
    layout: "documentary",
    items: {
      en: [
        {
          title: "Featured human stories",
          detail:
            "First-person experiences, told in the words of the people who lived them.",
        },
        {
          title: "Witness records",
          detail:
            "Observations and fragments held with their source and context.",
        },
        {
          title: "Story collections",
          detail:
            "Find a path through stories grouped by shared questions and themes.",
        },
        {
          title: "Knowledge explorer",
          detail: "Move from a story to the knowledge connected to it.",
        },
        {
          title: "Archive timeline",
          detail: "Read records in the order they were added to the archive.",
        },
        {
          title: "Community contributions",
          detail:
            "A place for people to add their experience to the shared record.",
        },
      ],
      id: [
        {
          title: "Kisah manusia pilihan",
          detail:
            "Pengalaman orang pertama, diceritakan dengan kata-kata mereka sendiri.",
        },
        {
          title: "Catatan saksi",
          detail:
            "Pengamatan dan fragmen yang disimpan bersama sumber dan konteksnya.",
        },
        {
          title: "Koleksi cerita",
          detail:
            "Telusuri cerita yang dikelompokkan menurut pertanyaan dan tema.",
        },
        {
          title: "Penjelajah pengetahuan",
          detail:
            "Beranjak dari sebuah kisah menuju pengetahuan yang terhubung dengannya.",
        },
        {
          title: "Garis waktu arsip",
          detail: "Baca catatan menurut urutan penambahannya ke arsip.",
        },
        {
          title: "Kontribusi komunitas",
          detail:
            "Ruang bagi siapa pun untuk menambahkan pengalaman ke catatan bersama.",
        },
      ],
    },
  },
  arsy: {
    title: {
      en: "Radio. Technology. Infrastructure.",
      id: "Radio. Teknologi. Infrastruktur.",
    },
    intro: {
      en: "ARSY traces the signals, systems and infrastructure that connect distant places across the Empire.",
      id: "ARSY menelusuri sinyal, sistem, dan infrastruktur yang menghubungkan tempat-tempat berjauhan di seluruh Empire.",
    },
    layout: "signal",
    items: {
      en: [
        {
          title: "Radio and broadcast",
          detail: "Follow how a message travels from a source to a listener.",
        },
        {
          title: "Technology explorations",
          detail: "Notes on the tools and systems behind connected services.",
        },
        {
          title: "Network infrastructure",
          detail:
            "Maps and diagrams for the paths that keep services connected.",
        },
        {
          title: "Signal monitoring",
          detail: "A place to inspect the health and movement of a signal.",
        },
        {
          title: "Technical knowledge",
          detail:
            "Reference material for the systems that make connection possible.",
        },
      ],
      id: [
        {
          title: "Radio dan siaran",
          detail: "Ikuti perjalanan pesan dari sumber hingga pendengar.",
        },
        {
          title: "Eksplorasi teknologi",
          detail:
            "Catatan tentang perangkat dan sistem di balik layanan yang terhubung.",
        },
        {
          title: "Infrastruktur jaringan",
          detail:
            "Peta dan diagram jalur yang menjaga layanan tetap terhubung.",
        },
        {
          title: "Pemantauan sinyal",
          detail: "Ruang untuk memeriksa kesehatan dan pergerakan sinyal.",
        },
        {
          title: "Pengetahuan teknis",
          detail: "Referensi sistem yang memungkinkan koneksi.",
        },
      ],
    },
  },
  "human-pen": {
    title: {
      en: "Think. Write. Create. Share.",
      id: "Pikir. Tulis. Cipta. Bagikan.",
    },
    intro: {
      en: "Human-Pen is a working space for questions, drafts, writing and ideas that can become shared knowledge.",
      id: "Human-Pen adalah ruang kerja untuk pertanyaan, draf, tulisan, dan gagasan yang dapat menjadi pengetahuan bersama.",
    },
    layout: "scriptorium",
    items: {
      en: [
        {
          title: "Writing studio",
          detail: "Set a thought down, revise it, and give it a clear form.",
        },
        {
          title: "Idea development",
          detail:
            "Keep questions, fragments and connections close while a piece takes shape.",
        },
        {
          title: "Personal publications",
          detail: "A shelf for work written and published by its authors.",
        },
        {
          title: "Creative works",
          detail: "Writing and experiments made across the Empire.",
        },
        {
          title: "Scriptorium collections",
          detail: "Browse notes and manuscripts by subject and form.",
        },
      ],
      id: [
        {
          title: "Studio menulis",
          detail: "Catat sebuah pikiran, sunting, lalu susun hingga jelas.",
        },
        {
          title: "Pengembangan gagasan",
          detail:
            "Simpan pertanyaan, fragmen, dan hubungan saat tulisan mulai terbentuk.",
        },
        {
          title: "Terbitan pribadi",
          detail:
            "Rak untuk karya yang ditulis dan diterbitkan oleh penulisnya.",
        },
        {
          title: "Karya kreatif",
          detail: "Tulisan dan eksperimen yang dibuat di berbagai dunia.",
        },
        {
          title: "Koleksi scriptorium",
          detail:
            "Telusuri catatan dan manuskrip berdasarkan subjek dan bentuk.",
        },
      ],
    },
  },
  sidra: {
    title: {
      en: "Connect. Explore. Learn.",
      id: "Terhubung. Jelajahi. Pelajari.",
    },
    intro: {
      en: "SIDRA makes relationships between concepts, entities and discoveries visible, so a question can open a path to another.",
      id: "SIDRA menampilkan hubungan antara konsep, entitas, dan temuan agar satu pertanyaan dapat membuka jalur ke pertanyaan lain.",
    },
    layout: "constellation",
    items: {
      en: [
        {
          title: "Knowledge graph",
          detail: "See concepts and entities as points in a connected field.",
        },
        {
          title: "Concept explorer",
          detail: "Open a concept and follow its documented relationships.",
        },
        {
          title: "Relationship maps",
          detail:
            "Trace links between ideas without losing their source context.",
        },
        {
          title: "Discovery pathways",
          detail:
            "Move through a sequence of connected topics at your own pace.",
        },
        {
          title: "Learning collections",
          detail: "Gather related material into paths that can be revisited.",
        },
      ],
      id: [
        {
          title: "Graf pengetahuan",
          detail:
            "Lihat konsep dan entitas sebagai titik dalam bidang yang saling terhubung.",
        },
        {
          title: "Penjelajah konsep",
          detail: "Buka sebuah konsep dan telusuri relasi yang terdokumentasi.",
        },
        {
          title: "Peta hubungan",
          detail:
            "Telusuri kaitan antargagasan tanpa melepas konteks sumbernya.",
        },
        {
          title: "Jalur penemuan",
          detail: "Ikuti rangkaian topik yang terhubung sesuai ritmemu.",
        },
        {
          title: "Koleksi belajar",
          detail: "Himpun bahan terkait dalam jalur yang bisa dibuka kembali.",
        },
      ],
    },
  },
  "rocksoul-dx": {
    title: { en: "Play. Create. Dream.", id: "Bermain. Cipta. Bermimpi." },
    intro: {
      en: "ROCKSOUL DX is an experimental workbench for trying ideas, breaking assumptions and making new creative experiences.",
      id: "ROCKSOUL DX adalah meja kerja eksperimental untuk mencoba gagasan, menguji asumsi, dan membuat pengalaman kreatif.",
    },
    layout: "workshop",
    items: {
      en: [
        {
          title: "Creative workbench",
          detail:
            "A place to begin a project and change direction as it develops.",
        },
        {
          title: "Experiments",
          detail: "Small tests that make an idea tangible.",
        },
        {
          title: "Interactive playgrounds",
          detail: "Try an interaction and see how it behaves.",
        },
        {
          title: "Tools and projects",
          detail: "Open the tools and prototypes made for creative work.",
        },
        {
          title: "Dream fragments",
          detail: "Collect rough sketches before they become a larger work.",
        },
      ],
      id: [
        {
          title: "Meja kerja kreatif",
          detail: "Mulai sebuah proyek dan ubah arah seiring perkembangannya.",
        },
        {
          title: "Eksperimen",
          detail: "Uji kecil yang membuat gagasan bisa dicoba.",
        },
        {
          title: "Ruang bermain interaktif",
          detail: "Coba interaksi dan lihat cara kerjanya.",
        },
        {
          title: "Perangkat dan proyek",
          detail: "Buka alat dan prototipe yang dibuat untuk berkarya.",
        },
        {
          title: "Fragmen mimpi",
          detail:
            "Kumpulkan sketsa kasar sebelum menjadi karya yang lebih besar.",
        },
      ],
    },
  },
  crayon: {
    title: {
      en: "Imagine. Draw. Inspire.",
      id: "Bayangkan. Gambar. Inspirasikan.",
    },
    intro: {
      en: "CRAYON gives visual ideas room to become sketches, studies and finished work within the Empire's creative canon.",
      id: "CRAYON memberi ruang bagi gagasan visual untuk tumbuh menjadi sketsa, studi, dan karya dalam kanon kreatif Empire.",
    },
    layout: "artwall",
    items: {
      en: [
        {
          title: "Visual imagination",
          detail: "Explore how an idea can take shape through image and form.",
        },
        {
          title: "Drawing collections",
          detail: "Browse studies and illustrations gathered by subject.",
        },
        {
          title: "Creative inspiration",
          detail: "Find references and prompts for a new piece of work.",
        },
        {
          title: "Artistic explorations",
          detail: "Follow experiments across materials, marks and composition.",
        },
      ],
      id: [
        {
          title: "Imajinasi visual",
          detail:
            "Jelajahi bagaimana gagasan terbentuk melalui gambar dan rupa.",
        },
        {
          title: "Koleksi gambar",
          detail:
            "Telusuri studi dan ilustrasi yang dihimpun berdasarkan subjek.",
        },
        {
          title: "Inspirasi kreatif",
          detail: "Temukan referensi dan pemantik untuk karya berikutnya.",
        },
        {
          title: "Eksplorasi seni",
          detail: "Ikuti eksperimen bahan, guratan, dan komposisi.",
        },
      ],
    },
  },
  "sin-can": {
    title: { en: "Canon Explorer", id: "Penjelajah Kanon" },
    intro: {
      en: "SIN CAN organizes established stories and references so readers can follow a source, a fragment and its place in the canon.",
      id: "SIN CAN menata cerita dan referensi yang telah ditetapkan agar pembaca dapat menelusuri sumber, fragmen, dan posisinya dalam kanon.",
    },
    layout: "archive-board",
    items: {
      en: [
        {
          title: "Canon collections",
          detail: "Browse the established material by collection.",
        },
        {
          title: "Story references",
          detail: "Open a reference with its source attached.",
        },
        {
          title: "Related fragments",
          detail: "Follow fragments that share a documented connection.",
        },
        {
          title: "Timeline navigation",
          detail: "Move through the canon by recorded chronology.",
        },
        {
          title: "Canon exploration",
          detail:
            "Compare references without adding details that have not been established.",
        },
      ],
      id: [
        {
          title: "Koleksi kanon",
          detail: "Telusuri materi yang telah ditetapkan menurut koleksi.",
        },
        {
          title: "Referensi cerita",
          detail: "Buka referensi bersama sumbernya.",
        },
        {
          title: "Fragmen terkait",
          detail: "Ikuti fragmen yang memiliki hubungan tercatat.",
        },
        {
          title: "Navigasi garis waktu",
          detail: "Telusuri kanon menurut kronologi yang tercatat.",
        },
        {
          title: "Eksplorasi kanon",
          detail:
            "Bandingkan referensi tanpa menambahkan detail yang belum ditetapkan.",
        },
      ],
    },
  },
  mythos: {
    title: { en: "Canon Explorer", id: "Penjelajah Kanon" },
    intro: {
      en: "MYTHOS follows the larger narrative structure through established themes, stories and world fragments.",
      id: "MYTHOS menelusuri struktur narasi yang lebih luas melalui tema, cerita, dan fragmen dunia yang telah ditetapkan.",
    },
    layout: "mythic-map",
    items: {
      en: [
        {
          title: "Mythos collections",
          detail: "Gather narrative material by its documented theme.",
        },
        {
          title: "Narrative connections",
          detail: "Follow links between stories and themes in the canon.",
        },
        {
          title: "World fragments",
          detail: "Read fragments alongside the context already established.",
        },
        {
          title: "Canon navigation",
          detail: "Move between the source, its story and its wider setting.",
        },
      ],
      id: [
        {
          title: "Koleksi mythos",
          detail: "Himpun materi narasi berdasarkan tema yang terdokumentasi.",
        },
        {
          title: "Hubungan narasi",
          detail: "Telusuri kaitan ant cerita dan tema di dalam kanon.",
        },
        {
          title: "Fragmen dunia",
          detail: "Baca fragmen bersama konteks yang sudah ditetapkan.",
        },
        {
          title: "Navigasi kanon",
          detail:
            "Berpindah antara sumber, cerita, dan latarnya yang lebih luas.",
        },
      ],
    },
  },
  "angel-with-shotgun": {
    title: { en: "Law. Justice. Society.", id: "Hukum. Keadilan. Masyarakat." },
    intro: {
      en: "This world examines the structures and responsibilities that shape social life, with room for reflection and informed discussion.",
      id: "Dunia ini memeriksa struktur dan tanggung jawab yang membentuk kehidupan sosial, dengan ruang untuk refleksi dan diskusi yang berinformasi.",
    },
    layout: "civic-editorial",
    items: {
      en: [
        {
          title: "Law and society",
          detail: "Read how rules and institutions shape shared life.",
        },
        {
          title: "Justice explorations",
          detail: "Examine questions of fairness, process and responsibility.",
        },
        {
          title: "Ethical discussions",
          detail: "Consider difficult choices with context and care.",
        },
        {
          title: "Social structures",
          detail: "Map the systems that influence people and communities.",
        },
        {
          title: "Knowledge collections",
          detail: "Browse source-led material related to law and society.",
        },
      ],
      id: [
        {
          title: "Hukum dan masyarakat",
          detail:
            "Baca bagaimana aturan dan lembaga membentuk kehidupan bersama.",
        },
        {
          title: "Eksplorasi keadilan",
          detail: "Periksa persoalan keadilan, proses, dan tanggung jawab.",
        },
        {
          title: "Diskusi etika",
          detail:
            "Pertimbangkan pilihan sulit dengan konteks dan kehati-hatian.",
        },
        {
          title: "Struktur sosial",
          detail: "Petakan sistem yang memengaruhi orang dan komunitas.",
        },
        {
          title: "Koleksi pengetahuan",
          detail: "Telusuri materi bersumber tentang hukum dan masyarakat.",
        },
      ],
    },
  },
};

export function WorldDetailContent({
  world,
  locale,
}: {
  world: WorldCardData;
  locale: Locale;
}) {
  const story = STORIES[world.slug];
  const items = story.items[locale];
  const index = Number(world.number) - 1;
  const previous = index > 0 ? `/${WORLDS[index - 1].slug}` : null;
  const next = index < WORLDS.length - 1 ? `/${WORLDS[index + 1].slug}` : null;

  return (
    <>
      <section
        className={`world-opening world-opening--${story.layout}`}
        data-accent={world.accent}
      >
        <div className="world-opening-copy">
          <p className="world-index-mark">
            {world.number} / {locale === "id" ? "DUNIA" : "WORLD"}
          </p>
          <h1>{world.name}</h1>
          <p className="world-opening-subtitle">{story.title[locale]}</p>
          <p className="world-opening-intro">{story.intro[locale]}</p>
        </div>
        <figure className="world-opening-art">
          {world.art ? (
            <Image
              src={world.art}
              alt={world.artAlt[locale]}
              priority
              sizes="(max-width: 760px) 100vw, 54vw"
            />
          ) : null}
          <figcaption>{world.tagline[locale]}</figcaption>
        </figure>
        <span className="world-opening-stamp" aria-hidden="true">
          {world.number}
        </span>
      </section>

      {world.slug === "sidra" ? (
        <nav
          className="sidra-knowledge-map"
          aria-label={
            locale === "id" ? "Peta pengetahuan SIDRA" : "SIDRA knowledge map"
          }
        >
          <svg
            viewBox="0 0 1000 120"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M90 60 C220 6 270 110 400 60 S580 10 700 60 S850 110 930 60" />
          </svg>
          {items.map((item, itemIndex) => (
            <Link key={item.title} href={`#sidra-node-${itemIndex + 1}`}>
              <span>{String(itemIndex + 1).padStart(2, "0")}</span>
              <strong>{item.title}</strong>
            </Link>
          ))}
        </nav>
      ) : null}

      <section
        className={`world-content world-content--${story.layout}`}
        aria-label={story.title[locale]}
      >
        {items.map((item, itemIndex) => (
          <article
            className="world-fragment"
            id={
              world.slug === "sidra" ? `sidra-node-${itemIndex + 1}` : undefined
            }
            key={item.title}
          >
            <span className="fragment-index">
              {String(itemIndex + 1).padStart(2, "0")}
            </span>
            <div>
              <h2>{item.title}</h2>
              <p>{item.detail}</p>
            </div>
            <span className="fragment-mark" aria-hidden="true">
              {itemIndex % 2 === 0 ? "✳" : "╱"}
            </span>
          </article>
        ))}
      </section>

      <nav
        className="world-neighbor-nav"
        aria-label={locale === "id" ? "Dunia lain" : "Other worlds"}
      >
        <Link href="/worlds" className="world-neighbor-map">
          {locale === "id" ? "Kembali ke atlas" : "Back to the atlas"}
          <ArrowRightIcon size={18} aria-hidden="true" />
        </Link>
        <div>
          {previous ? (
            <Link href={`/worlds${previous}`} rel="prev">
              ← {WORLDS[index - 1].name}
            </Link>
          ) : null}
          {next ? (
            <Link href={`/worlds${next}`} rel="next">
              {WORLDS[index + 1].name} →
            </Link>
          ) : null}
        </div>
      </nav>
    </>
  );
}
