import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/functions";
import type {
  ClickContext,
  GetShortLinkMetricsInput,
  GetShortLinkMetricsResult,
  ResolveShortLinkRedirectInput,
  ResolveShortLinkRedirectResult,
  ShortLinkMetricsRangeDays,
} from "./types";

const resolveShortLinkRedirectCallable = httpsCallable<
  ResolveShortLinkRedirectInput,
  ResolveShortLinkRedirectResult
>(functions, "resolveShortLinkRedirect");

const getShortLinkMetricsCallable = httpsCallable<
  GetShortLinkMetricsInput,
  GetShortLinkMetricsResult
>(functions, "getShortLinkMetrics");

export const resolveShortLinkRedirect = async (
  slug: string,
  clickContext: ClickContext,
): Promise<string> => {
  const response = await resolveShortLinkRedirectCallable({
    clickContext,
    slug,
  });
  const destinationUrl = response.data.destinationUrl;

  if (typeof destinationUrl !== "string" || destinationUrl.length === 0) {
    throw new Error("Invalid short link redirect response");
  }

  return destinationUrl;
};

export const getShortLinkMetrics = async (
  slug: string,
  rangeDays?: ShortLinkMetricsRangeDays,
): Promise<GetShortLinkMetricsResult> => {
  const response = await getShortLinkMetricsCallable({
    rangeDays,
    slug,
  });

  return response.data;
};
