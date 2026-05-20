import { FormEvent, useState } from 'react';
import { Save, UserRound } from 'lucide-react';
import type { AuthUser, RiskProfile } from '../../types/auth';
import { t } from '../../utils/i18n';

type UserProfilePanelProps = {
  locale: string;
  user: AuthUser | null;
  onOpenAuth: () => void;
  onUpdateProfile: (updates: { name: string; riskProfile: RiskProfile; preferredCurrency: 'usd' | 'eur' | 'clp' }) => void;
};

export function UserProfilePanel({ locale, user, onOpenAuth, onUpdateProfile }: UserProfilePanelProps) {
  const [name, setName] = useState(user?.name ?? '');
  const [riskProfile, setRiskProfile] = useState<RiskProfile>(user?.riskProfile ?? 'balanced');
  const [preferredCurrency, setPreferredCurrency] = useState<'usd' | 'eur' | 'clp'>(user?.preferredCurrency ?? 'usd');
  const [saved, setSaved] = useState(false);

  if (!user) {
    return (
      <section className="panel auth-gate">
        <div>
          <p className="eyebrow">Profile</p>
          <h2>{t(locale, 'profileGateTitle')}</h2>
          <p>{t(locale, 'profileGateDescription')}</p>
        </div>
        <button className="primary-button" type="button" onClick={onOpenAuth}>{t(locale, 'authLogin')}</button>
      </section>
    );
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onUpdateProfile({ name, riskProfile, preferredCurrency });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  };

  return (
    <section className="profile-layout">
      <article className="panel profile-summary-card">
        <div className="user-avatar xl">{user.avatarInitials}</div>
        <div>
          <p className="eyebrow">{t(locale, 'profile')}</p>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      </article>

      <form className="panel profile-form" onSubmit={handleSubmit}>
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Preferences</p>
            <h3>{t(locale, 'profileSettings')}</h3>
          </div>
          <UserRound size={22} />
        </div>

        <label className="field-group">
          <span>{t(locale, 'authName')}</span>
          <div className="input-shell">
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
        </label>

        <label className="field-group">
          <span>{t(locale, 'riskProfile')}</span>
          <div className="input-shell">
            <select value={riskProfile} onChange={(event) => setRiskProfile(event.target.value as RiskProfile)}>
              <option value="conservative">{t(locale, 'conservative')}</option>
              <option value="balanced">{t(locale, 'balanced')}</option>
              <option value="aggressive">{t(locale, 'aggressive')}</option>
            </select>
          </div>
        </label>

        <label className="field-group">
          <span>{t(locale, 'preferredCurrency')}</span>
          <div className="input-shell">
            <select value={preferredCurrency} onChange={(event) => setPreferredCurrency(event.target.value as 'usd' | 'eur' | 'clp')}>
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="clp">CLP</option>
            </select>
          </div>
        </label>

        {saved ? <div className="auth-message"><Save size={16} />{t(locale, 'profileSaved')}</div> : null}

        <button className="primary-button auth-submit" type="submit">
          <Save size={16} />
          {t(locale, 'saveProfile')}
        </button>
      </form>
    </section>
  );
}
