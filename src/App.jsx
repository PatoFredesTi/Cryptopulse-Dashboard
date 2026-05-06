import { useEffect, useMemo, useState } from 'react';
import { CoinDetailDrawer } from './components/CoinDetailDrawer';
import { CryptoTable } from './components/CryptoTable';
import { ErrorState } from './components/ErrorState';
import { FiltersBar } from './components/FiltersBar';
import { Header } from './components/Header';
import { LoadingState } from './components/LoadingState';
import { MarketOverview } from './components/MarketOverview';
import { RoadmapCards } from './components/RoadmapCards';
import { TrendingCoins } from './components/TrendingCoins';
import { useCryptoMarket } from './hooks/useCryptoMarket';
import { useLocalStorage } from './hooks/useLocalStorage';
import { t } from './utils/i18n';

function normalizeSearch(value) {
  return value.trim().toLowerCase();
}

function applyFilter(coins, activeFilter, favorites) {
  if (activeFilter === 'gainers') {
    return coins.filter((coin) => (coin.price_change_percentage_24h_in_currency ?? 0) > 0);
  }

  if (activeFilter === 'losers') {
    return coins.filter((coin) => (coin.price_change_percentage_24h_in_currency ?? 0) < 0);
  }

  if (activeFilter === 'favorites') {
    return coins.filter((coin) => favorites.includes(coin.id));
  }

  return coins;
}

function applySort(coins, sortConfig, favorites) {
  return [...coins].sort((a, b) => {
    const aFavorite = favorites.includes(a.id);
    const bFavorite = favorites.includes(b.id);

    if (aFavorite !== bFavorite) return aFavorite ? -1 : 1;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export default function App() {
  const [locale, setLocale] = useLocalStorage('cryptopulse-locale', 'es');
  const [theme, setTheme] = useLocalStorage('cryptopulse-theme', 'dark');
  const [currency, setCurrency] = useLocalStorage('cryptopulse-currency', 'usd');
  const [favorites, setFavorites] = useLocalStorage('cryptopulse-favorites', []);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCoinId, setSelectedCoinId] = useState(null);
  const [detailDays, setDetailDays] = useState(30);
  const [sortConfig, setSortConfig] = useState({ key: 'market_cap_rank', direction: 'asc' });

  const { coins, globalData, trending, loading, error, lastUpdated, refresh } = useCryptoMarket(currency);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = locale;
  }, [theme, locale]);

  const toggleFavorite = (coinId) => {
    setFavorites((current) => (
      current.includes(coinId)
        ? current.filter((id) => id !== coinId)
        : [...current, coinId]
    ));
  };

  const visibleCoins = useMemo(() => {
    const query = normalizeSearch(search);
    const searchedCoins = query
      ? coins.filter((coin) => (
        coin.name.toLowerCase().includes(query)
        || coin.symbol.toLowerCase().includes(query)
        || coin.id.toLowerCase().includes(query)
      ))
      : coins;

    const filteredCoins = applyFilter(searchedCoins, activeFilter, favorites);
    return applySort(filteredCoins, sortConfig, favorites);
  }, [coins, search, activeFilter, favorites, sortConfig]);

  const selectedMarketCoin = useMemo(
    () => coins.find((coin) => coin.id === selectedCoinId),
    [coins, selectedCoinId],
  );

  if (loading && !coins.length) {
    return (
      <main className="app-shell">
        <LoadingState message={t(locale, 'loading')} />
      </main>
    );
  }

  if (error && !coins.length) {
    return (
      <main className="app-shell">
        <ErrorState locale={locale} error={error} onRetry={refresh} />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <Header
        locale={locale}
        setLocale={setLocale}
        currency={currency}
        setCurrency={setCurrency}
        theme={theme}
        setTheme={setTheme}
        onRefresh={refresh}
        loading={loading}
      />

      <MarketOverview locale={locale} currency={currency} globalData={globalData} coins={coins} />

      <div className="content-grid">
        <div className="main-column">
          <FiltersBar
            locale={locale}
            search={search}
            setSearch={setSearch}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            favoritesCount={favorites.length}
          />

          {error ? <div className="soft-alert">{error}</div> : null}

          <CryptoTable
            locale={locale}
            currency={currency}
            coins={visibleCoins}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            onSelectCoin={setSelectedCoinId}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        </div>

        <aside className="side-column">
          <TrendingCoins locale={locale} trending={trending} onSelectCoin={setSelectedCoinId} />
          <section className="panel meta-panel">
            <p className="eyebrow">Status</p>
            <h2>{t(locale, 'lastUpdated')}</h2>
            <strong>{lastUpdated ? lastUpdated.toLocaleString(locale === 'es' ? 'es-CL' : 'en-US') : '—'}</strong>
            <p>Auto-refresh cada 2 minutos. Favoritos persistidos en localStorage para esta versión.</p>
          </section>
        </aside>
      </div>

      <CoinDetailDrawer
        locale={locale}
        currency={currency}
        selectedCoinId={selectedCoinId}
        selectedMarketCoin={selectedMarketCoin}
        onClose={() => setSelectedCoinId(null)}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        days={detailDays}
        setDays={setDetailDays}
      />
    </main>
  );
}
