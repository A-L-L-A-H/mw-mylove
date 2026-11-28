# Security Policy

## Supported Versions

Only the latest release on the default branch receives security updates.

| Version | Supported |
| ------- | --------- |
| Latest  | ✅        |
| Older   | ❌        |

## Reporting a Vulnerability

Do **not** open a public issue for security vulnerabilities.

Use the repository's **Security → Report a vulnerability** flow on GitHub for private vulnerability reporting.

If that action is unavailable, contact the repository owner privately through the contact method listed on [the owner profile](https://github.com/bjo163); do not create a public issue containing exploit details.

Include the affected commit or release, impact, prerequisites, reproducible steps, and a safe proof of concept. Remove real tokens, personal data, and production records. Do not test against systems or data you do not own. The maintainers will acknowledge reports as soon as practical, coordinate a fix and disclosure with the reporter, and publish a correction notice when appropriate. There is no guaranteed response time or bounty program.

The repository owner must verify and enable GitHub private vulnerability reporting and configure an actively monitored private contact before claiming this channel is operational. See [the incident-response runbook](../mw-docs/operations/security-incident-response.md) for containment and release correction.

## Disclosure

Coordinated disclosure is appreciated. We will credit reporters who follow this process.

## API Exposure Boundary

The Fastify API listens on 4490 (MW_API_PORT). Keep it behind an internal network. Public HTTP should reach pps/web on 4460, which proxies to the API through MW_API_ORIGIN. Treat the API origin as trusted internal infrastructure.
