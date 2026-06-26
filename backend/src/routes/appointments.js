import { Router } from 'express';
import { insert, find, findOne, update, remove } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// ---- Appointments / medical checkups ----
router.get('/', async (req, res) => {
  const items = (await find('appointments', { userId: req.userId }))
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
  const a = await findOne('appointments', { id: req.params.id, userId: req.userId });
  if (!a) return res.status(404).json({ error: 'Not found' });
  const { title, datetime, location, doctor, type, notes, completed } = req.body || {};
  const patch = {};
  for (const [k, v] of Object.entries({ title, datetime, location, doctor, type, notes, completed })) {
    if (v !== undefined) patch[k] = v;
  }
  res.json({ appointment: await update('appointments', a.id, patch) });
});

router.delete('/:id', async (req, res) => {
  const a = await findOne('appointments', { id: req.params.id, userId: req.userId });
  if (!a) return res.status(404).json({ error: 'Not found' });
  await remove('appointments', a.id);
  res.json({ ok: true });
});

export default router;
