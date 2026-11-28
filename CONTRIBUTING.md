# Contributing to mw-mylove

## Quick Start

1. Fork the repository and create a feature branch.
2. Install dependencies with `bun install`.
3. Make changes in the owning `apps/*` or `packages/*` workspace.
4. Verify before opening a pull request:

```bash
bun run lint
bun run format:check
bun run typecheck
bun test
bun run build
```

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/): `feat`, `fix`, `docs`, `chore`, `refactor`, and `test`.

## Code Quality

ESLint 9 is strict. `max-lines` is 300, `max-len` is 100, and `complexity` is 10. `bun run lint` uses `--max-warnings 0`; `bun run lint:changed` checks changed files; `bun run check-disables` requires a ticket token on every `eslint-disable` directive.

## Reporting Issues

Use the GitHub issue tracker with reproduction steps, expected versus actual behavior, and environment details.

## Security

For security issues, see [SECURITY.md](SECURITY.md).
