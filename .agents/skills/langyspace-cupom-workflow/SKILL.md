---
name: langyspace-cupom-workflow
description: Use for medium or large Cupom app implementation, visible UI/report work, redirect or attribution contracts, Firebase Functions/Firestore changes, privacy-sensitive analytics, or deployment. Do not load for simple read-only answers or isolated documentation edits.
---

# Langyspace Cupom workflow

Preserve the root `AGENTS.md` invariants and load only what matches:

- Medium/large work or direct/indirect visual impact: read
  `references/execution-and-visual.md`.
- Short-link redirects, report access, click capture, Firestore rules, privacy, or deployment: read
  `references/contracts-and-privacy.md`.

Execute one small subtask at a time. Batch independent read-only discovery and checks in one tool
round; keep writes dependency-ordered. Run only the smallest local check that can detect a
regression in the changed scope, with a default budget of two checks and three only for high-risk
work. CI owns full suites, `validate:ui`, broad audits, and deploy validation. Do not rerun a
successful check while its relevant inputs are unchanged, and do not monitor CI or deploy after
pushing unless a failure is reported or the user explicitly requests it. Production writes,
provider mutations, external messages, and destructive cleanup require explicit user intent and
exact side-effect verification.
