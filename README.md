# mw-mylove — Flagship public web portal for A-L-L-A-H.COM.

**Repository:** [`A-L-L-A-H/mw-mylove`](https://github.com/A-L-L-A-H/mw-mylove) · **Stack:** Bun workspaces · Next.js App Router · Fastify · React · TypeScript

## Layout

- `apps/web`: Next.js portal on port `4460`
- `apps/api`: Fastify JSON/service API on port `4490`
- `packages/`: per-feature packages (`auth`, `portal`, `seo`, `storefront`, `sla`) plus shared `eslint-config` and `typescript-config`

Next route handlers proxy to the Fastify API through `MW_API_ORIGIN`. Upstream JSON responses are preserved; unreachable upstreams return explicit offline states with empty arrays.

## Quick start

With `mw-design` checked out beside `mw-mylove`:

```bash
bun install
bun run dev
```

## Verify

```bash
bun run lint
bun run format:check
bun run typecheck
bun test
bun run build
```

## Configuration

- **Web port:** `4460` (`MW_MYLOVE_PORT`)
- **API port:** `4490` (`MW_API_PORT`)
- **API origin used by Next proxy:** `MW_API_ORIGIN`
- **Public origin:** `MW_PUBLIC_ORIGIN`
- **Upstream timeout:** `MW_UPSTREAM_TIMEOUT_MS` (default `250`)

## Containers

- `docker build -f Dockerfile.web .` builds the web image.
- `docker build -f Dockerfile.api .` builds the API image.

## Notes

Offline or unreachable upstreams render explicit empty states; no fake data is substituted. CAN-0011..0014 and ADR-0005 compliance labels remain in the portal.
