import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useI18n } from '../i18n';

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function Tools() {
  return (
    <div className="grid cols-2">
      <KickCounter />
      <ContractionTimer />
    </div>
  );
}

function KickCounter() {
  const { t } = useI18n();
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState([]);
  const startRef = useRef(null);
  const timerRef = useRef(null);

  const load = () => api.get('/tools/kicks').then((r) => setHistory(r.data.sessions));
  useEffect(() => { load(); }, []);

  const start = () => {
    setRunning(true); setCount(0); setElapsed(0);
    startRef.current = Date.now();
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
  };
  const stop = async () => {
    clearInterval(timerRef.current);
    setRunning(false);
    if (count > 0) {
      await api.post('/tools/kicks', { count, durationSec: elapsed });
      load();
    }
  };

  return (
    <div className="card">
      <h3>👶 {t('kickCounter')}</h3>
      <div className="card tinted" style={{ textAlign: 'center', margin: '.6rem 0' }}>
        <div style={{ fontSize: '3rem', fontWeight: 800 }}>{count}</div>
        <div style={{ opacity: .85 }}>{t('kicks')} • {fmt(elapsed)}</div>
      </div>
      <button
        onClick={() => running && setCount((c) => c + 1)}
        disabled={!running}
        style={{
          width: '100%', height: 110, border: 'none', borderRadius: 16, fontSize: '1.1rem', fontWeight: 600,
          background: running ? 'var(--blush)' : 'var(--lavender-light)', color: 'var(--ink)',
          cursor: running ? 'pointer' : 'default',
        }}
      >
        {running ? t('tapKick') : t('start')}
      </button>
      <button className="btn" style={{ background: running ? 'var(--blush)' : 'var(--lavender)' }} onClick={running ? stop : start}>
        {running ? t('stop') : t('start')}
      </button>
      <div className="section-title">{t('history')}</div>
      {history.length === 0 && <div className="muted">{t('empty')}</div>}
      {history.slice(0, 6).map((s) => (
        <div className="list-item" key={s.id}>
          <span>🦶</span>
          <div>{s.count} {t('kicks')} • {fmt(s.durationSec || 0)}</div>
          <div className="right muted" style={{ fontSize: '.8rem' }}>{new Date(s.startedAt).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  );
}

function ContractionTimer() {
  const { t } = useI18n();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState([]);
  const startRef = useRef(null);
  const prevStartRef = useRef(null);
  const timerRef = useRef(null);

  const load = () => api.get('/tools/contractions').then((r) => setHistory(r.data.contractions));
  useEffect(() => { load(); }, []);

  const start = () => {
    setRunning(true); setElapsed(0);
    startRef.current = Date.now();
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
  };
  const stop = async () => {
    clearInterval(timerRef.current);
    setRunning(false);
    const duration = Math.floor((Date.now() - startRef.current) / 1000);
    const intervalSec = prevStartRef.current ? Math.floor((startRef.current - prevStartRef.current) / 1000) : null;
    await api.post('/tools/contractions', { startedAt: new Date(startRef.current).toISOString(), durationSec: duration, intervalSec });
    prevStartRef.current = startRef.current;
    load();
  };

  return (
    <div className="card">
      <h3>⏱️ {t('contractionTimer')}</h3>
      <div className="card tinted" style={{ textAlign: 'center', margin: '.6rem 0', background: running ? 'var(--blush)' : 'var(--lavender)' }}>
        <div style={{ fontSize: '3rem', fontWeight: 800 }}>{fmt(elapsed)}</div>
        <div style={{ opacity: .85 }}>{t('duration')}</div>
      </div>
      <button className="btn" style={{ background: running ? 'var(--blush)' : 'var(--lavender)' }} onClick={running ? stop : start}>
        {running ? t('stop') : t('start')}
      </button>
      <div className="section-title">{t('history')}</div>
      {history.length === 0 && <div className="muted">{t('empty')}</div>}
      {history.slice(0, 6).map((c) => (
        <div className="list-item" key={c.id}>
          <span>🌊</span>
          <div>{t('duration')}: {fmt(c.durationSec || 0)}{c.intervalSec != null ? ` • ${t('interval')}: ${fmt(c.intervalSec)}` : ''}</div>
          <div className="right muted" style={{ fontSize: '.8rem' }}>{new Date(c.startedAt).toLocaleTimeString()}</div>
        </div>
      ))}
    </div>
  );
}
