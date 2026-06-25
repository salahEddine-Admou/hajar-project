import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { api } from '../api';
import { useI18n } from '../i18n';
import { Loader, ErrorBox } from '../components/ui';

const EMOJIS = ['😢', '😟', '😐', '🙂', '😄'];

export default function Wellness() {
  const { t, lang } = useI18n();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(2);
  const [anxiety, setAnxiety] = useState(2);

  const load = () => {
    setError(null);
    setData(null);
    Promise.all([
      api.get('/wellness/mood'),
      api.get('/wellness/recommendations', { params: { lang } }),
    ])
      .then(([m, r]) => setData({ moods: m.data.moods, rec: r.data }))
      .catch((e) => setError(e.message));
  };

  useEffect(load, [lang]);

  const logMood = async () => {
    await api.post('/wellness/mood', { mood, stress, anxiety });
    load();
  };

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!data) return <Loader />;

  const chart = [...data.moods].reverse().map((m) => ({ date: m.date, mood: m.mood, stress: m.stress, anxiety: m.anxiety }));

  return (
    <div className="grid cols-2">
      <div className="card">
        <h3>{t('logMood')}</h3>
        <div style={{ fontSize: '2.6rem', textAlign: 'center' }}>{EMOJIS[mood - 1]}</div>
        <Slider label={t('mood')} value={mood} set={setMood} />
        <Slider label={t('stress')} value={stress} set={setStress} />
        <Slider label={t('anxiety')} value={anxiety} set={setAnxiety} />
        <button className="btn" onClick={logMood}>{t('logMood')}</button>
      </div>

      <div className="card">
        <h3>{t('recommendations')}</h3>
        {(data.rec.tips || []).map((tip, i) => (
          <div className="list-item" key={i}>🌿 <span>{tip}</span></div>
        ))}
        {(!data.rec.tips || data.rec.tips.length === 0) && <div className="muted">{t('empty')}</div>}
      </div>

      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <h3>{t('mood')}</h3>
        {chart.length === 0 ? (
          <div className="muted">{t('empty')}</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="mood" name={t('mood')} stroke="#7c5cbf" strokeWidth={2} />
              <Line type="monotone" dataKey="stress" name={t('stress')} stroke="#f7a8b8" strokeWidth={2} />
              <Line type="monotone" dataKey="anxiety" name={t('anxiety')} stroke="#ffb085" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function Slider({ label, value, set }) {
  return (
    <div style={{ margin: '.4rem 0' }}>
      <label>{label}: {value}</label>
      <input type="range" min="1" max="5" value={value} onChange={(e) => set(Number(e.target.value))} />
    </div>
  );
}
