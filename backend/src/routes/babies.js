import { Router } from 'express';
import { insert, find, findOne, update, remove } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { VACCINE_SCHEDULE } from '../content/schedules.js';

const router = Router();
router.use(requireAuth);

const DAY = 24 * 60 * 60 * 1000;

function ownBaby(req, babyId) {
  return findOne('babies', { id: babyId, userId: req.userId });
}

function ageInMonths(birthDate) {
  const b = new Date(birthDate);
  const now = new Date();
  return (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
}

// ---- Baby profiles (with birth details) ----
router.get('/', async (req, res) => {
  const babies = (await find('babies', { userId: req.userId })).map((b) => ({
    ...b,
    ageMonths: b.birthDate ? ageInMonths(b.birthDate) : null,
  }));
  res.json({ babies });
});

router.post('/', async (req, res) => {
  const { name, birthDate, sex, birthWeight, birthHeight, headCircumference, deliveryType, notes } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const baby = await insert('babies', {
    userId: req.userId, name, birthDate, sex,
    birthWeight, birthHeight, headCircumference,
    deliveryType: deliveryType || 'vaginal', notes,
  });
  res.status(201).json({ baby });
});

router.patch('/:id', async (req, res) => {
  const baby = await ownBaby(req, req.params.id);
  if (!baby) return res.status(404).json({ error: 'Not found' });
  const { name, birthDate, sex, birthWeight, birthHeight, headCircumference, deliveryType, notes } = req.body || {};
  const patch = {};
  for (const [k, v] of Object.entries({ name, birthDate, sex, birthWeight, birthHeight, headCircumference, deliveryType, notes })) {
    if (v !== undefined) patch[k] = v;
  }
  res.json({ baby: await update('babies', baby.id, patch) });
});

router.delete('/:id', async (req, res) => {
  const baby = await ownBaby(req, req.params.id);
  if (!baby) return res.status(404).json({ error: 'Not found' });
  await remove('babies', baby.id);
  res.json({ ok: true });
});

// ---- Growth records (weight / height / head circumference) ----
router.get('/:id/growth', async (req, res) => {
  const baby = await ownBaby(req, req.params.id);
  if (!baby) return res.status(404).json({ error: 'Not found' });
  const records = (await find('growthRecords', { babyId: baby.id }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  res.json({ records });
});

router.post('/:id/growth', async (req, res) => {
  const baby = await ownBaby(req, req.params.id);
  if (!baby) return res.status(404).json({ error: 'Not found' });
  const { date, weight, height, headCircumference } = req.body || {};
  const record = await insert('growthRecords', {
    babyId: baby.id, date: date || new Date().toISOString().slice(0, 10),
    weight, height, headCircumference,
  });
  res.status(201).json({ record });
});

router.delete('/:id/growth/:recordId', async (req, res) => {
  const baby = await ownBaby(req, req.params.id);
  if (!baby) return res.status(404).json({ error: 'Not found' });
  const rec = await findOne('growthRecords', { id: req.params.recordId, babyId: baby.id });
  if (!rec) return res.status(404).json({ error: 'Not found' });
  await remove('growthRecords', rec.id);
  res.json({ ok: true });
});

// ---- Vaccinations: merge standard schedule with recorded status ----
router.get('/:id/vaccinations', async (req, res) => {
  const baby = await ownBaby(req, req.params.id);
  if (!baby) return res.status(404).json({ error: 'Not found' });
  const lang = req.query.lang || 'en';
  const given = await find('vaccinations', { babyId: baby.id });
  const schedule = VACCINE_SCHEDULE.map((s) => {
    const record = given.find((g) => g.vaccine === s.vaccine);
    const dueDate = baby.birthDate
      ? new Date(new Date(baby.birthDate).getTime() + s.ageMonths * 30 * DAY).toISOString().slice(0, 10)
      : null;
    return {
      vaccine: s.vaccine,
      ageMonths: s.ageMonths,
      protectsAgainst: s.protectsAgainst[lang] || s.protectsAgainst.en,
      dueDate,
      given: !!record,
      givenDate: record ? record.givenDate : null,
      recordId: record ? record.id : null,
    };
  });
  res.json({ vaccinations: schedule });
});

router.post('/:id/vaccinations', async (req, res) => {
  const baby = await ownBaby(req, req.params.id);
  if (!baby) return res.status(404).json({ error: 'Not found' });
  const { vaccine, givenDate } = req.body || {};
  if (!vaccine) return res.status(400).json({ error: 'vaccine is required' });
  const existing = await findOne('vaccinations', { babyId: baby.id, vaccine });
  if (existing) {
    return res.json({ vaccination: await update('vaccinations', existing.id, { givenDate: givenDate || new Date().toISOString().slice(0, 10) }) });
  }
  const rec = await insert('vaccinations', { babyId: baby.id, vaccine, givenDate: givenDate || new Date().toISOString().slice(0, 10) });
  res.status(201).json({ vaccination: rec });
});

router.delete('/:id/vaccinations/:recordId', async (req, res) => {
  const baby = await ownBaby(req, req.params.id);
  if (!baby) return res.status(404).json({ error: 'Not found' });
  const rec = await findOne('vaccinations', { id: req.params.recordId, babyId: baby.id });
  if (!rec) return res.status(404).json({ error: 'Not found' });
  await remove('vaccinations', rec.id);
  res.json({ ok: true });
});

// ---- Tracking logs: feeding / sleep / diaper ----
router.get('/:id/logs', async (req, res) => {
  const baby = await ownBaby(req, req.params.id);
  if (!baby) return res.status(404).json({ error: 'Not found' });
  const { type } = req.query;
  const filter = { babyId: baby.id };
  if (type) filter.type = type;
  const logs = (await find('trackingLogs', filter))
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  res.json({ logs });
});

router.post('/:id/logs', async (req, res) => {
  const baby = await ownBaby(req, req.params.id);
  if (!baby) return res.status(404).json({ error: 'Not found' });
  const { type, startTime, endTime, subtype, amount, unit, notes } = req.body || {};
  if (!type) return res.status(400).json({ error: 'type is required (feeding|sleep|diaper)' });
  const log = await insert('trackingLogs', {
    babyId: baby.id, type, startTime: startTime || new Date().toISOString(),
    endTime, subtype, amount, unit, notes,
  });
  res.status(201).json({ log });
});

router.delete('/:id/logs/:logId', async (req, res) => {
  const baby = await ownBaby(req, req.params.id);
  if (!baby) return res.status(404).json({ error: 'Not found' });
  const log = await findOne('trackingLogs', { id: req.params.logId, babyId: baby.id });
  if (!log) return res.status(404).json({ error: 'Not found' });
  await remove('trackingLogs', log.id);
  res.json({ ok: true });
});

export default router;
