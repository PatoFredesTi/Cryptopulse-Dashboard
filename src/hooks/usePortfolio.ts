import { useMemo } from 'react';
import type { CryptoMarket } from '../types/crypto';
import type { PortfolioPosition, PortfolioSummary, PortfolioTransaction, PortfolioTransactionDraft } from '../types/portfolio';
import { useLocalStorage } from './useLocalStorage';

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sanitizeNumber(value: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
}

function getCoinMap(coins: CryptoMarket[]) {
  return new Map(coins.map((coin) => [coin.id, coin]));
}

function calculatePositions(transactions: PortfolioTransaction[], coins: CryptoMarket[]) {
  const coinMap = getCoinMap(coins);
  const positionMap = new Map<string, Omit<PortfolioPosition, 'allocation'>>();

  const orderedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  orderedTransactions.forEach((transaction) => {
    const quantity = sanitizeNumber(transaction.quantity);
    const price = sanitizeNumber(transaction.price);
    if (!quantity || !price) return;

    const coin = coinMap.get(transaction.coinId);
    const currentPrice = coin?.current_price ?? price;
    const current = positionMap.get(transaction.coinId) ?? {
      coinId: transaction.coinId,
      quantity: 0,
      averageCost: 0,
      costBasis: 0,
      currentPrice,
      currentValue: 0,
      invested: 0,
      realizedValue: 0,
      realizedPnl: 0,
      unrealizedPnl: 0,
      totalPnl: 0,
      roi: 0,
      transactions: 0,
    };

    if (transaction.type === 'buy') {
      current.quantity += quantity;
      current.costBasis += quantity * price;
      current.invested += quantity * price;
    } else {
      const sellQuantity = Math.min(quantity, current.quantity);
      const averageCost = current.quantity > 0 ? current.costBasis / current.quantity : 0;
      const realizedValue = sellQuantity * price;
      const realizedCost = sellQuantity * averageCost;

      current.quantity -= sellQuantity;
      current.costBasis = Math.max(0, current.costBasis - realizedCost);
      current.realizedValue += realizedValue;
      current.realizedPnl += realizedValue - realizedCost;
    }

    current.transactions += 1;
    current.averageCost = current.quantity > 0 ? current.costBasis / current.quantity : 0;
    current.currentPrice = currentPrice;
    current.currentValue = current.quantity * currentPrice;
    current.unrealizedPnl = current.currentValue - current.costBasis;
    current.totalPnl = current.realizedPnl + current.unrealizedPnl;
    current.roi = current.invested > 0 ? (current.totalPnl / current.invested) * 100 : 0;
    positionMap.set(transaction.coinId, current);
  });

  const openPositions = Array.from(positionMap.values()).filter((position) => position.quantity > 0.00000001);
  const totalCurrentValue = openPositions.reduce((sum, position) => sum + position.currentValue, 0);

  return openPositions
    .map((position) => ({
      ...position,
      allocation: totalCurrentValue > 0 ? (position.currentValue / totalCurrentValue) * 100 : 0,
    }))
    .sort((a, b) => b.currentValue - a.currentValue);
}

function calculateSummary(transactions: PortfolioTransaction[], positions: PortfolioPosition[]): PortfolioSummary {
  const totalInvested = transactions
    .filter((transaction) => transaction.type === 'buy')
    .reduce((sum, transaction) => sum + sanitizeNumber(transaction.quantity) * sanitizeNumber(transaction.price), 0);
  const totalRealized = transactions
    .filter((transaction) => transaction.type === 'sell')
    .reduce((sum, transaction) => sum + sanitizeNumber(transaction.quantity) * sanitizeNumber(transaction.price), 0);
  const currentValue = positions.reduce((sum, position) => sum + position.currentValue, 0);
  const totalPnl = currentValue + totalRealized - totalInvested;
  const roi = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const rankedPositions = [...positions].sort((a, b) => b.roi - a.roi);

  return {
    totalInvested,
    totalRealized,
    currentValue,
    totalPnl,
    roi,
    openPositions: positions.length,
    bestPosition: rankedPositions[0],
    worstPosition: rankedPositions[rankedPositions.length - 1],
  };
}

export function usePortfolio(userId?: string | null, coins: CryptoMarket[] = []) {
  const storageKey = userId ? `cryptopulse-portfolio-${userId}` : 'cryptopulse-portfolio-guest';
  const [transactions, setTransactions] = useLocalStorage<PortfolioTransaction[]>(storageKey, []);

  const positions = useMemo(() => calculatePositions(transactions, coins), [transactions, coins]);
  const summary = useMemo(() => calculateSummary(transactions, positions), [transactions, positions]);

  const addTransaction = (draft: PortfolioTransactionDraft) => {
    if (!draft.coinId || !sanitizeNumber(draft.quantity) || !sanitizeNumber(draft.price)) return null;

    const transaction: PortfolioTransaction = {
      id: createId('trx'),
      coinId: draft.coinId,
      type: draft.type,
      quantity: sanitizeNumber(draft.quantity),
      price: sanitizeNumber(draft.price),
      date: draft.date || new Date().toISOString().slice(0, 10),
      note: draft.note.trim(),
      createdAt: new Date().toISOString(),
    };

    setTransactions((current) => [transaction, ...current]);
    return transaction;
  };

  const removeTransaction = (transactionId: string) => {
    setTransactions((current) => current.filter((transaction) => transaction.id !== transactionId));
  };

  const clearPortfolio = () => {
    setTransactions([]);
  };

  return {
    transactions,
    positions,
    summary,
    addTransaction,
    removeTransaction,
    clearPortfolio,
  };
}
