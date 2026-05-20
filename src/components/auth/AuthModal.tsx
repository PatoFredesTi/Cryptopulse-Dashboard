import { FormEvent, useMemo, useState } from 'react';
import { CheckCircle2, LockKeyhole, Mail, ShieldCheck, User, X } from 'lucide-react';
import type { AuthMode, LoginPayload, RegisterPayload } from '../../types/auth';
import { t } from '../../utils/i18n';

type AuthModalProps = {
  mode: AuthMode;
  locale: string;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
  onLogin: (payload: LoginPayload) => void;
  onRegister: (payload: RegisterPayload) => void;
  onResetPassword: (email: string) => void;
};

const demoEmail = 'demo@cryptopulse.dev';

export function AuthModal({
  mode,
  locale,
  onClose,
  onModeChange,
  onLogin,
  onRegister,
  onResetPassword,
}: AuthModalProps) {
  const [email, setEmail] = useState(demoEmail);
  const [password, setPassword] = useState('cryptopulse-demo');
  const [name, setName] = useState('Crypto Analyst');
  const [remember, setRemember] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [message, setMessage] = useState('');

  const title = useMemo(() => {
    if (mode === 'register') return t(locale, 'authCreateAccount');
    if (mode === 'forgot') return t(locale, 'authRecoverAccess');
    return t(locale, 'authLoginTitle');
  }, [locale, mode]);

  const subtitle = useMemo(() => {
    if (mode === 'register') return t(locale, 'authRegisterSubtitle');
    if (mode === 'forgot') return t(locale, 'authForgotSubtitle');
    return t(locale, 'authLoginSubtitle');
  }, [locale, mode]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');

    if (mode === 'forgot') {
      onResetPassword(email);
      setMessage(t(locale, 'authResetSent'));
      return;
    }

    if (!email.trim() || !password.trim()) {
      setMessage(t(locale, 'authRequiredFields'));
      return;
    }

    if (mode === 'register') {
      if (!acceptTerms) {
        setMessage(t(locale, 'authAcceptTerms'));
        return;
      }

      onRegister({ name, email, password, acceptTerms });
      onClose();
      return;
    }

    onLogin({ email, password, remember });
    onClose();
  };

  const handleDemoLogin = () => {
    onLogin({ email: demoEmail, password: 'cryptopulse-demo', remember: true });
    onClose();
  };

  return (
    <div className="auth-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <section className="auth-modal panel">
        <button className="close-button auth-close" type="button" onClick={onClose} aria-label="Close auth modal">
          <X size={18} />
        </button>

        <div className="auth-hero">
          <span className="auth-icon"><ShieldCheck size={24} /></span>
          <p className="eyebrow">CryptoPulse Identity · v2.5</p>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Authentication modes">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => onModeChange('login')}>
            {t(locale, 'authLogin')}
          </button>
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => onModeChange('register')}>
            {t(locale, 'authRegister')}
          </button>
          <button type="button" className={mode === 'forgot' ? 'active' : ''} onClick={() => onModeChange('forgot')}>
            {t(locale, 'authForgot')}
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <label className="field-group">
              <span>{t(locale, 'authName')}</span>
              <div className="input-shell">
                <User size={16} />
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Crypto Analyst" />
              </div>
            </label>
          ) : null}

          <label className="field-group">
            <span>{t(locale, 'authEmail')}</span>
            <div className="input-shell">
              <Mail size={16} />
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={demoEmail} />
            </div>
          </label>

          {mode !== 'forgot' ? (
            <label className="field-group">
              <span>{t(locale, 'authPassword')}</span>
              <div className="input-shell">
                <LockKeyhole size={16} />
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
              </div>
            </label>
          ) : null}

          {mode === 'login' ? (
            <label className="check-row">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
              <span>{t(locale, 'authRemember')}</span>
            </label>
          ) : null}

          {mode === 'register' ? (
            <label className="check-row">
              <input type="checkbox" checked={acceptTerms} onChange={(event) => setAcceptTerms(event.target.checked)} />
              <span>{t(locale, 'authTerms')}</span>
            </label>
          ) : null}

          {message ? <div className="auth-message"><CheckCircle2 size={16} />{message}</div> : null}

          <button className="primary-button auth-submit" type="submit">
            {mode === 'register' ? t(locale, 'authCreateAccount') : mode === 'forgot' ? t(locale, 'authSendRecovery') : t(locale, 'authLogin')}
          </button>

          {mode === 'login' ? (
            <button className="secondary-button auth-submit" type="button" onClick={handleDemoLogin}>
              {t(locale, 'authUseDemo')}
            </button>
          ) : null}
        </form>

        <div className="auth-note">
          <strong>{t(locale, 'authDemoNoteTitle')}</strong>
          <p>{t(locale, 'authDemoNoteText')}</p>
        </div>
      </section>
    </div>
  );
}
