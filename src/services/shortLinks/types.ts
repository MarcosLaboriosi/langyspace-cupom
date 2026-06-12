import type { Timestamp } from "firebase/firestore/lite";

export const shortLinkTypes = [
  "whatsapp",
  "website",
  "landing_page",
  "form",
  "checkout",
  "other",
] as const;

export type ShortLinkType = (typeof shortLinkTypes)[number];

export type ShortLinkClickStatus =
  | "redirected"
  | "inactive"
  | "invalid_destination";

export interface ShortLinkModel {
  active: boolean;
  campaignId: string | null;
  campaignName: string | null;
  couponCode: string | null;
  destinationUrl: string;
  influencerId: string | null;
  influencerName: string | null;
  medium: string | null;
  slug: string;
  source: string | null;
  title: string;
  type: ShortLinkType;
}

export interface UtmParams {
  utm_campaign: string | null;
  utm_content: string | null;
  utm_medium: string | null;
  utm_source: string | null;
  utm_term: string | null;
}

export interface ClickContext extends UtmParams {
  fullUrl: string;
  pathname: string;
  referrer: string | null;
  userAgent: string;
}

export interface ResolveShortLinkRedirectInput {
  clickContext: ClickContext;
  slug: string;
}

export interface ResolveShortLinkRedirectResult {
  destinationUrl: string;
  shortLinkClickId?: string;
}

export interface ShortLinkClickModel extends ClickContext {
  campaignId: string | null;
  campaignName: string | null;
  couponCode: string | null;
  createdAt: Timestamp | null;
  destinationUrl: string;
  influencerId: string | null;
  influencerName: string | null;
  linkTitle: string;
  medium: string | null;
  slug: string;
  source: string | null;
  status: ShortLinkClickStatus;
  type: ShortLinkType;
}

export type ShortLinkMetricsRangeDays = 7 | 30 | 90;

export interface GetShortLinkMetricsInput {
  id: string;
  rangeDays?: ShortLinkMetricsRangeDays;
}

export interface ShortLinkMetricsLink {
  active: boolean;
  campaignId: string | null;
  campaignName: string | null;
  couponCode: string | null;
  discountLabel: string | null;
  id: string;
  influencerId: string | null;
  influencerName: string | null;
  slug: string;
  title: string;
  type: ShortLinkType;
}

export interface ShortLinkMetricsFunnel {
  accountCreatedRate: number;
  accountCreations: number;
  checkoutStartRate: number;
  checkoutStarts: number;
  clickToEnrollmentRate: number;
  clickToPaymentViewRate: number;
  clicks: number;
  enrollments: number;
  paymentConfirmRate: number;
  paymentsConfirmed: number;
  paymentViewToEnrollmentRate: number;
  paymentViews: number;
  registrationViewRate: number;
  registrationViews: number;
}

export interface ShortLinkMetricsDailyItem {
  accountCreations: number;
  checkoutStarts: number;
  clicks: number;
  date: string;
  enrollments: number;
  paymentsConfirmed: number;
  paymentViews: number;
  registrationViews: number;
}

export interface ShortLinkMetricsTopItem {
  count: number;
  label: string;
}

export interface ShortLinkMetricsHeatmapItem {
  count: number;
  hour: number;
  weekday: string;
}

export interface ShortLinkMetricsDetails {
  attribution: {
    exactEnrollments: number;
    exactPaymentViews: number;
    fallbackEnrollments: number;
    fallbackPaymentViews: number;
  };
  eventBreakdown: Partial<
    Record<
      | "checkout_created"
      | "payment_viewed"
      | "payment_confirmed"
      | "registration_viewed"
      | "account_created"
      | "subscription_created",
      number
    >
  >;
  clickHeatmap: ShortLinkMetricsHeatmapItem[];
  privacyThreshold: number;
  statusBreakdown: Record<string, number>;
  topCities: ShortLinkMetricsTopItem[];
  topClickHours: ShortLinkMetricsTopItem[];
  topClickWeekdays: ShortLinkMetricsTopItem[];
  topDevices: ShortLinkMetricsTopItem[];
  topReferrers: ShortLinkMetricsTopItem[];
  topRegions: ShortLinkMetricsTopItem[];
  topUtms: {
    campaign: ShortLinkMetricsTopItem[];
    content: ShortLinkMetricsTopItem[];
    medium: ShortLinkMetricsTopItem[];
    source: ShortLinkMetricsTopItem[];
    term: ShortLinkMetricsTopItem[];
  };
}

export interface GetShortLinkMetricsResult {
  daily: ShortLinkMetricsDailyItem[];
  details: ShortLinkMetricsDetails;
  funnel: ShortLinkMetricsFunnel;
  link: ShortLinkMetricsLink;
  rangeDays: ShortLinkMetricsRangeDays;
}
