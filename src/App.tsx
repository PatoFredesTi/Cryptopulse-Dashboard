import { useEffect, useMemo, useState } from 'react';
import { CoinDetailDrawer } from './components/CoinDetailDrawer';
import { CryptoTable } from './components/CryptoTable';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { ErrorState } from './components/ErrorState';
import { FiltersBar } from './components/FiltersBar';
import { Header } from './components/Header';
import { MarketHero } from './components/MarketHero';
import { MarketOverview } from './components/MarketOverview';
import { RoadmapCards } from './components/RoadmapCards';
import { StatusBanner } from './components/StatusBanner';
import { ToastContainer } from './components/ToastContainer';
import { TrendingCoins } from './components/TrendingCoins';
import { UserDashboard } from './components/user/UserDashboard';
import { useAuthSession } from './hooks/useAuthSession';
import { useAutoRefreshTimer } from './hooks/useAutoRefreshTimer';
import { useCloudSync } from './hooks/useCloudSync';
import { useCryptoMarket } from './hooks/useCryptoMarket';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { useLocalStorage } from './hooks/useLocalStorage';
import { usePortfolio } from './hooks/usePortfolio';
import { usePriceAlerts } from './hooks/usePriceAlerts';
import { useToast } from './hooks/useToast';
import { useWatchlists } from './hooks/useWatchlists';
import type { AuthActivity, AuthUser } from './types/auth';
import type { CryptoMarket } from './types/crypto';
import { t } from './utils/i18n';

type AppView = 'market' | 'dashboard' | 'case-study';

type SortConfig = {
  key: keyof CryptoMarket;
  direction: 'asc' | 'desc';
};

const PUBLIC_WORKSPACE_USER: AuthUser = {
  id: 'public-workspace',
  name: 'CryptoPulse Workspace',
  email: 'workspace@cryptopulse.local',
  role: 'Analyst',
  plan: 'Demo',
  avatarInitials: 'CP',
  riskProfile: 'balanced',
  preferredCurrency: 'usd',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
};

const PUBLIC_WORKSPACE_ACTIVITY: AuthActivity[] = [
  {
    id: 'activity-v31-polish',
    type: 'profile-update',
    title: 'Workspace enabled',
    description: 'CryptoPulse v3.1 removes login friction and keeps portfolio tools available locally.',
    createdAt: new Date().toISOString(),
  },
];

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function applyFilter(coins: CryptoMarket[], activeFilter: string, favorites: string[]) {
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

function applySort(coins: CryptoMarket[], sortConfig: SortConfig, favorites: string[]) {
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
  const [theme, setTheme] = useLocalStorage(
    'cryptopulse-theme',
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
  );
  const [currency, setCurrency] = useLocalStorage('cryptopulse-currency', 'usd');
  const [favorites, setFavorites] = useLocalStorage<string[]>('cryptopulse-favorites', []);
  const [activeView, setActiveView] = useLocalStorage<AppView>('cryptopulse-v31-active-view', 'market');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 280);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedCoinId, setSelectedCoinId] = useState<string | null>(null);
  const [detailDays, setDetailDays] = useState(30);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useLocalStorage('cryptopulse-page-size', 25);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'market_cap_rank', direction: 'asc' });
  const { toasts, pushToast, removeToast } = useToast();
  const auth = useAuthSession();
  const workspaceUser = auth.user ?? PUBLIC_WORKSPACE_USER;
  const workspaceActivity = auth.activity.length ? auth.activity : PUBLIC_WORKSPACE_ACTIVITY;
  const watchlists = useWatchlists(workspaceUser.id, favorites);

  const { coins, globalData, trending, loading, error, lastUpdated, refresh } = useCryptoMarket(currency);
  const portfolio = usePortfolio(workspaceUser.id, coins);
  const alerts = usePriceAlerts(workspaceUser.id, coins, currency);
  const cloudSync = useCloudSync({ user: workspaceUser, watchlists: watchlists.watchlists, portfolio, alerts });
  const { nextRefreshSeconds, progress: refreshProgress } = useAutoRefreshTimer(lastUpdated);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.lang = locale;
  }, [theme, locale]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeFilter, sortConfig, pageSize, currency]);

  const handleNavigate = (view: AppView) => {
    setActiveView(view);
  };

  const toggleFavorite = (coinId: string) => {
    const coin = coins.find((item) => item.id === coinId);
    const isFavorite = favorites.includes(coinId);

    setFavorites((current) => (
      current.includes(coinId)
        ? current.filter((id) => id !== coinId)
        : [...current, coinId]
    ));

    pushToast(
      isFavorite
        ? t(locale, 'favoriteRemoved').replace('{coin}', coin?.name ?? coinId)
        : t(locale, 'favoriteAdded').replace('{coin}', coin?.name ?? coinId),
      isFavorite ? 'neutral' : 'positive',
    );
  };

  const clearFilters = () => {
    setSearch('');
    setActiveFilter('all');
    setSortConfig({ key: 'market_cap_rank', direction: 'asc' });
    setPage(1);
  };

  const visibleCoins = useMemo(() => {
    const query = normalizeSearch(debouncedSearch);
    const searchedCoins = query
      ? coins.filter((coin) => (
        coin.name.toLowerCase().includes(query)
        || coin.symbol.toLowerCase().includes(query)
        || coin.id.toLowerCase().includes(query)
      ))
      : coins;

    const filteredCoins = applyFilter(searchedCoins, activeFilter, favorites);
    return applySort(filteredCoins, sortConfig, favorites);
  }, [coins, debouncedSearch, activeFilter, favorites, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(visibleCoins.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedCoins = visibleCoins.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const selectedMarketCoin = useMemo(
    () => coins.find((coin) => coin.id === selectedCoinId),
    [coins, selectedCoinId],
  );

  const renderHeader = () => (
    <Header
      locale={locale}
      setLocale={setLocale}
      currency={currency}
      setCurrency={setCurrency}
      theme={theme}
      setTheme={setTheme}
      onRefresh={refresh}
      loading={loading}
      activeView={activeView}
      onNavigate={handleNavigate}
    />
  );

  if (loading && !coins.length) {
    return (
      <main className="app-shell">
        {renderHeader()}
        <DashboardSkeleton />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </main>
    );
  }

  if (error && !coins.length) {
    return (
      <main className="app-shell">
        {renderHeader()}
        <ErrorState locale={locale} error={error} onRetry={refresh} />
      </main>
    );
  }

  return (
    <main className="app-shell">
      {renderHeader()}

      {activeView === 'dashboard' ? (
        <UserDashboard
          locale={locale}
          currency={currency}
          user={workspaceUser}
          favorites={favorites}
          coins={coins}
          activity={workspaceActivity}
          watchlists={watchlists.watchlists}
          portfolio={portfolio}
          alerts={alerts}
          cloudSync={cloudSync}
          onOpenAuth={() => undefined}
          onNavigateProfile={() => undefined}
          onSelectCoin={setSelectedCoinId}
          onCreateWatchlist={watchlists.createWatchlist}
          onUpdateWatchlist={watchlists.updateWatchlist}
          onDeleteWatchlist={watchlists.deleteWatchlist}
          onAddCoinToWatchlist={watchlists.addCoinToWatchlist}
          onRemoveCoinFromWatchlist={watchlists.removeCoinFromWatchlist}
          onUpdateWatchlistItem={watchlists.updateWatchlistItem}
        />
      ) : null}

      {activeView === 'market' ? (
        <>
          <MarketHero locale={locale} currency={currency} globalData={globalData} coins={coins} onSelectCoin={setSelectedCoinId} />

          <MarketOverview locale={locale} currency={currency} globalData={globalData} coins={coins} />

          <StatusBanner
            locale={locale}
            loading={loading}
            error={error}
            lastUpdated={lastUpdated}
            totalCoins={coins.length}
            visibleCoins={visibleCoins.length}
            nextRefreshSeconds={nextRefreshSeconds}
            refreshProgress={refreshProgress}
          />

          <DashboardAnalytics
            locale={locale}
            currency={currency}
            globalData={globalData}
            coins={coins}
            onSelectCoin={setSelectedCoinId}
          />

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
                coins={paginatedCoins}
                totalResults={visibleCoins.length}
                page={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                setPage={setPage}
                setPageSize={setPageSize}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
                onSelectCoin={setSelectedCoinId}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                onClearFilters={clearFilters}
              />
            </div>
          </div>
        </>
      ) : null}

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
        availableCoins={coins}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </main>
  );
}
