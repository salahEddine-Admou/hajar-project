import { Router } from 'express';
import { insert, find, findOne, update, remove } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

function ownStudent(req, studentId) {
  return findOne('students', (s) => s.id === studentId && s.userId === req.userId);
}

function pct(score, max) {
  const m = Number(max) || 0;
  if (!m) return 0;
  return Math.round((Number(score) / m) * 1000) / 10; // one decimal
}

// ---- Students (school profiles) ----
router.get('/students', async (req, res) => {
  const students = (await find('students', (s) => s.userId === req.userId))
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  res.json({ students });
});

router.post('/students', async (req, res) => {
  const { name, babyId, schoolName, grade, teacher, year, color } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const student = await insert('students', {
    userId: req.userId,
    name,
    babyId: babyId || null,
    schoolName: schoolName || '',
    grade: grade || '',
    teacher: teacher || '',
    year: year || '',
    color: color || '#7c5cbf',
  });
  res.status(201).json({ student });
});

router.patch('/students/:id', async (req, res) => {
  const student = await ownStudent(req, req.params.id);
  if (!student) return res.status(404).json({ error: 'Not found' });
  res.json({ student: await update('students', student.id, req.body || {}) });
});

router.delete('/students/:id', async (req, res) => {
  const student = await ownStudent(req, req.params.id);
  if (!student) return res.status(404).json({ error: 'Not found' });
  // Cascade delete related records.
  for (const coll of ['grades', 'assignments', 'attendance', 'timetable']) {
    const items = await find(coll, (x) => x.studentId === student.id);
    for (const it of items) await remove(coll, it.id);
  }
  await remove('students', student.id);
  res.json({ ok: true });
});

// ---- Grades ----
router.get('/grades', async (req, res) => {
  const student = await ownStudent(req, req.query.studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const grades = (await find('grades', (g) => g.studentId === student.id))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((g) => ({ ...g, percent: pct(g.score, g.max) }));
  res.json({ grades });
});

router.post('/grades', async (req, res) => {
  const { studentId, subject, score, max, term, date } = req.body || {};
  const student = await ownStudent(req, studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  if (subject === undefined || score === undefined) {
    return res.status(400).json({ error: 'subject and score are required' });
  }
  const grade = await insert('grades', {
    userId: req.userId,
    studentId: student.id,
    subject,
    score: Number(score),
    max: Number(max) || 20,
    term: term || '',
    date: date || new Date().toISOString(),
  });
  res.status(201).json({ grade: { ...grade, percent: pct(grade.score, grade.max) } });
});

router.delete('/grades/:id', async (req, res) => {
  const g = await findOne('grades', (x) => x.id === req.params.id && x.userId === req.userId);
  if (!g) return res.status(404).json({ error: 'Not found' });
  await remove('grades', g.id);
  res.json({ ok: true });
});

// ---- Assignments (homework + exams) ----
router.get('/assignments', async (req, res) => {
  const student = await ownStudent(req, req.query.studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const assignments = (await find('assignments', (a) => a.studentId === student.id))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  res.json({ assignments });
});

router.post('/assignments', async (req, res) => {
  const { studentId, title, subject, dueDate, type } = req.body || {};
  const student = await ownStudent(req, studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  if (!title) return res.status(400).json({ error: 'title is required' });
  const assignment = await insert('assignments', {
    userId: req.userId,
    studentId: student.id,
    title,
    subject: subject || '',
    dueDate: dueDate || null,
    type: type === 'exam' ? 'exam' : 'homework',
    done: false,
  });
  res.status(201).json({ assignment });
});

router.patch('/assignments/:id', async (req, res) => {
  const a = await findOne('assignments', (x) => x.id === req.params.id && x.userId === req.userId);
  if (!a) return res.status(404).json({ error: 'Not found' });
  res.json({ assignment: await update('assignments', a.id, req.body || {}) });
});

router.delete('/assignments/:id', async (req, res) => {
  const a = await findOne('assignments', (x) => x.id === req.params.id && x.userId === req.userId);
  if (!a) return res.status(404).json({ error: 'Not found' });
  await remove('assignments', a.id);
  res.json({ ok: true });
});

// ---- Attendance ----
router.get('/attendance', async (req, res) => {
  const student = await ownStudent(req, req.query.studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const records = (await find('attendance', (r) => r.studentId === student.id))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json({ attendance: records });
});

router.post('/attendance', async (req, res) => {
  const { studentId, date, status } = req.body || {};
  const student = await ownStudent(req, studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const allowed = ['present', 'absent', 'late'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'invalid status' });
  const record = await insert('attendance', {
    userId: req.userId,
    studentId: student.id,
    date: date || new Date().toISOString(),
    status,
  });
  res.status(201).json({ record });
});

router.delete('/attendance/:id', async (req, res) => {
  const r = await findOne('attendance', (x) => x.id === req.params.id && x.userId === req.userId);
  if (!r) return res.status(404).json({ error: 'Not found' });
  await remove('attendance', r.id);
  res.json({ ok: true });
});

// ---- Timetable (weekly schedule) ----
router.get('/timetable', async (req, res) => {
  const student = await ownStudent(req, req.query.studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const entries = (await find('timetable', (t) => t.studentId === student.id))
    .sort((a, b) => (a.day - b.day) || (a.startTime || '').localeCompare(b.startTime || ''));
  res.json({ timetable: entries });
});

router.post('/timetable', async (req, res) => {
  const { studentId, day, subject, startTime, endTime, room } = req.body || {};
  const student = await ownStudent(req, studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  if (day === undefined || !subject) return res.status(400).json({ error: 'day and subject are required' });
  const entry = await insert('timetable', {
    userId: req.userId,
    studentId: student.id,
    day: Number(day), // 0 = Monday … 6 = Sunday
    subject,
    startTime: startTime || '',
    endTime: endTime || '',
    room: room || '',
  });
  res.status(201).json({ entry });
});

router.delete('/timetable/:id', async (req, res) => {
  const t = await findOne('timetable', (x) => x.id === req.params.id && x.userId === req.userId);
  if (!t) return res.status(404).json({ error: 'Not found' });
  await remove('timetable', t.id);
  res.json({ ok: true });
});

// ---- Summary (dashboard for one student) ----
router.get('/students/:id/summary', async (req, res) => {
  const student = await ownStudent(req, req.params.id);
  if (!student) return res.status(404).json({ error: 'Not found' });

  const [grades, assignments, attendance] = await Promise.all([
    find('grades', (g) => g.studentId === student.id),
    find('assignments', (a) => a.studentId === student.id),
    find('attendance', (r) => r.studentId === student.id),
  ]);

  // Per-subject averages
  const bySubject = {};
  for (const g of grades) {
    const p = pct(g.score, g.max);
    (bySubject[g.subject] ||= []).push(p);
  }
  const subjects = Object.entries(bySubject).map(([subject, arr]) => ({
    subject,
    average: Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 10) / 10,
    count: arr.length,
  })).sort((a, b) => b.average - a.average);

  const overall = grades.length
    ? Math.round((grades.reduce((s, g) => s + pct(g.score, g.max), 0) / grades.length) * 10) / 10
    : null;

  // Grade trend over time (chronological percentages)
  const trend = grades
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((g) => ({ date: g.date, percent: pct(g.score, g.max), subject: g.subject }));

  // Attendance breakdown
  const att = { present: 0, absent: 0, late: 0 };
  for (const r of attendance) if (att[r.status] !== undefined) att[r.status]++;
  const attTotal = attendance.length;
  const attendanceRate = attTotal ? Math.round((att.present / attTotal) * 1000) / 10 : null;

  // Assignments
  const now = new Date();
  const pending = assignments.filter((a) => !a.done);
  const upcoming = pending
    .filter((a) => a.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const overdue = pending.filter((a) => a.dueDate && new Date(a.dueDate) < now);

  res.json({
    student,
    overall,
    subjects,
    trend,
    attendance: { ...att, total: attTotal, rate: attendanceRate },
    assignments: {
      total: assignments.length,
      pending: pending.length,
      overdue: overdue.length,
      next: upcoming[0] || null,
    },
  });
});

export default router;
