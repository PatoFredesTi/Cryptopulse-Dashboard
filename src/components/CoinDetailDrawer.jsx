import { ExternalLink, Github, Globe2, Loader2, PlusCircle, Star, X } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCoinDetails } from '../hooks/useCoinDetails';
import { buildChartData, formatCurrency, formatNumber, formatPercent, getChangeTone, stripHtml } from '../utils/formatters';
import { t } from '../utils/i18n';

const dayRanges = [
  { label: '24h', value: 1 },
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
  { label: '1y', value: 365 },
];

function DetailMetric({ label, value }) {
  return (
    <div className="detail-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LinkButton({ href, icon, children }) {
  if (!href) return null;

  return (
    <a className="detail-link" href={href} target="_blank" rel="noreferrer">
      {icon}
      {children}
      <ExternalLink size={14} />
    </a>
  );
}

export function CoinDetailDrawer({ locale, currency, selectedCoinId, selectedMarketCoin, onClose, favorites, toggleFavorite, days, setDays }) {
  const { detail, chart, loading, error } = useCoinDetails(selectedCoinId, currency, days);
  const isFavorite = selectedCoinId ? favorites.includes(selectedCoinId) : false;
  const chartData = buildChartData(chart?.prices ?? []);
  const coin = detail ?? selectedMarketCoin;

  if (!selectedCoinId) return null;

  const description = stripHtml(detail?.description?.en ?? '').slice(0, 680);
  const priceChange = selectedMarketCoin?.price_change_percentage_24h_in_currency ?? detail?.market_data?.price_change_percentage_24h;
  const tone = getChangeTone(priceChange);

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="detail-drawer" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" type="button" onClick={onClose} aria-label="Close details">
          <X size={20} />
        </button>

        {loading && !detail ? (
          <div className="drawer-loading">
            <Loader2 className="spin" size={34} />
            <p>Cargando análisis...</p>
          </div>
        ) : null}

        {error ? (
          <div className="drawer-error">
            <strong>{t(locale, 'errorTitle')}</strong>
            <p>{error}</p>
          </div>
        ) : null}

        {coin ? (
          <>
            <div className="detail-hero">
              <div className="detail-coin-title">
                <img src={coin.image?.large ?? coin.image} alt={coin.name} />
                <div>
                  <p className="eyebrow">{t(locale, 'detailTitle')}</p>
                  <h2>{coin.name}</h2>
                  <span>{coin.symbol?.toUpperCase()} · #{coin.market_cap_rank}</span>
                </div>
              </div>

              <div className="detail-price">
                <strong>{formatCurrency(selectedMarketCoin?.current_price ?? detail?.market_data?.current_price?.[currency], currency)}</strong>
                <span className={`change-value ${tone}`}>{formatPercent(priceChange)}</span>
              </div>
            </div>

            <div className="detail-actions">
              <button className={`secondary-button ${isFavorite ? 'favorited' : ''}`} type="button" onClick={() => toggleFavorite(selectedCoinId)}>
                <Star size={16} fill="currentColor" />
                {isFavorite ? t(locale, 'removeFavorite') : t(locale, 'addFavorite')}
              </button>
              <button className="primary-button" type="button" title="Planned for v2.7">
                <PlusCircle size={16} />
                {t(locale, 'addPortfolio')}
              </button>
            </div>

            <section className="detail-section chart-section">
              <div className="section-heading compact">
                <div>
                  <p className="eyebrow">Price chart</p>
                  <h3>{t(locale, 'range')}</h3>
                </div>
                <div className="range-buttons">
                  {dayRanges.map((range) => (
                    <button
                      key={range.value}
                      type="button"
                      className={days === range.value ? 'active' : ''}
                      onClick={() => setDays(range.value)}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="chart-card">
                {chartData.length ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={chartData} margin={{ top: 12, right: 18, left: 4, bottom: 6 }}>
                      <defs>
                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="currentColor" stopOpacity={0.28} />
                          <stop offset="95%" stopColor="currentColor" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={26} />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={88}
                        tickFormatter={(value) => formatCurrency(value, currency, true)}
                      />
                      <Tooltip
                        formatter={(value) => [formatCurrency(value, currency), t(locale, 'price')]}
                        labelFormatter={(label) => `Fecha: ${label}`}
                        contentStyle={{ borderRadius: '16px' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="currentColor" strokeWidth={3} fill="url(#priceGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="drawer-loading small">
                    <Loader2 className="spin" size={26} />
                    <p>Cargando gráfico...</p>
                  </div>
                )}
              </div>
            </section>

            <section className="detail-section">
              <h3>{t(locale, 'metrics')}</h3>
              <div className="detail-metrics-grid">
                <DetailMetric label={t(locale, 'marketCapShort')} value={formatCurrency(detail?.market_data?.market_cap?.[currency] ?? selectedMarketCoin?.market_cap, currency, true)} />
                <DetailMetric label={t(locale, 'volume24h')} value={formatCurrency(detail?.market_data?.total_volume?.[currency] ?? selectedMarketCoin?.total_volume, currency, true)} />
                <DetailMetric label={t(locale, 'circulatingSupply')} value={formatNumber(detail?.market_data?.circulating_supply ?? selectedMarketCoin?.circulating_supply)} />
                <DetailMetric label={t(locale, 'totalSupply')} value={formatNumber(detail?.market_data?.total_supply ?? selectedMarketCoin?.total_supply)} />
                <DetailMetric label={t(locale, 'ath')} value={formatCurrency(detail?.market_data?.ath?.[currency] ?? selectedMarketCoin?.ath, currency)} />
                <DetailMetric label={t(locale, 'atl')} value={formatCurrency(detail?.market_data?.atl?.[currency] ?? selectedMarketCoin?.atl, currency)} />
              </div>
            </section>

            {description ? (
              <section className="detail-section">
                <h3>{t(locale, 'description')}</h3>
                <p className="detail-description">{description}...</p>
              </section>
            ) : null}

            {detail?.links ? (
              <section className="detail-section">
                <h3>{t(locale, 'officialLinks')}</h3>
                <div className="detail-links-grid">
                  <LinkButton href={detail.links.homepage?.find(Boolean)} icon={<Globe2 size={16} />}>
                    {t(locale, 'website')}
                  </LinkButton>
                  <LinkButton href={detail.links.blockchain_site?.find(Boolean)} icon={<ExternalLink size={16} />}>
                    {t(locale, 'explorer')}
                  </LinkButton>
                  <LinkButton href={detail.links.repos_url?.github?.find(Boolean)} icon={<Github size={16} />}>
                    {t(locale, 'sourceCode')}
                  </LinkButton>
                </div>
              </section>
            ) : null}
          </>
        ) : null}
      </aside>
    </div>
  );
}
