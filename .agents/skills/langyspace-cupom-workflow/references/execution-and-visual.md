# Execution and visual quality

For medium/large work, inspect architecture, dependencies, flows, tests, risks, and user changes.
Create reviewed `docs/epics/<name>/epic.md`, `requirements.md`, `technical-plan.md`, `tasks.md`, and
`progress.md`. Execute one dependency-ordered task at a time through `understand -> implement ->
focused check when useful -> review diff -> update docs -> mark complete`. Revise the plan when a
premise changes and finish with a PR-style review.

For direct/indirect impact, record routes, states, content extremes, and widths. Extend focused
coverage when it is missing and run the smallest affected test only when it adds local evidence. CI
owns `pnpm run validate:ui` and broad layout audits. The product owner performs visual review. Never
weaken assertions to pass. The audit uses local sanitized data, blocks external network, and never
reads or mutates production.

Successful local evidence remains valid while its relevant source, dependencies, fixtures, and
contracts are unchanged. After a failure, rerun only the failed check. Internal subtasks do not
generate individual pushes. Push once per coherent user delivery, then stop without monitoring CI
or deploy; report them as initiated and unverified unless a failure is later reported.
