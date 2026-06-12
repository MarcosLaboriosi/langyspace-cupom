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
  id: string;
  influencerId: string | null;
  influencerName: string | null;
  slug: string;
  title: string;
  type: ShortLinkType;
}

export interface ShortLinkMetricsFunnel {
  clickToEnrollmentRate: number;
  clickToPaymentViewRate: number;
  clicks: number;
  enrollments: number;
  paymentViewToEnrollmentRate: number;
  paymentViews: number;
}

export interface ShortLinkMetricsDailyItem {
  clicks: number;
  date: string;
  enrollments: number;
  paymentViews: number;
}

export interface ShortLinkMetricsTopItem {
  count: number;
  label: string;
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
      | "subscription_created",
      number
    >
  >;
  statusBreakdown: Record<string, number>;
  topReferrers: ShortLinkMetricsTopItem[];
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
