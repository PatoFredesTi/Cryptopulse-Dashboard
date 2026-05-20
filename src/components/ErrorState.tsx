import { AlertTriangle } from 'lucide-react';
import { t } from '../utils/i18n';

export function ErrorState({ locale, error, onRetry }) {
  return (
    <section className="state-card error-state">
      <AlertTriangle size={34} />
      <h2>{t(locale, 'errorTitle')}</h2>
      <p>{error}</p>
      <button className="primary-button" type="button" onClick={onRetry}>
        {t(locale, 'retry')}
      </button>
    </section>
  );
}
