import { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';
import { api } from '../api';
import { useI18n } from '../i18n';
import { Loader, ErrorBox, Empty } from '../components/ui';

function AddBabyForm({ t, onAdded }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', birthDate: '', sex: 'male', deliveryType: 'vaginal', birthWeight: '', birthHeight: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      const res = await api.post('/babies', {
        name: form.name.trim(),
        birthDate: form.birthDate || undefined,
        sex: form.sex,
        deliveryType: form.deliveryType,
        birthWeight: form.birthWeight ? Number(form.birthWeight) : undefined,
        birthHeight: form.birthHeight ? Number(form.birthHeight) : undefined,
      });
      setForm({ name: '', birthDate: '', sex: 'male', deliveryType: 'vaginal', birthWeight: '', birthHeight: '' });
      setOpen(false);
      onAdded(res.data.baby);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button className="btn" style={{ marginBottom: '1rem' }} onClick={() => setOpen(true)}>
        + {t('addBaby')}
      </button>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '1rem', maxWidth: 520 }}>
      <h3 style={{ marginTop: 0 }}>{t('addBaby')}</h3>
      <label>{t('name')}</label>
      <input value={form.name} onChange={set('name')} />
      <label>{t('birthDate')}</label>
      <input type="date" value={form.birthDate} onChange={set('birthDate')} />
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', margin: '.4rem 0' }}>
        {['male', 'female'].map((s) => (
          <button key={s} className={`chip ${form.sex === s ? 'active' : ''}`} onClick={() => setForm((f) => ({ ...f, sex: s }))}>{t(s)}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', margin: '.4rem 0' }}>
        {['vaginal', 'cesarean'].map((d) => (
          <button key={d} className={`chip ${form.deliveryType === d ? 'active' : ''}`} onClick={() => setForm((f) => ({ ...f, deliveryType: d }))}>{t(d)}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <label>{t('weight')}</label>
          <input type="number" step="0.01" value={form.birthWeight} onChange={set('birthWeight')} />
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <label>{t('height')}</label>
          <input type="number" step="0.1" value={form.birthHeight} onChange={set('birthHeight')} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '.5rem', marginTop: '.8rem' }}>
        <button className="btn" disabled={busy || !form.name.trim()} onClick={submit}>{t('save')}</button>
        <button className="btn btn-ghost" disabled={busy} onClick={() => setOpen(false)}>{t('cancel')}</button>
      </div>
    </div>
  );
}

function AddGrowthForm({ t, babyId, onAdded }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ date: today, weight: '', height: '', headCircumference: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.weight && !form.height && !form.headCircumference) return;
    setBusy(true);
    try {
      await api.post(`/babies/${babyId}/growth`, {
        date: form.date || today,
        weight: form.weight ? Number(form.weight) : undefined,
        height: form.height ? Number(form.height) : undefined,
        headCircumference: form.headCircumference ? Number(form.headCircumference) : undefined,
      });
      setForm({ date: today, weight: '', height: '', headCircumference: '' });
      onAdded();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'flex-end', marginTop: '.8rem' }}>
      <div><label>{t('date')}</label><input type="date" value={form.date} onChange={set('date')} /></div>
      <div style={{ width: 110 }}><label>{t('weight')}</label><input type="number" step="0.01" value={form.weight} onChange={set('weight')} /></div>
      <div style={{ width: 110 }}><label>{t('height')}</label><input type="number" step="0.1" value={form.height} onChange={set('height')} /></div>
      <div style={{ width: 110 }}><label>{t('headCirc')}</label><input type="number" step="0.1" value={form.headCircumference} onChange={set('headCircumference')} /></div>
      <button className="btn" disabled={busy} onClick={submit}>{t('addGrowth')}</button>
    </div>
  );
}

export default function Babies() {
  const { t, lang } = useI18n();
  const [babies, setBabies] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [vaccines, setVaccines] = useState([]);

  const loadBabies = (selectId) => {
    setError(null);
    api.get('/babies')
      .then((res) => {
        setBabies(res.data.babies);
        setSelected((cur) => {
          if (selectId) return res.data.babies.find((b) => b.id === selectId) || cur;
          if (cur) return res.data.babies.find((b) => b.id === cur.id) || res.data.babies[0] || null;
          return res.data.babies[0] || null;
        });
      })
      .catch((e) => setError(e.message));
  };

  useEffect(() => loadBabies(), []);

  const loadGrowth = () => {
    if (!selected) return;
    api.get(`/babies/${selected.id}/growth`).then((r) => setGrowth(r.data.records));
  };

  useEffect(() => {
    if (!selected) { setGrowth([]); setVaccines([]); return; }
    api.get(`/babies/${selected.id}/growth`).then((r) => setGrowth(r.data.records));
    api.get(`/babies/${selected.id}/vaccinations`, { params: { lang } }).then((r) => setVaccines(r.data.vaccinations));
  }, [selected, lang]);

  const markVaccine = async (vaccine) => {
    await api.post(`/babies/${selected.id}/vaccinations`, { vaccine });
    const r = await api.get(`/babies/${selected.id}/vaccinations`, { params: { lang } });
    setVaccines(r.data.vaccinations);
  };

  if (error) return <ErrorBox message={error} onRetry={() => loadBabies()} />;
  if (!babies) return <Loader />;

  if (!babies.length) {
    return (
      <div>
        <AddBabyForm t={t} onAdded={(b) => loadBabies(b.id)} />
        <div className="card"><Empty /></div>
      </div>
    );
  }

  const chartData = growth.map((g) => ({
    date: g.date,
    weight: g.weight,
    height: g.height,
    head: g.headCircumference,
  }));

  return (
    <div>
      <AddBabyForm t={t} onAdded={(b) => loadBabies(b.id)} />

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
        {selected && <AddGrowthForm t={t} babyId={selected.id} onAdded={loadGrowth} />}
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
