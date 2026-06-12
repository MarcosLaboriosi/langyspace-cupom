import type {
  ShortLinkMetricsDailyItem,
  ShortLinkMetricsTopItem,
} from "@/services/shortLinks";

export const rangeOptions = [7, 30, 90] as const;

export const eventLabels: Record<string, string> = {
  checkout_created: "Checkouts criados",
  payment_confirmed: "Pagamentos confirmados",
  payment_viewed: "Tela de pagamento",
  subscription_created: "Matrículas",
};

export const statusLabels: Record<string, string> = {
  inactive: "Inativos",
  invalid_destination: "Destino inválido",
  redirected: "Redirecionados",
};

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
    ]),
  );

export const getTopItemsOrFallback = (
  items: ShortLinkMetricsTopItem[],
): ShortLinkMetricsTopItem[] =>
  items.length > 0 ? items : [{ count: 0, label: "sem dados" }];
