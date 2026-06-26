import { createContext, useContext, useEffect, useState } from 'react';

const STRINGS = {
  en: {
    appName: 'Hajar', dashboard: 'Dashboard', pregnancy: 'Pregnancy', babies: 'Babies',
    wellness: 'Wellness', community: 'Community', assistant: 'AI Assistant', logout: 'Log out',
    login: 'Log in', register: 'Create account', email: 'Email', password: 'Password', name: 'Full name',
    noAccount: "No account? Sign up", haveAccount: 'Have an account? Log in',
    welcome: 'Welcome', overview: 'Overview', totalUsers: 'Users', totalBabies: 'Babies',
    totalPregnancies: 'Pregnancies', moodLogs: 'Mood logs', screenings: 'Screenings', posts: 'Posts',
    chats: 'AI messages', appointments: 'Appointments', last7: 'Last 7 days', newUsers: 'New users',
    byLanguage: 'Users by language', upcoming: 'Upcoming reminders', nothingUpcoming: 'No upcoming reminders',
    week: 'Week', trimester: 'Trimester', dueDate: 'Due date', daysToGo: 'days to go', babySize: 'Baby is the size of a',
    noPregnancy: 'No active pregnancy', managePregnancy: 'Manage pregnancy', editPregnancy: 'Update', lmpDate: 'Last period (LMP)', resetPregnancy: 'Reset', confirmReset: 'Reset pregnancy data?',
    growth: 'Growth', vaccinations: 'Vaccinations', given: 'Given', due: 'Due',
    weight: 'Weight (kg)', height: 'Height (cm)', headCirc: 'Head (cm)', addPost: 'New post', title: 'Title',
    body: 'Message', send: 'Send', reply: 'Reply', replies: 'replies', likes: 'likes', ask: 'Ask about pregnancy, sleep, feeding…',
    mood: 'Mood', stress: 'Stress', anxiety: 'Anxiety', logMood: 'Log mood', recommendations: 'Recommendations',
    loading: 'Loading…', error: 'Something went wrong', empty: 'Nothing here yet', language: 'Language',
    overdue: 'Overdue', appointment: 'Appointment', medication: 'Medication', vaccination: 'Vaccination', milestone: 'Milestone',
    tools: 'Tools', kickCounter: 'Kick counter', contractionTimer: 'Contraction timer', dailyTip: 'Tip of the day',
    start: 'Start', stop: 'Stop', kicks: 'kicks', duration: 'Duration', interval: 'Interval', history: 'History', tapKick: 'Tap each kick',
    school: 'School', students: 'Children', addStudent: 'Add child', schoolName: 'School', grade: 'Grade / class', teacher: 'Teacher', year: 'School year',
    grades: 'Grades', subject: 'Subject', score: 'Score', max: 'Out of', term: 'Term', addGrade: 'Add grade',
    overall: 'Overall average', subjectAverages: 'Subject averages', gradeTrend: 'Grade trend',
    homework: 'Homework', exam: 'Exam', exams: 'Exams', assignments: 'Assignments', addAssignment: 'Add assignment',
    pending: 'Pending', done: 'Done', nextDue: 'Next due',
    attendance: 'Attendance', present: 'Present', absent: 'Absent', late: 'Late', attendanceRate: 'Attendance rate', markAttendance: 'Mark attendance',
    timetable: 'Timetable', day: 'Day', startTime: 'Start', endTime: 'End', room: 'Room', addClass: 'Add class', weekly: 'Weekly schedule',
    add: 'Add', save: 'Save', cancel: 'Cancel', delete: 'Delete', noStudents: 'Add your first child to start tracking school.',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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
    noPregnancy: 'Aucune grossesse active', managePregnancy: 'Gérer la grossesse', editPregnancy: 'Mettre à jour', lmpDate: 'Dernières règles (DDR)', resetPregnancy: 'Réinitialiser', confirmReset: 'Réinitialiser les données de grossesse ?',
    growth: 'Croissance', vaccinations: 'Vaccinations', given: 'Fait', due: 'Prévu',
    weight: 'Poids (kg)', height: 'Taille (cm)', headCirc: 'Tête (cm)', addPost: 'Nouveau message', title: 'Titre',
    body: 'Message', send: 'Envoyer', reply: 'Répondre', replies: 'réponses', likes: "j'aime", ask: 'Posez une question…',
    mood: 'Humeur', stress: 'Stress', anxiety: 'Anxiété', logMood: "Noter l'humeur", recommendations: 'Recommandations',
    loading: 'Chargement…', error: 'Une erreur est survenue', empty: 'Rien pour le moment', language: 'Langue',
    overdue: 'En retard', appointment: 'Rendez-vous', medication: 'Médicament', vaccination: 'Vaccination', milestone: 'Étape',
    tools: 'Outils', kickCounter: 'Compteur de coups', contractionTimer: 'Minuteur de contractions', dailyTip: 'Conseil du jour',
    start: 'Démarrer', stop: 'Arrêter', kicks: 'coups', duration: 'Durée', interval: 'Intervalle', history: 'Historique', tapKick: 'Touchez chaque coup',
    school: 'École', students: 'Enfants', addStudent: 'Ajouter un enfant', schoolName: 'École', grade: 'Niveau / classe', teacher: 'Enseignant', year: 'Année scolaire',
    grades: 'Notes', subject: 'Matière', score: 'Note', max: 'Sur', term: 'Trimestre', addGrade: 'Ajouter une note',
    overall: 'Moyenne générale', subjectAverages: 'Moyennes par matière', gradeTrend: 'Évolution des notes',
    homework: 'Devoirs', exam: 'Examen', exams: 'Examens', assignments: 'Travaux', addAssignment: 'Ajouter un travail',
    pending: 'En cours', done: 'Terminé', nextDue: 'Prochaine échéance',
    attendance: 'Présence', present: 'Présent', absent: 'Absent', late: 'En retard', attendanceRate: 'Taux de présence', markAttendance: 'Pointer',
    timetable: 'Emploi du temps', day: 'Jour', startTime: 'Début', endTime: 'Fin', room: 'Salle', addClass: 'Ajouter un cours', weekly: 'Emploi du temps hebdomadaire',
    add: 'Ajouter', save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', noStudents: 'Ajoutez votre premier enfant pour suivre sa scolarité.',
    days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
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
    noPregnancy: 'لا يوجد حمل نشط', managePregnancy: 'إدارة الحمل', editPregnancy: 'تحديث', lmpDate: 'آخر دورة شهرية', resetPregnancy: 'إعادة تعيين', confirmReset: 'إعادة تعيين بيانات الحمل؟',
    growth: 'النمو', vaccinations: 'التطعيمات', given: 'تم', due: 'مستحق',
    weight: 'الوزن (كغ)', height: 'الطول (سم)', headCirc: 'الرأس (سم)', addPost: 'منشور جديد', title: 'العنوان',
    body: 'الرسالة', send: 'إرسال', reply: 'رد', replies: 'ردود', likes: 'إعجاب', ask: 'اسألي عن الحمل والنوم…',
    mood: 'المزاج', stress: 'التوتر', anxiety: 'القلق', logMood: 'تسجيل المزاج', recommendations: 'توصيات',
    loading: 'جارٍ التحميل…', error: 'حدث خطأ ما', empty: 'لا يوجد شيء بعد', language: 'اللغة',
    overdue: 'متأخر', appointment: 'موعد', medication: 'دواء', vaccination: 'تطعيم', milestone: 'مرحلة',
    tools: 'أدوات', kickCounter: 'عداد الركلات', contractionTimer: 'مؤقّت الانقباضات', dailyTip: 'نصيحة اليوم',
    start: 'ابدئي', stop: 'إيقاف', kicks: 'ركلة', duration: 'المدة', interval: 'الفاصل', history: 'السجل', tapKick: 'اضغطي عند كل ركلة',
    school: 'المدرسة', students: 'الأطفال', addStudent: 'إضافة طفل', schoolName: 'المدرسة', grade: 'الصف / الفصل', teacher: 'المعلّم', year: 'العام الدراسي',
    grades: 'الدرجات', subject: 'المادة', score: 'الدرجة', max: 'من', term: 'الفصل', addGrade: 'إضافة درجة',
    overall: 'المعدل العام', subjectAverages: 'متوسط المواد', gradeTrend: 'تطور الدرجات',
    homework: 'الواجبات', exam: 'اختبار', exams: 'الاختبارات', assignments: 'المهام', addAssignment: 'إضافة مهمة',
    pending: 'قيد التنفيذ', done: 'منجز', nextDue: 'التالي',
    attendance: 'الحضور', present: 'حاضر', absent: 'غائب', late: 'متأخر', attendanceRate: 'نسبة الحضور', markAttendance: 'تسجيل الحضور',
    timetable: 'الجدول', day: 'اليوم', startTime: 'البداية', endTime: 'النهاية', room: 'القاعة', addClass: 'إضافة حصة', weekly: 'الجدول الأسبوعي',
    add: 'إضافة', save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', noStudents: 'أضيفي طفلك الأول لبدء متابعة المدرسة.',
    days: ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
  },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('hajar_lang') || 'ar');

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
