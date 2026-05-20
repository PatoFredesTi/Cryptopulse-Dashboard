import { BarChart3, BookOpenText, Github, LayoutDashboard, Moon, RefreshCw, Sun } from 'lucide-react';
import { t } from '../utils/i18n';

type HeaderProps = {
  locale: string;
  setLocale: (locale: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  onRefresh: () => void;
  loading: boolean;
  activeView: string;
  onNavigate: (view: 'market' | 'dashboard' | 'case-study') => void;
};

export function Header({
  locale,
  setLocale,
  currency,
  setCurrency,
  theme,
  setTheme,
  onRefresh,
  loading,
  activeView,
  onNavigate,
}: HeaderProps) {
  const isDark = theme === 'dark';

  return (
    <header className="app-header pro-header">
      <button className="brand-block brand-button" type="button" onClick={() => onNavigate('market')}>
        <div className="logo-mark">
          <BarChart3 size={24} />
        </div>
        <div>
          <h1>Market Intelligence</h1>
          <p className="brand-subtitle">{t(locale, 'appSubtitleV31')}</p>
        </div>
      </button>

      <div className="header-actions">
        <span className="status-pill">
          <span className="pulse-dot" />
          {t(locale, 'liveMarket')}
        </span>

        <button className={`nav-pill ${activeView === 'market' ? 'active' : ''}`} type="button" onClick={() => onNavigate('market')}>
          <BarChart3 size={15} />
          {t(locale, 'market')}
        </button>

        <button className={`nav-pill ${activeView === 'dashboard' ? 'active' : ''}`} type="button" onClick={() => onNavigate('dashboard')}>
          <LayoutDashboard size={15} />
          {t(locale, 'workspace')}
        </button>

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
      </div>
    </header>
  );
}
