import { BellRing, BriefcaseBusiness, PieChart, ShieldCheck, Star, TrendingUp, WalletCards } from 'lucide-react';
import type { AuthActivity, AuthUser } from '../../types/auth';
import type { CryptoMarket } from '../../types/crypto';
import type { Watchlist, WatchlistItem } from '../../types/watchlist';
import type { PortfolioPosition, PortfolioSummary, PortfolioTransaction, PortfolioTransactionDraft } from '../../types/portfolio';
import type { AlertEvaluation, PriceAlert, PriceAlertDraft, PriceAlertSummary } from '../../types/alerts';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import { t } from '../../utils/i18n';
import { WatchlistManager } from './WatchlistManager';
import { PortfolioSimulator } from './PortfolioSimulator';
import { PriceAlertsManager } from './PriceAlertsManager';
import { BackendIntegrationPanel } from './BackendIntegrationPanel';
import type { CloudSyncState } from '../../types/backend';

type UserDashboardProps = {
  locale: string;
  currency: string;
  user: AuthUser | null;
  favorites: string[];
  coins: CryptoMarket[];
  activity: AuthActivity[];
  watchlists: Watchlist[];
  portfolio: {
    transactions: PortfolioTransaction[];
    positions: PortfolioPosition[];
    summary: PortfolioSummary;
    addTransaction: (draft: PortfolioTransactionDraft) => PortfolioTransaction | null;
    removeTransaction: (transactionId: string) => void;
    clearPortfolio: () => void;
  };
  alerts: {
    alerts: PriceAlert[];
    evaluations: AlertEvaluation[];
    summary: PriceAlertSummary;
    createAlert: (draft: PriceAlertDraft) => PriceAlert | null;
    removeAlert: (alertId: string) => void;
    toggleAlertStatus: (alertId: string) => void;
    clearTriggeredHistory: () => void;
  };
  cloudSync: CloudSyncState;
  onOpenAuth: () => void;
  onNavigateProfile: () => void;
  onSelectCoin: (coinId: string) => void;
  onCreateWatchlist: (draft: { name: string; description: string; color: string }) => Watchlist | null;
  onUpdateWatchlist: (watchlistId: string, updates: { name?: string; description?: string; color?: string }) => void;
  onDeleteWatchlist: (watchlistId: string) => void;
  onAddCoinToWatchlist: (watchlistId: string, coinId: string) => void;
  onRemoveCoinFromWatchlist: (watchlistId: string, coinId: string) => void;
  onUpdateWatchlistItem: (watchlistId: string, coinId: string, updates: Partial<Pick<WatchlistItem, 'note' | 'priority' | 'status' | 'targetPrice'>>) => void;
};

function getTrackedCoinIds(watchlists: Watchlist[]) {
  const tracked = new Set<string>();
  watchlists.forEach((list) => list.items.forEach((item) => tracked.add(item.coinId)));
  return Array.from(tracked);
}

function getTrackedCoins(coins: CryptoMarket[], watchlists: Watchlist[]) {
  const trackedIds = getTrackedCoinIds(watchlists);
  return coins.filter((coin) => trackedIds.includes(coin.id));
}

export function UserDashboard({
  locale,
  currency,
  user,
  favorites,
  coins,
  activity,
  watchlists,
  portfolio,
  alerts,
  cloudSync,
  onOpenAuth,
  onNavigateProfile,
  onSelectCoin,
  onCreateWatchlist,
  onUpdateWatchlist,
  onDeleteWatchlist,
  onAddCoinToWatchlist,
  onRemoveCoinFromWatchlist,
  onUpdateWatchlistItem,
}: UserDashboardProps) {
  const trackedCoins = getTrackedCoins(coins, watchlists);
  const averageTrackedChange = trackedCoins.length
    ? trackedCoins.reduce((sum, coin) => sum + (coin.price_change_percentage_24h_in_currency ?? 0), 0) / trackedCoins.length
    : 0;
  const trackedMarketCap = trackedCoins.reduce((sum, coin) => sum + (coin.market_cap ?? 0), 0);
  const totalWatchlistItems = watchlists.reduce((sum, list) => sum + list.items.length, 0);
  const highPriorityItems = watchlists.reduce((sum, list) => sum + list.items.filter((item) => item.priority === 'high').length, 0);
  const portfolioValue = portfolio.summary.currentValue;
  const portfolioRoi = portfolio.summary.roi;
  const triggeredAlerts = alerts.summary.triggered;

  if (!user) {
    return (
      <section className="panel auth-gate">
        <div>
          <p className="eyebrow">Identity Layer · v2.9</p>
          <h2>{t(locale, 'authGateTitle')}</h2>
          <p>{t(locale, 'authGateDescription')}</p>
        </div>
        <button className="primary-button" type="button" onClick={onOpenAuth}>
          <ShieldCheck size={16} />
          {t(locale, 'authStartSession')}
        </button>
      </section>
    );
  }

  return (
    <section className="user-dashboard-grid">
      <article className="panel user-hero-card">
        <div className="user-avatar xl">{user.avatarInitials}</div>
        <div>
          <p className="eyebrow">{t(locale, '')}</p>
          <h2>{t(locale, 'workspaceTitle')}</h2>
          <p>{t(locale, 'workspaceDescription')}</p>
        </div>
        <span className="workspace-mode-pill">
          <ShieldCheck size={16} />
          {t(locale, 'localMode')}
        </span>
      </article>

      <div className="auth-metrics-grid four-columns">
        <article className="panel auth-metric-card">
          <Star size={18} />
          <span>{t(locale, 'savedAssets')}</span>
          <strong>{totalWatchlistItems}</strong>
          <small>{watchlists.length} {t(locale, 'customLists')}</small>
        </article>
        <article className="panel auth-metric-card">
          <TrendingUp size={18} />
          <span>{t(locale, 'watchlistPerformance')}</span>
          <strong className={averageTrackedChange >= 0 ? 'positive' : 'negative'}>{formatPercent(averageTrackedChange)}</strong>
          <small>{t(locale, 'average24h')}</small>
        </article>
        <article className="panel auth-metric-card">
          <BriefcaseBusiness size={18} />
          <span>{t(locale, 'trackedMarketCap')}</span>
          <strong>{formatCurrency(trackedMarketCap, currency)}</strong>
          <small>{highPriorityItems} {t(locale, 'highPriority')}</small>
        </article>
        <article className="panel auth-metric-card">
          <WalletCards size={18} />
          <span>{t(locale, 'portfolioCurrentValue')}</span>
          <strong>{formatCurrency(portfolioValue, currency)}</strong>
          <small>{portfolio.positions.length} {t(locale, 'openPositions')}</small>
        </article>
        <article className="panel auth-metric-card">
          <PieChart size={18} />
          <span>{t(locale, 'portfolioRoi')}</span>
          <strong className={portfolioRoi >= 0 ? 'positive' : 'negative'}>{formatPercent(portfolioRoi)}</strong>
          <small>{portfolio.transactions.length} {t(locale, 'transactions')}</small>
        </article>
        <article className="panel auth-metric-card">
          <BellRing size={18} />
          <span>{t(locale, 'activeAlerts')}</span>
          <strong className={triggeredAlerts ? 'positive' : ''}>{alerts.summary.active}</strong>
          <small>{triggeredAlerts} {t(locale, 'triggeredAlerts')}</small>
        </article>
      </div>

      
        <div className="main-column">
          <WatchlistManager
            locale={locale}
            currency={currency}
            coins={coins}
            watchlists={watchlists}
            onCreateWatchlist={onCreateWatchlist}
            onUpdateWatchlist={onUpdateWatchlist}
            onDeleteWatchlist={onDeleteWatchlist}
            onAddCoin={onAddCoinToWatchlist}
            onRemoveCoin={onRemoveCoinFromWatchlist}
            onUpdateItem={onUpdateWatchlistItem}
            onSelectCoin={onSelectCoin}
          />

          <PortfolioSimulator
            locale={locale}
            currency={currency}
            coins={coins}
            transactions={portfolio.transactions}
            positions={portfolio.positions}
            summary={portfolio.summary}
            onAddTransaction={portfolio.addTransaction}
            onRemoveTransaction={portfolio.removeTransaction}
            onClearPortfolio={portfolio.clearPortfolio}
            onSelectCoin={onSelectCoin}
          />

          <PriceAlertsManager
            locale={locale}
            currency={currency}
            coins={coins}
            alerts={alerts.alerts}
            evaluations={alerts.evaluations}
            summary={alerts.summary}
            onCreateAlert={alerts.createAlert}
            onRemoveAlert={alerts.removeAlert}
            onToggleAlertStatus={alerts.toggleAlertStatus}
            onClearTriggeredHistory={alerts.clearTriggeredHistory}
            onSelectCoin={onSelectCoin}
          />
        </div>


    </section>
  );
}
