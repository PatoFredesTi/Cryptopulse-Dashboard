import { ArrowDownRight, ArrowUpRight, BarChart3, DatabaseZap, LineChart, Radar } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { CryptoMarket } from '../types/crypto';
import { buildMarketPulseData, getMarketSentiment, getTopMovers } from '../utils/analytics';
import { formatCurrency, formatPercent, getChangeTone } from '../utils/formatters';

type MarketHeroProps = {
  locale: string;
  currency: string;
  coins: CryptoMarket[];
  globalData: Record<string, any> | null;
  onSelectCoin: (coinId: string) => void;
};

function getCopy(locale: string) {
  const isEs = locale === 'es';

  return {
    eyebrow: isEs ? '' : '',
    title: isEs ? 'Dashboard cripto con experiencia de producto.' : 'Crypto dashboard with a product-grade experience.',
    description: isEs
      ? 'Analiza el mercado, revisa activos, organiza watchlists, simula portafolios y monitorea alertas desde una interfaz más limpia, profesional y enfocada en decisiones.'
      : 'Analyze the market, inspect assets, organize watchlists, simulate portfolios and monitor alerts from a cleaner, more professional decision-focused interface.',
    liveData: isEs ? 'Datos en vivo' : 'Live data',
    analytics: isEs ? 'Analytics' : 'Analytics',
    localWorkspace: isEs ? 'Workspace local' : 'Local workspace',
    marketSignal: isEs ? 'Señal de mercado' : 'Market signal',
    leader: isEs ? 'Líder 24h' : '24h leader',
    risk: isEs ? 'Mayor caída' : 'Largest drop',
    marketCap: isEs ? 'Capitalización global' : 'Global market cap',
    volume: isEs ? 'Volumen 24h' : '24h volume',
    assets: isEs ? 'Activos cargados' : 'Loaded assets',
    bullish: isEs ? 'Alcista' : 'Bullish',
    bearish: isEs ? 'Bajista' : 'Bearish',
    neutral: isEs ? 'Neutral' : 'Neutral',
  };
}

function MiniAssetCard({ label, coin, currency, onSelectCoin, variant }: { label: string; coin?: CryptoMarket; currency: string; onSelectCoin: (coinId: string) => void; variant: 'up' | 'down' }) {
  if (!coin) {
    return (
      <div className="hero-asset-card muted-card">
        <span>{label}</span>
        <strong>—</strong>
        <small>Loading market data</small>
      </div>
    );
  }

  const change = coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h;
  const Icon = variant === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <button className="hero-asset-card" type="button" onClick={() => onSelectCoin(coin.id)}>
      <span className="hero-card-label">{label}</span>
      <div className="hero-asset-main">
        <img src={coin.image} alt={coin.name} />
        <div>
          <strong>{coin.symbol.toUpperCase()}</strong>
          <small>{formatCurrency(coin.current_price, currency)}</small>
        </div>
      </div>
      <span className={`hero-card-change ${getChangeTone(change)}`}>
        <Icon size={15} />
        {formatPercent(change)}
      </span>
    </button>
  );
}

export function MarketHero({ locale, currency, coins, globalData, onSelectCoin }: MarketHeroProps) {
  const copy = getCopy(locale);
  const sentiment = getMarketSentiment(coins);
  const pulseData = buildMarketPulseData(coins).slice(-18);
  const { gainers, losers } = getTopMovers(coins, 1);
  const signalLabel = sentiment.state === 'bullish' ? copy.bullish : sentiment.state === 'bearish' ? copy.bearish : copy.neutral;
  const signalTone = sentiment.state === 'bullish' ? 'positive' : sentiment.state === 'bearish' ? 'negative' : 'neutral';

  return (
    <section className="hero-showcase">
      <div className="hero-copy">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
        <div className="hero-badges" aria-label="Feature highlights">
          <span><DatabaseZap size={15} />{copy.liveData}</span>
          <span><BarChart3 size={15} />{copy.analytics}</span>
          <span><Radar size={15} />{copy.localWorkspace}</span>
        </div>
      </div>

      <div className="hero-command-card">
        <div className="hero-command-header">
          <div>
            <span>{copy.marketSignal}</span>
            <strong className={signalTone}>{signalLabel}</strong>
          </div>
          <LineChart size={22} />
        </div>

        <div className="hero-chart-shell">
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={pulseData}>
              <defs>
                <linearGradient id="heroPulseGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="currentColor" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, copy.marketSignal]} />
              <Area type="monotone" dataKey="value" stroke="currentColor" strokeWidth={3} fill="url(#heroPulseGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="hero-stat-grid">
          <div>
            <span>{copy.marketCap}</span>
            <strong>{formatCurrency(globalData?.total_market_cap?.[currency] ?? 0, currency, true)}</strong>
          </div>
          <div>
            <span>{copy.volume}</span>
            <strong>{formatCurrency(globalData?.total_volume?.[currency] ?? 0, currency, true)}</strong>
          </div>
          <div>
            <span>{copy.assets}</span>
            <strong>{coins.length}</strong>
          </div>
        </div>
      </div>

      <div className="hero-side-stack">
        <MiniAssetCard label={copy.leader} coin={gainers[0]} currency={currency} onSelectCoin={onSelectCoin} variant="up" />
        <MiniAssetCard label={copy.risk} coin={losers[0]} currency={currency} onSelectCoin={onSelectCoin} variant="down" />
      </div>
    </section>
  );
}
