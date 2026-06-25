import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { useI18n } from '../i18n';

const LINKS = [
  { to: '/', key: 'dashboard', icon: '📊', end: true },
  { to: '/pregnancy', key: 'pregnancy', icon: '🤰' },
  { to: '/babies', key: 'babies', icon: '👶' },
  { to: '/wellness', key: 'wellness', icon: '🌸' },
  { to: '/school', key: 'school', icon: '🎒' },
  { to: '/tools', key: 'tools', icon: '⏱️' },
  { to: '/community', key: 'community', icon: '💬' },
  { to: '/assistant', key: 'assistant', icon: '🤖' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useI18n();
  const location = useLocation();
  const current = LINKS.find((l) => (l.end ? location.pathname === l.to : location.pathname.startsWith(l.to) && l.to !== '/')) || LINKS[0];

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
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="brand-mini">
            <span className="page-icon">{current.icon}</span>
            <h2>{t(current.key)}</h2>
          </div>
          <div className="userbox">
            <select className="lang-mini" value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t('language')}>
              <option value="ar">ع</option>
              <option value="fr">FR</option>
            </select>
            <div className="avatar" title={user?.name}>{(user?.name || '?').charAt(0).toUpperCase()}</div>
            <button className="icon-btn" onClick={logout} title={t('logout')}>⎋</button>
          </div>
        </div>
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className="bn-link" title={t(l.key)}>
            <span className="bn-ic">{l.icon}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
