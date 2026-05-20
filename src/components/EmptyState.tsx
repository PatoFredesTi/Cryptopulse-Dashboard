import { SearchX } from 'lucide-react';
import { t } from '../utils/i18n';

export function EmptyState({ locale, title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state-pro">
      <div className="empty-state-icon">
        <SearchX size={26} />
      </div>
      <div>
        <strong>{title ?? t(locale, 'emptyTitle')}</strong>
        <p>{description ?? t(locale, 'noResults')}</p>
      </div>
      {actionLabel && onAction ? (
        <button className="secondary-button" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
