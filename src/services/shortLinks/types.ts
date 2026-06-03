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
  campaignName: string | null;
  couponCode: string | null;
  destinationUrl: string;
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

export interface ShortLinkClickModel extends ClickContext {
  campaignName: string | null;
  couponCode: string | null;
  createdAt: Timestamp | null;
  destinationUrl: string;
  influencerName: string | null;
  linkTitle: string;
  medium: string | null;
  slug: string;
  source: string | null;
  status: ShortLinkClickStatus;
  type: ShortLinkType;
}
