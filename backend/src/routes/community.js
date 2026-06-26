import { Router } from 'express';
import { insert, find, findOne, update, remove } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

export const COMMUNITY_GROUPS = [
  'pregnancy', 'newborn', 'breastfeeding', 'sleep', 'mental-health', 'nutrition', 'expert-qa',
];

/** Build a { userId -> name } map for the given user ids. */
async function nameMap(userIds) {
  const ids = [...new Set(userIds)];
  const users = await find('users', { id: { $in: ids } });
  return users.reduce((acc, u) => ({ ...acc, [u.id]: u.name }), {});
}

router.get('/groups', (req, res) => res.json({ groups: COMMUNITY_GROUPS }));

// List posts (optionally by group), newest first, with reply counts
router.get('/posts', async (req, res) => {
  const { group } = req.query;
  const posts = (await find('communityPosts', group ? { group } : {}, { sort: { createdAt: -1 }, limit: 200 }));
  const replies = await find('communityReplies', {});
  const names = await nameMap(posts.map((p) => p.userId));
  const withMeta = posts.map((p) => ({
    ...p,
    authorName: names[p.userId] || 'Member',
    replyCount: replies.filter((r) => r.postId === p.id).length,
    isMine: p.userId === req.userId,
  }));
  res.json({ posts: withMeta });
});

router.post('/posts', async (req, res) => {
  const { group, title, body, expert } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: 'title and body are required' });
  const post = await insert('communityPosts', {
    userId: req.userId, group: group || 'pregnancy', title, body,
    expert: !!expert, likes: 0,
  });
  const me = await findOne('users', { id: req.userId });
  res.status(201).json({ post: { ...post, authorName: me ? me.name : 'Member', replyCount: 0, isMine: true } });
});

router.get('/posts/:id', async (req, res) => {
  const post = await findOne('communityPosts', { id: req.params.id });
  if (!post) return res.status(404).json({ error: 'Not found' });
  const replies = await find('communityReplies', { postId: post.id }, { sort: { createdAt: 1 } });
  const names = await nameMap([post.userId, ...replies.map((r) => r.userId)]);
  res.json({
    post: { ...post, authorName: names[post.userId] || 'Member', isMine: post.userId === req.userId },
    replies: replies.map((r) => ({ ...r, authorName: names[r.userId] || 'Member', isMine: r.userId === req.userId })),
  });
});

router.post('/posts/:id/like', async (req, res) => {
  const post = await findOne('communityPosts', { id: req.params.id });
  if (!post) return res.status(404).json({ error: 'Not found' });
  res.json({ post: await update('communityPosts', post.id, { likes: (post.likes || 0) + 1 }) });
});

router.post('/posts/:id/replies', async (req, res) => {
  const post = await findOne('communityPosts', { id: req.params.id });
  if (!post) return res.status(404).json({ error: 'Not found' });
  const { body } = req.body || {};
  if (!body) return res.status(400).json({ error: 'body is required' });
  const reply = await insert('communityReplies', { postId: post.id, userId: req.userId, body });
  const me = await findOne('users', { id: req.userId });
  res.status(201).json({ reply: { ...reply, authorName: me ? me.name : 'Member', isMine: true } });
});

router.delete('/posts/:id', async (req, res) => {
  const post = await findOne('communityPosts', { id: req.params.id, userId: req.userId });
  if (!post) return res.status(404).json({ error: 'Not found' });
  for (const r of await find('communityReplies', { postId: post.id })) await remove('communityReplies', r.id);
  await remove('communityPosts', post.id);
  res.json({ ok: true });
});

export default router;
