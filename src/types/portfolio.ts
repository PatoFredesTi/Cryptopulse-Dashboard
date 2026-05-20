export type PortfolioTransactionType = 'buy' | 'sell';

export type PortfolioTransaction = {
  id: string;
  coinId: string;
  type: PortfolioTransactionType;
  quantity: number;
  price: number;
  date: string;
  note: string;
  createdAt: string;
};

export type PortfolioTransactionDraft = {
  coinId: string;
  type: PortfolioTransactionType;
  quantity: number;
  price: number;
  date: string;
  note: string;
};

export type PortfolioPosition = {
  coinId: string;
  quantity: number;
  averageCost: number;
  costBasis: number;
  currentPrice: number;
  currentValue: number;
  invested: number;
  realizedValue: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalPnl: number;
  roi: number;
  allocation: number;
  transactions: number;
};

export type PortfolioSummary = {
  totalInvested: number;
  totalRealized: number;
  currentValue: number;
  totalPnl: number;
  roi: number;
  openPositions: number;
  bestPosition?: PortfolioPosition;
  worstPosition?: PortfolioPosition;
};
