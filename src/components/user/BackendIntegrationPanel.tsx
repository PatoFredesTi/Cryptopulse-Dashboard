import { CloudCog, Database, KeyRound, RefreshCcw, Router, TimerReset, Zap } from 'lucide-react';
import type { CloudServiceStatus, CloudSyncState } from '../../types/backend';
import { formatNumber } from '../../utils/formatters';
import { t } from '../../utils/i18n';

type BackendIntegrationPanelProps = {
  locale: string;
  cloudSync: CloudSyncState;
};

const iconMap = {
  auth: KeyRound,
  api: Router,
  functions: Zap,
  database: Database,
  scheduler: TimerReset,
};

function getStatusClass(status: CloudServiceStatus) {
  if (status === 'ready') return 'positive';
  if (status === 'missing-config' || status === 'offline') return 'negative';
  return '';
}

export function BackendIntegrationPanel({ locale, cloudSync }: BackendIntegrationPanelProps) {
  const lastSyncLabel = cloudSync.lastSyncAt
    ? new Date(cloudSync.lastSyncAt).toLocaleString(locale === 'es' ? 'es-CL' : 'en-US')
    : t(locale, 'cloudNeverSynced');

  return (
    <section className="panel backend-panel">
      <div className="section-heading split-heading">
        <div>
          <p className="eyebrow">Backend Integration · v2.9</p>
          <h3>{t(locale, 'backendReadyTitle')}</h3>
          <p>{t(locale, 'backendReadyDescription')}</p>
        </div>
        <button className="secondary-button" type="button" onClick={cloudSync.syncNow} disabled={cloudSync.syncing}>
          <RefreshCcw size={16} className={cloudSync.syncing ? 'spin-icon' : ''} />
          {cloudSync.syncing ? t(locale, 'cloudSyncing') : t(locale, 'cloudSyncNow')}
        </button>
      </div>

      <div className="backend-mode-card">
        <CloudCog size={20} />
        <div>
          <span>{t(locale, 'cloudMode')}</span>
          <strong>{cloudSync.mode.toUpperCase()} · {cloudSync.provider}</strong>
          <small>{cloudSync.endpoint ?? t(locale, 'cloudMockEndpoint')}</small>
        </div>
        <span className={`status-pill ${cloudSync.isConfigured ? 'positive' : 'negative'}`}>
          {cloudSync.isConfigured ? t(locale, 'cloudConfigured') : t(locale, 'cloudMissingConfig')}
        </span>
      </div>

      <div className="cloud-service-grid">
        {cloudSync.services.map((service) => {
          const Icon = iconMap[service.id] ?? CloudCog;
          return (
            <article key={service.id} className="cloud-service-card">
              <Icon size={18} />
              <div>
                <strong>{service.name}</strong>
                <span>{service.role}</span>
                <small>{service.detail}</small>
              </div>
              <span className={`status-pill ${getStatusClass(service.status)}`}>
                {t(locale, `cloudStatus_${service.status}`)}
              </span>
            </article>
          );
        })}
      </div>

      <div className="cloud-snapshot-grid">
        <div>
          <span>{t(locale, 'cloudSnapshotWatchlists')}</span>
          <strong>{formatNumber(cloudSync.snapshot.watchlists)} / {formatNumber(cloudSync.snapshot.watchlistItems)}</strong>
        </div>
        <div>
          <span>{t(locale, 'cloudSnapshotPortfolio')}</span>
          <strong>{formatNumber(cloudSync.snapshot.portfolioTransactions)} / {formatNumber(cloudSync.snapshot.openPositions)}</strong>
        </div>
        <div>
          <span>{t(locale, 'cloudSnapshotAlerts')}</span>
          <strong>{formatNumber(cloudSync.snapshot.activeAlerts)} / {formatNumber(cloudSync.snapshot.triggeredAlerts)}</strong>
        </div>
        <div>
          <span>{t(locale, 'cloudLastSync')}</span>
          <strong>{lastSyncLabel}</strong>
        </div>
      </div>

      {cloudSync.error ? <div className="soft-alert danger-alert">{cloudSync.error}</div> : null}

      <div className="technical-note-card">
        <strong>{t(locale, 'recruiterNote')}</strong>
        <p>{t(locale, 'backendRecruiterNote')}</p>
      </div>
    </section>
  );
}
