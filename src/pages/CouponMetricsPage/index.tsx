import { useEffect, useMemo, useState } from "react";
import logoWhiteSrc from "@/assets/horizontal-logo-white.svg";
import {
  getShortLinkMetrics,
  type GetShortLinkMetricsResult,
  type ShortLinkMetricsRangeDays,
} from "@/services/shortLinks";
import {
  eventLabels,
  formatCompactNumber,
  formatDateLabel,
  formatPercent,
  getDailyMax,
  getTopItemsOrFallback,
  rangeOptions,
  statusLabels,
} from "./utils";

interface CouponMetricsPageProps {
  id: string;
}

export function CouponMetricsPage({ id }: CouponMetricsPageProps) {
  const [rangeDays, setRangeDays] = useState<ShortLinkMetricsRangeDays>(30);
  const [metrics, setMetrics] = useState<GetShortLinkMetricsResult | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const dailyMax = useMemo(
    () => getDailyMax(metrics?.daily ?? []),
    [metrics?.daily],
  );

  useEffect(() => {
    let isCurrent = true;

    setIsLoading(true);
    setErrorMessage("");

    getShortLinkMetrics(id, rangeDays)
      .then((nextMetrics) => {
        if (!isCurrent) return;

        setMetrics(nextMetrics);
      })
      .catch(() => {
        if (!isCurrent) return;

        setErrorMessage("Não foi possível carregar este relatório.");
        setMetrics(null);
      })
      .finally(() => {
        if (!isCurrent) return;

        setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [id, rangeDays]);

  const pageTitle = metrics?.link.title ?? "Relatório de cupom";
  const pageMeta = metrics?.link.couponCode
    ? `${metrics.link.couponCode} · ${metrics.link.campaignName ?? "campanha"}`
    : "relatório público";
  const kpis = metrics
    ? [
        {
          label: "Cliques no link",
          meta: "acessos registrados",
          tone: "dark",
          value: formatCompactNumber(metrics.funnel.clicks),
        },
        {
          label: "Tela de pagamento",
          meta: `${formatPercent(metrics.funnel.clickToPaymentViewRate)} dos cliques`,
          tone: "light",
          value: formatCompactNumber(metrics.funnel.paymentViews),
        },
        {
          label: "Matrículas",
          meta: `${formatPercent(metrics.funnel.clickToEnrollmentRate)} dos cliques`,
          tone: "pink",
          value: formatCompactNumber(metrics.funnel.enrollments),
        },
        {
          label: "Pagamento → matrícula",
          meta: "conversão final",
          tone: "light",
          value: formatPercent(metrics.funnel.paymentViewToEnrollmentRate),
        },
      ]
    : [];

  return (
    <main className="coupon-report">
      <header className="coupon-report__hero">
        <div className="coupon-report__hero-inner">
          <img
            alt="Langy.space"
            className="coupon-report__logo"
            src={logoWhiteSrc}
          />
          <div className="coupon-report__heading">
            <p className="coupon-report__eyebrow">relatório de cupom</p>
            <h1>{pageTitle}</h1>
            <p>{pageMeta}</p>
          </div>
          <div className="coupon-report__ranges" aria-label="Período">
            {rangeOptions.map((option) => (
              <button
                aria-pressed={option === rangeDays}
                className="coupon-report__range"
                key={option}
                type="button"
                onClick={() => setRangeDays(option)}
              >
                {option}d
              </button>
            ))}
          </div>
        </div>
      </header>
      <section className="coupon-report__content" aria-busy={isLoading}>
        {errorMessage ? (
          <div className="coupon-report__state" role="alert">
            <strong>{errorMessage}</strong>
            <span>
              Confira o id do relatório ou tente novamente em alguns instantes.
            </span>
          </div>
        ) : isLoading && !metrics ? (
          <div className="coupon-report__kpi-grid">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                className="coupon-report__kpi"
                data-loading="true"
                key={index}
              >
                <span />
                <strong />
                <small />
              </div>
            ))}
          </div>
        ) : metrics ? (
          <>
            <section className="coupon-report__kpi-grid" aria-label="Funil">
              {kpis.map((kpi) => (
                <article
                  className="coupon-report__kpi"
                  data-tone={kpi.tone}
                  key={kpi.label}
                >
                  <span>{kpi.label}</span>
                  <strong>{kpi.value}</strong>
                  <small>{kpi.meta}</small>
                </article>
              ))}
            </section>
            <section className="coupon-report__grid">
              <article className="coupon-report__panel coupon-report__panel--wide">
                <div className="coupon-report__panel-header">
                  <div>
                    <h2>Série diária</h2>
                    <p>{rangeDays} dias</p>
                  </div>
                </div>
                <div className="coupon-report__chart">
                  {metrics.daily.map((item) => (
                    <div className="coupon-report__chart-day" key={item.date}>
                      <div className="coupon-report__bars">
                        <span
                          data-kind="clicks"
                          style={{
                            height: `${Math.max(6, (item.clicks / dailyMax) * 100)}%`,
                          }}
                        />
                        <span
                          data-kind="payment"
                          style={{
                            height: `${Math.max(
                              6,
                              (item.paymentViews / dailyMax) * 100,
                            )}%`,
                          }}
                        />
                        <span
                          data-kind="enrollment"
                          style={{
                            height: `${Math.max(
                              6,
                              (item.enrollments / dailyMax) * 100,
                            )}%`,
                          }}
                        />
                      </div>
                      <small>{formatDateLabel(item.date)}</small>
                    </div>
                  ))}
                </div>
                <div className="coupon-report__legend">
                  <span data-kind="clicks">Cliques</span>
                  <span data-kind="payment">Pagamento</span>
                  <span data-kind="enrollment">Matrículas</span>
                </div>
              </article>
              <article className="coupon-report__panel">
                <div className="coupon-report__panel-header">
                  <div>
                    <h2>Atribuição</h2>
                    <p>exata + fallback por cupom</p>
                  </div>
                </div>
                <div className="coupon-report__stat-list">
                  <div>
                    <span>Pagamentos atribuídos</span>
                    <strong>
                      {metrics.details.attribution.exactPaymentViews}
                    </strong>
                  </div>
                  <div>
                    <span>Pagamentos por cupom</span>
                    <strong>
                      {metrics.details.attribution.fallbackPaymentViews}
                    </strong>
                  </div>
                  <div>
                    <span>Matrículas atribuídas</span>
                    <strong>
                      {metrics.details.attribution.exactEnrollments}
                    </strong>
                  </div>
                  <div>
                    <span>Matrículas por cupom</span>
                    <strong>
                      {metrics.details.attribution.fallbackEnrollments}
                    </strong>
                  </div>
                </div>
              </article>
              <article className="coupon-report__panel">
                <div className="coupon-report__panel-header">
                  <div>
                    <h2>Origem</h2>
                    <p>principais referências</p>
                  </div>
                </div>
                <div className="coupon-report__rank-list">
                  {getTopItemsOrFallback(metrics.details.topReferrers).map(
                    (item) => (
                      <div key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.count}</strong>
                      </div>
                    ),
                  )}
                </div>
              </article>
              <article className="coupon-report__panel">
                <div className="coupon-report__panel-header">
                  <div>
                    <h2>UTM source</h2>
                    <p>origem da campanha</p>
                  </div>
                </div>
                <div className="coupon-report__rank-list">
                  {getTopItemsOrFallback(metrics.details.topUtms.source).map(
                    (item) => (
                      <div key={item.label}>
                        <span>{item.label}</span>
                        <strong>{item.count}</strong>
                      </div>
                    ),
                  )}
                </div>
              </article>
              <article className="coupon-report__panel">
                <div className="coupon-report__panel-header">
                  <div>
                    <h2>Eventos</h2>
                    <p>conversões registradas</p>
                  </div>
                </div>
                <div className="coupon-report__rank-list">
                  {Object.entries(metrics.details.eventBreakdown).map(
                    ([eventType, count]) => (
                      <div key={eventType}>
                        <span>{eventLabels[eventType] ?? eventType}</span>
                        <strong>{count}</strong>
                      </div>
                    ),
                  )}
                </div>
              </article>
              <article className="coupon-report__panel">
                <div className="coupon-report__panel-header">
                  <div>
                    <h2>Status dos cliques</h2>
                    <p>qualidade do link</p>
                  </div>
                </div>
                <div className="coupon-report__rank-list">
                  {Object.entries(metrics.details.statusBreakdown).map(
                    ([status, count]) => (
                      <div key={status}>
                        <span>{statusLabels[status] ?? status}</span>
                        <strong>{count}</strong>
                      </div>
                    ),
                  )}
                </div>
              </article>
            </section>
          </>
        ) : null}
      </section>
    </main>
  );
}
