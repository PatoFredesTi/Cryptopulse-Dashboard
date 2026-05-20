import { Activity, Clock3, DatabaseZap, RefreshCw } from 'lucide-react';
import { t } from '../utils/i18n';

function formatTime(value, locale) {
  if (!value) return '—';
  return value.toLocaleTimeString(locale === 'es' ? 'es-CL' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function StatusBanner({ locale, loading, error, lastUpdated, totalCoins, visibleCoins, nextRefreshSeconds, refreshProgress }) {
  return (
    <section className="status-banner panel">
      <div className="status-banner-main">
        <span className={`status-icon ${loading ? 'loading' : error ? 'warning' : 'success'}`}>
          {loading ? <RefreshCw className="spin" size={18} /> : <Activity size={18} />}
        </span>
        <div>
          <strong>{loading ? t(locale, 'syncingMarket') : error ? t(locale, 'partialDataWarning') : t(locale, 'marketReady')}</strong>
          <p>{error ? t(locale, 'partialDataDescription') : t(locale, 'marketReadyDescription')}</p>
        </div>
      </div>

      <div className="status-banner-metrics">
        <span>
          <Clock3 size={15} />
          {t(locale, 'updatedAt')}: <strong>{formatTime(lastUpdated, locale)}</strong>
        </span>
        <span>
          <DatabaseZap size={15} />
          {t(locale, 'results')}: <strong>{visibleCoins}/{totalCoins}</strong>
        </span>
        <span>
          <RefreshCw size={15} />
          {t(locale, 'nextRefresh')}: <strong>{nextRefreshSeconds}s</strong>
        </span>
      </div>

      <div className="refresh-progress" aria-hidden="true">
        <i style={{ width: `${refreshProgress}%` }} />
      </div>
    </section>
  );
}
