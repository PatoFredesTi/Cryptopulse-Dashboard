import { BellRing, Cloud, WalletCards } from 'lucide-react';
import { t } from '../utils/i18n';

export function RoadmapCards({ locale }) {
  const items = [
    { icon: <Cloud size={22} />, label: t(locale, 'authSoon'), version: 'v2.5' },
    { icon: <WalletCards size={22} />, label: t(locale, 'portfolioSoon'), version: 'v2.7' },
    { icon: <BellRing size={22} />, label: t(locale, 'alertsSoon'), version: 'v2.8' },
  ];

  return (
    <section className="panel roadmap-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Product thinking</p>
          <h2>{t(locale, 'nextRoadmap')}</h2>
        </div>
      </div>
      <div className="roadmap-grid">
        {items.map((item) => (
          <article key={item.label} className="roadmap-card">
            <span>{item.icon}</span>
            <strong>{item.label}</strong>
            <small>{item.version}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
