import { ChevronDown, ChevronUp, Star } from 'lucide-react';
import { t } from '../utils/i18n';
import { formatCurrency, formatPercent, getChangeTone } from '../utils/formatters';
import { Sparkline } from './Sparkline';
import { EmptyState } from './EmptyState';
import { PaginationControls } from './PaginationControls';

const sortableColumns = [
  { key: 'market_cap_rank', label: '#' },
  { key: 'current_price', labelKey: 'price' },
  { key: 'price_change_percentage_1h_in_currency', labelKey: 'change1h' },
  { key: 'price_change_percentage_24h_in_currency', labelKey: 'change24h' },
  { key: 'price_change_percentage_7d_in_currency', labelKey: 'change7d' },
  { key: 'market_cap', labelKey: 'marketCapShort' },
  { key: 'total_volume', labelKey: 'volume' },
];

function SortIndicator({ active, direction }) {
  if (!active) return <span className="sort-placeholder" />;
  return direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
}

function ChangeCell({ value }) {
  const tone = getChangeTone(value);
  return <span className={`change-value ${tone}`}>{formatPercent(value)}</span>;
}

export function CryptoTable({ locale, currency, coins, totalResults, page, totalPages, pageSize, setPage, setPageSize, sortConfig, setSortConfig, onSelectCoin, favorites, toggleFavorite, onClearFilters }) {
  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <section className="panel table-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Top 100</p>
          <h2>{t(locale, 'tableTitle')}</h2>
          <p>{t(locale, 'tableSubtitle')}</p>
        </div>
      </div>

      <div className="table-toolbar">
        <span>{t(locale, 'showingResults').replace('{count}', totalResults)}</span>
        <PaginationControls
          locale={locale}
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          setPage={setPage}
          setPageSize={setPageSize}
          totalResults={totalResults}
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th className="favorite-column" aria-label="Favorite" />
              <th>{t(locale, 'coin')}</th>
              {sortableColumns.map((column) => (
                <th key={column.key}>
                  <button className="table-sort-button" type="button" onClick={() => handleSort(column.key)}>
                    {column.label ?? t(locale, column.labelKey)}
                    <SortIndicator active={sortConfig.key === column.key} direction={sortConfig.direction} />
                  </button>
                </th>
              ))}
              <th>{t(locale, 'sparkline')}</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin) => {
              const isFavorite = favorites.includes(coin.id);
              const isPositive = (coin.price_change_percentage_7d_in_currency ?? coin.price_change_percentage_24h_in_currency ?? 0) >= 0;

              return (
                <tr key={coin.id} onClick={() => onSelectCoin(coin.id)}>
                  <td className="favorite-column" onClick={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      className={`favorite-button ${isFavorite ? 'active' : ''}`}
                      onClick={() => toggleFavorite(coin.id)}
                      aria-label={isFavorite ? t(locale, 'removeFavorite') : t(locale, 'addFavorite')}
                    >
                      <Star size={18} fill="currentColor" />
                    </button>
                  </td>
                  <td>
                    <div className="coin-cell">
                      <img src={coin.image} alt={coin.name} />
                      <div>
                        <strong>{coin.name}</strong>
                        <span>{coin.symbol.toUpperCase()}</span>
                      </div>
                    </div>
                  </td>
                  <td>#{coin.market_cap_rank}</td>
                  <td>{formatCurrency(coin.current_price, currency)}</td>
                  <td><ChangeCell value={coin.price_change_percentage_1h_in_currency} /></td>
                  <td><ChangeCell value={coin.price_change_percentage_24h_in_currency} /></td>
                  <td><ChangeCell value={coin.price_change_percentage_7d_in_currency} /></td>
                  <td>{formatCurrency(coin.market_cap, currency, true)}</td>
                  <td>{formatCurrency(coin.total_volume, currency, true)}</td>
                  <td><Sparkline values={coin.sparkline_in_7d?.price} positive={isPositive} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!coins.length ? (
        <EmptyState
          locale={locale}
          title={t(locale, 'emptyTitle')}
          description={t(locale, 'noResults')}
          actionLabel={t(locale, 'clearFilters')}
          onAction={onClearFilters}
        />
      ) : null}
    </section>
  );
}
