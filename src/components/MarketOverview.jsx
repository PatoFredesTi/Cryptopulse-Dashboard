import { t } from '../utils/i18n';
import { formatCurrency, formatNumber, formatPercent, getChangeTone } from '../utils/formatters';
import { MetricCard } from './MetricCard';

export function MarketOverview({ locale, currency, globalData, coins }) {
  const marketCap = globalData?.total_market_cap?.[currency];
  const volume = globalData?.total_volume?.[currency];
  const btcDominance = globalData?.market_cap_percentage?.btc;
  const activeCryptos = globalData?.active_cryptocurrencies;

  const sortedByChange = [...coins]
    .filter((coin) => typeof coin.price_change_percentage_24h === 'number')
    .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);

  const topGainer = sortedByChange[0];
  const topLoser = sortedByChange.at(-1);

  return (
    <section className="overview-grid">
      <MetricCard label={t(locale, 'marketCap')} value={formatCurrency(marketCap, currency, true)} helper="Global" />
      <MetricCard label={t(locale, 'volume24h')} value={formatCurrency(volume, currency, true)} helper="24h" />
      <MetricCard label={t(locale, 'btcDominance')} value={formatPercent(btcDominance)} helper="Bitcoin" tone="positive" />
      <MetricCard label={t(locale, 'activeCryptos')} value={formatNumber(activeCryptos, false)} helper="CoinGecko" />
      <MetricCard
        label={t(locale, 'topGainer')}
        value={topGainer ? topGainer.symbol.toUpperCase() : 'N/A'}
        helper={topGainer ? formatPercent(topGainer.price_change_percentage_24h) : null}
        tone={getChangeTone(topGainer?.price_change_percentage_24h)}
      />
      <MetricCard
        label={t(locale, 'topLoser')}
        value={topLoser ? topLoser.symbol.toUpperCase() : 'N/A'}
        helper={topLoser ? formatPercent(topLoser.price_change_percentage_24h) : null}
        tone={getChangeTone(topLoser?.price_change_percentage_24h)}
      />
    </section>
  );
}
