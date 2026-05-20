export type BackendMode = 'mock' | 'api';

export type CloudServiceStatus = 'ready' | 'mocked' | 'missing-config' | 'offline';

export type CloudService = {
  id: string;
  name: string;
  role: string;
  status: CloudServiceStatus;
  detail: string;
};

export type CloudSnapshot = {
  userId: string | null;
  generatedAt: string;
  watchlists: number;
  watchlistItems: number;
  portfolioTransactions: number;
  openPositions: number;
  alerts: number;
  activeAlerts: number;
  triggeredAlerts: number;
};

export type CloudSyncResult = {
  ok: boolean;
  mode: BackendMode;
  message: string;
  syncedAt: string;
  snapshot: CloudSnapshot;
};

export type CloudSyncState = {
  mode: BackendMode;
  endpoint: string | null;
  provider: string;
  authProvider: string;
  databaseProvider: string;
  functionsProvider: string;
  schedulerProvider: string;
  isConfigured: boolean;
  lastSyncAt: string | null;
  syncing: boolean;
  error: string | null;
  services: CloudService[];
  snapshot: CloudSnapshot;
  syncNow: () => Promise<CloudSyncResult>;
};
