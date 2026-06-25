import { createContext, useContext, useEffect, useState } from 'react';

const STRINGS = {
  en: {
    appName: 'Hajar', dashboard: 'Dashboard', pregnancy: 'Pregnancy', babies: 'Babies',
    wellness: 'Wellness', community: 'Community', assistant: 'AI Assistant', logout: 'Log out',
    login: 'Log in', register: 'Create account', email: 'Email', password: 'Password', name: 'Full name',
    noAccount: "No account? Sign up", haveAccount: 'Have an account? Log in',
    welcome: 'Welcome', overview: 'Engagement overview', totalUsers: 'Users', totalBabies: 'Babies',
    totalPregnancies: 'Pregnancies', moodLogs: 'Mood logs', screenings: 'Screenings', posts: 'Posts',
    chats: 'AI messages', appointments: 'Appointments', last7: 'Last 7 days', newUsers: 'New users',
    byLanguage: 'Users by language', upcoming: 'Upcoming reminders', nothingUpcoming: 'No upcoming reminders',
    week: 'Week', trimester: 'Trimester', dueDate: 'Due date', daysToGo: 'days to go', babySize: 'Baby is the size of a',
    noPregnancy: 'No active pregnancy', growth: 'Growth', vaccinations: 'Vaccinations', given: 'Given', due: 'Due',
    weight: 'Weight (kg)', height: 'Height (cm)', headCirc: 'Head (cm)', addPost: 'New post', title: 'Title',
    body: 'Message', send: 'Send', reply: 'Reply', replies: 'replies', likes: 'likes', ask: 'Ask about pregnancy, sleep, feeding…',
    mood: 'Mood', stress: 'Stress', anxiety: 'Anxiety', logMood: 'Log mood', recommendations: 'Recommendations',
    loading: 'Loading…', error: 'Something went wrong', empty: 'Nothing here yet', language: 'Language',
    overdue: 'Overdue', appointment: 'Appointment', medication: 'Medication', vaccination: 'Vaccination', milestone: 'Milestone',
  },
  fr: {
    appName: 'Hajar', dashboard: 'Tableau de bord', pregnancy: 'Grossesse', babies: 'Bébés',
    wellness: 'Bien-être', community: 'Communauté', assistant: 'Assistant IA', logout: 'Déconnexion',
    login: 'Connexion', register: 'Créer un compte', email: 'E-mail', password: 'Mot de passe', name: 'Nom complet',
    noAccount: "Pas de compte ? S'inscrire", haveAccount: 'Déjà un compte ? Se connecter',
    welcome: 'Bienvenue', overview: "Vue d'ensemble", totalUsers: 'Utilisateurs', totalBabies: 'Bébés',
    totalPregnancies: 'Grossesses', moodLogs: "Journaux d'humeur", screenings: 'Dépistages', posts: 'Publications',
    chats: 'Messages IA', appointments: 'Rendez-vous', last7: '7 derniers jours', newUsers: 'Nouveaux utilisateurs',
    byLanguage: 'Utilisateurs par langue', upcoming: 'Rappels à venir', nothingUpcoming: 'Aucun rappel à venir',
    week: 'Semaine', trimester: 'Trimestre', dueDate: 'Date prévue', daysToGo: 'jours restants', babySize: "Bébé a la taille d'un(e)",
    noPregnancy: 'Aucune grossesse active', growth: 'Croissance', vaccinations: 'Vaccinations', given: 'Fait', due: 'Prévu',
    weight: 'Poids (kg)', height: 'Taille (cm)', headCirc: 'Tête (cm)', addPost: 'Nouveau message', title: 'Titre',
    body: 'Message', send: 'Envoyer', reply: 'Répondre', replies: 'réponses', likes: "j'aime", ask: 'Posez une question…',
    mood: 'Humeur', stress: 'Stress', anxiety: 'Anxiété', logMood: "Noter l'humeur", recommendations: 'Recommandations',
    loading: 'Chargement…', error: 'Une erreur est survenue', empty: 'Rien pour le moment', language: 'Langue',
    overdue: 'En retard', appointment: 'Rendez-vous', medication: 'Médicament', vaccination: 'Vaccination', milestone: 'Étape',
  },
  ar: {
    appName: 'هاجر', dashboard: 'لوحة المعلومات', pregnancy: 'الحمل', babies: 'الأطفال',
    wellness: 'العافية', community: 'المجتمع', assistant: 'المساعد الذكي', logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول', register: 'إنشاء حساب', email: 'البريد الإلكتروني', password: 'كلمة المرور', name: 'الاسم الكامل',
    noAccount: 'ليس لديك حساب؟ سجّل', haveAccount: 'لديك حساب؟ سجّل الدخول',
    welcome: 'مرحباً', overview: 'نظرة عامة', totalUsers: 'المستخدمون', totalBabies: 'الأطفال',
    totalPregnancies: 'حالات الحمل', moodLogs: 'سجلات المزاج', screenings: 'الفحوصات', posts: 'المنشورات',
    chats: 'رسائل الذكاء', appointments: 'المواعيد', last7: 'آخر 7 أيام', newUsers: 'مستخدمون جدد',
    byLanguage: 'المستخدمون حسب اللغة', upcoming: 'تذكيرات قادمة', nothingUpcoming: 'لا توجد تذكيرات',
    week: 'الأسبوع', trimester: 'الثلث', dueDate: 'موعد الولادة', daysToGo: 'يوم متبقٍ', babySize: 'حجم الطفل مثل',
    noPregnancy: 'لا يوجد حمل نشط', growth: 'النمو', vaccinations: 'التطعيمات', given: 'تم', due: 'مستحق',
    weight: 'الوزن (كغ)', height: 'الطول (سم)', headCirc: 'الرأس (سم)', addPost: 'منشور جديد', title: 'العنوان',
    body: 'الرسالة', send: 'إرسال', reply: 'رد', replies: 'ردود', likes: 'إعجاب', ask: 'اسألي عن الحمل والنوم…',
    mood: 'المزاج', stress: 'التوتر', anxiety: 'القلق', logMood: 'تسجيل المزاج', recommendations: 'توصيات',
    loading: 'جارٍ التحميل…', error: 'حدث خطأ ما', empty: 'لا يوجد شيء بعد', language: 'اللغة',
    overdue: 'متأخر', appointment: 'موعد', medication: 'دواء', vaccination: 'تطعيم', milestone: 'مرحلة',
  },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('hajar_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('hajar_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const t = (key) => STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
