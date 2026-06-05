import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase/functions";
import type {
  ClickContext,
  ResolveShortLinkRedirectInput,
  ResolveShortLinkRedirectResult,
} from "./types";

const resolveShortLinkRedirectCallable = httpsCallable<
  ResolveShortLinkRedirectInput,
  ResolveShortLinkRedirectResult
>(functions, "resolveShortLinkRedirect");

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
