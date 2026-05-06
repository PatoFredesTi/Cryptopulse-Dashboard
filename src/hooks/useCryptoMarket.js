import { useCallback, useEffect, useState } from 'react';
import { getGlobalData, getMarkets, getTrendingCoins } from '../api/coingecko';

export function useCryptoMarket(currency) {
  const [coins, setCoins] = useState([]);
  const [globalData, setGlobalData] = useState(null);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

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
      setError(requestError.message);
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
