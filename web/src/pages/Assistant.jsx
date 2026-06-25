import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { useI18n } from '../i18n';

export default function Assistant() {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    api.get('/ai/history').then((r) => {
      setMessages(r.data.messages.map((m) => ({ role: m.role, content: m.content })));
    });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: msg }]);
    setSending(true);
    try {
      const r = await api.post('/ai/chat', { message: msg, lang });
      setMessages((m) => [...m, { role: 'assistant', content: r.data.reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: e.message }]);
    } finally {
      setSending(false);
    }
  };

  const suggestions = [
    'Tips for breastfeeding latch?',
    'How much should a newborn sleep?',
    'What milestones at 4 months?',
  ];

  return (
    <div className="chat">
      <div className="chat-scroll" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="center" style={{ flexDirection: 'column', gap: '.6rem' }}>
            <div style={{ fontSize: '2.4rem' }}>🤖</div>
            <div className="muted">{t('ask')}</div>
            {suggestions.map((s) => (
              <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role === 'user' ? 'user' : 'bot'}`}>{m.content}</div>
        ))}
        {sending && <div className="bubble bot">…</div>}
      </div>
      <div className="composer">
        <input
          placeholder={t('ask')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button className="btn" onClick={() => send()} disabled={sending}>{t('send')}</button>
      </div>
    </div>
  );
}
