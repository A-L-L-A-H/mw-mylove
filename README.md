# mw-mylove — Flagship public web portal for A-L-L-A-H.COM.

**Repository:** [`A-L-L-A-H/mw-mylove`](https://github.com/A-L-L-A-H/mw-mylove) · **Stack:** TypeScript · Bun

## What it does

Presents community pages and storefront/PaaS catalog views backed by live mw-corpus, mw-nexus, mw-lore, and mw-echo proxies.

## Quick start

```bash
bun install
bun run start
```

## Verify

```bash
bun test
bun run typecheck
```

## Configuration

- **Port:** 4460
- **Key configuration:** MW_MYLOVE_PORT

## Notes

Offline or unreachable upstreams render explicit empty states; no fake data is substituted.
