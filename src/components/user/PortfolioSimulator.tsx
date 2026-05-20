import { ArrowDownRight, ArrowUpRight, BriefcaseBusiness, Calculator, LineChart, PieChart as PieChartIcon, Plus, RotateCcw, Trash2, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CryptoMarket } from '../../types/crypto';
import type { PortfolioPosition, PortfolioTransaction, PortfolioTransactionDraft, PortfolioTransactionType } from '../../types/portfolio';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import { t } from '../../utils/i18n';

const allocationColors = ['#38bdf8', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6', '#f97316', '#64748b'];

type PortfolioSimulatorProps = {
  locale: string;
  currency: string;
  coins: CryptoMarket[];
  transactions: PortfolioTransaction[];
  positions: PortfolioPosition[];
  summary: {
    totalInvested: number;
    totalRealized: number;
    currentValue: number;
    totalPnl: number;
    roi: number;
    openPositions: number;
    bestPosition?: PortfolioPosition;
    worstPosition?: PortfolioPosition;
  };
  onAddTransaction: (draft: PortfolioTransactionDraft) => PortfolioTransaction | null;
  onRemoveTransaction: (transactionId: string) => void;
  onClearPortfolio: () => void;
  onSelectCoin: (coinId: string) => void;
};

function getCoinMap(coins: CryptoMarket[]) {
  return new Map(coins.map((coin) => [coin.id, coin]));
}

function buildAllocationData(positions: PortfolioPosition[], coinMap: Map<string, CryptoMarket>) {
  return positions.map((position) => {
    const coin = coinMap.get(position.coinId);
    return {
      id: position.coinId,
      name: coin?.symbol?.toUpperCase() ?? position.coinId,
      fullName: coin?.name ?? position.coinId,
      value: Number(position.currentValue.toFixed(2)),
      allocation: position.allocation,
    };
  });
}

function buildPerformanceData(positions: PortfolioPosition[], coinMap: Map<string, CryptoMarket>) {
  return positions.slice(0, 8).map((position) => {
    const coin = coinMap.get(position.coinId);
    return {
      name: coin?.symbol?.toUpperCase() ?? position.coinId,
      pnl: Number(position.totalPnl.toFixed(2)),
      roi: Number(position.roi.toFixed(2)),
    };
  });
}

function getDefaultCoinId(coins: CryptoMarket[]) {
  return coins[0]?.id ?? '';
}

function getCoinPrice(coins: CryptoMarket[], coinId: string) {
  return coins.find((coin) => coin.id === coinId)?.current_price ?? 0;
}

function formatInputPrice(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '';
  return String(Number(value.toFixed(value < 1 ? 6 : 2)));
}

export function PortfolioSimulator({
  locale,
  currency,
  coins,
  transactions,
  positions,
  summary,
  onAddTransaction,
  onRemoveTransaction,
  onClearPortfolio,
  onSelectCoin,
}: PortfolioSimulatorProps) {
  const [coinId, setCoinId] = useState(getDefaultCoinId(coins));
  const [type, setType] = useState<PortfolioTransactionType>('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');

  const coinMap = useMemo(() => getCoinMap(coins), [coins]);
  const allocationData = useMemo(() => buildAllocationData(positions, coinMap), [positions, coinMap]);
  const performanceData = useMemo(() => buildPerformanceData(positions, coinMap), [positions, coinMap]);
  const selectedCoin = coinMap.get(coinId);

  useEffect(() => {
    if (!coinId && coins.length) setCoinId(coins[0].id);
  }, [coinId, coins]);

  useEffect(() => {
    const currentPrice = getCoinPrice(coins, coinId);
    if (currentPrice) setPrice(formatInputPrice(currentPrice));
  }, [coinId, coins]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const created = onAddTransaction({
      coinId,
      type,
      quantity: Number(quantity),
      price: Number(price),
      date,
      note,
    });

    if (created) {
      setQuantity('');
      setNote('');
    }
  };

  const latestTransactions = transactions.slice(0, 8);

  return (
    <section className="panel portfolio-panel">
      <div className="section-heading portfolio-heading">
        <div>
          <h3>{t(locale, 'portfolioSimulatorTitle')}</h3>
          <p>{t(locale, 'portfolioSimulatorDescription')}</p>
        </div>
        <button className="secondary-button" type="button" onClick={onClearPortfolio} disabled={!transactions.length}>
          <RotateCcw size={16} />
          {t(locale, 'clearPortfolio')}
        </button>
      </div>

      <div className="portfolio-summary-grid">
        <article className="portfolio-summary-card">
          <WalletCards size={18} />
          <span>{t(locale, 'portfolioCurrentValue')}</span>
          <strong>{formatCurrency(summary.currentValue, currency)}</strong>
          <small>{summary.openPositions} {t(locale, 'openPositions')}</small>
        </article>
        <article className="portfolio-summary-card">
          <Calculator size={18} />
          <span>{t(locale, 'portfolioInvested')}</span>
          <strong>{formatCurrency(summary.totalInvested, currency)}</strong>
          <small>{formatCurrency(summary.totalRealized, currency)} {t(locale, 'realizedSales')}</small>
        </article>
        <article className="portfolio-summary-card">
          {summary.totalPnl >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
          <span>{t(locale, 'portfolioPnl')}</span>
          <strong className={summary.totalPnl >= 0 ? 'positive' : 'negative'}>{formatCurrency(summary.totalPnl, currency)}</strong>
          <small className={summary.roi >= 0 ? 'positive' : 'negative'}>{formatPercent(summary.roi)} ROI</small>
        </article>
        <article className="portfolio-summary-card">
          <BriefcaseBusiness size={18} />
          <span>{t(locale, 'portfolioBestAsset')}</span>
          <strong>{summary.bestPosition ? coinMap.get(summary.bestPosition.coinId)?.symbol?.toUpperCase() : '—'}</strong>
          <small>{summary.bestPosition ? formatPercent(summary.bestPosition.roi) : t(locale, 'noPositions')}</small>
        </article>
      </div>

      <div className="portfolio-layout-grid">
        <form className="portfolio-form" onSubmit={handleSubmit}>
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Trade Log</p>
              <h4>{t(locale, 'addTransaction')}</h4>
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

          <div className="portfolio-form-row">
            <label>
              <span>{t(locale, 'transactionType')}</span>
              <select value={type} onChange={(event) => setType(event.target.value as PortfolioTransactionType)}>
                <option value="buy">{t(locale, 'buy')}</option>
                <option value="sell">{t(locale, 'sell')}</option>
              </select>
            </label>
            <label>
              <span>{t(locale, 'transactionDate')}</span>
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
          </div>

          <div className="portfolio-form-row">
            <label>
              <span>{t(locale, 'quantity')}</span>
              <input min="0" step="any" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="0.05" />
            </label>
            <label>
              <span>{t(locale, 'entryPrice')}</span>
              <input min="0" step="any" type="number" value={price} onChange={(event) => setPrice(event.target.value)} placeholder={selectedCoin ? formatInputPrice(selectedCoin.current_price) : '0'} />
            </label>
          </div>

          <label>
            <span>{t(locale, 'transactionNote')}</span>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={t(locale, 'transactionNotePlaceholder')} />
          </label>

          <button className="primary-button" type="submit" disabled={!coinId || !Number(quantity) || !Number(price)}>
            <Plus size={16} />
            {t(locale, 'saveTransaction')}
          </button>
        </form>

        <div className="portfolio-charts-grid">
          <article className="portfolio-chart-card">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Allocation</p>
                <h4>{t(locale, 'portfolioAllocation')}</h4>
              </div>
              <PieChartIcon size={18} />
            </div>
            {allocationData.length ? (
              <div className="portfolio-chart-wrap">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={allocationData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
                      {allocationData.map((item, index) => (
                        <Cell key={item.id} fill={allocationColors[index % allocationColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number, name: string) => [formatCurrency(Number(value), currency), name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="portfolio-empty-chart">{t(locale, 'portfolioEmptyState')}</div>
            )}
          </article>

          <article className="portfolio-chart-card">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">PnL</p>
                <h4>{t(locale, 'portfolioPerformance')}</h4>
              </div>
              <LineChart size={18} />
            </div>
            {performanceData.length ? (
              <div className="portfolio-chart-wrap">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={performanceData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.18} vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 11 }} />
                    <YAxis tickFormatter={(value) => formatNumber(value)} tick={{ fill: 'currentColor', fontSize: 11 }} width={54} />
                    <Tooltip formatter={(value: number) => formatCurrency(Number(value), currency)} />
                    <Bar dataKey="pnl" radius={[8, 8, 0, 0]}>
                      {performanceData.map((item, index) => (
                        <Cell key={`${item.name}-${index}`} fill={item.pnl >= 0 ? '#22c55e' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="portfolio-empty-chart">{t(locale, 'portfolioEmptyState')}</div>
            )}
          </article>
        </div>
      </div>

      <div className="portfolio-positions-grid">
        <article className="portfolio-table-card">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Positions</p>
              <h4>{t(locale, 'openPositions')}</h4>
            </div>
          </div>
          {positions.length ? (
            <div className="portfolio-list">
              {positions.map((position) => {
                const coin = coinMap.get(position.coinId);
                return (
                  <button key={position.coinId} type="button" className="portfolio-position-row" onClick={() => onSelectCoin(position.coinId)}>
                    <span className="portfolio-coin-pill">
                      {coin?.image ? <img src={coin.image} alt="" /> : null}
                      <span>
                        <strong>{coin?.symbol?.toUpperCase() ?? position.coinId}</strong>
                        <small>{coin?.name ?? position.coinId}</small>
                      </span>
                    </span>
                    <span>
                      <strong>{formatNumber(position.quantity, false)}</strong>
                      <small>{t(locale, 'quantity')}</small>
                    </span>
                    <span>
                      <strong>{formatCurrency(position.currentValue, currency)}</strong>
                      <small>{formatPercent(position.allocation)}</small>
                    </span>
                    <span>
                      <strong className={position.totalPnl >= 0 ? 'positive' : 'negative'}>{formatCurrency(position.totalPnl, currency)}</strong>
                      <small className={position.roi >= 0 ? 'positive' : 'negative'}>{formatPercent(position.roi)}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="portfolio-empty-chart">{t(locale, 'portfolioEmptyState')}</div>
          )}
        </article>

        <article className="portfolio-table-card">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">History</p>
              <h4>{t(locale, 'transactionHistory')}</h4>
            </div>
          </div>
          {latestTransactions.length ? (
            <div className="portfolio-list transaction-list">
              {latestTransactions.map((transaction) => {
                const coin = coinMap.get(transaction.coinId);
                return (
                  <div key={transaction.id} className="transaction-row">
                    <div>
                      <strong>{transaction.type === 'buy' ? t(locale, 'buy') : t(locale, 'sell')} · {coin?.symbol?.toUpperCase() ?? transaction.coinId}</strong>
                      <p>{transaction.note || t(locale, 'noTransactionNote')}</p>
                      <small>{new Date(transaction.date).toLocaleDateString(locale === 'es' ? 'es-CL' : 'en-US')}</small>
                    </div>
                    <div>
                      <strong>{formatNumber(transaction.quantity, false)}</strong>
                      <small>{formatCurrency(transaction.price, currency)}</small>
                    </div>
                    <button className="icon-button" type="button" onClick={() => onRemoveTransaction(transaction.id)} aria-label="Remove transaction">
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="portfolio-empty-chart">{t(locale, 'portfolioNoTransactions')}</div>
          )}
        </article>
      </div>
    </section>
  );
}
