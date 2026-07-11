import { useCallback, useEffect, useState } from 'react';
import { getGlobalData, getMarkets, getTrendingCoins } from '../api/coingecko';
import type { CryptoMarket, SupportedCurrency, TrendingCoin } from '../types/crypto';

type GlobalMarketData = Record<string, any> | null;
const MARKET_CACHE_KEY = 'cryptopulse-market-cache-v1';

type MarketCache = {
  currency: string;
  coins: CryptoMarket[];
  globalData: GlobalMarketData;
  trending: TrendingCoin[];
  updatedAt: string;
};

function readMarketCache(currency: string): MarketCache | null {
  try {
    const cached = JSON.parse(localStorage.getItem(MARKET_CACHE_KEY) ?? 'null') as MarketCache | null;
    return cached?.currency === currency && Array.isArray(cached.coins) ? cached : null;
  } catch {
    return null;
  }
}

export function useCryptoMarket(currency: SupportedCurrency | string) {
  const [coins, setCoins] = useState<CryptoMarket[]>([]);
  const [globalData, setGlobalData] = useState<GlobalMarketData>(null);
  const [trending, setTrending] = useState<TrendingCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [marketsResult, globalResult, trendingResult] = await Promise.allSettled([
        getMarkets({ vsCurrency: currency, perPage: 100 }),
        getGlobalData(),
        getTrendingCoins(),
      ]);

      if (marketsResult.status === 'rejected') throw marketsResult.reason;

      const updatedAt = new Date();
      const nextGlobalData = globalResult.status === 'fulfilled' ? globalResult.value.data : null;
      const nextTrending = trendingResult.status === 'fulfilled' ? trendingResult.value.coins ?? [] : [];

      setCoins(marketsResult.value);
      setGlobalData(nextGlobalData);
      setTrending(nextTrending);
      setLastUpdated(updatedAt);
      localStorage.setItem(MARKET_CACHE_KEY, JSON.stringify({
        currency,
        coins: marketsResult.value,
        globalData: nextGlobalData,
        trending: nextTrending,
        updatedAt: updatedAt.toISOString(),
      } satisfies MarketCache));
    } catch (requestError) {
      const cached = readMarketCache(currency);
      if (cached) {
        setCoins(cached.coins);
        setGlobalData(cached.globalData);
        setTrending(cached.trending);
        setLastUpdated(new Date(cached.updatedAt));
        setError('Conexión temporalmente no disponible. Estás viendo los últimos datos guardados.');
      } else {
        setError(requestError instanceof Error ? requestError.message : 'No fue posible cargar los datos del mercado.');
      }
    } finally {
      setLoading(false);
    }
  }, [currency]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const intervalId = window.setInterval(loadData, 120000);
    return () => window.clearInterval(intervalId);
  }, [loadData]);

  return {
    coins,
    globalData,
    trending,
    loading,
    error,
    lastUpdated,
    refresh: loadData,
  };
}
