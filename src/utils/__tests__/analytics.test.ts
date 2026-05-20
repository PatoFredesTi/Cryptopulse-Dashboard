import { describe, expect, it } from 'vitest';
import { getMarketSentiment, getRankSegments, getTopMovers } from '../analytics';

const coins = [
  { id: 'btc', market_cap_rank: 1, market_cap: 1000, total_volume: 100, price_change_percentage_24h_in_currency: 3 },
  { id: 'eth', market_cap_rank: 2, market_cap: 800, total_volume: 80, price_change_percentage_24h_in_currency: 2 },
  { id: 'sol', market_cap_rank: 11, market_cap: 300, total_volume: 90, price_change_percentage_24h_in_currency: -4 },
  { id: 'ada', market_cap_rank: 35, market_cap: 120, total_volume: 10, price_change_percentage_24h_in_currency: 1 },
];

describe('analytics utilities', () => {
  it('splits top movers into gainers and losers', () => {
    const movers = getTopMovers(coins, 2);
    expect(movers.gainers.map((coin) => coin.id)).toEqual(['btc', 'eth']);
    expect(movers.losers.map((coin) => coin.id)).toEqual(['sol']);
  });

  it('calculates market sentiment counters', () => {
    const sentiment = getMarketSentiment(coins);
    expect(sentiment.positiveCount).toBe(3);
    expect(sentiment.negativeCount).toBe(1);
    expect(sentiment.total).toBe(4);
  });

  it('groups assets by rank segments', () => {
    const segments = getRankSegments(coins);
    expect(segments.find((segment) => segment.id === 'leaders')?.count).toBe(2);
    expect(segments.find((segment) => segment.id === 'large')?.count).toBe(1);
    expect(segments.find((segment) => segment.id === 'mid')?.count).toBe(1);
  });
});
