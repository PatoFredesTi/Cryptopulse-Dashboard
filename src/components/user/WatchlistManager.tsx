import { BarChart3, BellRing, CheckCircle2, CircleDollarSign, Edit3, Layers3, Plus, ShieldAlert, Star, Target, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CryptoMarket } from '../../types/crypto';
import type { Watchlist, WatchlistItem, WatchlistPriority, WatchlistSortMode, WatchlistStatus } from '../../types/watchlist';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import { t } from '../../utils/i18n';

type WatchlistManagerProps = {
  locale: string;
  currency: string;
  coins: CryptoMarket[];
  watchlists: Watchlist[];
  onCreateWatchlist: (draft: { name: string; description: string; color: string }) => Watchlist | null;
  onUpdateWatchlist: (watchlistId: string, updates: { name?: string; description?: string; color?: string }) => void;
  onDeleteWatchlist: (watchlistId: string) => void;
  onAddCoin: (watchlistId: string, coinId: string) => void;
  onRemoveCoin: (watchlistId: string, coinId: string) => void;
  onUpdateItem: (watchlistId: string, coinId: string, updates: Partial<Pick<WatchlistItem, 'note' | 'priority' | 'status' | 'targetPrice'>>) => void;
  onSelectCoin: (coinId: string) => void;
};

type EnrichedItem = WatchlistItem & {
  coin?: CryptoMarket;
};

const priorityOrder: Record<WatchlistPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const statusIcon: Record<WatchlistStatus, JSX.Element> = {
  watching: <Star size={14} />,
  'buy-zone': <Target size={14} />,
  holding: <CircleDollarSign size={14} />,
  risky: <ShieldAlert size={14} />,
};

const defaultColors = ['#4f46e5', '#059669', '#f97316', '#dc2626', '#7c3aed', '#0891b2'];

function getCoinMap(coins: CryptoMarket[]) {
  return new Map(coins.map((coin) => [coin.id, coin]));
}

function getListStats(items: EnrichedItem[]) {
  const validItems = items.filter((item) => item.coin);
  const averageChange = validItems.length
    ? validItems.reduce((sum, item) => sum + (item.coin?.price_change_percentage_24h_in_currency ?? 0), 0) / validItems.length
    : 0;
  const marketCap = validItems.reduce((sum, item) => sum + (item.coin?.market_cap ?? 0), 0);
  const highPriority = items.filter((item) => item.priority === 'high').length;
  const buyZone = items.filter((item) => item.status === 'buy-zone').length;

  return { averageChange, marketCap, highPriority, buyZone };
}

function sortItems(items: EnrichedItem[], sortMode: WatchlistSortMode) {
  return [...items].sort((a, b) => {
    if (sortMode === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority];
    if (sortMode === 'updatedAt') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (sortMode === 'change24h') return (b.coin?.price_change_percentage_24h_in_currency ?? -999) - (a.coin?.price_change_percentage_24h_in_currency ?? -999);
    if (sortMode === 'marketCap') return (b.coin?.market_cap ?? 0) - (a.coin?.market_cap ?? 0);
    return (a.coin?.market_cap_rank ?? 9999) - (b.coin?.market_cap_rank ?? 9999);
  });
}

export function WatchlistManager({
  locale,
  currency,
  coins,
  watchlists,
  onCreateWatchlist,
  onUpdateWatchlist,
  onDeleteWatchlist,
  onAddCoin,
  onRemoveCoin,
  onUpdateItem,
  onSelectCoin,
}: WatchlistManagerProps) {
  const [activeListId, setActiveListId] = useState(() => watchlists[0]?.id ?? '');
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftColor, setDraftColor] = useState(defaultColors[0]);
  const [selectedCoinId, setSelectedCoinId] = useState('');
  const [sortMode, setSortMode] = useState<WatchlistSortMode>('priority');
  const [editingList, setEditingList] = useState(false);

  const coinMap = useMemo(() => getCoinMap(coins), [coins]);
  const activeList = watchlists.find((list) => list.id === activeListId) ?? watchlists[0];
  const enrichedItems = useMemo(() => (
    activeList?.items.map((item) => ({ ...item, coin: coinMap.get(item.coinId) })) ?? []
  ), [activeList, coinMap]);
  const sortedItems = useMemo(() => sortItems(enrichedItems, sortMode), [enrichedItems, sortMode]);
  const availableCoins = coins.filter((coin) => !activeList?.items.some((item) => item.coinId === coin.id)).slice(0, 100);
  const stats = getListStats(enrichedItems);
  const totalTracked = watchlists.reduce((sum, list) => sum + list.items.length, 0);

  const handleCreateList = () => {
    const created = onCreateWatchlist({ name: draftName, description: draftDescription, color: draftColor });
    if (created) {
      setActiveListId(created.id);
      setDraftName('');
      setDraftDescription('');
      setDraftColor(defaultColors[(watchlists.length + 1) % defaultColors.length]);
    }
  };

  const handleAddCoin = () => {
    if (!activeList || !selectedCoinId) return;
    onAddCoin(activeList.id, selectedCoinId);
    setSelectedCoinId('');
  };

  if (!activeList) {
    return (
      <section className="panel watchlist-pro-panel">
        <div className="auth-empty-state">
          <Layers3 size={28} />
          <strong>{t(locale, 'watchlistProEmptyTitle')}</strong>
          <p>{t(locale, 'watchlistProEmptyDescription')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="watchlist-pro-shell">
      <div className="section-heading compact">
      </div>

      <div className="watchlist-pro-layout">
        <aside className="watchlist-sidebar panel">
          <div className="watchlist-list-tabs">
            {watchlists.map((list) => {
              const listStats = getListStats(list.items.map((item) => ({ ...item, coin: coinMap.get(item.coinId) })));
              return (
                <button
                  key={list.id}
                  type="button"
                  className={`watchlist-tab ${list.id === activeList.id ? 'active' : ''}`}
                  onClick={() => setActiveListId(list.id)}
                >
                  <span className="watchlist-color-dot" style={{ background: list.color }} />
                  <span>
                    <strong>{list.name}</strong>
                    <small>{list.items.length} {t(locale, 'assets')} · {formatPercent(listStats.averageChange)}</small>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="watchlist-create-box">
            <p className="eyebrow">{t(locale, 'createWatchlist')}</p>
            <input value={draftName} onChange={(event) => setDraftName(event.target.value)} placeholder={t(locale, 'watchlistName')} />
            <textarea value={draftDescription} onChange={(event) => setDraftDescription(event.target.value)} placeholder={t(locale, 'watchlistDescription')} rows={3} />
            <div className="color-picker-row">
              {defaultColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={color}
                  className={`color-dot-button ${draftColor === color ? 'active' : ''}`}
                  style={{ background: color }}
                  onClick={() => setDraftColor(color)}
                />
              ))}
            </div>
            <button className="primary-button full-width" type="button" onClick={handleCreateList} disabled={!draftName.trim()}>
              <Plus size={15} />
              {t(locale, 'createList')}
            </button>
          </div>
        </aside>

        <div className="watchlist-main panel">
          <div className="watchlist-active-header">
            <div className="watchlist-title-block">
              <span className="watchlist-color-dot large" style={{ background: activeList.color }} />
              <div>
                {editingList ? (
                  <input
                    className="watchlist-name-input"
                    value={activeList.name}
                    onChange={(event) => onUpdateWatchlist(activeList.id, { name: event.target.value })}
                  />
                ) : <h3>{activeList.name}</h3>}
                {editingList ? (
                  <textarea
                    value={activeList.description}
                    onChange={(event) => onUpdateWatchlist(activeList.id, { description: event.target.value })}
                    rows={2}
                  />
                ) : <p>{activeList.description || t(locale, 'watchlistNoDescription')}</p>}
              </div>
            </div>
            <div className="watchlist-actions">
              <button className="secondary-button" type="button" onClick={() => setEditingList((current) => !current)}>
                <Edit3 size={15} />
                {editingList ? t(locale, 'done') : t(locale, 'edit')}
              </button>
              <button className="icon-button danger" type="button" onClick={() => onDeleteWatchlist(activeList.id)} disabled={watchlists.length <= 1} aria-label={t(locale, 'deleteList')}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="watchlist-stat-grid">
            <article>
              <Star size={16} />
              <span>{t(locale, 'assets')}</span>
              <strong>{activeList.items.length}</strong>
            </article>
            <article>
              <BarChart3 size={16} />
              <span>{t(locale, 'average24h')}</span>
              <strong className={stats.averageChange >= 0 ? 'positive' : 'negative'}>{formatPercent(stats.averageChange)}</strong>
            </article>
            <article>
              <CircleDollarSign size={16} />
              <span>{t(locale, 'trackedMarketCap')}</span>
              <strong>{formatCurrency(stats.marketCap, currency, true)}</strong>
            </article>
            <article>
              <BellRing size={16} />
              <span>{t(locale, 'buyZone')}</span>
              <strong>{stats.buyZone}</strong>
            </article>
          </div>

          <div className="watchlist-controls-row">
            <select value={selectedCoinId} onChange={(event) => setSelectedCoinId(event.target.value)}>
              <option value="">{t(locale, 'selectCoin')}</option>
              {availableCoins.map((coin) => (
                <option key={coin.id} value={coin.id}>{coin.name} · {coin.symbol.toUpperCase()}</option>
              ))}
            </select>
            <button className="secondary-button" type="button" onClick={handleAddCoin} disabled={!selectedCoinId}>
              <Plus size={15} />
              {t(locale, 'addAsset')}
            </button>
            <select value={sortMode} onChange={(event) => setSortMode(event.target.value as WatchlistSortMode)}>
              <option value="priority">{t(locale, 'sortByPriority')}</option>
              <option value="rank">{t(locale, 'sortByRank')}</option>
              <option value="change24h">{t(locale, 'sortByChange')}</option>
              <option value="marketCap">{t(locale, 'sortByMarketCap')}</option>
              <option value="updatedAt">{t(locale, 'sortByUpdated')}</option>
            </select>
          </div>

          {sortedItems.length ? (
            <div className="watchlist-pro-items">
              {sortedItems.map((item) => {
                const coin = item.coin;
                const targetDistance = coin && item.targetPrice
                  ? ((item.targetPrice - coin.current_price) / coin.current_price) * 100
                  : null;

                return (
                  <article key={item.coinId} className={`watchlist-pro-item priority-${item.priority}`}>
                    <button className="watchlist-coin-main" type="button" onClick={() => onSelectCoin(item.coinId)}>
                      {coin?.image ? <img src={coin.image} alt="" /> : <span className="coin-placeholder">?</span>}
                      <span>
                        <strong>{coin?.name ?? item.coinId}</strong>
                        <small>{coin ? `${coin.symbol.toUpperCase()} · #${coin.market_cap_rank}` : t(locale, 'assetUnavailable')}</small>
                      </span>
                    </button>

                    <div className="watchlist-coin-price">
                      <strong>{coin ? formatCurrency(coin.current_price, currency) : '—'}</strong>
                      <small className={(coin?.price_change_percentage_24h_in_currency ?? 0) >= 0 ? 'positive' : 'negative'}>
                        {formatPercent(coin?.price_change_percentage_24h_in_currency)}
                      </small>
                    </div>

                    <div className="watchlist-item-controls">
                      <label>
                        <span>{t(locale, 'priority')}</span>
                        <select value={item.priority} onChange={(event) => onUpdateItem(activeList.id, item.coinId, { priority: event.target.value as WatchlistPriority })}>
                          <option value="high">{t(locale, 'high')}</option>
                          <option value="medium">{t(locale, 'medium')}</option>
                          <option value="low">{t(locale, 'low')}</option>
                        </select>
                      </label>
                      <label>
                        <span>{t(locale, 'status')}</span>
                        <select value={item.status} onChange={(event) => onUpdateItem(activeList.id, item.coinId, { status: event.target.value as WatchlistStatus })}>
                          <option value="watching">{t(locale, 'watching')}</option>
                          <option value="buy-zone">{t(locale, 'buyZone')}</option>
                          <option value="holding">{t(locale, 'holding')}</option>
                          <option value="risky">{t(locale, 'risky')}</option>
                        </select>
                      </label>
                      <label>
                        <span>{t(locale, 'targetPrice')}</span>
                        <input
                          type="number"
                          min="0"
                          value={item.targetPrice ?? ''}
                          placeholder="0.00"
                          onChange={(event) => onUpdateItem(activeList.id, item.coinId, { targetPrice: event.target.value ? Number(event.target.value) : null })}
                        />
                      </label>
                    </div>

                    <div className="watchlist-note-row">
                      <span className={`watchlist-status status-${item.status}`}>{statusIcon[item.status]} {t(locale, item.status)}</span>
                      {targetDistance !== null ? (
                        <span className={targetDistance >= 0 ? 'positive' : 'negative'}>
                          {t(locale, 'targetDistance')}: {formatPercent(targetDistance)}
                        </span>
                      ) : <span>{t(locale, 'noTarget')}</span>}
                    </div>

                    <textarea
                      value={item.note}
                      onChange={(event) => onUpdateItem(activeList.id, item.coinId, { note: event.target.value })}
                      placeholder={t(locale, 'watchlistNotePlaceholder')}
                      rows={2}
                    />

                    <button className="icon-button remove-watchlist-item" type="button" onClick={() => onRemoveCoin(activeList.id, item.coinId)} aria-label={t(locale, 'removeAsset')}>
                      <X size={15} />
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="auth-empty-state watchlist-pro-empty">
              <CheckCircle2 size={28} />
              <strong>{t(locale, 'watchlistProEmptyTitle')}</strong>
              <p>{t(locale, 'watchlistProEmptyDescription')}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
