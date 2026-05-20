import type { CoinDetail, CryptoMarket, MarketChart, SupportedCurrency, TrendingCoin } from '../types/crypto';

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

type GetMarketsParams = {
  vsCurrency?: SupportedCurrency | string;
  perPage?: number;
  page?: number;
};

type GetMarketChartParams = {
  id: string;
  vsCurrency?: SupportedCurrency | string;
  days?: number;
};

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      accept: 'application/json',
    },
  });

  if (!response.ok) {
    const message = response.status === 429
      ? 'CoinGecko rate limit reached. Try again in a minute.'
      : `CoinGecko request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function getMarkets({ vsCurrency = 'usd', perPage = 100, page = 1 }: GetMarketsParams = {}): Promise<CryptoMarket[]> {
  const params = new URLSearchParams({
    vs_currency: vsCurrency,
    order: 'market_cap_desc',
    per_page: String(perPage),
    page: String(page),
    sparkline: 'true',
    price_change_percentage: '1h,24h,7d',
  });

  return request<CryptoMarket[]>(`/coins/markets?${params.toString()}`);
}

export function getGlobalData(): Promise<{ data: Record<string, unknown> }> {
  return request('/global');
}

export function getTrendingCoins(): Promise<{ coins?: TrendingCoin[] }> {
  return request('/search/trending');
}

export function getCoinDetails(id: string): Promise<CoinDetail> {
  return request(
    `/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=true&sparkline=false`,
  );
}

export function getCoinMarketChart({ id, vsCurrency = 'usd', days = 30 }: GetMarketChartParams): Promise<MarketChart> {
  const params = new URLSearchParams({
    vs_currency: vsCurrency,
    days: String(days),
  });

  return request<MarketChart>(`/coins/${id}/market_chart?${params.toString()}`);
}
