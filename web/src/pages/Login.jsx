import { useState } from 'react';
import { useAuth } from '../auth';
import { useI18n } from '../i18n';

export default function Login() {
  const { login, register } = useAuth();
  const { t, lang, setLang } = useI18n();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@hajar.app');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await register(name.trim(), email.trim(), password, lang);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand">
          <div className="logo">🤍</div>
          <h1>{t('appName')}</h1>
          <p>{mode === 'login' ? t('login') : t('register')}</p>
        </div>

        <div className="lang-row">
          {[['ar', 'العربية'], ['fr', 'Français']].map(([code, label]) => (
            <button type="button" key={code} className={`chip ${lang === code ? 'active' : ''}`} onClick={() => setLang(code)}>
              {label}
            </button>
          ))}
        </div>

        {mode === 'register' && (
          <>
            <label>{t('name')}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </>
        )}
        <label>{t('email')}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>{t('password')}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <div className="error">{error}</div>}

        <button className="btn" disabled={loading}>
          {loading ? t('loading') : mode === 'login' ? t('login') : t('register')}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? t('noAccount') : t('haveAccount')}
        </button>
      </form>
    </div>
  );
}
