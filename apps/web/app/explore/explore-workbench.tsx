"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@moonwitness/ui/components/alert";
import { Button } from "@moonwitness/ui/components/button";
import { Field } from "@moonwitness/ui/components/field";
import { Input } from "@moonwitness/ui/components/input";
import { Panel } from "@moonwitness/ui/components/panel";
import { Textarea } from "@moonwitness/ui/components/textarea";
import type { Locale } from "../lib/locale";

interface ResultState {
  pending: boolean;
  text: string;
  error: boolean;
}

const EMPTY_RESULT: ResultState = { pending: false, text: "", error: false };

async function readResponse(response: Response): Promise<string> {
  const payload = await response
    .json()
    .catch(() => ({ error: "The service returned an unreadable response." }));
  return JSON.stringify(payload, null, 2);
}

function responseStatus(text: string): string {
  try {
    const payload = JSON.parse(text) as { status?: string };
    return payload.status ?? "online";
  } catch {
    return "offline";
  }
}

function Result({ state }: { state: ResultState }) {
  if (state.pending) return <p role="status">Requesting live service…</p>;
  if (!state.text) return <p className="result-empty">No result yet.</p>;
  if (state.error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Request failed</AlertTitle>
        <AlertDescription>{state.text}</AlertDescription>
      </Alert>
    );
  }
  return <pre className="result-box">{state.text}</pre>;
}

export function ExploreWorkbench({
  locale,
  initialQuery = "",
}: {
  locale: Locale;
  initialQuery?: string;
}) {
  const indonesian = locale === "id";
  const [query, setQuery] = useState(initialQuery);
  const [arabicText, setArabicText] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [posterTitle, setPosterTitle] = useState("");
  const [posterSubtitle, setPosterSubtitle] = useState("");
  const [corpus, setCorpus] = useState<ResultState>(EMPTY_RESULT);
  const [aqel, setAqel] = useState<ResultState>(EMPTY_RESULT);
  const [mtime, setMtime] = useState<ResultState>(EMPTY_RESULT);
  const [poster, setPoster] = useState<ResultState>(EMPTY_RESULT);
  const [livePanels, setLivePanels] = useState<Record<string, ResultState>>({});

  async function getResult(
    path: string,
    method = "GET",
    body?: unknown,
  ): Promise<ResultState> {
    const response = await fetch(path, {
      method,
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    const text = await readResponse(response);
    return { pending: false, text, error: !response.ok };
  }

  async function run(
    path: string,
    setter: (state: ResultState) => void,
    method = "GET",
    body?: unknown,
  ) {
    setter({ pending: true, text: "", error: false });
    try {
      setter(await getResult(path, method, body));
    } catch (error) {
      setter({
        pending: false,
        text:
          error instanceof Error ? error.message : "Network request failed.",
        error: true,
      });
    }
  }

  useEffect(() => {
    void run(
      `/api/corpus/search?q=${encodeURIComponent(initialQuery)}`,
      setCorpus,
    );
    void Promise.all(
      [
        ["nexus", "/api/nexus/domains"],
        ["lore", "/api/lore/eras"],
        ["radar", "/api/radar/events"],
      ].map(async ([key, path]) => {
        try {
          const result = await getResult(path);
          setLivePanels((current) => ({ ...current, [key]: result }));
        } catch (error) {
          setLivePanels((current) => ({
            ...current,
            [key]: {
              pending: false,
              text:
                error instanceof Error
                  ? error.message
                  : "Network request failed.",
              error: true,
            },
          }));
        }
      }),
    );
  }, [initialQuery]);

  const copy = indonesian
    ? {
        search: "Pencarian corpus",
        query: "Frasa pencarian",
        searchButton: "Cari corpus",
        aqel: "Pemeriksa leksikal Arab AQEL",
        arabic: "Teks Arab",
        analyze: "Analisis teks",
        disclaimer: "Kandidat komputasional; bukan tafsir otoritatif.",
        time: "Konversi M-Time",
        timestamp: "Waktu ISO-8601 (kosongkan untuk waktu saat ini)",
        convert: "Konversi waktu",
        poster: "Pratinjau kartu tipografi",
        title: "Judul kartu",
        subtitle: "Teks atau tema geometris",
        preview: "Pratinjau SVG",
        live: "Panel layanan langsung",
        nexus: "Domain Nexus",
        lore: "Era Lore",
        radar: "Peristiwa Radar",
      }
    : {
        search: "Corpus search",
        query: "Search phrase",
        searchButton: "Search corpus",
        aqel: "AQEL Arabic lexical inspector",
        arabic: "Arabic text",
        analyze: "Analyze text",
        disclaimer: "Computational candidate; not authoritative tafsir.",
        time: "M-Time conversion",
        timestamp: "ISO-8601 timestamp (leave blank for current time)",
        convert: "Convert time",
        poster: "Typographic card preview",
        title: "Card title",
        subtitle: "Text or geometric theme",
        preview: "Preview SVG",
        live: "Live service panels",
        nexus: "Nexus domains",
        lore: "Lore eras",
        radar: "Radar events",
      };

  return (
    <div className="explore-layout">
      <Panel
        id="corpus"
        className="content-panel"
        title={copy.search}
        description={
          indonesian
            ? "Hasil bersumber dari mw-corpus."
            : "Results are sourced from mw-corpus."
        }
        surface="ink"
        frame="scuffed"
      >
        <div className="field-stack">
          <Field label={copy.query} htmlFor="corpus-query">
            <Input
              id="corpus-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </Field>
          <div className="field-actions">
            <Button
              type="button"
              onClick={() =>
                void run(
                  `/api/corpus/search?q=${encodeURIComponent(query)}`,
                  setCorpus,
                )
              }
            >
              {copy.searchButton}
            </Button>
          </div>
          <Result state={corpus} />
        </div>
      </Panel>

      <Panel
        id="aqel"
        className="content-panel"
        title={copy.aqel}
        description={copy.disclaimer}
        surface="ink"
        frame="scuffed"
      >
        <div className="field-stack">
          <Field label={copy.arabic} htmlFor="aqel-text">
            <Textarea
              id="aqel-text"
              dir="rtl"
              rows={3}
              value={arabicText}
              onChange={(event) => setArabicText(event.target.value)}
            />
          </Field>
          <div className="field-actions">
            <Button
              type="button"
              disabled={!arabicText.trim()}
              onClick={() =>
                void run("/api/aqel/analyze", setAqel, "POST", {
                  text: arabicText,
                })
              }
            >
              {copy.analyze}
            </Button>
          </div>
          <Result state={aqel} />
        </div>
      </Panel>

      <Panel
        id="mtime"
        className="content-panel"
        title={copy.time}
        description="Software Profile · Not Religious Authority"
        surface="ink"
        frame="scuffed"
      >
        <div className="field-stack">
          <Field label={copy.timestamp} htmlFor="mtime-input">
            <Input
              id="mtime-input"
              value={timestamp}
              onChange={(event) => setTimestamp(event.target.value)}
              placeholder="2026-11-28T12:00:00Z"
            />
          </Field>
          <div className="field-actions">
            <Button
              type="button"
              onClick={() =>
                void run(
                  `/api/time/convert?ts=${encodeURIComponent(timestamp)}`,
                  setMtime,
                )
              }
            >
              {copy.convert}
            </Button>
          </div>
          <Result state={mtime} />
        </div>
      </Panel>

      <Panel
        id="poster"
        className="content-panel"
        title={copy.poster}
        description="CAN-0011 · Typographic and geometric motifs only"
        surface="ink"
        frame="scuffed"
      >
        <div className="field-stack">
          <Field label={copy.title} htmlFor="poster-title">
            <Input
              id="poster-title"
              value={posterTitle}
              onChange={(event) => setPosterTitle(event.target.value)}
            />
          </Field>
          <Field label={copy.subtitle} htmlFor="poster-subtitle">
            <Textarea
              id="poster-subtitle"
              rows={3}
              value={posterSubtitle}
              onChange={(event) => setPosterSubtitle(event.target.value)}
            />
          </Field>
          <div className="field-actions">
            <Button
              type="button"
              disabled={!posterTitle.trim() && !posterSubtitle.trim()}
              onClick={() =>
                void run("/api/poster/preview", setPoster, "POST", {
                  title: posterTitle,
                  subtitle: posterSubtitle,
                })
              }
            >
              {copy.preview}
            </Button>
          </div>
          <Result state={poster} />
        </div>
      </Panel>

      <Panel
        id="nexus"
        className="content-panel"
        title={copy.live}
        surface="ink"
        frame="scuffed"
      >
        <div className="live-panel-grid">
          <LivePanel title={copy.nexus} state={livePanels.nexus} />
          <LivePanel title={copy.lore} state={livePanels.lore} />
          <LivePanel title={copy.radar} state={livePanels.radar} />
        </div>
      </Panel>
    </div>
  );
}

function LivePanel({ title, state }: { title: string; state?: ResultState }) {
  const status = state?.text ? responseStatus(state.text) : "offline";
  return (
    <section className="live-panel">
      <h3>{title}</h3>
      {state ? (
        <Result state={state} />
      ) : (
        <p role="status">Connecting to upstream service…</p>
      )}
      {state?.text ? <p className="live-panel-status">{status}</p> : null}
    </section>
  );
}
