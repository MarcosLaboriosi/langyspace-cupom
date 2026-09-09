# Redirect, report, and privacy contracts

- Keep the app small. Resolve destinations from `short_links/{slug}.destinationUrl` through the
  shared Teacher `resolveShortLinkRedirect` callable; never hardcode coupon destinations or read the
  collection directly from the browser.
- Public reports use opaque `short_links.reportId` at `/relatorio/:id`, not public slugs, and fetch
  sanitized aggregates through `getShortLinkMetrics`.
- Reports expose only aggregate counts/rates, daily series, UTM/referrer summaries, and link
  metadata.
- Never store raw IP, lead name, phone, email, or sensitive personal data. Server-side click payloads
  may store campaign fields, UTMs, sanitized referrer/full URL, pathname, user agent, and timestamp.
- Shared rules for `short_links` and `short_link_clicks` live in
  `../langyspace-teacher/firestore.rules`; validate changes from Teacher with
  `pnpm run rules:check`.
- Firebase project is `langyspace-564b5`; Hosting target/site is `cupom` / `langyspace-cupom`.

## Contract lookup

Follow [queries.ts](../../../../src/services/shortLinks/queries.ts) to the public request/response
DTOs in [types.ts](../../../../src/services/shortLinks/types.ts), then compare the matching types in
[Teacher's shortLinks domain](../../../../../langyspace-teacher/functions/packages/auth/src/domains/shortLinks/types.ts).
`requestContext` is server enrichment; `ShortLinkDocument` describes storage. Share only a proven
public projection when needed, never the entire storage/types module or Firebase SDK dependencies.
From Teacher, `pnpm context:contracts -- resolveShortLinkRedirect` locates the callable and direct
consumers; verify the returned source before changing a contract.
