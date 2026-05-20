import { AlertTriangle, Bell, BellOff, Clock3, Plus, Radar, Target, Trash2, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AlertEvaluation, PriceAlert, PriceAlertCondition, PriceAlertDraft, PriceAlertSummary } from '../../types/alerts';
import type { CryptoMarket } from '../../types/crypto';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import { t } from '../../utils/i18n';

type PriceAlertsManagerProps = {
  locale: string;
  currency: string;
  coins: CryptoMarket[];
  alerts: PriceAlert[];
  evaluations: AlertEvaluation[];
  summary: PriceAlertSummary;
  onCreateAlert: (draft: PriceAlertDraft) => PriceAlert | null;
  onRemoveAlert: (alertId: string) => void;
  onToggleAlertStatus: (alertId: string) => void;
  onClearTriggeredHistory: () => void;
  onSelectCoin: (coinId: string) => void;
};

const conditionOptions: PriceAlertCondition[] = ['price_above', 'price_below', 'change_above', 'change_below', 'volume_above'];

function getCoinMap(coins: CryptoMarket[]) {
  return new Map(coins.map((coin) => [coin.id, coin]));
}

function getDefaultCoinId(coins: CryptoMarket[]) {
  return coins[0]?.id ?? '';
}

function getDefaultTarget(coin: CryptoMarket | undefined, condition: PriceAlertCondition) {
  if (!coin) return '';
  if (condition === 'price_above') return String(Number((coin.current_price * 1.05).toFixed(coin.current_price < 1 ? 6 : 2)));
  if (condition === 'price_below') return String(Number((coin.current_price * 0.95).toFixed(coin.current_price < 1 ? 6 : 2)));
  if (condition === 'change_above') return '10';
  if (condition === 'change_below') return '-5';
  return String(Number((coin.total_volume * 1.2).toFixed(2)));
}

function formatAlertValue(value: number, condition: PriceAlertCondition, currency: string) {
  if (condition === 'change_above' || condition === 'change_below') return formatPercent(value);
  if (condition === 'volume_above') return formatCurrency(value, currency, true);
  return formatCurrency(value, currency);
}

function getEvaluationTone(evaluation: AlertEvaluation) {
  if (evaluation.isTriggered) return 'triggered';
  if (evaluation.progress >= 85) return 'near';
  return 'active';
}

function getAlertChartData(evaluations: AlertEvaluation[], coinMap: Map<string, CryptoMarket>) {
  return evaluations
    .slice(0, 8)
    .map((evaluation) => {
      const coin = coinMap.get(evaluation.alert.coinId);
      return {
        name: coin?.symbol?.toUpperCase() ?? evaluation.alert.coinId,
        progress: Number(evaluation.progress.toFixed(2)),
        triggers: evaluation.alert.triggerCount,
      };
    });
}

export function PriceAlertsManager({
  locale,
  currency,
  coins,
  alerts,
  evaluations,
  summary,
  onCreateAlert,
  onRemoveAlert,
  onToggleAlertStatus,
  onClearTriggeredHistory,
  onSelectCoin,
}: PriceAlertsManagerProps) {
  const [coinId, setCoinId] = useState(getDefaultCoinId(coins));
  const [condition, setCondition] = useState<PriceAlertCondition>('price_above');
  const [targetValue, setTargetValue] = useState('');
  const [note, setNote] = useState('');

  const coinMap = useMemo(() => getCoinMap(coins), [coins]);
  const selectedCoin = coinMap.get(coinId);
  const chartData = useMemo(() => getAlertChartData(evaluations, coinMap), [evaluations, coinMap]);
  const triggeredEvaluations = evaluations.filter((evaluation) => evaluation.isTriggered);
  const activeEvaluations = evaluations.filter((evaluation) => evaluation.alert.status === 'active');

  useEffect(() => {
    if (!coinId && coins.length) setCoinId(coins[0].id);
  }, [coinId, coins]);

  useEffect(() => {
    setTargetValue(getDefaultTarget(selectedCoin, condition));
  }, [condition, selectedCoin]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const created = onCreateAlert({
      coinId,
      condition,
      targetValue: Number(targetValue),
      note,
    });

    if (created) {
      setNote('');
    }
  };

  return (
    <section className="panel alerts-panel">
      <div className="section-heading portfolio-heading">
        <div>
          <h3>{t(locale, 'priceAlertsTitle')}</h3>
          <p>{t(locale, 'priceAlertsDescription')}</p>
        </div>
        <button className="secondary-button" type="button" onClick={onClearTriggeredHistory} disabled={!alerts.some((alert) => alert.triggerCount > 0)}>
          <Clock3 size={16} />
          {t(locale, 'clearAlertHistory')}
        </button>
      </div>

      <div className="alerts-summary-grid">
        <article className="portfolio-summary-card">
          <Bell size={18} />
          <span>{t(locale, 'activeAlerts')}</span>
          <strong>{summary.active}</strong>
          <small>{summary.total} {t(locale, 'configuredAlerts')}</small>
        </article>
        <article className="portfolio-summary-card">
          <Zap size={18} />
          <span>{t(locale, 'triggeredAlerts')}</span>
          <strong className={summary.triggered ? 'positive' : ''}>{summary.triggered}</strong>
          <small>{t(locale, 'marketConditionsMet')}</small>
        </article>
        <article className="portfolio-summary-card">
          <Radar size={18} />
          <span>{t(locale, 'nearestAlert')}</span>
          <strong>{summary.nearest ? `${Math.abs(summary.nearest.distancePercent).toFixed(2)}%` : '—'}</strong>
          <small>{summary.nearest ? t(locale, 'distanceToTarget') : t(locale, 'noActiveAlerts')}</small>
        </article>
        <article className="portfolio-summary-card">
          <BellOff size={18} />
          <span>{t(locale, 'pausedAlerts')}</span>
          <strong>{summary.paused}</strong>
          <small>{t(locale, 'inactiveRules')}</small>
        </article>
      </div>

      <div className="alerts-layout-grid">
        <form className="portfolio-form alerts-form" onSubmit={handleSubmit}>
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Rule Builder</p>
              <h4>{t(locale, 'createAlert')}</h4>
            </div>
            <Plus size={18} />
          </div>

          <label>
            <span>{t(locale, 'selectCoin')}</span>
            <select value={coinId} onChange={(event) => setCoinId(event.target.value)}>
              {coins.slice(0, 100).map((coin) => (
                <option key={coin.id} value={coin.id}>{coin.name} ({coin.symbol.toUpperCase()})</option>
              ))}
            </select>
          </label>

          <label>
            <span>{t(locale, 'alertCondition')}</span>
            <select value={condition} onChange={(event) => setCondition(event.target.value as PriceAlertCondition)}>
              {conditionOptions.map((option) => (
                <option key={option} value={option}>{t(locale, option)}</option>
              ))}
            </select>
          </label>

          <label>
            <span>{t(locale, 'alertTargetValue')}</span>
            <input min={condition === 'change_below' ? undefined : '0'} step="any" type="number" value={targetValue} onChange={(event) => setTargetValue(event.target.value)} placeholder="0" />
          </label>

          <label>
            <span>{t(locale, 'alertNote')}</span>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={t(locale, 'alertNotePlaceholder')} />
          </label>

          <button className="primary-button" type="submit" disabled={!coinId || !Number(targetValue)}>
            <Plus size={16} />
            {t(locale, 'saveAlert')}
          </button>
        </form>

        <div className="alerts-board">
          <article className="portfolio-chart-card">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Monitor</p>
                <h4>{t(locale, 'alertProgress')}</h4>
              </div>
              <Target size={18} />
            </div>
            {chartData.length ? (
              <div className="portfolio-chart-wrap">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.18} />
                    <XAxis dataKey="name" />
                    <YAxis unit="%" />
                    <Tooltip formatter={(value: number) => [`${Number(value).toFixed(2)}%`, t(locale, 'alertProgress')]} />
                    <Bar dataKey="progress" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="portfolio-empty-chart">{t(locale, 'alertsEmptyState')}</div>
            )}
          </article>

          {triggeredEvaluations.length ? (
            <article className="alert-trigger-strip">
              <AlertTriangle size={18} />
              <div>
                <strong>{t(locale, 'alertsTriggeredNow')}</strong>
                <p>{triggeredEvaluations.map((evaluation) => coinMap.get(evaluation.alert.coinId)?.symbol?.toUpperCase() ?? evaluation.alert.coinId).join(', ')}</p>
              </div>
            </article>
          ) : null}

          <div className="alerts-list">
            {evaluations.length ? evaluations.map((evaluation) => {
              const alert = evaluation.alert;
              const coin = coinMap.get(alert.coinId);
              const tone = getEvaluationTone(evaluation);
              const lastTriggered = alert.lastTriggeredAt
                ? new Date(alert.lastTriggeredAt).toLocaleString(locale === 'es' ? 'es-CL' : 'en-US')
                : t(locale, 'neverTriggered');

              return (
                <article key={alert.id} className={`alert-rule-card ${tone}`}>
                  <button className="alert-coin-button" type="button" onClick={() => onSelectCoin(alert.coinId)}>
                    {coin?.image ? <img src={coin.image} alt={coin.name} /> : <span className="coin-placeholder">?</span>}
                    <span>
                      <strong>{coin?.name ?? alert.coinId}</strong>
                      <small>{coin?.symbol?.toUpperCase() ?? alert.coinId} · {t(locale, alert.condition)}</small>
                    </span>
                  </button>

                  <div className="alert-values-grid">
                    <span>
                      <small>{t(locale, 'currentValue')}</small>
                      <strong>{formatAlertValue(evaluation.currentValue, alert.condition, currency)}</strong>
                    </span>
                    <span>
                      <small>{t(locale, 'targetPrice')}</small>
                      <strong>{formatAlertValue(alert.targetValue, alert.condition, currency)}</strong>
                    </span>
                    <span>
                      <small>{t(locale, 'alertProgress')}</small>
                      <strong>{Number(evaluation.progress).toFixed(0)}%</strong>
                    </span>
                  </div>

                  <div className="alert-progress-track" aria-label={t(locale, 'alertProgress')}>
                    <span style={{ width: `${evaluation.progress}%` }} />
                  </div>

                  <div className="watchlist-note-row">
                    <span className={`watchlist-status status-${alert.status}`}>{t(locale, alert.status)}</span>
                    <span>{formatNumber(alert.triggerCount, false)} {t(locale, 'triggers')}</span>
                    <span>{t(locale, 'lastTrigger')}: {lastTriggered}</span>
                    {alert.note ? <span>{alert.note}</span> : <span>{t(locale, 'noTransactionNote')}</span>}
                  </div>

                  <div className="alert-actions-row">
                    <button className="secondary-button" type="button" onClick={() => onToggleAlertStatus(alert.id)}>
                      {alert.status === 'active' ? <BellOff size={15} /> : <Bell size={15} />}
                      {alert.status === 'active' ? t(locale, 'pauseAlert') : t(locale, 'resumeAlert')}
                    </button>
                    <button className="icon-button danger" type="button" onClick={() => onRemoveAlert(alert.id)} aria-label={t(locale, 'deleteAlert')}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              );
            }) : (
              <div className="portfolio-empty-chart alerts-empty-panel">
                <Bell size={22} />
                <strong>{t(locale, 'alertsEmptyTitle')}</strong>
                <p>{t(locale, 'alertsEmptyDescription')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
