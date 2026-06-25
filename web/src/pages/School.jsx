import { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { api } from '../api';
import { useI18n } from '../i18n';
import { Loader, ErrorBox, Empty, Stat } from '../components/ui';

const TABS = ['overview', 'grades', 'assignments', 'attendance', 'timetable'];
const ATT_COLORS = { present: '#8fd3c4', absent: '#f7a8b8', late: '#ffd8b0' };

export default function School() {
  const { t } = useI18n();
  const [students, setStudents] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('overview');
  const [showAdd, setShowAdd] = useState(false);

  const loadStudents = () => {
    setError(null);
    api.get('/school/students')
      .then((r) => {
        setStudents(r.data.students);
        setSelected((cur) => cur || r.data.students[0] || null);
      })
      .catch((e) => setError(e.message));
  };
  useEffect(loadStudents, []);

  if (error) return <ErrorBox message={error} onRetry={loadStudents} />;
  if (!students) return <Loader />;

  return (
    <div>
      <div className="topbar" style={{ marginBottom: '.6rem' }}>
        <div className="tabs" style={{ margin: 0 }}>
          {students.map((s) => (
            <button key={s.id} className={`tab ${selected?.id === s.id ? 'active' : ''}`} onClick={() => setSelected(s)}>
              🎒 {s.name}{s.grade ? ` • ${s.grade}` : ''}
            </button>
          ))}
          <button className="tab" onClick={() => setShowAdd((v) => !v)}>＋ {t('addStudent')}</button>
        </div>
      </div>

      {showAdd && <AddStudent onDone={() => { setShowAdd(false); loadStudents(); }} />}

      {!students.length && !showAdd && <Empty message={t('noStudents')} />}

      {selected && (
        <>
          <div className="tabs">
            {TABS.map((tb) => (
              <button key={tb} className={`tab ${tab === tb ? 'active' : ''}`} onClick={() => setTab(tb)}>
                {t(tb)}
              </button>
            ))}
          </div>
          {tab === 'overview' && <Overview student={selected} />}
          {tab === 'grades' && <Grades student={selected} />}
          {tab === 'assignments' && <Assignments student={selected} />}
          {tab === 'attendance' && <Attendance student={selected} />}
          {tab === 'timetable' && <Timetable student={selected} />}
        </>
      )}
    </div>
  );
}

function AddStudent({ onDone }) {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: '', schoolName: '', grade: '', teacher: '', year: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    await api.post('/school/students', form);
    onDone();
  };
  return (
    <form className="card" onSubmit={submit} style={{ marginBottom: '1rem' }}>
      <div className="grid cols-3">
        <div><label>{t('students')}</label><input value={form.name} onChange={set('name')} required /></div>
        <div><label>{t('schoolName')}</label><input value={form.schoolName} onChange={set('schoolName')} /></div>
        <div><label>{t('grade')}</label><input value={form.grade} onChange={set('grade')} /></div>
        <div><label>{t('teacher')}</label><input value={form.teacher} onChange={set('teacher')} /></div>
        <div><label>{t('year')}</label><input value={form.year} onChange={set('year')} placeholder="2025/2026" /></div>
      </div>
      <button className="btn btn-sm" type="submit">{t('save')}</button>
    </form>
  );
}

function Overview({ student }) {
  const { t, lang } = useI18n();
  const [data, setData] = useState(null);
  useEffect(() => { api.get(`/school/students/${student.id}/summary`).then((r) => setData(r.data)); }, [student]);
  if (!data) return <Loader />;

  const subjectData = data.subjects.map((s) => ({ name: s.subject, avg: s.average }));
  const trendData = data.trend.map((g, i) => ({ name: `${i + 1}`, percent: g.percent }));
  const attData = ['present', 'absent', 'late']
    .map((k) => ({ name: t(k), key: k, value: data.attendance[k] }))
    .filter((d) => d.value > 0);

  return (
    <div>
      <div className="grid cols-4">
        <Stat icon="📊" value={data.overall != null ? `${data.overall}%` : '—'} label={t('overall')} color="#7c5cbf" />
        <Stat icon="✅" value={data.attendance.rate != null ? `${data.attendance.rate}%` : '—'} label={t('attendanceRate')} color="#8fd3c4" />
        <Stat icon="📝" value={data.assignments.pending} label={t('pending')} color="#ffb085" />
        <Stat icon="⚠️" value={data.assignments.overdue} label={t('overdue')} color="#f7a8b8" />
      </div>

      <div className="grid cols-2" style={{ marginTop: '1.2rem' }}>
        <div className="card">
          <h3>{t('subjectAverages')}</h3>
          {subjectData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={subjectData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="avg" radius={[0, 8, 8, 0]} fill="#7c5cbf" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <h3>{t('gradeTrend')}</h3>
          {trendData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="percent" stroke="#8fd3c4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid cols-2" style={{ marginTop: '1.2rem' }}>
        <div className="card">
          <h3>{t('attendance')}</h3>
          {attData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={attData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={3}>
                  {attData.map((d) => <Cell key={d.key} fill={ATT_COLORS[d.key]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <h3>{t('nextDue')}</h3>
          {data.assignments.next ? (
            <div className="list-item">
              <span>{data.assignments.next.type === 'exam' ? '📚' : '📝'}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{data.assignments.next.title}</div>
                <div className="muted" style={{ fontSize: '.8rem' }}>{data.assignments.next.subject}</div>
              </div>
              <div className="right muted" style={{ fontSize: '.8rem' }}>
                {data.assignments.next.dueDate ? new Date(data.assignments.next.dueDate).toLocaleDateString(lang) : ''}
              </div>
            </div>
          ) : <Empty />}
        </div>
      </div>
    </div>
  );
}

function Grades({ student }) {
  const { t } = useI18n();
  const [grades, setGrades] = useState([]);
  const [form, setForm] = useState({ subject: '', score: '', max: '20', term: '' });
  const load = () => api.get('/school/grades', { params: { studentId: student.id } }).then((r) => setGrades(r.data.grades));
  useEffect(() => { load(); }, [student]);
  const submit = async (e) => {
    e.preventDefault();
    if (!form.subject || form.score === '') return;
    await api.post('/school/grades', { studentId: student.id, ...form });
    setForm({ subject: '', score: '', max: form.max, term: form.term });
    load();
  };
  const del = async (id) => { await api.delete(`/school/grades/${id}`); load(); };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="card">
      <form onSubmit={submit} className="grid cols-4" style={{ alignItems: 'end' }}>
        <div><label>{t('subject')}</label><input value={form.subject} onChange={set('subject')} required /></div>
        <div><label>{t('score')}</label><input type="number" step="0.1" value={form.score} onChange={set('score')} required /></div>
        <div><label>{t('max')}</label><input type="number" value={form.max} onChange={set('max')} /></div>
        <div><button className="btn btn-sm" type="submit">{t('addGrade')}</button></div>
      </form>
      <div className="section-title">{t('grades')}</div>
      {grades.length === 0 && <Empty />}
      {grades.map((g) => (
        <div className="list-item" key={g.id}>
          <span className="badge">{g.percent}%</span>
          <div>
            <div style={{ fontWeight: 600 }}>{g.subject}</div>
            <div className="muted" style={{ fontSize: '.8rem' }}>{g.score} / {g.max}{g.term ? ` • ${g.term}` : ''}</div>
          </div>
          <button className="chip right" onClick={() => del(g.id)}>{t('delete')}</button>
        </div>
      ))}
    </div>
  );
}

function Assignments({ student }) {
  const { t, lang } = useI18n();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', subject: '', dueDate: '', type: 'homework' });
  const load = () => api.get('/school/assignments', { params: { studentId: student.id } }).then((r) => setItems(r.data.assignments));
  useEffect(() => { load(); }, [student]);
  const submit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    await api.post('/school/assignments', { studentId: student.id, ...form });
    setForm({ title: '', subject: '', dueDate: '', type: form.type });
    load();
  };
  const toggle = async (a) => { await api.patch(`/school/assignments/${a.id}`, { done: !a.done }); load(); };
  const del = async (id) => { await api.delete(`/school/assignments/${id}`); load(); };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="card">
      <form onSubmit={submit} className="grid cols-4" style={{ alignItems: 'end' }}>
        <div><label>{t('title')}</label><input value={form.title} onChange={set('title')} required /></div>
        <div><label>{t('subject')}</label><input value={form.subject} onChange={set('subject')} /></div>
        <div><label>{t('dueDate')}</label><input type="date" value={form.dueDate} onChange={set('dueDate')} /></div>
        <div>
          <label>&nbsp;</label>
          <select value={form.type} onChange={set('type')}>
            <option value="homework">{t('homework')}</option>
            <option value="exam">{t('exam')}</option>
          </select>
        </div>
        <div><button className="btn btn-sm" type="submit">{t('addAssignment')}</button></div>
      </form>
      <div className="section-title">{t('assignments')}</div>
      {items.length === 0 && <Empty />}
      {items.map((a) => {
        const overdue = !a.done && a.dueDate && new Date(a.dueDate) < new Date();
        return (
          <div className="list-item" key={a.id}>
            <input type="checkbox" checked={a.done} onChange={() => toggle(a)} style={{ width: 'auto' }} />
            <span>{a.type === 'exam' ? '📚' : '✏️'}</span>
            <div>
              <div style={{ fontWeight: 600, textDecoration: a.done ? 'line-through' : 'none', opacity: a.done ? .5 : 1 }}>{a.title}</div>
              <div className="muted" style={{ fontSize: '.8rem' }}>{a.subject}</div>
            </div>
            <div className="right" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              {a.dueDate && <span className={`badge ${overdue ? 'warn' : ''}`}>{new Date(a.dueDate).toLocaleDateString(lang)}</span>}
              <button className="chip" onClick={() => del(a.id)}>{t('delete')}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Attendance({ student }) {
  const { t, lang } = useI18n();
  const [records, setRecords] = useState([]);
  const load = () => api.get('/school/attendance', { params: { studentId: student.id } }).then((r) => setRecords(r.data.attendance));
  useEffect(() => { load(); }, [student]);
  const mark = async (status) => {
    await api.post('/school/attendance', { studentId: student.id, status, date: new Date().toISOString() });
    load();
  };
  const del = async (id) => { await api.delete(`/school/attendance/${id}`); load(); };

  return (
    <div className="card">
      <h3>{t('markAttendance')}</h3>
      <div className="lang-row" style={{ justifyContent: 'flex-start' }}>
        <button className="chip" onClick={() => mark('present')}>🟢 {t('present')}</button>
        <button className="chip" onClick={() => mark('late')}>🟡 {t('late')}</button>
        <button className="chip" onClick={() => mark('absent')}>🔴 {t('absent')}</button>
      </div>
      <div className="section-title">{t('history')}</div>
      {records.length === 0 && <Empty />}
      {records.map((r) => (
        <div className="list-item" key={r.id}>
          <span>{r.status === 'present' ? '🟢' : r.status === 'late' ? '🟡' : '🔴'}</span>
          <div style={{ fontWeight: 600 }}>{t(r.status)}</div>
          <div className="right muted" style={{ fontSize: '.8rem', display: 'flex', gap: '.5rem' }}>
            {new Date(r.date).toLocaleDateString(lang)}
            <button className="chip" onClick={() => del(r.id)}>{t('delete')}</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Timetable({ student }) {
  const { t } = useI18n();
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ day: '0', subject: '', startTime: '', endTime: '', room: '' });
  const load = () => api.get('/school/timetable', { params: { studentId: student.id } }).then((r) => setEntries(r.data.timetable));
  useEffect(() => { load(); }, [student]);
  const submit = async (e) => {
    e.preventDefault();
    if (!form.subject) return;
    await api.post('/school/timetable', { studentId: student.id, ...form });
    setForm({ day: form.day, subject: '', startTime: '', endTime: '', room: '' });
    load();
  };
  const del = async (id) => { await api.delete(`/school/timetable/${id}`); load(); };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const days = t('days');

  return (
    <div className="card">
      <form onSubmit={submit} className="grid cols-4" style={{ alignItems: 'end' }}>
        <div>
          <label>{t('day')}</label>
          <select value={form.day} onChange={set('day')}>
            {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
          </select>
        </div>
        <div><label>{t('subject')}</label><input value={form.subject} onChange={set('subject')} required /></div>
        <div><label>{t('startTime')}</label><input type="time" value={form.startTime} onChange={set('startTime')} /></div>
        <div><label>{t('endTime')}</label><input type="time" value={form.endTime} onChange={set('endTime')} /></div>
        <div><label>{t('room')}</label><input value={form.room} onChange={set('room')} /></div>
        <div><button className="btn btn-sm" type="submit">{t('addClass')}</button></div>
      </form>
      <div className="section-title">{t('weekly')}</div>
      <div className="grid cols-3">
        {days.map((d, i) => {
          const dayEntries = entries.filter((e) => e.day === i);
          if (dayEntries.length === 0) return null;
          return (
            <div className="card" key={i} style={{ background: 'var(--surface)' }}>
              <div style={{ fontWeight: 700, marginBottom: '.4rem' }}>{d}</div>
              {dayEntries.map((e) => (
                <div className="list-item" key={e.id}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{e.subject}</div>
                    <div className="muted" style={{ fontSize: '.78rem' }}>
                      {[[e.startTime, e.endTime].filter(Boolean).join('–'), e.room].filter(Boolean).join(' • ')}
                    </div>
                  </div>
                  <button className="chip right" onClick={() => del(e.id)}>✕</button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {entries.length === 0 && <Empty />}
    </div>
  );
}
