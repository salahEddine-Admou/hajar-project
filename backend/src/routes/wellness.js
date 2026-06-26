import { Router } from 'express';
import { insert, find } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { EPDS_QUESTIONS, scoreEpds, WELLNESS_TIPS } from '../content/schedules.js';

const router = Router();
router.use(requireAuth);

// ---- Daily mood tracking ----
router.get('/mood', async (req, res) => {
  const logs = await find('moodLogs', { userId: req.userId }, { sort: { date: -1 }, limit: 365 });
  res.json({ moods: logs });
});

router.post('/mood', async (req, res) => {
  const { date, mood, stress, anxiety, energy, sleepHours, note } = req.body || {};
  if (mood === undefined) return res.status(400).json({ error: 'mood (1-5) is required' });
  const log = await insert('moodLogs', {
    userId: req.userId,
    date: date || new Date().toISOString().slice(0, 10),
    mood, stress, anxiety, energy, sleepHours, note,
  });
  res.status(201).json({ mood: log });
});

// ---- PPD screening (EPDS) ----
router.get('/screening/epds', (req, res) => {
  const lang = req.query.lang || 'en';
  const questions = EPDS_QUESTIONS.map((q) => ({
    id: q.id,
    text: q.text[lang] || q.text.en,
    reverse: q.reverse,
  }));
  res.json({ instrument: 'EPDS', maxScore: 30, questions });
});

router.post('/screening/epds', async (req, res) => {
  const { answers } = req.body || {};
  if (!Array.isArray(answers)) return res.status(400).json({ error: 'answers array is required' });
  const lang = req.query.lang || 'en';
  const result = scoreEpds(answers);
  const tips = (WELLNESS_TIPS[result.risk] && (WELLNESS_TIPS[result.risk][lang] || WELLNESS_TIPS[result.risk].en)) || [];
  const screening = await insert('screenings', {
    userId: req.userId, instrument: 'EPDS',
    score: result.total, risk: result.risk, flagSelfHarm: result.flagSelfHarm,
    date: new Date().toISOString().slice(0, 10),
  });
  res.status(201).json({ result, tips, screening });
});

router.get('/screening/history', async (req, res) => {
  const items = await find('screenings', { userId: req.userId }, { sort: { date: -1 } });
  res.json({ screenings: items });
});

// ---- Personalized recommendations from latest mood/screening ----
router.get('/recommendations', async (req, res) => {
  const lang = req.query.lang || 'en';
  const screenings = await find('screenings', { userId: req.userId }, { sort: { date: -1 }, limit: 1 });
  const latest = screenings[0];
  const risk = latest ? latest.risk : 'low';
  const tips = (WELLNESS_TIPS[risk] && (WELLNESS_TIPS[risk][lang] || WELLNESS_TIPS[risk].en)) || [];
  res.json({ risk, tips });
});

export default router;
