/**
 * Standard vaccination schedule (based on common WHO/EPI infant programmes)
 * and pregnancy milestones. Educational defaults — clinicians may adjust.
 */

export const VACCINE_SCHEDULE = [
  { ageMonths: 0, vaccine: 'BCG', protectsAgainst: { en: 'Tuberculosis', fr: 'Tuberculose', ar: 'السل' } },
  { ageMonths: 0, vaccine: 'Hepatitis B (birth dose)', protectsAgainst: { en: 'Hepatitis B', fr: 'Hépatite B', ar: 'التهاب الكبد B' } },
  { ageMonths: 2, vaccine: 'DTaP-1', protectsAgainst: { en: 'Diphtheria, Tetanus, Pertussis', fr: 'Diphtérie, Tétanos, Coqueluche', ar: 'الدفتيريا والكزاز والسعال الديكي' } },
  { ageMonths: 2, vaccine: 'IPV-1 (Polio)', protectsAgainst: { en: 'Polio', fr: 'Poliomyélite', ar: 'شلل الأطفال' } },
  { ageMonths: 2, vaccine: 'Hib-1', protectsAgainst: { en: 'Haemophilus influenzae b', fr: 'Haemophilus influenzae b', ar: 'المستدمية النزلية ب' } },
  { ageMonths: 2, vaccine: 'PCV-1', protectsAgainst: { en: 'Pneumococcus', fr: 'Pneumocoque', ar: 'المكورات الرئوية' } },
  { ageMonths: 2, vaccine: 'Rotavirus-1', protectsAgainst: { en: 'Rotavirus', fr: 'Rotavirus', ar: 'الفيروس العجلي' } },
  { ageMonths: 4, vaccine: 'DTaP-2', protectsAgainst: { en: 'Diphtheria, Tetanus, Pertussis', fr: 'Diphtérie, Tétanos, Coqueluche', ar: 'الدفتيريا والكزاز والسعال الديكي' } },
  { ageMonths: 4, vaccine: 'IPV-2 (Polio)', protectsAgainst: { en: 'Polio', fr: 'Poliomyélite', ar: 'شلل الأطفال' } },
  { ageMonths: 4, vaccine: 'Hib-2', protectsAgainst: { en: 'Haemophilus influenzae b', fr: 'Haemophilus influenzae b', ar: 'المستدمية النزلية ب' } },
  { ageMonths: 4, vaccine: 'PCV-2', protectsAgainst: { en: 'Pneumococcus', fr: 'Pneumocoque', ar: 'المكورات الرئوية' } },
  { ageMonths: 4, vaccine: 'Rotavirus-2', protectsAgainst: { en: 'Rotavirus', fr: 'Rotavirus', ar: 'الفيروس العجلي' } },
  { ageMonths: 6, vaccine: 'DTaP-3', protectsAgainst: { en: 'Diphtheria, Tetanus, Pertussis', fr: 'Diphtérie, Tétanos, Coqueluche', ar: 'الدفتيريا والكزاز والسعال الديكي' } },
  { ageMonths: 6, vaccine: 'Hepatitis B-3', protectsAgainst: { en: 'Hepatitis B', fr: 'Hépatite B', ar: 'التهاب الكبد B' } },
  { ageMonths: 9, vaccine: 'Measles-1', protectsAgainst: { en: 'Measles', fr: 'Rougeole', ar: 'الحصبة' } },
  { ageMonths: 12, vaccine: 'MMR-1', protectsAgainst: { en: 'Measles, Mumps, Rubella', fr: 'Rougeole, Oreillons, Rubéole', ar: 'الحصبة والنكاف والحصبة الألمانية' } },
  { ageMonths: 12, vaccine: 'PCV booster', protectsAgainst: { en: 'Pneumococcus', fr: 'Pneumocoque', ar: 'المكورات الرئوية' } },
  { ageMonths: 15, vaccine: 'Varicella', protectsAgainst: { en: 'Chickenpox', fr: 'Varicelle', ar: 'جدري الماء' } },
  { ageMonths: 18, vaccine: 'DTaP booster', protectsAgainst: { en: 'Diphtheria, Tetanus, Pertussis', fr: 'Diphtérie, Tétanos, Coqueluche', ar: 'الدفتيريا والكزاز والسعال الديكي' } },
];

export const PREGNANCY_MILESTONES = [
  { week: 8, title: { en: 'First prenatal visit', fr: 'Première visite prénatale', ar: 'أول زيارة قبل الولادة' } },
  { week: 12, title: { en: 'End of first trimester', fr: 'Fin du premier trimestre', ar: 'نهاية الثلث الأول' } },
  { week: 12, title: { en: 'NT scan window', fr: 'Échographie de la clarté nucale', ar: 'فحص الشفافية القفوية' } },
  { week: 20, title: { en: 'Anatomy ultrasound', fr: 'Échographie morphologique', ar: 'فحص السونار التشريحي' } },
  { week: 24, title: { en: 'Glucose screening', fr: 'Test de glycémie', ar: 'فحص سكري الحمل' } },
  { week: 28, title: { en: 'Start of third trimester', fr: 'Début du troisième trimestre', ar: 'بداية الثلث الأخير' } },
  { week: 36, title: { en: 'Group B strep test', fr: 'Test streptocoque B', ar: 'فحص العقدية من المجموعة ب' } },
  { week: 40, title: { en: 'Due date', fr: 'Date prévue d’accouchement', ar: 'موعد الولادة المتوقع' } },
];

/** Edinburgh Postnatal Depression Scale (EPDS) — 10 items, score 0–3 each. */
export const EPDS_QUESTIONS = [
  {
    id: 1,
    text: {
      en: 'I have been able to laugh and see the funny side of things',
      fr: "J'ai pu rire et voir le bon côté des choses",
      ar: 'كنت قادرة على الضحك ورؤية الجانب المرح للأمور',
    },
    options: { en: ['As much as I always could', 'Not quite so much now', 'Definitely not so much now', 'Not at all'] },
    reverse: true,
  },
  {
    id: 2,
    text: {
      en: 'I have looked forward with enjoyment to things',
      fr: "Je me suis réjouie à l'idée de faire des choses",
      ar: 'كنت أتطلع باستمتاع إلى الأمور',
    },
    reverse: true,
  },
  {
    id: 3,
    text: {
      en: 'I have blamed myself unnecessarily when things went wrong',
      fr: 'Je me suis reproché, sans raison, des choses qui allaient mal',
      ar: 'لمت نفسي دون داعٍ عندما تسوء الأمور',
    },
    reverse: false,
  },
  {
    id: 4,
    text: {
      en: 'I have been anxious or worried for no good reason',
      fr: "J'ai été anxieuse ou inquiète sans raison",
      ar: 'كنت قلقة أو متوترة دون سبب وجيه',
    },
    reverse: false,
  },
  {
    id: 5,
    text: {
      en: 'I have felt scared or panicky for no very good reason',
      fr: "J'ai eu peur ou paniqué sans raison valable",
      ar: 'شعرت بالخوف أو الذعر دون سبب وجيه',
    },
    reverse: false,
  },
  {
    id: 6,
    text: {
      en: 'Things have been getting on top of me',
      fr: 'Les choses devenaient trop pour moi',
      ar: 'كانت الأمور تتراكم عليّ',
    },
    reverse: false,
  },
  {
    id: 7,
    text: {
      en: 'I have been so unhappy that I have had difficulty sleeping',
      fr: "J'ai été si malheureuse que j'ai eu du mal à dormir",
      ar: 'كنت تعيسة لدرجة صعوبة النوم',
    },
    reverse: false,
  },
  {
    id: 8,
    text: {
      en: 'I have felt sad or miserable',
      fr: 'Je me suis sentie triste ou misérable',
      ar: 'شعرت بالحزن أو التعاسة',
    },
    reverse: false,
  },
  {
    id: 9,
    text: {
      en: 'I have been so unhappy that I have been crying',
      fr: "J'ai été si malheureuse que j'ai pleuré",
      ar: 'كنت تعيسة لدرجة البكاء',
    },
    reverse: false,
  },
  {
    id: 10,
    text: {
      en: 'The thought of harming myself has occurred to me',
      fr: "L'idée de me faire du mal m'est venue à l'esprit",
      ar: 'راودتني فكرة إيذاء نفسي',
    },
    reverse: false,
  },
];

export function scoreEpds(answers) {
  // answers: array of { id, value(0-3) }
  let total = 0;
  for (const a of answers) total += Number(a.value) || 0;
  let risk = 'low';
  if (total >= 13) risk = 'high';
  else if (total >= 10) risk = 'moderate';
  const flagSelfHarm = answers.some((a) => a.id === 10 && Number(a.value) > 0);
  return { total, risk, flagSelfHarm };
}

export const WELLNESS_TIPS = {
  low: {
    en: ['Keep up your healthy routine.', 'Stay connected with loved ones.', 'Enjoy short daily walks.'],
    fr: ['Maintenez votre routine saine.', 'Restez en lien avec vos proches.', 'Profitez de courtes promenades quotidiennes.'],
    ar: ['حافظي على روتينك الصحي.', 'ابقي على تواصل مع أحبائك.', 'استمتعي بنزهات يومية قصيرة.'],
  },
  moderate: {
    en: ['Try a 5-minute breathing exercise.', 'Ask a partner or friend for support.', 'Prioritise rest when the baby sleeps.'],
    fr: ['Essayez un exercice de respiration de 5 minutes.', 'Demandez du soutien à un proche.', 'Reposez-vous quand le bébé dort.'],
    ar: ['جرّبي تمرين تنفس لمدة 5 دقائق.', 'اطلبي الدعم من شريك أو صديق.', 'أعطي الراحة الأولوية عندما ينام الطفل.'],
  },
  high: {
    en: ['Please reach out to your healthcare provider.', 'You are not alone — support is available.', 'Consider contacting a mental health professional.'],
    fr: ['Veuillez contacter votre professionnel de santé.', "Vous n'êtes pas seule — du soutien existe.", 'Envisagez de consulter un professionnel de santé mentale.'],
    ar: ['يرجى التواصل مع مقدم الرعاية الصحية.', 'لست وحدك — الدعم متاح.', 'فكري في التواصل مع مختص بالصحة النفسية.'],
  },
};
