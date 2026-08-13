# langyspace-cupom agent guide

Standalone React + Firebase app for `cupom.langy.space`.

## epic execution protocol

For every medium or large implementation, treat the work as a product and engineering epic. Do not
start coding until planning, product refinement, technical refinement, task breakdown, and a
critical plan review are complete.

Before implementation:

1. Inspect the repository, architecture, existing patterns, dependencies, affected flows, tests,
   risks, and current user changes.
2. Create `docs/epics/<epic-name>/` as the source of truth for the work.
3. Create and maintain:
   - `epic.md`: problem, objective, scope, out of scope, user journey, and success criteria.
   - `requirements.md`: requirements, business rules, edge cases, and acceptance criteria.
   - `technical-plan.md`: proposed solution, affected architecture and files, data, APIs, risks,
     and technical decisions.
   - `tasks.md`: small tasks and subtasks ordered by dependency.
   - `progress.md`: current state, completed work, next subtask, blockers, and discoveries.
4. Critically review the complete plan for ambiguity, unnecessary complexity, regressions,
   duplication, UX, security, performance, and opportunities to reuse the existing architecture.
5. Implement only one subtask at a time.

For each subtask, follow this exact loop:

`understand -> implement -> test -> review diff -> validate acceptance criteria -> update docs -> mark complete -> next subtask`

Keep each subtask small, verifiable, testable, and single-purpose. If an assumption proves wrong,
stop, update the epic documents and affected tasks, then continue from the revised plan. Do not
expand scope; record non-essential improvements for later.

At the end, review the whole epic as another engineer's pull request. Validate requirements, the
complete user flow, edge cases, tests, types, lint, regressions, dead code, temporary logs, and
architectural consistency. Keep the documentation detailed enough for another session or agent to
resume at the exact next subtask without conversation history.

Act as Product Manager, Tech Lead, Senior Software Engineer, and QA throughout the process. Question
weak requirements and poor technical decisions instead of executing them blindly.

Tiny, isolated changes may use a lightweight flow without an epic folder, but must still inspect the
relevant code, preserve unrelated work, review the diff, and run focused validation.

## quick facts

- Stack: React, TypeScript, Vite, Firebase Hosting, Firebase Functions, Firestore.
- Package manager: `pnpm`.
- Firebase project: `langyspace-564b5`.
- Hosting target/site: `cupom` mapped to `langyspace-cupom`.
- The app is public and has no login.
- Public redirects must resolve through the shared `langyspace-teacher` auth Functions codebase,
  not through direct client reads from `short_links`.
- Public coupon reports live at `/relatorio/:id`, where `id` is the opaque `reportId` stored on
  `short_links`, and must read sanitized aggregates through `getShortLinkMetrics`, not direct
  Firestore reads.
- Shared Firestore rules for `short_links` and `short_link_clicks` currently live in
  `../langyspace-teacher/firestore.rules` because the Firestore database is shared with the existing
  Langy.space apps.

## commands

- Dev server: `pnpm dev`
- Unit tests: `pnpm test`
- Production build/type check: `pnpm run build`
- Mandatory UI release gate: `pnpm run validate:ui`
- Preview production build: `pnpm run preview`
- Deploy Hosting: `pnpm run deploy`

## workflow

Every application-code or layout change must pass `pnpm run validate:ui` before completion, release
commit or deploy. The deploy command and live workflow run the same blocking gate.

### mandatory visual review for every repository prompt

Before acting on any prompt in this repository, classify its visual impact as `direct`, `indirect`
or `none`. `direct` covers rendered UI, copy, styles, assets, responsiveness and interaction.
`indirect` covers data, API contracts, status values, loading/error behavior, ordering, density and
actions that can change what the report renders. `none` requires a concrete reason and cannot be
chosen merely because the edited file is backend or documentation.

For `direct` or `indirect` impact, identify the affected route/state, content extremes and widths
before implementation; verify audit coverage and add the missing sanitized case or fixture in the
same task. Product planning, technical review and the task breakdown must record this decision.
Completion requires `pnpm run validate:ui`, representative screenshot inspection and a repeated
impact classification during final diff review.

For `none`, the gate does not need to run, but the final handoff must state
`Visual gate review: not applicable` and the reason. Every task ends with exactly one verdict:
`passed` with evidence, `not applicable` with reason, or `blocked` with the failing surface. The
review cannot be deferred to commit or deploy.

When changing a page, report state, card, header, list, status or action, add the route or state to
`scripts/audit-layout.mjs` when existing cases do not exercise it. Cover normal and adversarial long
content at the applicable widths, including 390, 768, 1280, 1281, 1440, 1536, 1551, 1552 and 2048
px for shared layouts. Reject overflow, masked clipping without an accessible full value, incomplete
headers and controls outside their owner or viewport. Inspect screenshots for hierarchy, contrast
and density. Never weaken an assertion just to pass; document an intentional exception and explicit
selector in the active epic first.

The audit must use only the sanitized demo report through local Vite and block external network
requests. It must never read or mutate production data.

Keep the app small. The redirect destination must come from `short_links/{slug}.destinationUrl`
through the `resolveShortLinkRedirect` callable; do not hardcode coupon destinations in source code.
Report routes use `short_links.reportId`, not the public slug, and should only show aggregate
counts, rates, daily series, UTM/referrer summaries, and link metadata.

Do not save raw IP, lead name, lead phone, lead email, or sensitive personal data. Click payloads are
written server-side and may save campaign fields, UTMs, sanitized referrer, sanitized full URL,
pathname, user agent, and timestamp.

When Firestore rules need to change, update `../langyspace-teacher/firestore.rules` and validate
from that repo with `pnpm run rules:check`.
