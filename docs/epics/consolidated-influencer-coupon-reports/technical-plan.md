# Technical plan

## Architecture

The existing public callable remains `getShortLinkMetrics`. After resolving the requested
`short_links` document by `reportId`, its repository will resolve a report group:

- primary link: the requested document;
- sibling links: documents with the same `influencerId` and a coupon code;
- aggregate keys: unique slugs and coupon codes.

Click and conversion reads will run for each aggregate key and merge results by document ID before
the existing range, funnel, privacy, and UTM calculations execute.

## API change

Add `couponCodes: string[]` to `ShortLinkMetricsLink`. The existing singular `couponCode`, `slug`,
and `id` remain unchanged for compatibility and link generation.

## Affected files

- `../langyspace-teacher/functions/packages/auth/src/domains/shortLinks/types.ts`
- `../langyspace-teacher/functions/packages/auth/src/domains/shortLinks/repositories/shortLinkMetrics.repository.ts`
- `../langyspace-teacher/functions/packages/auth/src/domains/shortLinks/repositories/shortLinkMetrics.repository.test.ts`
- `src/services/shortLinks/types.ts`
- `src/pages/CouponMetricsPage/index.tsx`
- frontend fixtures/tests that construct `ShortLinkMetricsLink`

## Risks and decisions

- Query count grows with the number of an influencer's coupon links. Current groups are small; use
  parallel indexed equality queries and document-ID deduplication rather than a broader collection
  scan.
- Do not overload the singular `couponCode`; the new array keeps the contract explicit.
- Do not change funnel normalization in this epic because the user requested consolidation only.
- Preserve the existing uncommitted report cleanup and make a narrow heading integration.

## Validation

- Focused short-link repository tests.
- Auth Functions build and test suite.
- Coupon unit tests and production build.
- Production callable request for Nicolli over 90 days.
- Production HTML/bundle readback and existing redirect URL checks.
