import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/functions";
import {
  demoShortLinkMetricsReportId,
  getDemoShortLinkMetrics,
} from "./mockMetrics";
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
  id: string,
  rangeDays?: ShortLinkMetricsRangeDays,
): Promise<GetShortLinkMetricsResult> => {
  if (id === demoShortLinkMetricsReportId) {
    return getDemoShortLinkMetrics(rangeDays);
  }

  const response = await getShortLinkMetricsCallable({
    id,
    rangeDays,
  });

  return response.data;
};
