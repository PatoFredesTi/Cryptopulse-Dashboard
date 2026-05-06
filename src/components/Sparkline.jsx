export function Sparkline({ values = [], positive = true }) {
  const points = values.filter((value) => typeof value === 'number').slice(-40);

  if (points.length < 2) {
    return <span className="sparkline-empty">—</span>;
  }

  const width = 130;
  const height = 42;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coordinates = points.map((value, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className={`sparkline ${positive ? 'positive' : 'negative'}`} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="7 day price sparkline">
      <polyline points={coordinates} fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
