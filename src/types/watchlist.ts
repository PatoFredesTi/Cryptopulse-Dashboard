export type WatchlistPriority = 'low' | 'medium' | 'high';
export type WatchlistStatus = 'watching' | 'buy-zone' | 'holding' | 'risky';
export type WatchlistSortMode = 'rank' | 'change24h' | 'marketCap' | 'priority' | 'updatedAt';

export type WatchlistItem = {
  coinId: string;
  addedAt: string;
  updatedAt: string;
  priority: WatchlistPriority;
  status: WatchlistStatus;
  note: string;
  targetPrice?: number | null;
};

export type Watchlist = {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  items: WatchlistItem[];
};

export type WatchlistDraft = {
  name: string;
  description: string;
  color: string;
};

export type WatchlistSummary = {
  totalLists: number;
  totalItems: number;
  averageChange24h: number;
  trackedMarketCap: number;
  highPriorityItems: number;
};
