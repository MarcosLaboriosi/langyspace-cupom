import { describe, expect, it } from "vitest";
import { buildShareLinks, getStepRate } from "./utils";
import type { GetShortLinkMetricsResult } from "@/services/shortLinks";

const createMetrics = (): GetShortLinkMetricsResult => ({
  daily: [],
  details: {
    attribution: {
      exactEnrollments: 0,
      exactPaymentViews: 0,
      fallbackEnrollments: 0,
      fallbackPaymentViews: 0,
    },
    clickHeatmap: [],
    eventBreakdown: {},
    privacyThreshold: 5,
    statusBreakdown: {},
    topCities: [],
    topClickHours: [],
    topClickWeekdays: [],
    topDevices: [],
    topReferrers: [],
    topRegions: [],
    topUtms: {
      campaign: [],
      content: [],
      medium: [],
      source: [],
      term: [],
    },
  },
  funnel: {
    accountCreatedRate: 0,
    accountCreations: 0,
    checkoutStartRate: 0,
    checkoutStarts: 0,
    clickToEnrollmentRate: 0,
    clickToPaymentViewRate: 0,
    clicks: 0,
    enrollments: 0,
    paymentConfirmRate: 0,
    paymentsConfirmed: 0,
    paymentViewToEnrollmentRate: 0,
    paymentViews: 0,
    registrationViewRate: 0,
    registrationViews: 0,
  },
  link: {
    active: true,
    campaignId: "embaixadoras-2026",
    campaignName: "Embaixadoras",
    couponCode: "LETICIA10",
    discountLabel: "10% off todos os meses",
    id: "rpt_8Yp2Nq4Tz6Vb1Rc5",
    influencerId: "leticia",
    influencerName: "Letícia",
    slug: "leticia10",
    title: "Cupom Letícia 10",
    type: "checkout",
  },
  rangeDays: 7,
});

describe("CouponMetricsPage utils", () => {
  it("builds ready-to-share links with campaign UTMs", () => {
    const shareLinks = buildShareLinks(
      createMetrics(),
      "https://cupom.langy.space",
    );

    expect(shareLinks[0]).toMatchObject({
      label: "Bio",
      url: "https://cupom.langy.space/leticia10?utm_source=instagram&utm_medium=profile&utm_campaign=embaixadoras-2026&utm_content=bio",
    });
    expect(shareLinks.at(-1)).toMatchObject({
      label: "WhatsApp",
      url: "https://cupom.langy.space/leticia10?utm_source=whatsapp&utm_medium=dm&utm_campaign=embaixadoras-2026&utm_content=whatsapp",
    });
  });

  it("returns zero for rates without a previous funnel step", () => {
    expect(getStepRate(2, 0)).toBe(0);
    expect(getStepRate(3, 10)).toBe(30);
  });
});
