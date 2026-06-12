import { useEffect, useMemo, useState } from "react";
import logoWhiteSrc from "@/assets/horizontal-logo-white.svg";
import {
  getShortLinkMetrics,
  type GetShortLinkMetricsResult,
  type ShortLinkMetricsRangeDays,
  type ShortLinkMetricsTopItem,
} from "@/services/shortLinks";
import {
  buildShareLinks,
  formatCompactNumber,
  formatDateLabel,
  formatItemLabel,
  formatPercent,
  getBestDailyItem,
  getDailyMax,
  getStepRate,
  getTopItemsOrFallback,
  rangeOptions,
} from "./utils";

interface CouponMetricsPageProps {
  id: string;
}

interface RankListProps {
  fallbackLabel?: string;
  items: ShortLinkMetricsTopItem[];
}

function RankList({ fallbackLabel, items }: RankListProps) {
  return (
    <div className="coupon-report__rank-list">
      {getTopItemsOrFallback(items, fallbackLabel).map((item) => (
        <div key={item.label}>
          <span>{formatItemLabel(item.label)}</span>
          <strong>{formatCompactNumber(item.count)}</strong>
        </div>
      ))}
    </div>
  );
}

export function CouponMetricsPage({ id }: CouponMetricsPageProps) {
  const [rangeDays, setRangeDays] = useState<ShortLinkMetricsRangeDays>(7);
  const [metrics, setMetrics] = useState<GetShortLinkMetricsResult | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const dailyMax = useMemo(
    () => getDailyMax(metrics?.daily ?? []),
    [metrics?.daily],
  );
  const bestDay = useMemo(
    () => getBestDailyItem(metrics?.daily ?? []),
    [metrics?.daily],
  );
  const shareLinks = useMemo(
    () => (metrics ? buildShareLinks(metrics, window.location.origin) : []),
    [metrics],
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

  const pageTitle = metrics?.link.influencerName
    ? `Campanha da ${metrics.link.influencerName}`
    : (metrics?.link.title ?? "Relatório de campanha");
  const pageMeta = metrics?.link.couponCode
    ? `${metrics.link.couponCode} · ${metrics.link.discountLabel ?? metrics.link.campaignName ?? "campanha"}`
    : "";
  const publicLink = metrics
    ? new URL(`/${metrics.link.slug}`, window.location.origin).toString()
    : "";
  const summaryCards = metrics
    ? [
        {
          label: "Cliques",
          meta: "pessoas abriram o link",
          tone: "dark",
          value: formatCompactNumber(metrics.funnel.clicks),
        },
        {
          label: "Cadastros iniciados",
          meta: `${formatPercent(metrics.funnel.registrationViewRate)} dos cliques`,
          tone: "light",
          value: formatCompactNumber(metrics.funnel.registrationViews),
        },
        {
          label: "Checkouts",
          meta: `${formatPercent(metrics.funnel.checkoutStartRate)} da etapa anterior`,
          tone: "light",
          value: formatCompactNumber(metrics.funnel.checkoutStarts),
        },
        {
          label: "Pagamentos abertos",
          meta: `${formatPercent(metrics.funnel.clickToPaymentViewRate)} dos cliques`,
          tone: "light",
          value: formatCompactNumber(metrics.funnel.paymentViews),
        },
        {
          label: "Pagamentos confirmados",
          meta: `${formatPercent(metrics.funnel.paymentConfirmRate)} dos pagamentos abertos`,
          tone: "teal",
          value: formatCompactNumber(metrics.funnel.paymentsConfirmed),
        },
        {
          label: "Matrículas",
          meta: `${formatPercent(metrics.funnel.clickToEnrollmentRate)} dos cliques`,
          tone: "pink",
          value: formatCompactNumber(metrics.funnel.enrollments),
        },
      ]
    : [];
  const funnelSteps = metrics
    ? [
        {
          label: "Clique",
          previousValue: metrics.funnel.clicks,
          value: metrics.funnel.clicks,
        },
        {
          label: "Cadastro aberto",
          previousValue: metrics.funnel.clicks,
          value: metrics.funnel.registrationViews,
        },
        {
          label: "Conta criada",
          previousValue: metrics.funnel.registrationViews,
          value: metrics.funnel.accountCreations,
        },
        {
          label: "Checkout",
          previousValue:
            metrics.funnel.accountCreations || metrics.funnel.clicks,
          value: metrics.funnel.checkoutStarts,
        },
        {
          label: "Pagamento aberto",
          previousValue: metrics.funnel.checkoutStarts,
          value: metrics.funnel.paymentViews,
        },
        {
          label: "Pagamento confirmado",
          previousValue: metrics.funnel.paymentViews,
          value: metrics.funnel.paymentsConfirmed,
        },
        {
          label: "Matrícula",
          previousValue:
            metrics.funnel.paymentsConfirmed || metrics.funnel.paymentViews,
          value: metrics.funnel.enrollments,
        },
      ]
    : [];
  const funnelMax = Math.max(1, metrics?.funnel.clicks ?? 0);
  const directCouponViews =
    metrics?.details.attribution.fallbackPaymentViews ?? 0;
  const directCouponEnrollments =
    metrics?.details.attribution.fallbackEnrollments ?? 0;

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
            <p className="coupon-report__eyebrow">relatório de campanha</p>
            <h1>{pageTitle}</h1>
            {pageMeta ? <p>{pageMeta}</p> : null}
            {publicLink ? (
              <a className="coupon-report__public-link" href={publicLink}>
                {publicLink.replace(/^https?:\/\//, "")}
              </a>
            ) : null}
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
            {Array.from({ length: 6 }, (_, index) => (
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
            <section className="coupon-report__section-header">
              <div>
                <p>Resumo</p>
                <h2>O que sua divulgação gerou</h2>
              </div>
              {bestDay ? (
                <span>
                  Melhor dia: {formatDateLabel(bestDay.date)} ·{" "}
                  {formatCompactNumber(bestDay.clicks)} cliques
                </span>
              ) : null}
            </section>

            <section className="coupon-report__kpi-grid" aria-label="Resumo">
              {summaryCards.map((kpi) => (
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
                    <h2>Funil de conversão</h2>
                    <p>taxa entre uma etapa e a próxima</p>
                  </div>
                </div>
                <div className="coupon-report__funnel">
                  {funnelSteps.map((step, index) => {
                    const width = Math.max(4, (step.value / funnelMax) * 100);
                    const rate =
                      index === 0
                        ? 100
                        : getStepRate(step.value, step.previousValue);

                    return (
                      <div
                        className="coupon-report__funnel-step"
                        key={step.label}
                      >
                        <div>
                          <span>{step.label}</span>
                          <strong>{formatCompactNumber(step.value)}</strong>
                        </div>
                        <div className="coupon-report__funnel-track">
                          <span style={{ width: `${width}%` }} />
                        </div>
                        <small>
                          {index === 0
                            ? "início"
                            : `${formatPercent(rate)} da etapa anterior`}
                        </small>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="coupon-report__panel">
                <div className="coupon-report__panel-header">
                  <div>
                    <h2>Uso direto do cupom</h2>
                    <p>quando a pessoa não veio pelo link rastreado</p>
                  </div>
                </div>
                <div className="coupon-report__stat-list">
                  <div>
                    <span>Pagamentos com cupom</span>
                    <strong>{formatCompactNumber(directCouponViews)}</strong>
                  </div>
                  <div>
                    <span>Matrículas com cupom</span>
                    <strong>
                      {formatCompactNumber(directCouponEnrollments)}
                    </strong>
                  </div>
                </div>
              </article>

              <article className="coupon-report__panel coupon-report__panel--wide">
                <div className="coupon-report__panel-header">
                  <div>
                    <h2>Evolução</h2>
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
                              (item.paymentsConfirmed / dailyMax) * 100,
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
                  <span data-kind="payment">Pagamentos</span>
                  <span data-kind="enrollment">Matrículas</span>
                </div>
              </article>

              <article className="coupon-report__panel">
                <div className="coupon-report__panel-header">
                  <div>
                    <h2>Origem</h2>
                    <p>canais que trouxeram cliques</p>
                  </div>
                </div>
                <RankList items={metrics.details.topUtms.source} />
              </article>

              <article className="coupon-report__panel">
                <div className="coupon-report__panel-header">
                  <div>
                    <h2>Conteúdos</h2>
                    <p>links marcados por post, story ou bio</p>
                  </div>
                </div>
                <RankList
                  fallbackLabel={`Aguardando ${metrics.details.privacyThreshold} cliques`}
                  items={metrics.details.topUtms.content}
                />
              </article>

              <article className="coupon-report__panel">
                <div className="coupon-report__panel-header">
                  <div>
                    <h2>Regiões</h2>
                    <p>exibidas só com volume mínimo</p>
                  </div>
                </div>
                <RankList
                  fallbackLabel={`Aguardando ${metrics.details.privacyThreshold} cliques`}
                  items={metrics.details.topRegions}
                />
              </article>

              <article className="coupon-report__panel">
                <div className="coupon-report__panel-header">
                  <div>
                    <h2>Cidades</h2>
                    <p>agrupadas para proteger privacidade</p>
                  </div>
                </div>
                <RankList
                  fallbackLabel={`Aguardando ${metrics.details.privacyThreshold} cliques`}
                  items={metrics.details.topCities}
                />
              </article>

              <article className="coupon-report__panel">
                <div className="coupon-report__panel-header">
                  <div>
                    <h2>Dias fortes</h2>
                    <p>quando a audiência mais clicou</p>
                  </div>
                </div>
                <RankList items={metrics.details.topClickWeekdays} />
              </article>

              <article className="coupon-report__panel">
                <div className="coupon-report__panel-header">
                  <div>
                    <h2>Horários fortes</h2>
                    <p>faixas com mais cliques</p>
                  </div>
                </div>
                <RankList items={metrics.details.topClickHours} />
              </article>

              <article className="coupon-report__panel">
                <div className="coupon-report__panel-header">
                  <div>
                    <h2>Dispositivo</h2>
                    <p>como as pessoas acessaram</p>
                  </div>
                </div>
                <RankList items={metrics.details.topDevices} />
              </article>

              <article className="coupon-report__panel coupon-report__panel--wide">
                <div className="coupon-report__panel-header">
                  <div>
                    <h2>Mapa de horários</h2>
                    <p>combinações de dia e hora com mais cliques</p>
                  </div>
                </div>
                <div className="coupon-report__heatmap">
                  {getTopItemsOrFallback(
                    metrics.details.clickHeatmap.map((item) => ({
                      count: item.count,
                      label: `${item.weekday} · ${String(item.hour).padStart(2, "0")}h`,
                    })),
                  )
                    .slice(0, 12)
                    .map((item) => (
                      <div key={item.label}>
                        <span>{formatItemLabel(item.label)}</span>
                        <strong>{formatCompactNumber(item.count)}</strong>
                      </div>
                    ))}
                </div>
              </article>

              <article className="coupon-report__panel coupon-report__panel--wide">
                <div className="coupon-report__panel-header">
                  <div>
                    <h2>Links prontos</h2>
                    <p>use um link por formato para medir melhor</p>
                  </div>
                </div>
                <div className="coupon-report__share-list">
                  {shareLinks.map((link) => (
                    <a href={link.url} key={link.label}>
                      <strong>{link.label}</strong>
                      <span>{link.description}</span>
                      <small>{link.url.replace(/^https?:\/\//, "")}</small>
                    </a>
                  ))}
                </div>
              </article>
            </section>

            <p className="coupon-report__trust-note">
              Matrícula conta assinatura criada. Dados de região e conteúdo só
              aparecem agregados, com volume mínimo, sem mostrar dados de
              alunas.
            </p>
          </>
        ) : null}
      </section>
    </main>
  );
}
