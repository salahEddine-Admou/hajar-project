import { Router } from 'express';
import { insert, find, remove } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const SYSTEM_PROMPT = `You are "Hajar", a warm, supportive AI assistant for mothers.
You answer questions about pregnancy, newborn care, breastfeeding, infant sleep, and child development.
Be concise, practical and reassuring. Always remind the user to consult a healthcare professional
for medical concerns or emergencies. Never diagnose. Respond in the user's language.`;

// Rule-based fallback so the chatbot works with zero external dependencies.
const FALLBACK_RULES = [
  {
    match: /breastfeed|breast milk|latch|nursing|allaite|رضاعة/i,
    answer: {
      en: 'Aim to feed on demand (8–12 times/day for newborns). Ensure a deep latch with the baby’s mouth covering much of the areola. Pain beyond initial seconds may signal a shallow latch — a lactation consultant can help. Stay hydrated and rest when you can.',
      fr: 'Allaitez à la demande (8 à 12 fois/jour pour les nouveau-nés). Veillez à une bonne prise du sein couvrant une grande partie de l’aréole. Une douleur persistante peut indiquer une mauvaise prise — une consultante en lactation peut aider. Hydratez-vous et reposez-vous.',
      ar: 'أرضعي عند الطلب (٨–١٢ مرة يومياً لحديثي الولادة). تأكدي من التقام عميق يغطي جزءاً كبيراً من الهالة. الألم المستمر قد يدل على التقام سطحي — يمكن لمختص الرضاعة المساعدة. حافظي على الترطيب والراحة.',
    },
  },
  {
    match: /sleep|nap|night|dormir|sommeil|نوم/i,
    answer: {
      en: 'Newborns sleep 14–17 hours/day in short stretches. Put babies to sleep on their back, on a firm flat surface, with no loose bedding (safe sleep). A calm bedtime routine and watching for sleepy cues helps. Sleep patterns become more regular around 3–4 months.',
      fr: 'Les nouveau-nés dorment 14 à 17 h/jour par courtes périodes. Couchez le bébé sur le dos, sur une surface ferme, sans literie souple. Une routine calme et l’observation des signes de fatigue aident. Le sommeil se régularise vers 3–4 mois.',
      ar: 'ينام حديثو الولادة ١٤–١٧ ساعة يومياً على فترات قصيرة. نوّمي الطفل على ظهره على سطح ثابت بدون أغطية رخوة. روتين هادئ ومراقبة علامات النعاس يساعدان. ينتظم النوم حوالي الشهر الثالث أو الرابع.',
    },
  },
  {
    match: /fever|temperature|fièvre|حرارة|حمى/i,
    answer: {
      en: 'For infants under 3 months, a rectal temperature of 38°C (100.4°F) or higher needs urgent medical attention. For older babies, watch behaviour, feeding and hydration. Please contact your doctor for fever guidance — this is general information, not medical advice.',
      fr: 'Pour un nourrisson de moins de 3 mois, une température de 38°C ou plus nécessite des soins urgents. Pour les bébés plus âgés, surveillez le comportement et l’hydratation. Contactez votre médecin — ceci est une information générale.',
      ar: 'للرضع دون ٣ أشهر، حرارة ٣٨ درجة مئوية أو أكثر تتطلب رعاية طبية عاجلة. للأكبر سناً راقبي السلوك والترطيب. يرجى استشارة الطبيب — هذه معلومات عامة وليست نصيحة طبية.',
    },
  },
  {
    match: /milestone|development|crawl|walk|talk|développement|تطور|نمو/i,
    answer: {
      en: 'Development varies, but general guides: smiling ~6–8 weeks, rolling ~4–6 months, sitting ~6–8 months, crawling ~7–10 months, first words ~12 months, walking ~9–15 months. Tummy time supports motor skills. Discuss any concerns at well-child visits.',
      fr: 'Le développement varie : sourire ~6–8 semaines, se retourner ~4–6 mois, s’asseoir ~6–8 mois, ramper ~7–10 mois, premiers mots ~12 mois, marcher ~9–15 mois. Le temps sur le ventre aide la motricité. Parlez de vos inquiétudes au médecin.',
      ar: 'يختلف النمو: الابتسامة ~٦–٨ أسابيع، التقلب ~٤–٦ أشهر، الجلوس ~٦–٨ أشهر، الحبو ~٧–١٠ أشهر، أول كلمة ~١٢ شهراً، المشي ~٩–١٥ شهراً. وقت الانبطاح يدعم المهارات الحركية. ناقشي أي قلق مع الطبيب.',
    },
  },
];

function fallbackAnswer(message, lang = 'en') {
  for (const rule of FALLBACK_RULES) {
    if (rule.match.test(message)) return rule.answer[lang] || rule.answer.en;
  }
  const generic = {
    en: 'I’m here to help with pregnancy, newborn care, breastfeeding, sleep and child development. Could you share a bit more detail? Remember to consult your healthcare provider for medical concerns.',
    fr: 'Je peux vous aider sur la grossesse, les soins du nouveau-né, l’allaitement, le sommeil et le développement. Pouvez-vous préciser ? Consultez votre médecin pour les questions médicales.',
    ar: 'أنا هنا للمساعدة في الحمل ورعاية المولود والرضاعة والنوم وتطور الطفل. هل يمكنك إضافة تفاصيل؟ يرجى استشارة الطبيب للمسائل الطبية.',
  };
  return generic[lang] || generic.en;
}

async function askOpenAI(history, message, lang) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const messages = [
      { role: 'system', content: `${SYSTEM_PROMPT}\nPreferred language: ${lang}.` },
      ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        temperature: 0.6,
        max_tokens: 400,
      }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

router.get('/history', async (req, res) => {
  const messages = (await find('chatMessages', (m) => m.userId === req.userId))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  res.json({ messages });
});

router.post('/chat', async (req, res) => {
  const { message, lang } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message is required' });
  const language = lang || 'en';

  await insert('chatMessages', { userId: req.userId, role: 'user', content: message });
  const history = (await find('chatMessages', (m) => m.userId === req.userId))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  let reply = await askOpenAI(history, message, language);
  let source = 'ai';
  if (!reply) {
    reply = fallbackAnswer(message, language);
    source = 'rules';
  }
  const stored = await insert('chatMessages', { userId: req.userId, role: 'assistant', content: reply, source });
  res.json({ reply: stored.content, source });
});

router.delete('/history', async (req, res) => {
  const mine = await find('chatMessages', (m) => m.userId === req.userId);
  for (const m of mine) await remove('chatMessages', m.id);
  res.json({ ok: true });
});

export default router;
