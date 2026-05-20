import { ChevronLeft, ChevronRight } from 'lucide-react';
import { t } from '../utils/i18n';

export function PaginationControls({ locale, page, totalPages, pageSize, setPage, setPageSize, totalResults }) {
  if (!totalResults) return null;

  return (
    <div className="pagination-controls">
      <div>
        <span>{t(locale, 'rowsPerPage')}</span>
        <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} aria-label={t(locale, 'rowsPerPage')}>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      <div className="pagination-actions">
        <button type="button" className="icon-button" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} aria-label={t(locale, 'previousPage')}>
          <ChevronLeft size={18} />
        </button>
        <strong>{t(locale, 'page')} {page} / {totalPages}</strong>
        <button type="button" className="icon-button" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} aria-label={t(locale, 'nextPage')}>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
