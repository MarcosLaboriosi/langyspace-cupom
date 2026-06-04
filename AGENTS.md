# langyspace-cupom agent guide

Standalone React + Firebase app for `cupom.langy.space`.

## quick facts

- Stack: React, TypeScript, Vite, Firebase Hosting, Firestore.
- Package manager: `pnpm`.
- Firebase project: `langyspace-564b5`.
- Hosting target/site: `cupom` mapped to `langyspace-cupom`.
- The app is public and has no login.
- Do not add Cloud Functions to the MVP.
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

Keep the app small. The redirect destination must come from `short_links/{slug}.destinationUrl`;
do not hardcode coupon destinations in source code.

Do not save raw IP, lead name, lead phone, lead email, or sensitive personal data. The click payload
may save campaign fields, UTMs, sanitized referrer, sanitized full URL, pathname, user agent, and
timestamp.

When Firestore rules need to change, update `../langyspace-teacher/firestore.rules` and validate
from that repo with `pnpm run rules:check`.
