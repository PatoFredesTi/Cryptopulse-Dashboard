import { useCallback, useEffect, useState } from 'react';
import { getCoinDetails, getCoinMarketChart } from '../api/coingecko';

export function useCoinDetails(selectedCoinId, currency, days) {
  const [detail, setDetail] = useState(null);
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDetails = useCallback(async () => {
    if (!selectedCoinId) return;

    setLoading(true);
    setError(null);

    try {
      const [coinDetail, marketChart] = await Promise.all([
        getCoinDetails(selectedCoinId),
        getCoinMarketChart({ id: selectedCoinId, vsCurrency: currency, days }),
      ]);

      setDetail(coinDetail);
      setChart(marketChart);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCoinId, currency, days]);

  useEffect(() => {
    if (!selectedCoinId) {
      setDetail(null);
      setChart(null);
      return;
    }

    loadDetails();
  }, [loadDetails, selectedCoinId]);

  return {
    detail,
    chart,
    loading,
    error,
    refresh: loadDetails,
  };
}
