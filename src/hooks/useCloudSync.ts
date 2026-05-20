import { useMemo, useState } from 'react';
import { syncCloudSnapshot } from '../api/backend';
import type { PriceAlertSummary } from '../types/alerts';
import type { AuthUser } from '../types/auth';
import type { BackendMode, CloudService, CloudSnapshot, CloudSyncState } from '../types/backend';
import type { PortfolioPosition, PortfolioSummary, PortfolioTransaction } from '../types/portfolio';
import type { Watchlist } from '../types/watchlist';

function getBackendMode(): BackendMode {
  return import.meta.env.VITE_BACKEND_MODE === 'api' ? 'api' : 'mock';
}

function buildServices({
  mode,
  endpoint,
  provider,
  authProvider,
  databaseProvider,
  functionsProvider,
  schedulerProvider,
}: {
  mode: BackendMode;
  endpoint: string | null;
  provider: string;
  authProvider: string;
  databaseProvider: string;
  functionsProvider: string;
  schedulerProvider: string;
}): CloudService[] {
  const hasEndpoint = Boolean(endpoint);
  const status = mode === 'api' && hasEndpoint ? 'ready' : 'mocked';
  const apiStatus = mode === 'api' ? (hasEndpoint ? 'ready' : 'missing-config') : 'mocked';

  return [
    {
      id: 'auth',
      name: authProvider,
      role: 'Identity provider for private dashboards and user-owned data.',
      status,
      detail: mode === 'api' ? 'Auth provider ready to protect API calls.' : 'Demo session active; Cognito can replace this layer.',
    },
    {
      id: 'api',
      name: 'API Gateway',
      role: 'HTTP entrypoint for watchlists, portfolio transactions and alerts.',
      status: apiStatus,
      detail: hasEndpoint ? endpoint! : 'Add VITE_CRYPTO_BACKEND_URL to connect a deployed API.',
    },
    {
      id: 'functions',
      name: functionsProvider,
      role: 'Serverless business logic and CoinGecko cache adapter.',
      status,
      detail: `${provider} functions layer prepared for future persistence and scheduled jobs.`,
    },
    {
      id: 'database',
      name: databaseProvider,
      role: 'Persistent storage for watchlists, portfolio transactions and alerts.',
      status,
      detail: 'Local storage models already match the cloud persistence boundaries.',
    },
    {
      id: 'scheduler',
      name: schedulerProvider,
      role: 'Scheduled alert evaluation and notification workflows.',
      status,
      detail: 'Alert engine can move from browser evaluation to scheduled cloud workers.',
    },
  ];
}

export function useCloudSync({
  user,
  watchlists,
  portfolio,
  alerts,
}: {
  user: AuthUser | null;
  watchlists: Watchlist[];
  portfolio: {
    transactions: PortfolioTransaction[];
    positions: PortfolioPosition[];
    summary: PortfolioSummary;
  };
  alerts: {
    summary: PriceAlertSummary;
  };
}): CloudSyncState {
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode = getBackendMode();
  const endpoint = import.meta.env.VITE_CRYPTO_BACKEND_URL || null;
  const provider = import.meta.env.VITE_CLOUD_PROVIDER || 'AWS';
  const authProvider = import.meta.env.VITE_AUTH_PROVIDER || 'Cognito';
  const databaseProvider = import.meta.env.VITE_DATABASE_PROVIDER || 'DynamoDB';
  const functionsProvider = import.meta.env.VITE_FUNCTIONS_PROVIDER || 'Lambda';
  const schedulerProvider = import.meta.env.VITE_SCHEDULER_PROVIDER || 'EventBridge';
  const isConfigured = mode === 'mock' || Boolean(endpoint);

  const snapshot = useMemo<CloudSnapshot>(() => ({
    userId: user?.id ?? null,
    generatedAt: new Date().toISOString(),
    watchlists: watchlists.length,
    watchlistItems: watchlists.reduce((sum, list) => sum + list.items.length, 0),
    portfolioTransactions: portfolio.transactions.length,
    openPositions: portfolio.positions.length,
    alerts: alerts.summary.total,
    activeAlerts: alerts.summary.active,
    triggeredAlerts: alerts.summary.triggered,
  }), [user?.id, watchlists, portfolio.transactions.length, portfolio.positions.length, alerts.summary.total, alerts.summary.active, alerts.summary.triggered]);

  const services = useMemo(() => buildServices({
    mode,
    endpoint,
    provider,
    authProvider,
    databaseProvider,
    functionsProvider,
    schedulerProvider,
  }), [mode, endpoint, provider, authProvider, databaseProvider, functionsProvider, schedulerProvider]);

  const syncNow = async () => {
    setSyncing(true);
    setError(null);

    try {
      const result = await syncCloudSnapshot({ mode, endpoint, snapshot });
      setLastSyncAt(result.syncedAt);
      return result;
    } catch (syncError) {
      const message = syncError instanceof Error ? syncError.message : 'Unknown backend sync error';
      setError(message);
      throw syncError;
    } finally {
      setSyncing(false);
    }
  };

  return {
    mode,
    endpoint,
    provider,
    authProvider,
    databaseProvider,
    functionsProvider,
    schedulerProvider,
    isConfigured,
    lastSyncAt,
    syncing,
    error,
    services,
    snapshot,
    syncNow,
  };
}
