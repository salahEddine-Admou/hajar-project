import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth';
import { useI18n } from '../i18n';

const LINKS = [
  { to: '/', key: 'dashboard', icon: '📊', end: true },
  { to: '/pregnancy', key: 'pregnancy', icon: '🤰' },
  { to: '/babies', key: 'babies', icon: '👶' },
  { to: '/wellness', key: 'wellness', icon: '🌸' },
  { to: '/tools', key: 'tools', icon: '⏱️' },
  { to: '/community', key: 'community', icon: '💬' },
  { to: '/assistant', key: 'assistant', icon: '🤖' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useI18n();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="logo-row">
          <span>🤍</span> <span className="label">{t('appName')}</span>
        </div>
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className="nav-link">
            <span className="ic">{l.icon}</span>
            <span className="label">{t(l.key)}</span>
          </NavLink>
        ))}
        <div className="spacer" />
        <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t('language')}>
          <option value="ar">العربية</option>
          <option value="fr">Français</option>
        </select>
        <button className="btn btn-ghost" onClick={logout}>{t('logout')}</button>
      </aside>

      <main className="main">
        <div className="topbar">
          <h2>{t('appName')}</h2>
          <div className="userbox">
            <span className="muted">{user?.name}</span>
            <div className="avatar">{(user?.name || '?').charAt(0)}</div>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
