import { BarChart3, Github, Moon, RefreshCw, ShieldCheck, Sun } from 'lucide-react';
import { t } from '../utils/i18n';

export function Header({ locale, setLocale, currency, setCurrency, theme, setTheme, onRefresh, loading }) {
  const isDark = theme === 'dark';

  return (
    <header className="app-header">
      <div className="brand-block">
        <div className="logo-mark">
          <BarChart3 size={24} />
        </div>
        <div>
          <p className="eyebrow">CryptoPulse v2.0</p>
          <h1>Crypto Market Dashboard</h1>
          <p className="brand-subtitle">{t(locale, 'appSubtitle')}</p>
        </div>
      </div>

      <div className="header-actions">
        <span className="status-pill">
          <span className="pulse-dot" />
          {t(locale, 'liveMarket')}
        </span>

        <select value={currency} onChange={(event) => setCurrency(event.target.value)} aria-label="Currency selector">
          <option value="usd">USD</option>
          <option value="eur">EUR</option>
          <option value="clp">CLP</option>
        </select>

        <select value={locale} onChange={(event) => setLocale(event.target.value)} aria-label="Language selector">
          <option value="es">ES</option>
          <option value="en">EN</option>
        </select>

        <button className="icon-button" type="button" onClick={() => setTheme(isDark ? 'light' : 'dark')} aria-label="Toggle theme">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="secondary-button" type="button" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          {t(locale, 'refresh')}
        </button>

        <a className="ghost-link" href="https://github.com/PatoFredesTi/AplicacionTablaCriptomonedas" target="_blank" rel="noreferrer">
          <Github size={16} />
          GitHub
        </a>

        <button className="primary-button" type="button" title="Planned for v2.5">
          <ShieldCheck size={16} />
          {t(locale, 'loginSoon')}
        </button>
      </div>
    </header>
  );
}
