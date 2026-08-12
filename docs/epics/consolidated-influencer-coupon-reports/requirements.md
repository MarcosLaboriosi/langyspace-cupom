# Requirements

## Business rules

1. The requested report document remains the primary link returned by the API.
2. When that document has an `influencerId`, include every `short_links` document with the same
   influencer and a non-empty `couponCode`.
3. When there is no `influencerId`, aggregate only the requested link.
4. Include historical sibling links regardless of active state so previous campaign results remain
   visible.
5. Deduplicate clicks and conversions by Firestore document ID.
6. A conversion is direct-coupon attribution only when its `shortLinkSlug` does not match any link
   in the consolidated group.
7. Keep `link.slug`, `link.id`, and the generated share URLs tied to the requested report.
8. Return only sanitized aggregate metadata; no student or billing records may enter the response.

## Edge cases

- Repeated slug/coupon queries can return the same conversion and must count it once.
- Another influencer's coupon must not enter the group.
- A same-influencer link without a coupon must not enter the coupon report.
- Coupon codes must be unique and deterministically sorted for display.

## Acceptance criteria

- Backend unit coverage proves sibling aggregation, deduplication, and isolation.
- Existing backend report tests continue to pass.
- Frontend types and heading render a multi-code report without changing the primary public link.
- Frontend tests/build and auth Functions build/tests pass.
- Production callable and served bundle confirm the consolidated response and label.
