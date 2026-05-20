export type PriceAlertCondition = 'price_above' | 'price_below' | 'change_above' | 'change_below' | 'volume_above';
export type PriceAlertStatus = 'active' | 'paused';

export type PriceAlertDraft = {
  coinId: string;
  condition: PriceAlertCondition;
  targetValue: number;
  note: string;
};

export type PriceAlert = {
  id: string;
  userId: string;
  coinId: string;
  condition: PriceAlertCondition;
  targetValue: number;
  note: string;
  status: PriceAlertStatus;
  currency: string;
  createdAt: string;
  updatedAt: string;
  lastTriggeredAt?: string;
  triggerCount: number;
};

export type AlertEvaluation = {
  alert: PriceAlert;
  isTriggered: boolean;
  currentValue: number;
  distance: number;
  distancePercent: number;
  progress: number;
};

export type PriceAlertSummary = {
  total: number;
  active: number;
  paused: number;
  triggered: number;
  nearest?: AlertEvaluation;
};
