# mw-mylove — A-L-L-A-H.COM Flagship Public Web Portal

Flagship Public Web Portal for **A-L-L-A-H.COM** & the **MoonWitness Sovereign Ecosystem** (`A-L-L-A-H/mw-mylove`), built with TypeScript and Bun (`MW_MYLOVE_PORT=4460`).

## Governance & Compliance

- **CAN-0011..0014**: Strict typographic, geometric, and celestial dark + gold + emerald UI. Zero visual depictions of Allah, Prophet Muhammad, or Isa/Yesus.
- **ADR 0005**: Explicit 8-layer epistemic separation labels on GOD PROMISE / Corpus cards and non-normative advisory badges on Mizan / CRAYON views.
- **Zero Fake Data**: Live proxy endpoints query `MW_CORPUS_URL`, `MW_NEXUS_URL`, `MW_LORE_URL`, and `MW_ECHO_URL`, rendering graceful offline/empty states when upstreams are unreachable.

## Endpoints

| Route | Purpose |
| --- | --- |
| `GET /` | Flagship SPA/HTML portal |
| `GET /health` | Service health & compliance metadata |
| `GET /api/ecosystem` | 13-repository MoonWitness ecosystem directory & 8-layer epistemic schema |
| `GET /api/corpus/search?q=` | Live proxy to `MW_CORPUS_URL` with 8-layer epistemic labels |
| `GET /api/nexus/domains` | Live proxy to `MW_NEXUS_URL` with ADR 0005 non-normative advisory badge |
| `GET /api/lore/eras` | Live proxy to `MW_LORE_URL` |
| `GET /api/radar/events` | Live proxy to `MW_ECHO_URL` |

## Development

```bash
bun install
bun test
bun run start
```
