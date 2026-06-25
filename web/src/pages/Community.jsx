import { useEffect, useState } from 'react';
import { api } from '../api';
import { useI18n } from '../i18n';
import { Loader, ErrorBox } from '../components/ui';

const GROUPS = ['pregnancy', 'newborn', 'breastfeeding', 'sleep', 'mental-health', 'nutrition', 'expert-qa'];

export default function Community() {
  const { t } = useI18n();
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);
  const [group, setGroup] = useState(null);
  const [open, setOpen] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [reply, setReply] = useState('');

  const load = () => {
    setError(null);
    api.get('/community/posts', { params: group ? { group } : {} })
      .then((r) => setPosts(r.data.posts))
      .catch((e) => setError(e.message));
  };

  useEffect(load, [group]);

  const create = async () => {
    if (!title.trim() || !body.trim()) return;
    await api.post('/community/posts', { title, body, group: group || 'pregnancy' });
    setTitle('');
    setBody('');
    load();
  };

  const openPost = async (id) => {
    const r = await api.get(`/community/posts/${id}`);
    setOpen(r.data);
  };

  const like = async (id) => {
    await api.post(`/community/posts/${id}/like`);
    openPost(id);
    load();
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    await api.post(`/community/posts/${open.post.id}/replies`, { body: reply });
    setReply('');
    openPost(open.post.id);
  };

  if (error) return <ErrorBox message={error} onRetry={load} />;
  if (!posts) return <Loader />;

  return (
    <div className="grid cols-2">
      <div>
        <div className="tabs">
          <button className={`tab ${!group ? 'active' : ''}`} onClick={() => setGroup(null)}>All</button>
          {GROUPS.map((g) => (
            <button key={g} className={`tab ${group === g ? 'active' : ''}`} onClick={() => setGroup(g)}>{g}</button>
          ))}
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3>{t('addPost')}</h3>
          <input placeholder={t('title')} value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea placeholder={t('body')} rows={3} value={body} onChange={(e) => setBody(e.target.value)} style={{ marginTop: '.5rem' }} />
          <button className="btn" onClick={create}>{t('send')}</button>
        </div>

        {posts.map((p) => (
          <div className="card" key={p.id} style={{ marginBottom: '.8rem', cursor: 'pointer' }} onClick={() => openPost(p.id)}>
            <span className="badge">{p.group}</span>
            <h3 style={{ marginTop: '.4rem' }}>{p.title}</h3>
            <p className="muted" style={{ margin: 0 }}>{p.body.slice(0, 90)}{p.body.length > 90 ? '…' : ''}</p>
            <div className="muted" style={{ fontSize: '.8rem', marginTop: '.5rem' }}>
              {p.authorName} • ❤️ {p.likes} • 💬 {p.replyCount} {t('replies')}
            </div>
          </div>
        ))}
      </div>

      <div>
        {open ? (
          <div className="card">
            <span className="badge">{open.post.group}</span>
            <h3 style={{ marginTop: '.4rem' }}>{open.post.title}</h3>
            <p>{open.post.body}</p>
            <button className="chip" onClick={() => like(open.post.id)}>❤️ {open.post.likes} {t('likes')}</button>
            <div className="section-title">{open.replies.length} {t('replies')}</div>
            {open.replies.map((r) => (
              <div className="list-item" key={r.id}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--lavender)', fontSize: '.85rem' }}>{r.authorName}</div>
                  <div>{r.body}</div>
                </div>
              </div>
            ))}
            <div className="composer">
              <input placeholder={t('reply')} value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendReply()} />
              <button className="btn" onClick={sendReply}>{t('send')}</button>
            </div>
          </div>
        ) : (
          <div className="card muted">{t('empty')}</div>
        )}
      </div>
    </div>
  );
}
