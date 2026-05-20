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

const dateLocales = {
  es: 'es-CL',
  en: 'en-US',
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

export function buildChartData(chartData = [], locale = 'es') {
  return chartData.map(([timestamp, value]) => ({
    date: new Date(timestamp).toLocaleDateString(dateLocales[locale] ?? 'es-CL', {
      month: 'short',
      day: 'numeric',
    }),
    timestamp,
    value,
  }));
}

export function buildVolumeData(volumeData = [], locale = 'es') {
  return volumeData.map(([timestamp, value]) => ({
    date: new Date(timestamp).toLocaleDateString(dateLocales[locale] ?? 'es-CL', {
      month: 'short',
      day: 'numeric',
    }),
    timestamp,
    value,
  }));
}

export function buildPerformanceComparisonData(primaryPrices = [], comparisonPrices = [], locale = 'es') {
  const length = Math.min(primaryPrices.length, comparisonPrices.length);
  if (!length) return [];

  const primaryStart = Number(primaryPrices[0]?.[1]);
  const comparisonStart = Number(comparisonPrices[0]?.[1]);

  if (!primaryStart || !comparisonStart) return [];

  return Array.from({ length }, (_, index) => {
    const [timestamp, primaryValue] = primaryPrices[index];
    const comparisonValue = comparisonPrices[index]?.[1];

    return {
      date: new Date(timestamp).toLocaleDateString(dateLocales[locale] ?? 'es-CL', {
        month: 'short',
        day: 'numeric',
      }),
      timestamp,
      primary: ((Number(primaryValue) - primaryStart) / primaryStart) * 100,
      comparison: ((Number(comparisonValue) - comparisonStart) / comparisonStart) * 100,
    };
  });
}

export function calculateRangeChange(prices = []) {
  if (prices.length < 2) return null;

  const first = Number(prices[0]?.[1]);
  const last = Number(prices[prices.length - 1]?.[1]);

  if (!first || Number.isNaN(first) || Number.isNaN(last)) return null;
  return ((last - first) / first) * 100;
}

export function formatDate(value, locale = 'es') {
  if (!value) return 'N/A';

  return new Intl.DateTimeFormat(dateLocales[locale] ?? 'es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}
