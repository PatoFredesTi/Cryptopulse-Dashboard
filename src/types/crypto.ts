export type SupportedCurrency = 'usd' | 'eur' | 'clp';
export type Locale = 'es' | 'en';
export type Theme = 'dark' | 'light';
export type ChangeTone = 'positive' | 'negative' | 'neutral';
export type MarketFilter = 'all' | 'gainers' | 'losers' | 'favorites';
export type SortDirection = 'asc' | 'desc';

export type SortConfig = {
  key: keyof CryptoMarket | string;
  direction: SortDirection;
};

export type Sparkline = {
  price: number[];
};

export type CryptoMarket = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation?: number | null;
  total_volume: number;
  high_24h?: number | null;
  low_24h?: number | null;
  price_change_24h?: number | null;
  price_change_percentage_24h?: number | null;
  price_change_percentage_24h_in_currency?: number | null;
  market_cap_change_24h?: number | null;
  market_cap_change_percentage_24h?: number | null;
  circulating_supply?: number | null;
  total_supply?: number | null;
  max_supply?: number | null;
  ath?: number | null;
  ath_change_percentage?: number | null;
  ath_date?: string | null;
  atl?: number | null;
  atl_change_percentage?: number | null;
  atl_date?: string | null;
  sparkline_in_7d?: Sparkline;
  last_updated?: string;
};

export type TrendingCoin = {
  item?: {
    id: string;
    coin_id?: number;
    name: string;
    symbol: string;
    thumb?: string;
    small?: string;
    large?: string;
    market_cap_rank?: number;
    score?: number;
  };
  id?: string;
  name?: string;
  symbol?: string;
  image?: string;
};

export type GlobalMarketData = {
  data?: {
    active_cryptocurrencies?: number;
    markets?: number;
    total_market_cap?: Record<string, number>;
    total_volume?: Record<string, number>;
    market_cap_percentage?: Record<string, number>;
    market_cap_change_percentage_24h_usd?: number;
    updated_at?: number;
  };
};

export type ChartPoint = [number, number];

export type MarketChart = {
  prices?: ChartPoint[];
  market_caps?: ChartPoint[];
  total_volumes?: ChartPoint[];
};

export type CoinDetail = {
  id: string;
  symbol: string;
  name: string;
  image?: string | { thumb?: string; small?: string; large?: string };
  market_cap_rank?: number;
  description?: { en?: string; es?: string };
  links?: {
    homepage?: string[];
    blockchain_site?: string[];
    official_forum_url?: string[];
    chat_url?: string[];
    announcement_url?: string[];
    twitter_screen_name?: string;
    facebook_username?: string;
    bitcointalk_thread_identifier?: number | null;
    telegram_channel_identifier?: string;
    subreddit_url?: string;
    repos_url?: { github?: string[]; bitbucket?: string[] };
  };
  market_data?: {
    current_price?: Record<string, number>;
    market_cap?: Record<string, number>;
    total_volume?: Record<string, number>;
    high_24h?: Record<string, number>;
    low_24h?: Record<string, number>;
    circulating_supply?: number;
    total_supply?: number;
    max_supply?: number;
    ath?: Record<string, number>;
    ath_change_percentage?: Record<string, number>;
    ath_date?: Record<string, string>;
    atl?: Record<string, number>;
    atl_change_percentage?: Record<string, number>;
    atl_date?: Record<string, string>;
    price_change_percentage_24h?: number;
    price_change_percentage_7d?: number;
    price_change_percentage_14d?: number;
    price_change_percentage_30d?: number;
    price_change_percentage_60d?: number;
    price_change_percentage_200d?: number;
    price_change_percentage_1y?: number;
  };
  developer_data?: {
    stars?: number;
    forks?: number;
    subscribers?: number;
    total_issues?: number;
    closed_issues?: number;
    pull_requests_merged?: number;
    pull_request_contributors?: number;
    commit_count_4_weeks?: number;
  };
  sentiment_votes_up_percentage?: number;
  sentiment_votes_down_percentage?: number;
  categories?: string[];
};

export type ToastMessage = {
  id: string;
  message: string;
  tone?: 'positive' | 'negative' | 'neutral';
};
