import { Flame } from 'lucide-react';
import { t } from '../utils/i18n';

export function TrendingCoins({ locale, trending, onSelectCoin }) {
  if (!trending?.length) return null;

  return (
    <section className="panel trending-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Market pulse</p>
          <h2>{t(locale, 'trending')}</h2>
        </div>
        <Flame size={22} />
      </div>

      <div className="trending-list">
        {trending.slice(0, 7).map(({ item }) => (
          <button key={item.id} className="trending-chip" type="button" onClick={() => onSelectCoin(item.id)}>
            <img src={item.small} alt={item.name} />
            <span>{item.name}</span>
            <strong>#{item.market_cap_rank ?? '—'}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
