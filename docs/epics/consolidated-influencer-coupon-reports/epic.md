# Consolidated influencer coupon reports

## Problem

An influencer can own multiple coupon links, but each public report currently counts only the
single coupon linked to its `reportId`. Nicolli's existing report therefore excludes the activity
from `NICOLLI15` and `NICOLLI20` even though all three coupons belong to the same influencer.

## Objective

Make every public coupon report consolidate the metrics of all coupon links owned by the same
`influencerId`, while preserving every existing redirect URL, slug, and report URL.

## Scope

- Aggregate clicks and conversion events across sibling coupon links with the same `influencerId`.
- Deduplicate records returned through both slug and coupon-code attribution.
- Expose the consolidated coupon-code list in the sanitized metrics response.
- Show the consolidated coupon codes in the existing report heading.
- Deploy the auth Function and coupon Hosting, then verify Nicolli's existing report URL.

## Out of scope

- Changing `short_links`, redirect destinations, slugs, or report IDs.
- Rewriting historical conversion documents.
- Changing the existing funnel/event counting rules.
- Exposing student, invoice, payment, or other personal data publicly.

## User journey

The user opens any existing report URL for an influencer and sees one consolidated campaign report.
The public link shown by that report remains the link associated with the requested `reportId`.

## Success criteria

- Nicolli's current report displays `NICOLLI10`, `NICOLLI15`, and `NICOLLI20` together.
- Its 90-day aggregates include events and clicks from all three links.
- Existing public redirect and report URLs remain unchanged and operational.
- Reports without an `influencerId` retain their current single-link behavior.
