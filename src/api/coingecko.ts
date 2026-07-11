import type { CoinDetail, CryptoMarket, MarketChart, SupportedCurrency, TrendingCoin } from '../types/crypto';

const API_BASE_URL = '/api/coingecko';
const REQUEST_TIMEOUT_MS = 12_000;
const CACHE_TTL_MS = 30_000;
const responseCache = new Map<string, { expiresAt: number; data: unknown }>();
const pendingRequests = new Map<string, Promise<unknown>>();

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

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function fetchWithRetry<T>(url: string): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json' },
        signal: controller.signal,
      });

      if (response.ok) return await response.json() as T;

      const canRetry = response.status === 429 || response.status >= 500;
      if (!canRetry || attempt === 2) {
        throw new Error(response.status === 429
          ? 'CoinGecko está recibiendo demasiadas solicitudes. Intenta nuevamente en un momento.'
          : `No fue posible obtener datos del mercado (${response.status}).`);
      }

      const retryAfter = Number(response.headers.get('retry-after')) * 1000;
      await wait(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 700 * (attempt + 1));
    } catch (error) {
      if (error instanceof Error && error.message.includes('CoinGecko')) throw error;
      if (attempt === 2) {
        throw new Error(error instanceof DOMException && error.name === 'AbortError'
          ? 'La consulta del mercado tardó demasiado. Comprueba tu conexión e intenta nuevamente.'
          : 'No pudimos conectar con el servicio de mercado. Mostraremos los últimos datos disponibles.');
      }
      await wait(500 * (attempt + 1));
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  throw new Error('No fue posible obtener los datos del mercado.');
}

async function request<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const cached = responseCache.get(url);
  if (cached && cached.expiresAt > Date.now()) return cached.data as T;

  const pending = pendingRequests.get(url);
  if (pending) return pending as Promise<T>;

  const requestPromise = fetchWithRetry<T>(url)
    .then((data) => {
      responseCache.set(url, { data, expiresAt: Date.now() + CACHE_TTL_MS });
      return data;
    })
    .finally(() => pendingRequests.delete(url));

  pendingRequests.set(url, requestPromise);
  return requestPromise;
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
