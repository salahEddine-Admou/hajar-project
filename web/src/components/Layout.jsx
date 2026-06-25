import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, HeartPulse, Baby, Flower2, GraduationCap,
  Timer, MessagesSquare, Bot, LogOut,
} from 'lucide-react';
import { useAuth } from '../auth';
import { useI18n } from '../i18n';

const LINKS = [
  { to: '/', key: 'dashboard', Icon: LayoutDashboard, end: true },
  { to: '/pregnancy', key: 'pregnancy', Icon: HeartPulse },
  { to: '/babies', key: 'babies', Icon: Baby },
  { to: '/wellness', key: 'wellness', Icon: Flower2 },
  { to: '/school', key: 'school', Icon: GraduationCap },
  { to: '/tools', key: 'tools', Icon: Timer },
  { to: '/community', key: 'community', Icon: MessagesSquare },
  { to: '/assistant', key: 'assistant', Icon: Bot },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useI18n();
  const location = useLocation();
  const current = LINKS.find((l) => (l.end ? location.pathname === l.to : location.pathname.startsWith(l.to) && l.to !== '/')) || LINKS[0];
  const CurrentIcon = current.Icon;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="logo-row">
          <span className="logo-badge">🤍</span> <span className="label">{t('appName')}</span>
        </div>
        {LINKS.map(({ to, key, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="nav-link">
            <span className="ic"><Icon size={20} strokeWidth={2.2} /></span>
            <span className="label">{t(key)}</span>
          </NavLink>
        ))}
        <div className="spacer" />
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="brand-mini">
            <span className="page-icon"><CurrentIcon size={22} strokeWidth={2.2} /></span>
            <h2>{t(current.key)}</h2>
          </div>
          <div className="userbox">
            <select className="lang-mini" value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t('language')}>
              <option value="ar">ع</option>
              <option value="fr">FR</option>
            </select>
            <div className="avatar" title={user?.name}>{(user?.name || '?').charAt(0).toUpperCase()}</div>
            <button className="icon-btn" onClick={logout} title={t('logout')}><LogOut size={18} /></button>
          </div>
        </div>
        <div className="route-fade" key={location.pathname}>
          <Outlet />
        </div>
      </main>

      <nav className="bottom-nav">
        {LINKS.map(({ to, key, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="bn-link" title={t(key)}>
            <span className="bn-ic"><Icon size={22} strokeWidth={2.2} /></span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
