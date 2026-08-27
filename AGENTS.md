# langyspace-cupom agent guide

## Project

- Public standalone React, TypeScript, Vite, Firebase Functions/Firestore/Hosting app for
  `cupom.langy.space`; package manager is `pnpm`.
- Firebase project `langyspace-564b5`; Hosting target/site `cupom` / `langyspace-cupom`.
- Redirects resolve through shared Teacher Functions, never direct browser reads of `short_links`.
- Reports live at `/relatorio/:id`, where `id` is an opaque `reportId`, and show sanitized
  aggregates from `getShortLinkMetrics`.

## Always-on workflow

- Preserve unrelated work. Read the active handoff/progress and next task before broad history.
- Classify rendered impact before acting: `direct` changes UI/copy/layout/interaction; `indirect`
  changes data or behavior that can alter rendering; `none` has no plausible rendered effect.
- Direct/indirect work identifies routes, states, extremes, and widths, fills audit gaps, runs
  `pnpm run validate:ui`, and includes representative screenshot inspection.
- Every final handoff contains exactly one verdict: `Visual gate review: passed` with evidence,
  `not applicable` with a concrete reason, or `blocked` with the failing surface.
- Medium/large work uses reviewed, resumable `docs/epics/<name>/` documents and one small task at a
  time. Tiny work still requires inspection, focused validation, and diff review.

## Contracts and safety

- Keep the app small and public. Destination and report authorization contracts remain server-owned.
- Never expose raw IP, names, phone, email, credentials, provider diagnostics, or other sensitive
  personal data. Browser reports receive aggregates only.
- Shared Firestore rules live in Teacher. Do not duplicate or loosen them locally.
- Production writes, external messages, provider mutations, destructive cleanup, rules deploys,
  and Hosting deploys require explicit user intent and exact-target verification.

## Progressive guidance

Use `.agents/skills/langyspace-cupom-workflow/SKILL.md` for medium/large implementation, visible
UI/report work, redirect/attribution contracts, Firebase/rules, privacy-sensitive analytics, or
deployment. It routes only the needed execution/visual or contracts/privacy reference. Do not load
it for simple read-only answers or isolated documentation.

## Common commands

- Development/build: `pnpm dev`, `pnpm run build`, `pnpm run preview`
- Tests: `pnpm test`
- Mandatory direct/indirect UI gate: `pnpm run validate:ui`
- Approved Hosting deploy: `pnpm run deploy`
