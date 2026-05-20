import { useCallback, useEffect, useState } from 'react';
import { getCoinDetails, getCoinMarketChart } from '../api/coingecko';
import type { CoinDetail, MarketChart, SupportedCurrency } from '../types/crypto';

export function useCoinDetails(
  selectedCoinId: string | null,
  currency: SupportedCurrency | string,
  days: number,
  comparisonCoinId: string,
) {
  const [detail, setDetail] = useState<CoinDetail | null>(null);
  const [chart, setChart] = useState<MarketChart | null>(null);
  const [comparisonChart, setComparisonChart] = useState<MarketChart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = useCallback(async () => {
    if (!selectedCoinId) return;

    setLoading(true);
    setError(null);

    try {
      const requests: Promise<CoinDetail | MarketChart>[] = [
        getCoinDetails(selectedCoinId),
        getCoinMarketChart({ id: selectedCoinId, vsCurrency: currency, days }),
      ];

      if (comparisonCoinId) {
        requests.push(getCoinMarketChart({ id: comparisonCoinId, vsCurrency: currency, days }));
      }

      const [coinDetail, marketChart, comparisonMarketChart] = await Promise.all(requests);

      setDetail(coinDetail as CoinDetail);
      setChart(marketChart as MarketChart);
      setComparisonChart((comparisonMarketChart as MarketChart | undefined) ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unexpected detail loading error.');
    } finally {
      setLoading(false);
    }
  }, [selectedCoinId, currency, days, comparisonCoinId]);

  useEffect(() => {
    if (!selectedCoinId) {
      setDetail(null);
      setChart(null);
      setComparisonChart(null);
      return;
    }

    loadDetails();
  }, [loadDetails, selectedCoinId]);

  return {
    detail,
    chart,
    comparisonChart,
    loading,
    error,
    refresh: loadDetails,
  };
}
