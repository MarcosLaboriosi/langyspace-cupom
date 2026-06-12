# langyspace-cupom agent guide

Standalone React + Firebase app for `cupom.langy.space`.

## quick facts

- Stack: React, TypeScript, Vite, Firebase Hosting, Firebase Functions, Firestore.
- Package manager: `pnpm`.
- Firebase project: `langyspace-564b5`.
- Hosting target/site: `cupom` mapped to `langyspace-cupom`.
- The app is public and has no login.
- Public redirects must resolve through the shared `langyspace-teacher` auth Functions codebase,
  not through direct client reads from `short_links`.
- Public coupon reports live at `/relatorio/:slug` and must read sanitized aggregates through
  `getShortLinkMetrics`, not direct Firestore reads.
- Shared Firestore rules for `short_links` and `short_link_clicks` currently live in
  `../langyspace-teacher/firestore.rules` because the Firestore database is shared with the existing
  Langy.space apps.

## commands

- Dev server: `pnpm dev`
- Unit tests: `pnpm test`
- Production build/type check: `pnpm run build`
- Preview production build: `pnpm run preview`
- Deploy Hosting: `pnpm run deploy`

## workflow

Keep the app small. The redirect destination must come from `short_links/{slug}.destinationUrl`
through the `resolveShortLinkRedirect` callable; do not hardcode coupon destinations in source code.
Report routes should only show aggregate counts, rates, daily series, UTM/referrer summaries, and
link metadata.

Do not save raw IP, lead name, lead phone, lead email, or sensitive personal data. Click payloads are
written server-side and may save campaign fields, UTMs, sanitized referrer, sanitized full URL,
pathname, user agent, and timestamp.

When Firestore rules need to change, update `../langyspace-teacher/firestore.rules` and validate
from that repo with `pnpm run rules:check`.
