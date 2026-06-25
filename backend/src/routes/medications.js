import { Router } from 'express';
import { insert, find, findOne, update, remove } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// Medication & healthcare reminders (works for mother postpartum and baby)
router.get('/', async (req, res) => {
  const items = await find('medications', (m) => m.userId === req.userId);
  res.json({ medications: items });
});

router.post('/', async (req, res) => {
  const { name, dosage, frequency, times, startDate, endDate, forWhom, notes } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const med = await insert('medications', {
    userId: req.userId, name, dosage, frequency: frequency || 'daily',
    times: times || [], startDate, endDate, forWhom: forWhom || 'mother',
    notes, active: true,
  });
  res.status(201).json({ medication: med });
});

router.patch('/:id', async (req, res) => {
  const m = await findOne('medications', (x) => x.id === req.params.id && x.userId === req.userId);
  if (!m) return res.status(404).json({ error: 'Not found' });
  res.json({ medication: await update('medications', m.id, req.body || {}) });
});

router.delete('/:id', async (req, res) => {
  const m = await findOne('medications', (x) => x.id === req.params.id && x.userId === req.userId);
  if (!m) return res.status(404).json({ error: 'Not found' });
  await remove('medications', m.id);
  res.json({ ok: true });
});

export default router;
