import { Router } from 'express';
import { insert, find, findOne, update, remove } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { weekInfo, allWeeks } from '../content/pregnancyWeeks.js';
import { PREGNANCY_MILESTONES } from '../content/schedules.js';

const router = Router();
router.use(requireAuth);

const DAY = 24 * 60 * 60 * 1000;

function computeProgress(pregnancy) {
  // Due date = LMP + 280 days. If only dueDate is known, derive LMP.
  let lmp;
  let dueDate;
  if (pregnancy.lmp) {
    lmp = new Date(pregnancy.lmp);
    dueDate = new Date(lmp.getTime() + 280 * DAY);
  } else if (pregnancy.dueDate) {
    dueDate = new Date(pregnancy.dueDate);
    lmp = new Date(dueDate.getTime() - 280 * DAY);
  } else {
    return null;
  }
  const today = new Date();
  const daysPregnant = Math.floor((today - lmp) / DAY);
  const week = Math.max(1, Math.floor(daysPregnant / 7) + 1);
  const dayOfWeek = ((daysPregnant % 7) + 7) % 7;
  const daysRemaining = Math.ceil((dueDate - today) / DAY);
  return {
    lmp: lmp.toISOString().slice(0, 10),
    dueDate: dueDate.toISOString().slice(0, 10),
    currentWeek: Math.min(week, 42),
    dayOfWeek,
    daysRemaining,
    trimester: week <= 13 ? 1 : week <= 27 ? 2 : 3,
    progressPercent: Math.min(100, Math.round((daysPregnant / 280) * 100)),
  };
}

// Create or replace the active pregnancy
router.post('/', async (req, res) => {
  const { lmp, dueDate } = req.body || {};
  if (!lmp && !dueDate) return res.status(400).json({ error: 'Provide lmp or dueDate' });
  // deactivate previous
  for (const p of await find('pregnancies', (p) => p.userId === req.userId && p.active)) {
    await update('pregnancies', p.id, { active: false });
  }
  const pregnancy = await insert('pregnancies', { userId: req.userId, lmp, dueDate, active: true });
  res.status(201).json({ pregnancy, progress: computeProgress(pregnancy) });
});

// Active pregnancy + computed progress + this week's content
router.get('/active', async (req, res) => {
  const lang = req.query.lang || 'en';
  const pregnancy = await findOne('pregnancies', (p) => p.userId === req.userId && p.active);
  if (!pregnancy) return res.json({ pregnancy: null });
  const progress = computeProgress(pregnancy);
  res.json({
    pregnancy,
    progress,
    week: progress ? weekInfo(progress.currentWeek, lang) : null,
  });
});

router.patch('/:id', async (req, res) => {
  const p = await findOne('pregnancies', (x) => x.id === req.params.id && x.userId === req.userId);
  if (!p) return res.status(404).json({ error: 'Not found' });
  const { lmp, dueDate, active } = req.body || {};
  const updated = await update('pregnancies', p.id, {
    ...(lmp !== undefined ? { lmp } : {}),
    ...(dueDate !== undefined ? { dueDate } : {}),
    ...(active !== undefined ? { active } : {}),
  });
  res.json({ pregnancy: updated, progress: computeProgress(updated) });
});

// Weekly development content
router.get('/weeks', (req, res) => {
  res.json({ weeks: allWeeks(req.query.lang || 'en') });
});

router.get('/weeks/:week', (req, res) => {
  res.json(weekInfo(Number(req.params.week), req.query.lang || 'en'));
});

// Milestones localized + relative dates if a pregnancy exists
router.get('/milestones', async (req, res) => {
  const lang = req.query.lang || 'en';
  const pregnancy = await findOne('pregnancies', (p) => p.userId === req.userId && p.active);
  const progress = pregnancy ? computeProgress(pregnancy) : null;
  const lmp = progress ? new Date(progress.lmp) : null;
  const milestones = PREGNANCY_MILESTONES.map((m) => ({
    week: m.week,
    title: m.title[lang] || m.title.en,
    date: lmp ? new Date(lmp.getTime() + m.week * 7 * DAY).toISOString().slice(0, 10) : null,
    done: progress ? progress.currentWeek >= m.week : false,
  }));
  res.json({ milestones });
});

router.delete('/:id', async (req, res) => {
  const p = await findOne('pregnancies', (x) => x.id === req.params.id && x.userId === req.userId);
  if (!p) return res.status(404).json({ error: 'Not found' });
  await remove('pregnancies', p.id);
  res.json({ ok: true });
});

export default router;
