import { useEffect, useState } from 'react';
import { api } from '../api';
import { useI18n } from '../i18n';
import { Loader, ErrorBox } from '../components/ui';

export default function Pregnancy() {
  const { t, lang } = useI18n();
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [lmp, setLmp] = useState('');

  const load = () => {
    setError(null);
    setState(null);
    api
      .get('/pregnancy/active', { params: { lang } })
      .then(async (res) => {
        if (!res.data.pregnancy) return setState({ none: true });
        const ms = await api.get('/pregnancy/milestones', { params: { lang } });
        setState({ ...res.data, milestones: ms.data.milestones });
      })
      .catch((e) => setError(e.message));
  };

  useEffect(load, [lang]);

  const start = async () => {
    if (!lmp) return;
    await api.post('/pregnancy', { lmp });
    load();
  };

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!state) return <Loader />;

  if (state.none) {
    return (
      <div className="card" style={{ maxWidth: 460 }}>
        <h3>{t('noPregnancy')}</h3>
        <label>{t('dueDate')} — LMP</label>
        <input type="date" value={lmp} onChange={(e) => setLmp(e.target.value)} />
        <button className="btn" onClick={start}>{t('send')}</button>
      </div>
    );
  }

  const { progress, week, milestones } = state;
  return (
    <div>
      <div className="card tinted">
        <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>{t('week')} {progress.currentWeek}</div>
        <div className="progress" style={{ margin: '.6rem 0' }}>
          <span style={{ width: `${progress.progressPercent}%` }} />
        </div>
        <div style={{ opacity: .9 }}>{t('trimester')} {progress.trimester} • {progress.daysRemaining} {t('daysToGo')}</div>
        <div style={{ opacity: .9 }}>{t('dueDate')}: {progress.dueDate}</div>
      </div>

      {week && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h3>🍼 {t('babySize')} {week.size}</h3>
          <p className="muted">{week.highlight}</p>
        </div>
      )}

      <div className="section-title">{t('appointments')} / {t('milestone')}</div>
      <div className="card">
        {milestones.map((m, i) => (
          <div className="list-item" key={i}>
            <span>{m.done ? '✅' : '⏳'}</span>
            <div style={{ fontWeight: 600 }}>{m.title}</div>
            <div className="right muted">{t('week')} {m.week}{m.date ? ` • ${m.date}` : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
