import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Gauge,
  Layers3,
  PieChart,
  Radar,
  Sparkles,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  buildMarketPulseData,
  getDominanceEntries,
  getLiquidityLeaders,
  getMarketSentiment,
  getRankSegments,
  getTopMovers,
} from '../utils/analytics';
import { formatCurrency, formatNumber, formatPercent, getChangeTone } from '../utils/formatters';
import { t } from '../utils/i18n';

function AnalyticsCard({ icon, eyebrow, title, children, className = '' }) {
  return (
    <section className={`panel analytics-card ${className}`}>
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3>{title}</h3>
        </div>
        <span className="analytics-icon">{icon}</span>
      </div>
      {children}
    </section>
  );
}

function CoinMoverItem({ coin, currency, onSelectCoin }) {
  const change = coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h;
  const tone = getChangeTone(change);

  return (
    <button className="mover-item" type="button" onClick={() => onSelectCoin(coin.id)}>
      <span className="mover-rank">#{coin.market_cap_rank}</span>
      <img src={coin.image} alt={coin.name} />
      <span className="mover-name">
        <strong>{coin.symbol.toUpperCase()}</strong>
        <small>{formatCurrency(coin.current_price, currency)}</small>
      </span>
      <span className={`change-value ${tone}`}>{formatPercent(change)}</span>
    </button>
  );
}

function MoversList({ title, coins, currency, onSelectCoin, type }) {
  const Icon = type === 'gainers' ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="movers-column">
      <div className="mini-title">
        <Icon size={16} />
        <strong>{title}</strong>
      </div>
      <div className="movers-list">
        {coins.map((coin) => (
          <CoinMoverItem key={coin.id} coin={coin} currency={currency} onSelectCoin={onSelectCoin} />
        ))}
      </div>
    </div>
  );
}

function SentimentMeter({ sentiment, locale }) {
  const stateLabel = t(locale, `${sentiment.state}Market`);
  const tone = sentiment.state === 'bullish' ? 'positive' : sentiment.state === 'bearish' ? 'negative' : 'neutral';

  return (
    <div className="sentiment-meter">
      <div className={`sentiment-orb ${tone}`}>
        <Gauge size={34} />
      </div>
      <div>
        <span>{t(locale, 'marketSentiment')}</span>
        <strong>{stateLabel}</strong>
        <small>{formatPercent(sentiment.averageChange)} {t(locale, 'average24h')}</small>
      </div>
      <div className="sentiment-progress" aria-label="Market positive ratio">
        <span style={{ width: `${Math.max(4, Math.min(100, sentiment.positiveRatio))}%` }} />
      </div>
    </div>
  );
}

export function DashboardAnalytics({ locale, currency, globalData, coins, onSelectCoin }) {
  const sentiment = getMarketSentiment(coins);
  const { gainers, losers } = getTopMovers(coins, 4);
  const segments = getRankSegments(coins);
  const dominanceEntries = getDominanceEntries(globalData, 6);
  const marketPulseData = buildMarketPulseData(coins);
  const liquidityLeaders = getLiquidityLeaders(coins, 4);
  const totalSegmentMarketCap = segments.reduce((acc, segment) => acc + segment.marketCap, 0);

  const segmentChartData = segments.map((segment) => ({
    name: t(locale, segment.labelKey),
    marketCap: segment.marketCap,
    avgChange: segment.avgChange,
  }));

  return (
    <section className="analytics-grid" aria-label="Dashboard analytics">
      <AnalyticsCard
        className="analytics-card-wide"
        eyebrow=""
        title={t(locale, 'marketPulse')}
        icon={<Activity size={20} />}
      >
        <div className="market-pulse-layout">
          <SentimentMeter sentiment={sentiment} locale={locale} />
          <div className="market-pulse-chart">
            {marketPulseData.length ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={marketPulseData}>
                  <defs>
                    <linearGradient id="pulseGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="currentColor" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="currentColor" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, t(locale, 'marketPulse')]} />
                  <Area type="monotone" dataKey="value" stroke="currentColor" strokeWidth={3} fill="url(#pulseGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="sparkline-empty">{t(locale, 'loadingChart')}</p>
            )}
          </div>
        </div>
        <div className="sentiment-stats">
          <span>{t(locale, 'positiveCoins')}: <strong>{sentiment.positiveCount}/{sentiment.total}</strong></span>
          <span>{t(locale, 'negativeCoins')}: <strong>{sentiment.negativeCount}/{sentiment.total}</strong></span>
          <span>{t(locale, 'positiveRatio')}: <strong>{formatPercent(sentiment.positiveRatio)}</strong></span>
        </div>
      </AnalyticsCard>

      <AnalyticsCard
        className="analytics-card-wide"
        eyebrow={t(locale, 'topMovers')}
        title={t(locale, 'topMoversTitle')}
        icon={<Sparkles size={20} />}
      >
        <div className="movers-grid">
          <MoversList title={t(locale, 'topGainers')} coins={gainers} currency={currency} onSelectCoin={onSelectCoin} type="gainers" />
          <MoversList title={t(locale, 'topLosers')} coins={losers} currency={currency} onSelectCoin={onSelectCoin} type="losers" />
        </div>
      </AnalyticsCard>

      <AnalyticsCard
        eyebrow={t(locale, 'dominance')}
        title={t(locale, 'marketDominance')}
        icon={<PieChart size={20} />}
      >
        <div className="dominance-list">
          {dominanceEntries.map((entry) => (
            <div className="dominance-row" key={entry.symbol}>
              <span>{entry.symbol.toUpperCase()}</span>
              <div className="dominance-bar"><i style={{ width: `${Math.min(100, entry.value)}%` }} /></div>
              <strong>{formatPercent(entry.value)}</strong>
            </div>
          ))}
        </div>
      </AnalyticsCard>

      <AnalyticsCard
        eyebrow={t(locale, 'segments')}
        title={t(locale, 'rankSegments')}
        icon={<Layers3 size={20} />}
      >
        <div className="segment-list">
          {segments.map((segment) => (
            <div className="segment-row" key={segment.id}>
              <div>
                <strong>{t(locale, segment.labelKey)}</strong>
                <small>Rank {segment.rank} · {segment.count} coins</small>
              </div>
              <div>
                <span>{formatCurrency(segment.marketCap, currency, true)}</span>
                <small className={getChangeTone(segment.avgChange)}>{formatPercent(segment.avgChange)}</small>
              </div>
              <div className="segment-share">
                <i style={{ width: `${totalSegmentMarketCap ? (segment.marketCap / totalSegmentMarketCap) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </AnalyticsCard>

      <AnalyticsCard
        eyebrow={t(locale, 'liquidity')}
        title={t(locale, 'liquidityLeaders')}
        icon={<Radar size={20} />}
      >
        <div className="liquidity-list">
          {liquidityLeaders.map((coin) => (
            <button className="liquidity-row" type="button" key={coin.id} onClick={() => onSelectCoin(coin.id)}>
              <img src={coin.image} alt={coin.name} />
              <span><strong>{coin.symbol.toUpperCase()}</strong><small>{coin.name}</small></span>
              <b>{formatPercent(coin.liquidityRatio)}</b>
            </button>
          ))}
        </div>
      </AnalyticsCard>

      <AnalyticsCard
        eyebrow={t(locale, 'segmentChart')}
        title={t(locale, 'capDistribution')}
        icon={<BarChart3 size={20} />}
      >
        <div className="segment-chart">
          <ResponsiveContainer width="100%" height={235}>
            <BarChart data={segmentChartData}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: 'currentColor', fontSize: 11 }} tickFormatter={(value) => formatNumber(value)} />
              <Tooltip formatter={(value) => [formatCurrency(value, currency, true), t(locale, 'marketCap')]} />
              <Bar dataKey="marketCap" radius={[10, 10, 0, 0]} fill="currentColor" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AnalyticsCard>
    </section>
  );
}
