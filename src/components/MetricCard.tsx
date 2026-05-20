import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export function MetricCard({ label, value, helper, tone = 'neutral' }) {
  const Icon = tone === 'negative' ? ArrowDownRight : ArrowUpRight;

  return (
    <article className={`metric-card ${tone}`}>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
      <span className="metric-icon">
        {tone === 'neutral' ? '•' : <Icon size={18} />}
      </span>
      {helper ? <small>{helper}</small> : null}
    </article>
  );
}
