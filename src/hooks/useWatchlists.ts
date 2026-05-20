import { useCallback, useEffect, useMemo } from 'react';
import type { Watchlist, WatchlistDraft, WatchlistItem, WatchlistPriority, WatchlistStatus } from '../types/watchlist';
import { useLocalStorage } from './useLocalStorage';

const nowIso = () => new Date().toISOString();
const normalizeName = (value: string) => value.trim().replace(/\s+/g, ' ');
const createId = (prefix = 'watchlist') => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function createItem(coinId: string): WatchlistItem {
  const createdAt = nowIso();
  return {
    coinId,
    addedAt: createdAt,
    updatedAt: createdAt,
    priority: 'medium',
    status: 'watching',
    note: '',
    targetPrice: null,
  };
}

function buildDefaultWatchlists(favoriteCoinIds: string[] = []): Watchlist[] {
  const createdAt = nowIso();
  return [
    {
      id: 'core-watchlist',
      name: 'Core Watchlist',
      description: 'Main assets followed from the market table.',
      color: '#4f46e5',
      createdAt,
      updatedAt: createdAt,
      items: favoriteCoinIds.map(createItem),
    },
    {
      id: 'long-term-watchlist',
      name: 'Long Term',
      description: 'Conviction assets for longer-term tracking.',
      color: '#059669',
      createdAt,
      updatedAt: createdAt,
      items: [],
    },
    {
      id: 'trading-watchlist',
      name: 'Trading Radar',
      description: 'Short-term setups and volatile assets.',
      color: '#f97316',
      createdAt,
      updatedAt: createdAt,
      items: [],
    },
  ];
}

function uniqueItems(items: WatchlistItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.coinId)) return false;
    seen.add(item.coinId);
    return true;
  });
}

export function useWatchlists(userId: string | undefined, favoriteCoinIds: string[]) {
  const storageKey = userId ? `cryptopulse-watchlists-${userId}` : 'cryptopulse-watchlists-demo';
  const [watchlists, setWatchlists] = useLocalStorage<Watchlist[]>(storageKey, buildDefaultWatchlists(favoriteCoinIds));

  useEffect(() => {
    if (!favoriteCoinIds.length) return;

    setWatchlists((current) => {
      if (!current.length) return buildDefaultWatchlists(favoriteCoinIds);
      const [firstList, ...rest] = current;
      const existing = new Set(firstList.items.map((item) => item.coinId));
      const missingItems = favoriteCoinIds.filter((coinId) => !existing.has(coinId)).map(createItem);
      if (!missingItems.length) return current;

      return [
        {
          ...firstList,
          updatedAt: nowIso(),
          items: uniqueItems([...firstList.items, ...missingItems]),
        },
        ...rest,
      ];
    });
  }, [favoriteCoinIds, setWatchlists]);

  const createWatchlist = useCallback((draft: WatchlistDraft) => {
    const name = normalizeName(draft.name);
    if (!name) return null;

    const createdAt = nowIso();
    const list: Watchlist = {
      id: createId(),
      name,
      description: draft.description.trim(),
      color: draft.color || '#38bdf8',
      createdAt,
      updatedAt: createdAt,
      items: [],
    };

    setWatchlists((current) => [...current, list]);
    return list;
  }, [setWatchlists]);

  const updateWatchlist = useCallback((watchlistId: string, updates: Partial<WatchlistDraft>) => {
    setWatchlists((current) => current.map((list) => (
      list.id === watchlistId
        ? {
          ...list,
          name: updates.name !== undefined ? normalizeName(updates.name) || list.name : list.name,
          description: updates.description !== undefined ? updates.description.trim() : list.description,
          color: updates.color ?? list.color,
          updatedAt: nowIso(),
        }
        : list
    )));
  }, [setWatchlists]);

  const deleteWatchlist = useCallback((watchlistId: string) => {
    setWatchlists((current) => current.length <= 1 ? current : current.filter((list) => list.id !== watchlistId));
  }, [setWatchlists]);

  const addCoinToWatchlist = useCallback((watchlistId: string, coinId: string) => {
    setWatchlists((current) => current.map((list) => {
      if (list.id !== watchlistId) return list;
      if (list.items.some((item) => item.coinId === coinId)) return list;
      return {
        ...list,
        updatedAt: nowIso(),
        items: [...list.items, createItem(coinId)],
      };
    }));
  }, [setWatchlists]);

  const removeCoinFromWatchlist = useCallback((watchlistId: string, coinId: string) => {
    setWatchlists((current) => current.map((list) => (
      list.id === watchlistId
        ? { ...list, updatedAt: nowIso(), items: list.items.filter((item) => item.coinId !== coinId) }
        : list
    )));
  }, [setWatchlists]);

  const updateWatchlistItem = useCallback((watchlistId: string, coinId: string, updates: Partial<Pick<WatchlistItem, 'note' | 'priority' | 'status' | 'targetPrice'>>) => {
    setWatchlists((current) => current.map((list) => (
      list.id === watchlistId
        ? {
          ...list,
          updatedAt: nowIso(),
          items: list.items.map((item) => (
            item.coinId === coinId
              ? {
                ...item,
                ...updates,
                note: updates.note !== undefined ? updates.note : item.note,
                priority: (updates.priority as WatchlistPriority | undefined) ?? item.priority,
                status: (updates.status as WatchlistStatus | undefined) ?? item.status,
                targetPrice: updates.targetPrice === undefined ? item.targetPrice : updates.targetPrice,
                updatedAt: nowIso(),
              }
              : item
          )),
        }
        : list
    )));
  }, [setWatchlists]);

  const allTrackedCoinIds = useMemo(() => {
    const tracked = new Set<string>();
    watchlists.forEach((list) => list.items.forEach((item) => tracked.add(item.coinId)));
    return Array.from(tracked);
  }, [watchlists]);

  return {
    watchlists,
    allTrackedCoinIds,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    addCoinToWatchlist,
    removeCoinFromWatchlist,
    updateWatchlistItem,
  };
}
