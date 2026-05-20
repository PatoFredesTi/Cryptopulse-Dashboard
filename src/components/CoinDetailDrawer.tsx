import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Code2,
  ExternalLink,
  Github,
  Globe2,
  Info,
  Loader2,
  PlusCircle,
  Scale,
  ShieldCheck,
  Star,
  TrendingUp,
  X,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCoinDetails } from '../hooks/useCoinDetails';
import {
  buildChartData,
  buildPerformanceComparisonData,
  buildVolumeData,
  calculateRangeChange,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  getChangeTone,
  stripHtml,
} from '../utils/formatters';
import { t } from '../utils/i18n';

const dayRanges = [
  { label: '24h', value: 1 },
  { label: '7d', value: 7 },
  { label: '30d', value: 30 },
  { label: '90d', value: 90 },
  { label: '1y', value: 365 },
];

const tabs = [
  { id: 'overview', icon: Info, labelKey: 'overviewTab' },
  { id: 'charts', icon: BarChart3, labelKey: 'chartsTab' },
  { id: 'fundamentals', icon: ShieldCheck, labelKey: 'fundamentalsTab' },
  { id: 'links', icon: ExternalLink, labelKey: 'linksTab' },
];

function DetailMetric({ label, value, helper = null, tone = 'neutral', icon = null }) {
  return (
    <div className={`detail-metric ${tone}`}>
      <span>{icon}{label}</span>
      <strong>{value}</strong>
      {helper ? <small>{helper}</small> : null}
    </div>
  );
}

function InsightCard({ icon, title, value, helper, tone = 'neutral' }) {
  return (
    <div className={`insight-card ${tone}`}>
      <div className="insight-icon">{icon}</div>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
        {helper ? <small>{helper}</small> : null}
      </div>
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

function buildCompareOptions(availableCoins, selectedCoinId) {
  return availableCoins
    .filter((coin) => coin.id !== selectedCoinId)
    .slice(0, 15)
    .map((coin) => ({ id: coin.id, label: `${coin.name} (${coin.symbol.toUpperCase()})` }));
}

function getHealthScore({ detail, selectedMarketCoin, rangeChange, volumeMarketCapRatio }) {
  let score = 0;

  if ((selectedMarketCoin?.market_cap_rank ?? detail?.market_cap_rank ?? 999) <= 20) score += 25;
  if ((selectedMarketCoin?.total_volume ?? 0) > 0) score += 15;
  if ((detail?.market_data?.circulating_supply ?? selectedMarketCoin?.circulating_supply ?? 0) > 0) score += 15;
  if ((detail?.links?.homepage ?? []).some(Boolean)) score += 10;
  if ((detail?.links?.repos_url?.github ?? []).some(Boolean)) score += 10;
  if ((detail?.developer_data?.stars ?? 0) > 500) score += 10;
  if ((volumeMarketCapRatio ?? 0) >= 2) score += 10;
  if ((rangeChange ?? 0) > 0) score += 5;

  if (score >= 80) return { score, tone: 'positive' };
  if (score >= 55) return { score, tone: 'neutral' };
  return { score, tone: 'negative' };
}

export function CoinDetailDrawer({
  locale,
  currency,
  selectedCoinId,
  selectedMarketCoin,
  onClose,
  favorites,
  toggleFavorite,
  days,
  setDays,
  availableCoins = [],
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [comparisonCoinId, setComparisonCoinId] = useState('');
  const compareOptions = useMemo(() => buildCompareOptions(availableCoins, selectedCoinId), [availableCoins, selectedCoinId]);

  useEffect(() => {
    if (!selectedCoinId) return;
    setActiveTab('overview');

    const defaultComparison = selectedCoinId === 'bitcoin' ? 'ethereum' : 'bitcoin';
    const optionExists = availableCoins.some((coin) => coin.id === defaultComparison);
    setComparisonCoinId(optionExists ? defaultComparison : compareOptions[0]?.id ?? '');
  }, [selectedCoinId, availableCoins, compareOptions]);

  const { detail, chart, comparisonChart, loading, error } = useCoinDetails(selectedCoinId, currency, days, comparisonCoinId);
  const isFavorite = selectedCoinId ? favorites.includes(selectedCoinId) : false;
  const chartData = buildChartData(chart?.prices ?? [], locale);
  const volumeData = buildVolumeData(chart?.total_volumes ?? [], locale);
  const comparisonData = buildPerformanceComparisonData(chart?.prices ?? [], comparisonChart?.prices ?? [], locale);
  const coin = detail ?? selectedMarketCoin;
  const comparisonCoin = availableCoins.find((item) => item.id === comparisonCoinId);

  if (!selectedCoinId) return null;

  const description = stripHtml(detail?.description?.en ?? '').slice(0, 820);
  const priceChange = selectedMarketCoin?.price_change_percentage_24h_in_currency ?? detail?.market_data?.price_change_percentage_24h;
  const rangeChange = calculateRangeChange(chart?.prices ?? []);
  const tone = getChangeTone(priceChange);
  const rangeTone = getChangeTone(rangeChange);
  const marketCap = detail?.market_data?.market_cap?.[currency] ?? selectedMarketCoin?.market_cap;
  const volume = detail?.market_data?.total_volume?.[currency] ?? selectedMarketCoin?.total_volume;
  const volumeMarketCapRatio = marketCap ? (volume / marketCap) * 100 : null;
  const athChange = detail?.market_data?.ath_change_percentage?.[currency];
  const high24h = detail?.market_data?.high_24h?.[currency] ?? selectedMarketCoin?.high_24h;
  const low24h = detail?.market_data?.low_24h?.[currency] ?? selectedMarketCoin?.low_24h;
  const healthScore = getHealthScore({ detail, selectedMarketCoin, rangeChange, volumeMarketCapRatio });

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="detail-drawer detail-drawer-pro" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" type="button" onClick={onClose} aria-label="Close details">
          <X size={20} />
        </button>

        {loading && !detail ? (
          <div className="drawer-loading">
            <Loader2 className="spin" size={34} />
            <p>{t(locale, 'loadingAnalysis')}</p>
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
            <div className="detail-hero detail-hero-pro">
              <div className="detail-coin-title">
                <img src={coin.image?.large ?? coin.image} alt={coin.name} />
                <div>
                  <p className="eyebrow">Crypto Detail Pro · v2.1</p>
                  <h2>{coin.name}</h2>
                  <span>{coin.symbol?.toUpperCase()} · #{coin.market_cap_rank}</span>
                </div>
              </div>

              <div className="detail-price">
                <strong>{formatCurrency(selectedMarketCoin?.current_price ?? detail?.market_data?.current_price?.[currency], currency)}</strong>
                <span className={`change-value ${tone}`}>{formatPercent(priceChange)} / 24h</span>
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

            <div className="detail-tabs" role="tablist" aria-label="Crypto detail sections">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={activeTab === tab.id ? 'active' : ''}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon size={16} />
                    {t(locale, tab.labelKey)}
                  </button>
                );
              })}
            </div>

            {activeTab === 'overview' ? (
              <>
                <section className="detail-section">
                  <h3>{t(locale, 'smartInsights')}</h3>
                  <div className="insights-grid">
                    <InsightCard
                      icon={<TrendingUp size={18} />}
                      title={t(locale, 'rangePerformance')}
                      value={formatPercent(rangeChange)}
                      helper={`${days} ${t(locale, 'days')}`}
                      tone={rangeTone}
                    />
                    <InsightCard
                      icon={<Activity size={18} />}
                      title={t(locale, 'liquiditySignal')}
                      value={volumeMarketCapRatio === null ? 'N/A' : `${volumeMarketCapRatio.toFixed(2)}%`}
                      helper={t(locale, 'volumeMarketCapRatio')}
                    />
                    <InsightCard
                      icon={<Scale size={18} />}
                      title={t(locale, 'athDistance')}
                      value={formatPercent(athChange)}
                      helper={detail?.market_data?.ath_date?.[currency] ? `${t(locale, 'athDate')}: ${formatDate(detail.market_data.ath_date[currency], locale)}` : ''}
                      tone={getChangeTone(athChange)}
                    />
                    <InsightCard
                      icon={<ShieldCheck size={18} />}
                      title={t(locale, 'profileScore')}
                      value={`${healthScore.score}/100`}
                      helper={t(locale, 'profileScoreHelp')}
                      tone={healthScore.tone}
                    />
                  </div>
                </section>

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
                            labelFormatter={(label) => `${t(locale, 'date')}: ${label}`}
                            contentStyle={{ borderRadius: '16px' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="currentColor" strokeWidth={3} fill="url(#priceGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="drawer-loading small">
                        <Loader2 className="spin" size={26} />
                        <p>{t(locale, 'loadingChart')}</p>
                      </div>
                    )}
                  </div>
                </section>

                {description ? (
                  <section className="detail-section">
                    <h3>{t(locale, 'description')}</h3>
                    <p className="detail-description">{description}...</p>
                  </section>
                ) : null}
              </>
            ) : null}

            {activeTab === 'charts' ? (
              <>
                <section className="detail-section chart-section">
                  <div className="section-heading compact">
                    <div>
                      <p className="eyebrow">Volume</p>
                      <h3>{t(locale, 'volumeChart')}</h3>
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

                  <div className="chart-card volume-chart-card">
                    {volumeData.length ? (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={volumeData} margin={{ top: 12, right: 18, left: 4, bottom: 6 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={26} />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            width={88}
                            tickFormatter={(value) => formatCurrency(value, currency, true)}
                          />
                          <Tooltip
                            formatter={(value) => [formatCurrency(value, currency, true), t(locale, 'volume')]}
                            labelFormatter={(label) => `${t(locale, 'date')}: ${label}`}
                            contentStyle={{ borderRadius: '16px' }}
                          />
                          <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="currentColor" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="drawer-loading small">
                        <Loader2 className="spin" size={26} />
                        <p>{t(locale, 'loadingChart')}</p>
                      </div>
                    )}
                  </div>
                </section>

                <section className="detail-section chart-section">
                  <div className="section-heading compact">
                    <div>
                      <p className="eyebrow">Comparison</p>
                      <h3>{t(locale, 'comparisonChart')}</h3>
                    </div>
                    <select value={comparisonCoinId} onChange={(event) => setComparisonCoinId(event.target.value)}>
                      {compareOptions.map((option) => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="chart-card comparison-chart-card">
                    {comparisonData.length ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={comparisonData} margin={{ top: 12, right: 18, left: 4, bottom: 6 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={26} />
                          <YAxis tickLine={false} axisLine={false} width={70} tickFormatter={(value) => `${value.toFixed(0)}%`} />
                          <Tooltip
                            formatter={(value, name) => [formatPercent(value), name === 'primary' ? coin.name : comparisonCoin?.name ?? t(locale, 'comparison')]}
                            labelFormatter={(label) => `${t(locale, 'date')}: ${label}`}
                            contentStyle={{ borderRadius: '16px' }}
                          />
                          <Line type="monotone" dataKey="primary" strokeWidth={3} dot={false} />
                          <Line type="monotone" dataKey="comparison" strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="drawer-loading small">
                        <Loader2 className="spin" size={26} />
                        <p>{t(locale, 'loadingComparison')}</p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            ) : null}

            {activeTab === 'fundamentals' ? (
              <section className="detail-section">
                <h3>{t(locale, 'metrics')}</h3>
                <div className="detail-metrics-grid detail-metrics-grid-pro">
                  <DetailMetric label={t(locale, 'marketCapShort')} value={formatCurrency(marketCap, currency, true)} />
                  <DetailMetric label={t(locale, 'volume24h')} value={formatCurrency(volume, currency, true)} />
                  <DetailMetric label={t(locale, 'high24h')} value={formatCurrency(high24h, currency)} tone="positive" />
                  <DetailMetric label={t(locale, 'low24h')} value={formatCurrency(low24h, currency)} tone="negative" />
                  <DetailMetric label={t(locale, 'circulatingSupply')} value={formatNumber(detail?.market_data?.circulating_supply ?? selectedMarketCoin?.circulating_supply)} />
                  <DetailMetric label={t(locale, 'totalSupply')} value={formatNumber(detail?.market_data?.total_supply ?? selectedMarketCoin?.total_supply)} />
                  <DetailMetric label={t(locale, 'maxSupply')} value={formatNumber(detail?.market_data?.max_supply)} />
                  <DetailMetric label={t(locale, 'ath')} value={formatCurrency(detail?.market_data?.ath?.[currency] ?? selectedMarketCoin?.ath, currency)} helper={formatDate(detail?.market_data?.ath_date?.[currency], locale)} />
                  <DetailMetric label={t(locale, 'atl')} value={formatCurrency(detail?.market_data?.atl?.[currency] ?? selectedMarketCoin?.atl, currency)} helper={formatDate(detail?.market_data?.atl_date?.[currency], locale)} />
                  <DetailMetric label={t(locale, 'developerStars')} value={formatNumber(detail?.developer_data?.stars)} icon={<Code2 size={16} />} />
                  <DetailMetric label={t(locale, 'githubForks')} value={formatNumber(detail?.developer_data?.forks)} />
                  <DetailMetric label={t(locale, 'sentimentVotes')} value={detail?.sentiment_votes_up_percentage ? `${detail.sentiment_votes_up_percentage.toFixed(1)}% up` : 'N/A'} />
                </div>
              </section>
            ) : null}

            {activeTab === 'links' ? (
              <>
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
                      <LinkButton href={detail.links.subreddit_url} icon={<ExternalLink size={16} />}>
                        Reddit
                      </LinkButton>
                      <LinkButton href={detail.links.official_forum_url?.find(Boolean)} icon={<ExternalLink size={16} />}>
                        Forum
                      </LinkButton>
                    </div>
                  </section>
                ) : null}

                <section className="detail-section detail-note">
                  <h3>{t(locale, 'recruiterNote')}</h3>
                  <p>{t(locale, 'recruiterNoteText')}</p>
                </section>
              </>
            ) : null}
          </>
        ) : null}
      </aside>
    </div>
  );
}
