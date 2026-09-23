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
- Direct/indirect work identifies routes, states, extremes, and widths and fills focused coverage
  gaps. Run the smallest local check that adds evidence; CI owns `pnpm run validate:ui`, broad
  audits, and full suites. The product owner performs visual review.
- Every final handoff contains exactly one verdict: `Visual gate review: pending human` for rendered
  changes, `accepted by human`, `not applicable` with a concrete reason, or `blocked` with the
  failing surface.
- Medium/large work uses reviewed, resumable `docs/epics/<name>/` documents and one small task at a
  time. Tiny work still requires inspection, focused validation, and diff review.
- Internal subtasks do not require individual pushes. Finish the smallest coherent user delivery,
  run at most two focused local checks (three only for high-risk changes), create a scoped commit,
  and push once to `main`. Reuse successful evidence while relevant inputs are unchanged; after a
  failure, rerun only the failed check. After pushing, do not poll, watch, or inspect CI/deploy logs
  unless the user explicitly asks or a failure is reported. Report the commit and that delivery was
  initiated without claiming production completion.
- Use one agent by default. For explicitly parallel work, give each subagent a bounded,
  self-contained brief with minimal history; subagents do not run full gates or monitor CI. Collect
  each result once instead of polling.

## Contracts and safety

- Keep route-level pages, screens, views, and containers in this product. Share a UI component
  through `@langyspace/ui` when its visual or interaction contract is reusable across products;
  size is not a boundary, so shared units may range from `Button`, `SearchInput`, `Card`, and
  `Drawer` to a complete `Chat` section or `Calendar`. The product still owns routing, fetching,
  domain state, business rules, and orchestration, passing data and actions into the component.
- Keep the app small and public. Destination and report authorization contracts remain server-owned.
- Never expose raw IP, names, phone, email, credentials, provider diagnostics, or other sensitive
  personal data. Browser reports receive aggregates only.
- Shared Firestore rules live in Teacher. Do not duplicate or loosen them locally.
- Production writes, external messages, provider mutations, destructive cleanup, rules deploys,
  and Hosting deploys require explicit user intent. Direct external side effects require exact
  verification; ordinary CI/CD remains asynchronous and unmonitored.

## Progressive guidance

Use `.agents/skills/langyspace-cupom-workflow/SKILL.md` for medium/large implementation, visible
UI/report work, redirect/attribution contracts, Firebase/rules, privacy-sensitive analytics, or
deployment. It routes only the needed execution/visual or contracts/privacy reference. Do not load
it for simple read-only answers or isolated documentation.

## Common commands

- Development/build: `pnpm dev`, `pnpm run build`, `pnpm run typecheck`, `pnpm run preview`
- Tests: `pnpm test`
- CI-owned direct/indirect UI gate: `pnpm run validate:ui`
- Approved Hosting deploy: `pnpm run deploy`
