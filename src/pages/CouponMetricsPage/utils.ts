import type {
  GetShortLinkMetricsResult,
  ShortLinkMetricsDailyItem,
  ShortLinkMetricsTopItem,
} from "@/services/shortLinks";

export const rangeOptions = [7, 30, 90] as const;

export interface ShareLink {
  description: string;
  label: string;
  url: string;
}

export const formatPercent = (value: number) =>
  `${value.toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  })}%`;

export const formatCompactNumber = (value: number) =>
  value.toLocaleString("pt-BR");

export const formatDateLabel = (dateKey: string) => {
  const [, month = "", day = ""] = dateKey.split("-");

  return `${day}/${month}`;
};

export const getDailyMax = (daily: ShortLinkMetricsDailyItem[]) =>
  Math.max(
    1,
    ...daily.flatMap((item) => [
      item.clicks,
      item.enrollments,
      item.paymentViews,
      item.paymentsConfirmed,
    ]),
  );

export const getTopItemsOrFallback = (
  items: ShortLinkMetricsTopItem[],
  label = "Aguardando volume",
): ShortLinkMetricsTopItem[] =>
  items.length > 0 ? items : [{ count: 0, label }];

export const getStepRate = (value: number, previousValue: number) =>
  previousValue > 0 ? Math.round((value / previousValue) * 1000) / 10 : 0;

export const getBestDailyItem = (daily: ShortLinkMetricsDailyItem[]) =>
  daily.reduce<ShortLinkMetricsDailyItem | null>((bestItem, item) => {
    if (!bestItem || item.clicks > bestItem.clicks) {
      return item;
    }

    return bestItem;
  }, null);

export const formatItemLabel = (label: string) => {
  if (label === "sem valor") {
    return "Sem marcação";
  }

  if (label === "mobile") {
    return "Celular";
  }

  if (label === "desktop") {
    return "Computador";
  }

  if (label === "tablet") {
    return "Tablet";
  }

  if (label === "other") {
    return "Outro dispositivo";
  }

  return label;
};

const buildShareLinkUrl = ({
  campaign,
  content,
  medium,
  origin,
  slug,
  source,
}: {
  campaign: string;
  content: string;
  medium: string;
  origin: string;
  slug: string;
  source: string;
}) => {
  const url = new URL(`/${slug}`, origin);

  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  url.searchParams.set("utm_campaign", campaign);
  url.searchParams.set("utm_content", content);

  return url.toString();
};

export const buildShareLinks = (
  metrics: GetShortLinkMetricsResult,
  origin: string,
): ShareLink[] => {
  const campaign = metrics.link.campaignId ?? metrics.link.slug;
  const slug = metrics.link.slug;

  return [
    {
      description: "Use na bio ou link fixado.",
      label: "Bio",
      url: buildShareLinkUrl({
        campaign,
        content: "bio",
        medium: "profile",
        origin,
        slug,
        source: "instagram",
      }),
    },
    {
      description: "Use em stories com CTA.",
      label: "Story",
      url: buildShareLinkUrl({
        campaign,
        content: "story",
        medium: "social",
        origin,
        slug,
        source: "instagram",
      }),
    },
    {
      description: "Use em legenda ou comentario fixado.",
      label: "Reels",
      url: buildShareLinkUrl({
        campaign,
        content: "reels",
        medium: "social",
        origin,
        slug,
        source: "instagram",
      }),
    },
    {
      description: "Use em post estatico ou carrossel.",
      label: "Post",
      url: buildShareLinkUrl({
        campaign,
        content: "post",
        medium: "social",
        origin,
        slug,
        source: "instagram",
      }),
    },
    {
      description: "Use em grupos ou conversa direta.",
      label: "WhatsApp",
      url: buildShareLinkUrl({
        campaign,
        content: "whatsapp",
        medium: "dm",
        origin,
        slug,
        source: "whatsapp",
      }),
    },
  ];
};
