# Execution and visual quality

For medium/large work, inspect architecture, dependencies, flows, tests, risks, and user changes.
Create reviewed `docs/epics/<name>/epic.md`, `requirements.md`, `technical-plan.md`, `tasks.md`, and
`progress.md`. Execute one dependency-ordered task at a time through `understand -> implement -> test
-> review diff -> validate acceptance -> update docs -> mark complete`. Revise the plan when a
premise changes and finish with a PR-style review.

For direct/indirect impact, record routes, states, content extremes, and widths. Extend the sanitized
demo report or `scripts/audit-layout.mjs` when coverage is missing. Run `pnpm run validate:ui` and
inspect screenshots. Cover applicable shared widths 390, 768, 1280, 1281, 1440, 1536, 1551, 1552,
and 2048 px. Reject overflow, inaccessible clipping, incomplete headers, and controls outside their
owner/viewport. Never weaken assertions to pass. The audit uses local sanitized data, blocks
external network, and never reads or mutates production.
