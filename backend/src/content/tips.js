/**
 * Curated daily tips (educational), localized in Arabic, French and English.
 * A tip is chosen deterministically from the day of the year so it changes
 * daily but is stable within a day.
 */

export const PREGNANCY_TIPS = [
  {
    ar: 'اشربي كمية كافية من الماء يومياً للحفاظ على ترطيب جسمك ودعم نمو طفلك.',
    fr: "Buvez suffisamment d'eau chaque jour pour rester hydratée et soutenir la croissance de bébé.",
    en: 'Drink enough water daily to stay hydrated and support your baby’s growth.',
  },
  {
    ar: 'تناولي حمض الفوليك يومياً لتقليل خطر التشوهات الخلقية.',
    fr: "Prenez de l'acide folique chaque jour pour réduire le risque d'anomalies congénitales.",
    en: 'Take folic acid daily to reduce the risk of birth defects.',
  },
  {
    ar: 'خصصي وقتاً للراحة، فالتعب طبيعي خلال الحمل.',
    fr: "Accordez-vous du repos : la fatigue est normale pendant la grossesse.",
    en: 'Make time to rest — fatigue is normal during pregnancy.',
  },
  {
    ar: 'مارسي تمارين خفيفة مثل المشي للحفاظ على نشاطك وصحتك.',
    fr: 'Pratiquez une activité douce comme la marche pour rester active et en forme.',
    en: 'Do gentle exercise like walking to stay active and healthy.',
  },
  {
    ar: 'تجنّبي الكافيين الزائد والأطعمة النيئة غير المطهوة جيداً.',
    fr: 'Évitez l’excès de caféine et les aliments crus ou mal cuits.',
    en: 'Avoid excess caffeine and raw or undercooked foods.',
  },
  {
    ar: 'تحدثي مع طفلك واستمعي للموسيقى الهادئة، فهو يبدأ بالسمع تدريجياً.',
    fr: 'Parlez à votre bébé et écoutez de la musique douce : il commence à entendre.',
    en: 'Talk to your baby and play soft music — they’re beginning to hear.',
  },
  {
    ar: 'سجّلي حركات طفلك يومياً وأبلغي طبيبك عند أي تغيّر ملحوظ.',
    fr: 'Comptez les mouvements de bébé chaque jour et signalez tout changement au médecin.',
    en: 'Track your baby’s movements daily and report any noticeable change to your doctor.',
  },
  {
    ar: 'حافظي على مواعيد فحوصاتك الدورية قبل الولادة.',
    fr: 'Respectez vos rendez-vous de suivi prénatal.',
    en: 'Keep up with your regular prenatal check-ups.',
  },
];

export const BABY_TIPS = [
  {
    ar: 'نوّمي طفلك على ظهره دائماً على سطح ثابت لتقليل خطر الموت المفاجئ.',
    fr: 'Couchez toujours bébé sur le dos, sur une surface ferme, pour réduire les risques.',
    en: 'Always put your baby to sleep on their back on a firm surface to reduce risk.',
  },
  {
    ar: 'الرضاعة عند الطلب تساعد على تنظيم إدرار الحليب وتغذية الطفل.',
    fr: "L'allaitement à la demande aide à réguler la lactation et nourrir bébé.",
    en: 'Feeding on demand helps regulate milk supply and nourish your baby.',
  },
  {
    ar: 'وقت الانبطاح اليومي يقوّي عضلات رقبة طفلك وظهره.',
    fr: 'Le temps sur le ventre renforce les muscles du cou et du dos de bébé.',
    en: 'Daily tummy time strengthens your baby’s neck and back muscles.',
  },
  {
    ar: 'تابعي جدول التطعيمات في مواعيده لحماية طفلك.',
    fr: 'Respectez le calendrier vaccinal pour protéger votre bébé.',
    en: 'Keep to the vaccination schedule to protect your baby.',
  },
  {
    ar: 'راقبي علامات النعاس وأنشئي روتيناً هادئاً قبل النوم.',
    fr: 'Repérez les signes de fatigue et créez une routine calme avant le coucher.',
    en: 'Watch for sleepy cues and create a calm pre-sleep routine.',
  },
  {
    ar: 'تحدثي وغنّي لطفلك كثيراً، فهذا يدعم تطوّر لغته.',
    fr: 'Parlez et chantez souvent à bébé : cela soutient le développement du langage.',
    en: 'Talk and sing to your baby often — it supports language development.',
  },
  {
    ar: 'تأكدي من أن درجة حرارة الغرفة مريحة وملابس الطفل مناسبة.',
    fr: 'Veillez à une température de pièce confortable et des vêtements adaptés.',
    en: 'Keep the room at a comfortable temperature and dress baby appropriately.',
  },
];

function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / (24 * 60 * 60 * 1000));
}

export function dailyTip(context = 'pregnancy', lang = 'ar') {
  const list = context === 'baby' ? BABY_TIPS : PREGNANCY_TIPS;
  const tip = list[dayOfYear() % list.length];
  return tip[lang] || tip.ar;
}
