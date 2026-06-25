import { Router } from 'express';
import { insert, find, findOne, update, remove } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// ---- Appointments / medical checkups ----
router.get('/', async (req, res) => {
  const items = (await find('appointments', (a) => a.userId === req.userId))
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  res.json({ appointments: items });
});

router.post('/', async (req, res) => {
  const { title, datetime, location, doctor, type, notes } = req.body || {};
  if (!title || !datetime) return res.status(400).json({ error: 'title and datetime are required' });
  const appt = await insert('appointments', {
    userId: req.userId, title, datetime, location, doctor,
    type: type || 'checkup', notes, completed: false,
  });
  res.status(201).json({ appointment: appt });
});

router.patch('/:id', async (req, res) => {
  const a = await findOne('appointments', (x) => x.id === req.params.id && x.userId === req.userId);
  if (!a) return res.status(404).json({ error: 'Not found' });
  res.json({ appointment: await update('appointments', a.id, req.body || {}) });
});

router.delete('/:id', async (req, res) => {
  const a = await findOne('appointments', (x) => x.id === req.params.id && x.userId === req.userId);
  if (!a) return res.status(404).json({ error: 'Not found' });
  await remove('appointments', a.id);
  res.json({ ok: true });
});

export default router;
