import type {
  ClickContext,
  ShortLinkModel,
  ShortLinkType,
  UtmParams,
} from "./types";
import { shortLinkTypes } from "./types";

const slugPattern = /^[a-z0-9][a-z0-9_-]{0,79}$/;

const siteRedirectTypes = new Set<ShortLinkType>([
  "website",
  "landing_page",
  "form",
  "checkout",
]);

const utmKeys = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

const trimToMaxLength = (value: string, maxLength: number) =>
  value.trim().slice(0, maxLength);

const readString = (value: unknown, maxLength = 300) =>
  typeof value === "string" && value.trim().length > 0
    ? trimToMaxLength(value, maxLength)
    : null;

const removeSearchAndHash = (value: string) => {
  try {
    const url = new URL(value);

    return `${url.origin}${url.pathname}`;
  } catch {
    return trimToMaxLength(value.split(/[?#]/)[0] ?? "", 500) || null;
  }
};

export const normalizeSlug = (pathname: string) => {
  const [firstSegment = ""] = pathname.replace(/^\/+|\/+$/g, "").split("/");

  return firstSegment.toLowerCase().replace(/\s+/g, "");
};

export const isValidSlug = (slug: string) => slugPattern.test(slug);

export const isShortLinkType = (value: unknown): value is ShortLinkType =>
  typeof value === "string" && shortLinkTypes.includes(value as ShortLinkType);

export const isValidDestinationUrl = (destinationUrl: string) => {
  if (!destinationUrl.startsWith("https://")) {
    return false;
  }

  try {
    const url = new URL(destinationUrl);

    return url.protocol === "https:";
  } catch {
    return false;
  }
};

export const mapShortLinkData = (
  slug: string,
  data: Record<string, unknown>,
): ShortLinkModel => ({
  active: data.active === true,
  campaignName: readString(data.campaignName),
  couponCode: readString(data.couponCode, 120),
  destinationUrl: readString(data.destinationUrl, 2000) ?? "",
  influencerName: readString(data.influencerName, 180),
  medium: readString(data.medium, 120),
  slug,
  source: readString(data.source, 120),
  title: readString(data.title, 220) ?? slug,
  type: isShortLinkType(data.type) ? data.type : "other",
});

export const readUtmParams = (searchParams: URLSearchParams): UtmParams =>
  utmKeys.reduce(
    (utmParams, key) => ({
      ...utmParams,
      [key]: readString(searchParams.get(key), 220),
    }),
    {
      utm_campaign: null,
      utm_content: null,
      utm_medium: null,
      utm_source: null,
      utm_term: null,
    },
  );

export const hasUtmParams = (utmParams: UtmParams) =>
  utmKeys.some(
    (key) => typeof utmParams[key] === "string" && utmParams[key].length > 0,
  );

export const buildSanitizedFullUrl = (
  location: Location,
  utmParams: UtmParams,
) => {
  const sanitizedUrl = new URL(`${location.origin}${location.pathname}`);

  utmKeys.forEach((key) => {
    const value = utmParams[key];

    if (value) {
      sanitizedUrl.searchParams.set(key, value);
    }
  });

  return sanitizedUrl.toString();
};

export const getClickContext = (
  location: Location,
  documentReferrer: string,
): ClickContext => {
  const utmParams = readUtmParams(new URLSearchParams(location.search));

  return {
    ...utmParams,
    fullUrl: buildSanitizedFullUrl(location, utmParams),
    pathname: location.pathname,
    referrer: documentReferrer ? removeSearchAndHash(documentReferrer) : null,
    userAgent: trimToMaxLength(window.navigator.userAgent, 500),
  };
};

export const buildRedirectDestination = (
  link: ShortLinkModel,
  utmParams: UtmParams,
) => {
  if (!siteRedirectTypes.has(link.type) || !hasUtmParams(utmParams)) {
    return link.destinationUrl;
  }

  try {
    const destinationUrl = new URL(link.destinationUrl);

    utmKeys.forEach((key) => {
      const value = utmParams[key];

      if (value && !destinationUrl.searchParams.has(key)) {
        destinationUrl.searchParams.set(key, value);
      }
    });

    return destinationUrl.toString();
  } catch {
    return link.destinationUrl;
  }
};

export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      window.setTimeout(
        () => reject(new Error("Timed out while recording short link click")),
        timeoutMs,
      );
    }),
  ]);
