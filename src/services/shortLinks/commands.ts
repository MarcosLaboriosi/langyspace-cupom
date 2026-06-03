import { addDoc, collection, serverTimestamp } from "firebase/firestore/lite";
import { SHORT_LINK_CLICKS_COLLECTION } from "@/config/constants";
import { db } from "@/lib/firebase/firestore";
import type {
  ClickContext,
  ShortLinkClickStatus,
  ShortLinkModel,
} from "./types";

interface RecordShortLinkClickInput {
  clickContext: ClickContext;
  destinationUrl: string;
  link: ShortLinkModel;
  status: ShortLinkClickStatus;
}

export const recordShortLinkClick = async ({
  clickContext,
  destinationUrl,
  link,
  status,
}: RecordShortLinkClickInput): Promise<void> => {
  await addDoc(collection(db, SHORT_LINK_CLICKS_COLLECTION), {
    campaignName: link.campaignName,
    couponCode: link.couponCode,
    createdAt: serverTimestamp(),
    destinationUrl,
    fullUrl: clickContext.fullUrl,
    influencerName: link.influencerName,
    linkTitle: link.title,
    medium: link.medium,
    pathname: clickContext.pathname,
    referrer: clickContext.referrer,
    slug: link.slug,
    source: link.source,
    status,
    type: link.type,
    userAgent: clickContext.userAgent,
    utm_campaign: clickContext.utm_campaign,
    utm_content: clickContext.utm_content,
    utm_medium: clickContext.utm_medium,
    utm_source: clickContext.utm_source,
    utm_term: clickContext.utm_term,
  });
};
