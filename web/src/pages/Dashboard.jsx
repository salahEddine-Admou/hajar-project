import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { api } from '../api';
import { useI18n } from '../i18n';
import { Loader, ErrorBox, Stat } from '../components/ui';

const COLORS = ['#7c5cbf', '#f7a8b8', '#8fd3c4', '#9fc5e8', '#ffd8b0'];

export default function Dashboard() {
  const { t, lang } = useI18n();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    setData(null);
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/notifications/upcoming', { params: { lang } }),
      api.get('/pregnancy/active', { params: { lang } }),
    ])
      .then(([a, n, p]) => setData({ analytics: a.data, notifs: n.data.notifications, preg: p.data }))
      .catch((e) => setError(e.message));
  };

  useEffect(load, [lang]);

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!data) return <Loader />;

  const { totals, last7Days, locales } = data.analytics;
  const weekly = [
    { name: t('newUsers'), v: last7Days.newUsers },
    { name: t('moodLogs'), v: last7Days.moodLogs },
    { name: t('chats'), v: last7Days.chatMessages },
    { name: t('posts'), v: last7Days.communityPosts },
  ];
  const localeData = Object.entries(locales).map(([k, v]) => ({ name: k.toUpperCase(), value: v }));
  const progress = data.preg?.progress;

  return (
    <div>
      <div className="section-title">{t('overview')}</div>
      <div className="grid cols-4">
        <Stat icon="👩" value={totals.users} label={t('totalUsers')} color="#7c5cbf" />
        <Stat icon="🤰" value={totals.pregnancies} label={t('totalPregnancies')} color="#f7a8b8" />
        <Stat icon="👶" value={totals.babies} label={t('totalBabies')} color="#8fd3c4" />
        <Stat icon="📅" value={totals.appointments} label={t('appointments')} color="#9fc5e8" />
        <Stat icon="🙂" value={totals.moodLogs} label={t('moodLogs')} color="#ffb085" />
        <Stat icon="🧠" value={totals.screenings} label={t('screenings')} color="#b39ddb" />
        <Stat icon="💬" value={totals.communityPosts} label={t('posts')} color="#f48fb1" />
        <Stat icon="🤖" value={totals.chatMessages} label={t('chats')} color="#80cbc4" />
      </div>

      <div className="grid cols-2" style={{ marginTop: '1.2rem' }}>
        <div className="card">
          <h3>{t('last7')}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weekly}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="v" radius={[8, 8, 0, 0]} fill="#7c5cbf" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3>{t('byLanguage')}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={localeData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {localeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid cols-2" style={{ marginTop: '1.2rem' }}>
        {progress && (
          <div className="card tinted">
            <h3 style={{ color: '#fff' }}>{t('pregnancy')}</h3>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{t('week')} {progress.currentWeek}</div>
            <div className="progress" style={{ margin: '.6rem 0' }}>
              <span style={{ width: `${progress.progressPercent}%` }} />
            </div>
            <div style={{ opacity: .9 }}>
              {progress.daysRemaining} {t('daysToGo')} • {t('dueDate')}: {progress.dueDate}
            </div>
            {data.preg.week && (
              <div style={{ marginTop: '.5rem' }}>{t('babySize')} {data.preg.week.size}</div>
            )}
          </div>
        )}

        <div className="card">
          <h3>{t('upcoming')}</h3>
          {data.notifs.length === 0 && <div className="muted">{t('nothingUpcoming')}</div>}
          {data.notifs.slice(0, 7).map((n, i) => (
            <div className="list-item" key={i}>
              <span className={`badge ${n.overdue ? 'warn' : ''}`}>{t(n.type)}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{n.title}</div>
                <div className="muted" style={{ fontSize: '.8rem' }}>{n.subtitle}</div>
              </div>
              <div className="right muted" style={{ fontSize: '.8rem' }}>
                {n.overdue ? t('overdue') : new Date(n.date).toLocaleDateString(lang)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
