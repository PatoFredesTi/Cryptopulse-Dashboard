import { useCallback, useEffect, useMemo } from 'react';
import type { CryptoMarket } from '../types/crypto';
import type { AlertEvaluation, PriceAlert, PriceAlertCondition, PriceAlertDraft, PriceAlertSummary } from '../types/alerts';
import { useLocalStorage } from './useLocalStorage';

const nowIso = () => new Date().toISOString();
const createId = (prefix = 'alert') => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function sanitizeNumber(value: number) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
}

function getCurrentValue(coin: CryptoMarket | undefined, condition: PriceAlertCondition) {
  if (!coin) return 0;

  if (condition === 'change_above' || condition === 'change_below') {
    return coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h ?? 0;
  }

  if (condition === 'volume_above') {
    return coin.total_volume ?? 0;
  }

  return coin.current_price ?? 0;
}

function evaluateCondition(condition: PriceAlertCondition, currentValue: number, targetValue: number) {
  if (!targetValue) return false;

  switch (condition) {
    case 'price_above':
    case 'change_above':
    case 'volume_above':
      return currentValue >= targetValue;
    case 'price_below':
    case 'change_below':
      return currentValue <= targetValue;
    default:
      return false;
  }
}

function calculateDistance(condition: PriceAlertCondition, currentValue: number, targetValue: number) {
  if (!targetValue) return { distance: 0, distancePercent: 0, progress: 0 };

  const isAboveTarget = condition === 'price_above' || condition === 'change_above' || condition === 'volume_above';
  const distance = isAboveTarget ? targetValue - currentValue : currentValue - targetValue;
  const distancePercent = targetValue ? (distance / Math.abs(targetValue)) * 100 : 0;

  let progress = 0;
  if (isAboveTarget) {
    progress = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;
  } else if (currentValue > 0) {
    progress = (targetValue / currentValue) * 100;
  } else {
    progress = 100;
  }

  return {
    distance,
    distancePercent,
    progress: Math.max(0, Math.min(100, progress)),
  };
}

function evaluateAlerts(alerts: PriceAlert[], coins: CryptoMarket[]): AlertEvaluation[] {
  const coinMap = new Map(coins.map((coin) => [coin.id, coin]));

  return alerts.map((alert) => {
    const coin = coinMap.get(alert.coinId);
    const currentValue = getCurrentValue(coin, alert.condition);
    const isTriggered = alert.status === 'active' && evaluateCondition(alert.condition, currentValue, alert.targetValue);
    const distance = calculateDistance(alert.condition, currentValue, alert.targetValue);

    return {
      alert,
      isTriggered,
      currentValue,
      ...distance,
    };
  });
}

function calculateSummary(evaluations: AlertEvaluation[]): PriceAlertSummary {
  const activeEvaluations = evaluations.filter((evaluation) => evaluation.alert.status === 'active');
  const nearest = [...activeEvaluations]
    .filter((evaluation) => !evaluation.isTriggered)
    .sort((a, b) => Math.abs(a.distancePercent) - Math.abs(b.distancePercent))[0];

  return {
    total: evaluations.length,
    active: evaluations.filter((evaluation) => evaluation.alert.status === 'active').length,
    paused: evaluations.filter((evaluation) => evaluation.alert.status === 'paused').length,
    triggered: evaluations.filter((evaluation) => evaluation.isTriggered).length,
    nearest,
  };
}

export function usePriceAlerts(userId: string | undefined, coins: CryptoMarket[] = [], currency = 'usd') {
  const storageKey = userId ? `cryptopulse-alerts-${userId}` : 'cryptopulse-alerts-demo';
  const [alerts, setAlerts] = useLocalStorage<PriceAlert[]>(storageKey, []);

  const evaluations = useMemo(() => evaluateAlerts(alerts, coins), [alerts, coins]);
  const summary = useMemo(() => calculateSummary(evaluations), [evaluations]);

  useEffect(() => {
    const triggeredEvaluations = evaluations.filter((evaluation) => evaluation.isTriggered);
    if (!triggeredEvaluations.length) return;

    setAlerts((current) => {
      let changed = false;
      const triggeredIds = new Set(triggeredEvaluations.map((evaluation) => evaluation.alert.id));
      const currentMinute = new Date().toISOString().slice(0, 16);

      const next = current.map((alert) => {
        if (!triggeredIds.has(alert.id)) return alert;
        const lastMinute = alert.lastTriggeredAt?.slice(0, 16);
        if (lastMinute === currentMinute) return alert;

        changed = true;
        return {
          ...alert,
          lastTriggeredAt: nowIso(),
          triggerCount: alert.triggerCount + 1,
          updatedAt: nowIso(),
        };
      });

      return changed ? next : current;
    });
  }, [evaluations, setAlerts]);

  const createAlert = useCallback((draft: PriceAlertDraft) => {
    const targetValue = sanitizeNumber(draft.targetValue);
    if (!draft.coinId || !targetValue) return null;

    const createdAt = nowIso();
    const alert: PriceAlert = {
      id: createId(),
      userId: userId ?? 'demo',
      coinId: draft.coinId,
      condition: draft.condition,
      targetValue,
      note: draft.note.trim(),
      status: 'active',
      currency,
      createdAt,
      updatedAt: createdAt,
      triggerCount: 0,
    };

    setAlerts((current) => [alert, ...current]);
    return alert;
  }, [currency, setAlerts, userId]);

  const removeAlert = useCallback((alertId: string) => {
    setAlerts((current) => current.filter((alert) => alert.id !== alertId));
  }, [setAlerts]);

  const toggleAlertStatus = useCallback((alertId: string) => {
    setAlerts((current) => current.map((alert) => (
      alert.id === alertId
        ? {
          ...alert,
          status: alert.status === 'active' ? 'paused' : 'active',
          updatedAt: nowIso(),
        }
        : alert
    )));
  }, [setAlerts]);

  const clearTriggeredHistory = useCallback(() => {
    setAlerts((current) => current.map((alert) => ({
      ...alert,
      lastTriggeredAt: undefined,
      triggerCount: 0,
      updatedAt: nowIso(),
    })));
  }, [setAlerts]);

  return {
    alerts,
    evaluations,
    summary,
    createAlert,
    removeAlert,
    toggleAlertStatus,
    clearTriggeredHistory,
  };
}
