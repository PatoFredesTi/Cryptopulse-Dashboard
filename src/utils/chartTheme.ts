export const chartColors = {
  primary: 'var(--chart-primary)',
  secondary: 'var(--chart-secondary)',
  positive: 'var(--positive)',
  negative: 'var(--negative)',
  grid: 'var(--chart-grid)',
  text: 'var(--chart-text)',
};

export const chartAxis = {
  tickLine: false,
  axisLine: false,
  tick: { fill: chartColors.text, fontSize: 11 },
} as const;

export const chartTooltipStyle = {
  border: '1px solid var(--border)',
  borderRadius: '10px',
  background: 'var(--surface-elevated)',
  color: 'var(--text-primary)',
  boxShadow: 'var(--shadow)',
};
