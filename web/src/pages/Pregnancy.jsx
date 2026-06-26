import { useEffect, useState } from 'react';
import { api } from '../api';
import { useI18n } from '../i18n';
import { Loader, ErrorBox } from '../components/ui';

function ManagePanel({ t, current, onSaved }) {
  const [mode, setMode] = useState('lmp');
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!value) return;
    setBusy(true);
    try {
      await api.post('/pregnancy', mode === 'lmp' ? { lmp: value } : { dueDate: value });
      setValue('');
      onSaved();
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!current) return;
    if (!window.confirm(t('confirmReset'))) return;
    setBusy(true);
    try {
      await api.delete(`/pregnancy/${current.id}`);
      onSaved();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <h3 style={{ marginTop: 0 }}>{t('managePregnancy')}</h3>
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.6rem' }}>
        <button
          className={`chip ${mode === 'lmp' ? 'active' : ''}`}
          onClick={() => setMode('lmp')}
        >
          {t('lmpDate')}
        </button>
        <button
          className={`chip ${mode === 'due' ? 'active' : ''}`}
          onClick={() => setMode('due')}
        >
          {t('dueDate')}
        </button>
      </div>
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="date" value={value} onChange={(e) => setValue(e.target.value)} />
        <button className="btn" disabled={busy || !value} onClick={save}>
          {current ? t('editPregnancy') : t('send')}
        </button>
        {current && (
          <button className="btn btn-ghost" disabled={busy} onClick={reset}>
            {t('resetPregnancy')}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Pregnancy() {
  const { t, lang } = useI18n();
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);

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

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!state) return <Loader />;

  if (state.none) {
    return (
      <div style={{ maxWidth: 460 }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>{t('noPregnancy')}</h3>
          <p className="muted">{t('managePregnancy')}</p>
        </div>
        <ManagePanel t={t} current={null} onSaved={load} />
      </div>
    );
  }

  const { pregnancy, progress, week, milestones } = state;
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

      <ManagePanel t={t} current={pregnancy} onSaved={load} />

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
