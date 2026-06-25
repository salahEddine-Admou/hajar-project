/**
 * Weekly pregnancy development content (weeks 1–40).
 * Educational only — not a substitute for medical advice.
 * Localized strings are provided for English, French and Arabic.
 */

const fruitSizes = {
  4: { en: 'poppy seed', fr: 'graine de pavot', ar: 'بذرة خشخاش' },
  5: { en: 'sesame seed', fr: 'graine de sésame', ar: 'بذرة سمسم' },
  6: { en: 'lentil', fr: 'lentille', ar: 'عدسة' },
  7: { en: 'blueberry', fr: 'myrtille', ar: 'توتة' },
  8: { en: 'raspberry', fr: 'framboise', ar: 'توت العليق' },
  9: { en: 'cherry', fr: 'cerise', ar: 'كرزة' },
  10: { en: 'strawberry', fr: 'fraise', ar: 'فراولة' },
  11: { en: 'lime', fr: 'citron vert', ar: 'ليمونة' },
  12: { en: 'plum', fr: 'prune', ar: 'برقوقة' },
  13: { en: 'peach', fr: 'pêche', ar: 'خوخة' },
  14: { en: 'lemon', fr: 'citron', ar: 'ليمونة كبيرة' },
  15: { en: 'apple', fr: 'pomme', ar: 'تفاحة' },
  16: { en: 'avocado', fr: 'avocat', ar: 'أفوكادو' },
  17: { en: 'turnip', fr: 'navet', ar: 'لفت' },
  18: { en: 'bell pepper', fr: 'poivron', ar: 'فلفل حلو' },
  19: { en: 'mango', fr: 'mangue', ar: 'مانجو' },
  20: { en: 'banana', fr: 'banane', ar: 'موزة' },
  21: { en: 'carrot', fr: 'carotte', ar: 'جزرة' },
  22: { en: 'spaghetti squash', fr: 'courge spaghetti', ar: 'قرع' },
  23: { en: 'grapefruit', fr: 'pamplemousse', ar: 'جريب فروت' },
  24: { en: 'corn cob', fr: 'épi de maïs', ar: 'كوز ذرة' },
  25: { en: 'cauliflower', fr: 'chou-fleur', ar: 'قرنبيط' },
  26: { en: 'lettuce', fr: 'laitue', ar: 'خس' },
  27: { en: 'rutabaga', fr: 'rutabaga', ar: 'لفت سويدي' },
  28: { en: 'eggplant', fr: 'aubergine', ar: 'باذنجان' },
  29: { en: 'butternut squash', fr: 'courge musquée', ar: 'قرع العسل' },
  30: { en: 'cabbage', fr: 'chou', ar: 'ملفوف' },
  31: { en: 'coconut', fr: 'noix de coco', ar: 'جوز هند' },
  32: { en: 'jicama', fr: 'jicama', ar: 'جيكاما' },
  33: { en: 'pineapple', fr: 'ananas', ar: 'أناناس' },
  34: { en: 'cantaloupe', fr: 'cantaloup', ar: 'شمام' },
  35: { en: 'honeydew melon', fr: 'melon miel', ar: 'بطيخ أصفر' },
  36: { en: 'romaine lettuce', fr: 'laitue romaine', ar: 'خس روماني' },
  37: { en: 'Swiss chard', fr: 'bette à carde', ar: 'سلق' },
  38: { en: 'leek', fr: 'poireau', ar: 'كراث' },
  39: { en: 'watermelon', fr: 'pastèque', ar: 'بطيخة' },
  40: { en: 'small pumpkin', fr: 'petite citrouille', ar: 'يقطينة صغيرة' },
};

const highlights = {
  4: {
    en: 'The embryo implants in the uterus and the placenta begins to form.',
    fr: "L'embryon s'implante dans l'utérus et le placenta commence à se former.",
    ar: 'يبدأ الجنين بالانغراس في الرحم وتبدأ المشيمة بالتكوّن.',
  },
  8: {
    en: 'Tiny fingers and toes are forming and the heart beats around 150 bpm.',
    fr: 'De petits doigts et orteils se forment et le cœur bat à environ 150 bpm.',
    ar: 'تتكوّن أصابع اليدين والقدمين الصغيرة وينبض القلب بنحو 150 نبضة في الدقيقة.',
  },
  12: {
    en: 'Vital organs are formed; the risk of miscarriage drops significantly.',
    fr: 'Les organes vitaux sont formés ; le risque de fausse couche diminue fortement.',
    ar: 'تتكوّن الأعضاء الحيوية وينخفض خطر الإجهاض بشكل كبير.',
  },
  16: {
    en: 'Baby can make facial expressions and you may soon feel first movements.',
    fr: 'Le bébé peut faire des expressions faciales ; vous sentirez bientôt les premiers mouvements.',
    ar: 'يستطيع الطفل تكوين تعابير الوجه وقد تشعرين قريباً بأولى حركاته.',
  },
  20: {
    en: 'Halfway point! An anatomy ultrasound is usually scheduled around now.',
    fr: 'Mi-parcours ! Une échographie morphologique est généralement prévue maintenant.',
    ar: 'منتصف الحمل! يُجرى عادةً فحص السونار التشريحي في هذه الفترة.',
  },
  24: {
    en: 'Baby reaches viability; lungs are developing rapidly.',
    fr: 'Le bébé atteint la viabilité ; les poumons se développent rapidement.',
    ar: 'يصل الطفل إلى مرحلة القابلية للحياة وتتطور الرئتان بسرعة.',
  },
  28: {
    en: 'Third trimester begins. Baby can open eyes and may respond to light.',
    fr: 'Début du troisième trimestre. Le bébé ouvre les yeux et réagit à la lumière.',
    ar: 'يبدأ الثلث الأخير. يفتح الطفل عينيه وقد يستجيب للضوء.',
  },
  32: {
    en: 'Baby practises breathing movements and gains weight quickly.',
    fr: 'Le bébé s’exerce à respirer et prend du poids rapidement.',
    ar: 'يتدرب الطفل على حركات التنفس ويكتسب الوزن بسرعة.',
  },
  36: {
    en: 'Baby is likely head-down preparing for birth.',
    fr: 'Le bébé est probablement tête en bas, se préparant à la naissance.',
    ar: 'يكون الطفل غالباً في وضع رأسي استعداداً للولادة.',
  },
  40: {
    en: 'Full term! Your baby is ready to meet you any day now.',
    fr: 'À terme ! Votre bébé est prêt à vous rencontrer.',
    ar: 'اكتمل الحمل! طفلك جاهز للقائك في أي يوم.',
  },
};

function pick(map, week) {
  const keys = Object.keys(map).map(Number).sort((a, b) => a - b);
  let chosen = keys[0];
  for (const k of keys) if (k <= week) chosen = k;
  return map[chosen];
}

export function weekInfo(week, lang = 'en') {
  const w = Math.max(1, Math.min(42, week));
  const size = pick(fruitSizes, w);
  const hl = pick(highlights, w);
  const trimester = w <= 13 ? 1 : w <= 27 ? 2 : 3;
  return {
    week: w,
    trimester,
    size: size[lang] || size.en,
    highlight: hl[lang] || hl.en,
  };
}

export function allWeeks(lang = 'en') {
  return Array.from({ length: 40 }, (_, i) => weekInfo(i + 1, lang));
}
