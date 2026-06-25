import { Router } from 'express';
import { find } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// Lightweight engagement dashboard data.
// NOTE: In production restrict this to admin roles.
router.get('/overview', async (req, res) => {
  const since = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const [users, pregnancies, babies, appointments, moodLogs, screenings, communityPosts, chatMessages] =
    await Promise.all([
      find('users', () => true),
      find('pregnancies', () => true),
      find('babies', () => true),
      find('appointments', () => true),
      find('moodLogs', () => true),
      find('screenings', () => true),
      find('communityPosts', () => true),
      find('chatMessages', () => true),
    ]);

  const countSince = (rows, field = 'createdAt') =>
    rows.filter((r) => new Date(r[field] || r.createdAt).getTime() >= since).length;

  res.json({
    totals: {
      users: users.length,
      pregnancies: pregnancies.length,
      babies: babies.length,
      appointments: appointments.length,
      moodLogs: moodLogs.length,
      screenings: screenings.length,
      communityPosts: communityPosts.length,
      chatMessages: chatMessages.length,
    },
    last7Days: {
      newUsers: countSince(users),
      moodLogs: countSince(moodLogs),
      chatMessages: countSince(chatMessages),
      communityPosts: countSince(communityPosts),
    },
    locales: users.reduce((acc, u) => {
      acc[u.locale || 'en'] = (acc[u.locale || 'en'] || 0) + 1;
      return acc;
    }, {}),
  });
});

export default router;
