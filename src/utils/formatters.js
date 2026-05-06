const currencyLocales = {
  usd: 'en-US',
  eur: 'de-DE',
  clp: 'es-CL',
};

const currencyCodes = {
  usd: 'USD',
  eur: 'EUR',
  clp: 'CLP',
};

export function formatCurrency(value, currency = 'usd', compact = false) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'N/A';

  return new Intl.NumberFormat(currencyLocales[currency] ?? 'en-US', {
    style: 'currency',
    currency: currencyCodes[currency] ?? 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: currency === 'clp' ? 0 : value < 1 ? 6 : 2,
  }).format(value);
}

export function formatNumber(value, compact = true) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'N/A';

  return new Intl.NumberFormat('en-US', {
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'N/A';
  return `${value >= 0 ? '+' : ''}${Number(value).toFixed(2)}%`;
}

export function getChangeTone(value) {
  if (value === null || value === undefined) return 'neutral';
  if (value > 0) return 'positive';
  if (value < 0) return 'negative';
  return 'neutral';
}

export function buildChartData(chartData = []) {
  return chartData.map(([timestamp, value]) => ({
    date: new Date(timestamp).toLocaleDateString('es-CL', {
      month: 'short',
      day: 'numeric',
    }),
    timestamp,
    value,
  }));
}

export function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
