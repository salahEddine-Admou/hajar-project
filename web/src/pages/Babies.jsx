import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';
import { api } from '../api';
import { useI18n } from '../i18n';
import { Loader, ErrorBox, Empty } from '../components/ui';

export default function Babies() {
  const { t, lang } = useI18n();
  const [babies, setBabies] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [vaccines, setVaccines] = useState([]);

  const loadBabies = () => {
    setError(null);
    api.get('/babies')
      .then((res) => {
        setBabies(res.data.babies);
        if (res.data.babies.length && !selected) setSelected(res.data.babies[0]);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(loadBabies, []);

  useEffect(() => {
    if (!selected) return;
    api.get(`/babies/${selected.id}/growth`).then((r) => setGrowth(r.data.records));
    api.get(`/babies/${selected.id}/vaccinations`, { params: { lang } }).then((r) => setVaccines(r.data.vaccinations));
  }, [selected, lang]);

  const markVaccine = async (vaccine) => {
    await api.post(`/babies/${selected.id}/vaccinations`, { vaccine });
    const r = await api.get(`/babies/${selected.id}/vaccinations`, { params: { lang } });
    setVaccines(r.data.vaccinations);
  };

  if (error) return <ErrorBox message={error} onRetry={loadBabies} />;
  if (!babies) return <Loader />;
  if (!babies.length) return <Empty />;

  const chartData = growth.map((g) => ({
    date: g.date,
    weight: g.weight,
    height: g.height,
    head: g.headCircumference,
  }));

  return (
    <div>
      <div className="tabs">
        {babies.map((b) => (
          <button key={b.id} className={`tab ${selected?.id === b.id ? 'active' : ''}`} onClick={() => setSelected(b)}>
            👶 {b.name}{b.ageMonths != null ? ` • ${b.ageMonths}m` : ''}
          </button>
        ))}
      </div>

      <div className="card">
        <h3>{t('growth')}</h3>
        {chartData.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="weight" name={t('weight')} stroke="#7c5cbf" strokeWidth={2} />
              <Line type="monotone" dataKey="height" name={t('height')} stroke="#8fd3c4" strokeWidth={2} />
              <Line type="monotone" dataKey="head" name={t('headCirc')} stroke="#f7a8b8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="section-title">{t('vaccinations')}</div>
      <div className="card">
        {vaccines.map((v) => (
          <div className="list-item" key={v.vaccine}>
            <span>{v.given ? '✅' : '💉'}</span>
            <div>
              <div style={{ fontWeight: 600 }}>{v.vaccine}</div>
              <div className="muted" style={{ fontSize: '.8rem' }}>{v.protectsAgainst}</div>
            </div>
            <div className="right">
              {v.given ? (
                <span className="badge">{t('given')} • {v.givenDate}</span>
              ) : (
                <button className="chip" onClick={() => markVaccine(v.vaccine)}>{t('due')} {v.dueDate}</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
