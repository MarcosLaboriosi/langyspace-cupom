import {
  collection,
  getDocs,
  limit as limitQuery,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore/lite";
import {
  SHORT_LINK_CLICKS_COLLECTION,
  SHORT_LINKS_COLLECTION,
} from "@/config/constants";
import { db } from "@/lib/firebase/firestore";
import type { ShortLinkClickModel, ShortLinkModel } from "./types";
import { mapShortLinkData } from "./utils";

export interface ShortLinkMetricsSummary {
  clicksByCampaign: Record<string, number>;
  clicksByCoupon: Record<string, number>;
  clicksByInfluencer: Record<string, number>;
  clicksBySlug: Record<string, number>;
  clicksByType: Record<string, number>;
  totalClicks: number;
}

const incrementCounter = (
  counters: Record<string, number>,
  key: string | null,
) => {
  const counterKey = key ?? "sem valor";

  counters[counterKey] = (counters[counterKey] ?? 0) + 1;
};

export const listShortLinksForMetrics = async (): Promise<ShortLinkModel[]> => {
  const snapshot = await getDocs(collection(db, SHORT_LINKS_COLLECTION));

  return snapshot.docs.map((documentSnapshot) =>
    mapShortLinkData(documentSnapshot.id, documentSnapshot.data()),
  );
};

export const listRecentShortLinkClicks = async (
  recentLimit = 50,
): Promise<ShortLinkClickModel[]> => {
  const snapshot = await getDocs(
    query(
      collection(db, SHORT_LINK_CLICKS_COLLECTION),
      orderBy("createdAt", "desc"),
      limitQuery(recentLimit),
    ),
  );

  return snapshot.docs.map((documentSnapshot) => {
    const data = documentSnapshot.data();

    return {
      campaignName:
        typeof data.campaignName === "string" ? data.campaignName : null,
      couponCode: typeof data.couponCode === "string" ? data.couponCode : null,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
      destinationUrl:
        typeof data.destinationUrl === "string" ? data.destinationUrl : "",
      fullUrl: typeof data.fullUrl === "string" ? data.fullUrl : "",
      influencerName:
        typeof data.influencerName === "string" ? data.influencerName : null,
      linkTitle: typeof data.linkTitle === "string" ? data.linkTitle : "",
      medium: typeof data.medium === "string" ? data.medium : null,
      pathname: typeof data.pathname === "string" ? data.pathname : "",
      referrer: typeof data.referrer === "string" ? data.referrer : null,
      slug: typeof data.slug === "string" ? data.slug : "",
      source: typeof data.source === "string" ? data.source : null,
      status:
        data.status === "inactive" || data.status === "invalid_destination"
          ? data.status
          : "redirected",
      type:
        data.type === "whatsapp" ||
        data.type === "website" ||
        data.type === "landing_page" ||
        data.type === "form" ||
        data.type === "checkout"
          ? data.type
          : "other",
      userAgent: typeof data.userAgent === "string" ? data.userAgent : "",
      utm_campaign:
        typeof data.utm_campaign === "string" ? data.utm_campaign : null,
      utm_content:
        typeof data.utm_content === "string" ? data.utm_content : null,
      utm_medium: typeof data.utm_medium === "string" ? data.utm_medium : null,
      utm_source: typeof data.utm_source === "string" ? data.utm_source : null,
      utm_term: typeof data.utm_term === "string" ? data.utm_term : null,
    };
  });
};

export const summarizeShortLinkClicks = (
  clicks: ShortLinkClickModel[],
): ShortLinkMetricsSummary => {
  const summary: ShortLinkMetricsSummary = {
    clicksByCampaign: {},
    clicksByCoupon: {},
    clicksByInfluencer: {},
    clicksBySlug: {},
    clicksByType: {},
    totalClicks: clicks.length,
  };

  clicks.forEach((click) => {
    incrementCounter(summary.clicksByCampaign, click.campaignName);
    incrementCounter(summary.clicksByCoupon, click.couponCode);
    incrementCounter(summary.clicksByInfluencer, click.influencerName);
    incrementCounter(summary.clicksBySlug, click.slug);
    incrementCounter(summary.clicksByType, click.type);
  });

  return summary;
};
