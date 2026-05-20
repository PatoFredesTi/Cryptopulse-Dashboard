import { useCallback, useEffect, useState } from 'react';
import { getGlobalData, getMarkets, getTrendingCoins } from '../api/coingecko';
import type { CryptoMarket, SupportedCurrency, TrendingCoin } from '../types/crypto';

type GlobalMarketData = Record<string, any> | null;

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
      const [markets, globalResponse, trendingResponse] = await Promise.all([
        getMarkets({ vsCurrency: currency, perPage: 100 }),
        getGlobalData(),
        getTrendingCoins(),
      ]);

      setCoins(markets);
      setGlobalData(globalResponse.data);
      setTrending(trendingResponse.coins ?? []);
      setLastUpdated(new Date());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unexpected data loading error.');
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
