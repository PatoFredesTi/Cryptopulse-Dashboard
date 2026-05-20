function getChangeValue(coin) {
  return coin?.price_change_percentage_24h_in_currency
    ?? coin?.price_change_percentage_24h
    ?? 0;
}

function sum(values) {
  return values.reduce((acc, value) => acc + (Number(value) || 0), 0);
}

export function getTopMovers(coins = [], limit = 5) {
  const validCoins = coins.filter((coin) => typeof getChangeValue(coin) === 'number');

  const gainers = [...validCoins]
    .filter((coin) => getChangeValue(coin) > 0)
    .sort((a, b) => getChangeValue(b) - getChangeValue(a))
    .slice(0, limit);

  const losers = [...validCoins]
    .filter((coin) => getChangeValue(coin) < 0)
    .sort((a, b) => getChangeValue(a) - getChangeValue(b))
    .slice(0, limit);

  return { gainers, losers };
}

export function getMarketSentiment(coins = []) {
  const validCoins = coins.filter((coin) => typeof getChangeValue(coin) === 'number');
  const positiveCount = validCoins.filter((coin) => getChangeValue(coin) > 0).length;
  const negativeCount = validCoins.filter((coin) => getChangeValue(coin) < 0).length;
  const averageChange = validCoins.length
    ? sum(validCoins.map(getChangeValue)) / validCoins.length
    : 0;
  const positiveRatio = validCoins.length ? (positiveCount / validCoins.length) * 100 : 0;

  let state = 'neutral';
  if (positiveRatio >= 58 && averageChange > 0.8) state = 'bullish';
  if (positiveRatio <= 42 && averageChange < -0.8) state = 'bearish';

  return {
    state,
    positiveCount,
    negativeCount,
    averageChange,
    positiveRatio,
    total: validCoins.length,
  };
}

export function getRankSegments(coins = []) {
  const segments = [
    { id: 'leaders', rank: '1-10', min: 1, max: 10, labelKey: 'leadersSegment' },
    { id: 'large', rank: '11-30', min: 11, max: 30, labelKey: 'largeSegment' },
    { id: 'mid', rank: '31-70', min: 31, max: 70, labelKey: 'midSegment' },
    { id: 'emerging', rank: '71-100', min: 71, max: 100, labelKey: 'emergingSegment' },
  ];

  return segments.map((segment) => {
    const segmentCoins = coins.filter((coin) => {
      const rank = coin.market_cap_rank;
      return rank >= segment.min && rank <= segment.max;
    });

    const marketCap = sum(segmentCoins.map((coin) => coin.market_cap));
    const volume = sum(segmentCoins.map((coin) => coin.total_volume));
    const avgChange = segmentCoins.length
      ? sum(segmentCoins.map(getChangeValue)) / segmentCoins.length
      : 0;

    return {
      ...segment,
      count: segmentCoins.length,
      marketCap,
      volume,
      avgChange,
    };
  });
}

export function getDominanceEntries(globalData, limit = 6) {
  const dominance = globalData?.market_cap_percentage ?? {};

  return Object.entries(dominance)
    .map(([symbol, value]) => ({ symbol, value: Number(value) || 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function buildMarketPulseData(coins = []) {
  const coinsWithSparkline = coins
    .filter((coin) => Array.isArray(coin.sparkline_in_7d?.price) && coin.sparkline_in_7d.price.length > 10)
    .slice(0, 12);

  if (!coinsWithSparkline.length) return [];

  const minLength = Math.min(...coinsWithSparkline.map((coin) => coin.sparkline_in_7d.price.length));
  const step = Math.max(1, Math.floor(minLength / 28));
  const points = [];

  for (let index = 0; index < minLength; index += step) {
    const normalizedValues = coinsWithSparkline.map((coin) => {
      const prices = coin.sparkline_in_7d.price;
      const start = Number(prices[0]);
      const current = Number(prices[index]);
      if (!start || Number.isNaN(current)) return 0;
      return ((current - start) / start) * 100;
    });

    points.push({
      label: `${Math.round((index / Math.max(minLength - 1, 1)) * 7)}d`,
      value: sum(normalizedValues) / normalizedValues.length,
    });
  }

  return points;
}

export function getLiquidityLeaders(coins = [], limit = 5) {
  return [...coins]
    .map((coin) => ({
      ...coin,
      liquidityRatio: coin.market_cap ? (coin.total_volume / coin.market_cap) * 100 : 0,
    }))
    .filter((coin) => coin.liquidityRatio > 0)
    .sort((a, b) => b.liquidityRatio - a.liquidityRatio)
    .slice(0, limit);
}
