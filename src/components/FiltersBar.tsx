import { Search } from 'lucide-react';
import { t } from '../utils/i18n';

const filters = ['all', 'gainers', 'losers', 'favorites'];

export function FiltersBar({ locale, search, setSearch, activeFilter, setActiveFilter, favoritesCount }) {
  return (
    <section className="filters-bar">
      <label className="search-box">
        <Search size={18} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t(locale, 'searchPlaceholder')}
        />
      </label>

      <div className="filter-tabs">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={activeFilter === filter ? 'active' : ''}
            onClick={() => setActiveFilter(filter)}
          >
            {t(locale, filter)}
            {filter === 'favorites' ? <span>{favoritesCount}</span> : null}
          </button>
        ))}
      </div>
    </section>
  );
}
