import type {
  GetShortLinkMetricsResult,
  ShortLinkMetricsDailyItem,
  ShortLinkMetricsRangeDays,
  ShortLinkMetricsTopItem,
} from "./types";

export const demoShortLinkMetricsReportId = "rpt_DudaDemo9Xc4Pn7";

const dayInMs = 24 * 60 * 60 * 1000;

const getDateKey = (date: Date) => date.toISOString().slice(0, 10);

const getRate = (value: number, total: number) =>
  total > 0 ? Math.round((value / total) * 1000) / 10 : 0;

const getTopItemsTotal = (items: ShortLinkMetricsTopItem[]) =>
  items.reduce((total, item) => total + item.count, 0);

const scaleTopItems = (
  items: Array<{ label: string; weight: number }>,
  total: number,
): ShortLinkMetricsTopItem[] => {
  const scaledItems = items.map((item) => ({
    count: Math.max(1, Math.round(total * item.weight)),
    label: item.label,
  }));
  const delta = total - getTopItemsTotal(scaledItems);

  scaledItems[0].count += delta;

  return scaledItems;
};

const buildDailyItems = (
  rangeDays: ShortLinkMetricsRangeDays,
): ShortLinkMetricsDailyItem[] => {
  const now = new Date();
  const rangeScale = rangeDays === 7 ? 1.26 : rangeDays === 30 ? 1 : 0.68;
  const dailyGrowth = rangeDays === 7 ? 22 : rangeDays === 30 ? 15.5 : 8.2;

  return Array.from({ length: rangeDays }, (_, index) => {
    const date = new Date(now.getTime() - (rangeDays - index - 1) * dayInMs);
    const wave = 0.78 + (index % 6) * 0.11;
    const launchLift = index > rangeDays * 0.68 ? 1.32 : 1;
    const weekendLift = index % 7 === 5 || index % 7 === 6 ? 1.18 : 1;
    const clicks = Math.round(
      (820 * rangeScale + index * dailyGrowth) *
        wave *
        launchLift *
        weekendLift,
    );
    const registrationViews = Math.round(
      clicks * (0.155 - (index % 4) * 0.006),
    );
    const accountCreations = Math.round(
      registrationViews * (0.29 + (index % 3) * 0.014),
    );
    const checkoutStarts = Math.round(
      accountCreations * (0.16 - (index % 5) * 0.004),
    );
    const paymentViews = Math.round(
      checkoutStarts * (0.52 + (index % 4) * 0.01),
    );
    const paymentsConfirmed = Math.round(
      paymentViews * (0.34 + (index % 5) * 0.012),
    );
    const enrollments = Math.round(
      paymentsConfirmed * (0.805 + (index % 3) * 0.02),
    );

    return {
      accountCreations,
      checkoutStarts,
      clicks,
      date: getDateKey(date),
      enrollments,
      paymentsConfirmed,
      paymentViews,
      registrationViews,
    };
  });
};

const sumDaily = (
  daily: ShortLinkMetricsDailyItem[],
  key: keyof Omit<ShortLinkMetricsDailyItem, "date">,
) => daily.reduce((total, item) => total + item[key], 0);

export const getDemoShortLinkMetrics = (
  rangeDays: ShortLinkMetricsRangeDays = 7,
): GetShortLinkMetricsResult => {
  const daily = buildDailyItems(rangeDays);
  const clicks = sumDaily(daily, "clicks");
  const registrationViews = sumDaily(daily, "registrationViews");
  const accountCreations = sumDaily(daily, "accountCreations");
  const checkoutStarts = sumDaily(daily, "checkoutStarts");
  const paymentViews = sumDaily(daily, "paymentViews");
  const paymentsConfirmed = sumDaily(daily, "paymentsConfirmed");
  const enrollments = sumDaily(daily, "enrollments");
  const fallbackPaymentViews = Math.round(paymentViews * 0.09);
  const fallbackEnrollments = Math.round(enrollments * 0.07);

  return {
    daily,
    details: {
      attribution: {
        exactEnrollments: enrollments - fallbackEnrollments,
        exactPaymentViews: paymentViews - fallbackPaymentViews,
        fallbackEnrollments,
        fallbackPaymentViews,
      },
      clickHeatmap: [
        { count: Math.round(clicks * 0.12), hour: 20, weekday: "quinta-feira" },
        { count: Math.round(clicks * 0.11), hour: 21, weekday: "domingo" },
        { count: Math.round(clicks * 0.1), hour: 19, weekday: "terça-feira" },
        { count: Math.round(clicks * 0.09), hour: 18, weekday: "quarta-feira" },
        { count: Math.round(clicks * 0.08), hour: 22, weekday: "sexta-feira" },
        { count: Math.round(clicks * 0.07), hour: 12, weekday: "sábado" },
        {
          count: Math.round(clicks * 0.06),
          hour: 15,
          weekday: "segunda-feira",
        },
        { count: Math.round(clicks * 0.05), hour: 9, weekday: "terça-feira" },
      ],
      eventBreakdown: {
        account_created: accountCreations,
        checkout_created: checkoutStarts,
        payment_confirmed: paymentsConfirmed,
        payment_viewed: paymentViews,
        registration_viewed: registrationViews,
        subscription_created: enrollments,
      },
      privacyThreshold: 5,
      statusBreakdown: {
        redirected: clicks,
      },
      topCities: scaleTopItems(
        [
          { label: "São Paulo, SP", weight: 0.24 },
          { label: "Uberlândia, MG", weight: 0.18 },
          { label: "Belo Horizonte, MG", weight: 0.15 },
          { label: "Rio de Janeiro, RJ", weight: 0.11 },
          { label: "Curitiba, PR", weight: 0.08 },
        ],
        Math.round(clicks * 0.76),
      ),
      topClickHours: scaleTopItems(
        [
          { label: "20h", weight: 0.2 },
          { label: "21h", weight: 0.17 },
          { label: "19h", weight: 0.15 },
          { label: "18h", weight: 0.12 },
          { label: "12h", weight: 0.09 },
        ],
        Math.round(clicks * 0.73),
      ),
      topClickWeekdays: scaleTopItems(
        [
          { label: "quinta-feira", weight: 0.2 },
          { label: "domingo", weight: 0.17 },
          { label: "terça-feira", weight: 0.16 },
          { label: "quarta-feira", weight: 0.13 },
          { label: "sexta-feira", weight: 0.12 },
        ],
        Math.round(clicks * 0.78),
      ),
      topDevices: scaleTopItems(
        [
          { label: "mobile", weight: 0.86 },
          { label: "desktop", weight: 0.1 },
          { label: "tablet", weight: 0.03 },
          { label: "other", weight: 0.01 },
        ],
        clicks,
      ),
      topReferrers: scaleTopItems(
        [
          { label: "instagram.com", weight: 0.52 },
          { label: "tiktok.com", weight: 0.24 },
          { label: "direto", weight: 0.14 },
          { label: "whatsapp.com", weight: 0.08 },
        ],
        Math.round(clicks * 0.98),
      ),
      topRegions: scaleTopItems(
        [
          { label: "SP, BR", weight: 0.32 },
          { label: "MG, BR", weight: 0.29 },
          { label: "RJ, BR", weight: 0.14 },
          { label: "PR, BR", weight: 0.1 },
          { label: "GO, BR", weight: 0.07 },
        ],
        Math.round(clicks * 0.92),
      ),
      topUtms: {
        campaign: scaleTopItems(
          [
            { label: "campanha-duda-demo-2026", weight: 0.82 },
            { label: "remarketing-duda-demo", weight: 0.18 },
          ],
          clicks,
        ),
        content: scaleTopItems(
          [
            { label: "story", weight: 0.34 },
            { label: "reels", weight: 0.27 },
            { label: "bio", weight: 0.2 },
            { label: "post", weight: 0.12 },
            { label: "whatsapp", weight: 0.07 },
          ],
          clicks,
        ),
        medium: scaleTopItems(
          [
            { label: "social", weight: 0.72 },
            { label: "profile", weight: 0.18 },
            { label: "dm", weight: 0.1 },
          ],
          clicks,
        ),
        source: scaleTopItems(
          [
            { label: "instagram", weight: 0.58 },
            { label: "tiktok", weight: 0.26 },
            { label: "whatsapp", weight: 0.1 },
            { label: "direto", weight: 0.06 },
          ],
          clicks,
        ),
        term: scaleTopItems(
          [
            { label: "ingles-online", weight: 0.44 },
            { label: "aulas-ao-vivo", weight: 0.33 },
            { label: "cupom", weight: 0.23 },
          ],
          Math.round(clicks * 0.62),
        ),
      },
    },
    funnel: {
      accountCreatedRate: getRate(accountCreations, registrationViews),
      accountCreations,
      checkoutStartRate: getRate(checkoutStarts, accountCreations || clicks),
      checkoutStarts,
      clickToEnrollmentRate: getRate(enrollments, clicks),
      clickToPaymentViewRate: getRate(paymentViews, clicks),
      clicks,
      enrollments,
      paymentConfirmRate: getRate(paymentsConfirmed, paymentViews),
      paymentsConfirmed,
      paymentViewToEnrollmentRate: getRate(enrollments, paymentViews),
      paymentViews,
      registrationViewRate: getRate(registrationViews, clicks),
      registrationViews,
    },
    link: {
      active: true,
      campaignId: "campanha-duda-demo-2026",
      campaignName: "Campanha Duda Demo",
      couponCode: "DUDA10",
      discountLabel: "10% off todos os meses",
      id: demoShortLinkMetricsReportId,
      influencerId: "duda-demo",
      influencerName: "Duda",
      slug: "duda10",
      title: "Campanha Duda 10",
      type: "checkout",
    },
    rangeDays,
  };
};
