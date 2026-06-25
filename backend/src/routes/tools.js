import { Router } from 'express';
import { insert, find, findOne, remove } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { dailyTip } from '../content/tips.js';

const router = Router();
router.use(requireAuth);

// ---- Daily tip (educational) ----
router.get('/tips/daily', (req, res) => {
  const lang = req.query.lang || 'ar';
  const context = req.query.context === 'baby' ? 'baby' : 'pregnancy';
  res.json({ context, tip: dailyTip(context, lang) });
});

// ---- Kick counter (fetal movement) ----
router.get('/kicks', async (req, res) => {
  const sessions = (await find('kickSessions', (k) => k.userId === req.userId))
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  res.json({ sessions });
});

router.post('/kicks', async (req, res) => {
  const { count, durationSec, startedAt } = req.body || {};
  if (count === undefined) return res.status(400).json({ error: 'count is required' });
  const session = await insert('kickSessions', {
    userId: req.userId,
    count: Number(count),
    durationSec: Number(durationSec) || 0,
    startedAt: startedAt || new Date().toISOString(),
  });
  res.status(201).json({ session });
});

router.delete('/kicks/:id', async (req, res) => {
  const k = await findOne('kickSessions', (x) => x.id === req.params.id && x.userId === req.userId);
  if (!k) return res.status(404).json({ error: 'Not found' });
  await remove('kickSessions', k.id);
  res.json({ ok: true });
});

// ---- Contraction timer ----
router.get('/contractions', async (req, res) => {
  const items = (await find('contractions', (c) => c.userId === req.userId))
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  res.json({ contractions: items });
});

router.post('/contractions', async (req, res) => {
  const { startedAt, durationSec, intervalSec } = req.body || {};
  if (durationSec === undefined) return res.status(400).json({ error: 'durationSec is required' });
  const c = await insert('contractions', {
    userId: req.userId,
    startedAt: startedAt || new Date().toISOString(),
    durationSec: Number(durationSec),
    intervalSec: intervalSec !== undefined ? Number(intervalSec) : null,
  });
  res.status(201).json({ contraction: c });
});

router.delete('/contractions/:id', async (req, res) => {
  const c = await findOne('contractions', (x) => x.id === req.params.id && x.userId === req.userId);
  if (!c) return res.status(404).json({ error: 'Not found' });
  await remove('contractions', c.id);
  res.json({ ok: true });
});

export default router;
