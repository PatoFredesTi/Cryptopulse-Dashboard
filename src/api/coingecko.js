const API_BASE_URL = 'https://api.coingecko.com/api/v3';

async function request(path) {
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

  return response.json();
}

export function getMarkets({ vsCurrency = 'usd', perPage = 100, page = 1 } = {}) {
  const params = new URLSearchParams({
    vs_currency: vsCurrency,
    order: 'market_cap_desc',
    per_page: String(perPage),
    page: String(page),
    sparkline: 'true',
    price_change_percentage: '1h,24h,7d',
  });

  return request(`/coins/markets?${params.toString()}`);
}

export function getGlobalData() {
  return request('/global');
}

export function getTrendingCoins() {
  return request('/search/trending');
}

export function getCoinDetails(id) {
  return request(
    `/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=true&sparkline=false`,
  );
}

export function getCoinMarketChart({ id, vsCurrency = 'usd', days = 30 }) {
  const params = new URLSearchParams({
    vs_currency: vsCurrency,
    days: String(days),
  });

  return request(`/coins/${id}/market_chart?${params.toString()}`);
}
