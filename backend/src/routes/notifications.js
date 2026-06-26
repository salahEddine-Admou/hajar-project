import { Router } from 'express';
import { find, findOne } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { VACCINE_SCHEDULE, PREGNANCY_MILESTONES } from '../content/schedules.js';

const router = Router();
router.use(requireAuth);

const DAY = 24 * 60 * 60 * 1000;

/**
 * Aggregates upcoming reminders across domains:
 *  - future appointments
 *  - active medications
 *  - vaccinations due/overdue per baby (next 60 days)
 *  - next pregnancy milestone
 */
router.get('/upcoming', async (req, res) => {
  const lang = req.query.lang || 'en';
  const horizonDays = Number(req.query.days) || 60;
  const now = Date.now();
  const items = [];

  const appts = await find('appointments', { userId: req.userId, completed: { $ne: true } });
  for (const a of appts) {
    const t = new Date(a.datetime).getTime();
    if (t >= now - DAY) {
      items.push({
        type: 'appointment',
        title: a.title,
        subtitle: a.doctor || a.location || '',
        date: a.datetime,
        overdue: false,
      });
    }
  }

  const meds = await find('medications', { userId: req.userId, active: { $ne: false } });
  for (const m of meds) {
    items.push({
      type: 'medication',
      title: m.name,
      subtitle: [m.dosage, m.frequency].filter(Boolean).join(' • '),
      date: m.startDate || new Date(now).toISOString(),
      overdue: false,
    });
  }

  const babies = await find('babies', { userId: req.userId });
  for (const baby of babies) {
    if (!baby.birthDate) continue;
    const given = await find('vaccinations', { babyId: baby.id });
    for (const s of VACCINE_SCHEDULE) {
      if (given.find((g) => g.vaccine === s.vaccine)) continue;
      const due = new Date(baby.birthDate).getTime() + s.ageMonths * 30 * DAY;
      const diffDays = (due - now) / DAY;
      if (diffDays <= horizonDays) {
        items.push({
          type: 'vaccination',
          title: `${s.vaccine} — ${baby.name}`,
          subtitle: s.protectsAgainst[lang] || s.protectsAgainst.en,
          date: new Date(due).toISOString(),
          overdue: diffDays < 0,
        });
      }
    }
  }

  const preg = await findOne('pregnancies', { userId: req.userId, active: true });
  if (preg && preg.lmp) {
    const lmp = new Date(preg.lmp).getTime();
    const currentWeek = Math.floor((now - lmp) / (7 * DAY)) + 1;
    const next = PREGNANCY_MILESTONES.find((m) => m.week >= currentWeek);
    if (next) {
      items.push({
        type: 'milestone',
        title: next.title[lang] || next.title.en,
        subtitle: `${lang === 'fr' ? 'Semaine' : lang === 'ar' ? 'الأسبوع' : 'Week'} ${next.week}`,
        date: new Date(lmp + next.week * 7 * DAY).toISOString(),
        overdue: false,
      });
    }
  }

  // School: pending homework & exams with a due date
  const assignments = (await find(
    'assignments',
    { userId: req.userId, done: { $ne: true } },
  )).filter((a) => a.dueDate);
  if (assignments.length) {
    const students = await find('students', { userId: req.userId });
    const nameOf = (id) => students.find((s) => s.id === id)?.name || '';
    for (const a of assignments) {
      const due = new Date(a.dueDate).getTime();
      const diffDays = (due - now) / DAY;
      if (diffDays <= horizonDays) {
        items.push({
          type: a.type === 'exam' ? 'exam' : 'homework',
          title: a.title,
          subtitle: [nameOf(a.studentId), a.subject].filter(Boolean).join(' • '),
          date: a.dueDate,
          overdue: diffDays < 0,
        });
      }
    }
  }

  items.sort((a, b) => new Date(a.date) - new Date(b.date));
  res.json({ notifications: items, count: items.length });
});

export default router;
