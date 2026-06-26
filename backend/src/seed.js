import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connect, reset, insert, now, ensureIndexes } from './db.js';

const DAY = 24 * 60 * 60 * 1000;
const iso = (d) => new Date(d).toISOString().slice(0, 10);

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Missing MONGODB_URI. Set it in your .env file.');
    process.exit(1);
  }
  await connect(uri);
  console.log('Connected to MongoDB.');

  await ensureIndexes();
  console.log('Indexes ensured.');

  await reset();
  console.log('Database reset.');

  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await insert('users', {
    name: 'Amina Demo',
    email: 'demo@hajar.app',
    passwordHash,
    locale: 'ar',
    role: 'mother',
  });
  console.log('Created demo user: demo@hajar.app / password123');

  await insert('pregnancies', {
    userId: user.id,
    lmp: iso(Date.now() - 24 * 7 * DAY),
    active: true,
  });

  await insert('appointments', {
    userId: user.id,
    title: 'Anatomy ultrasound',
    datetime: new Date(Date.now() + 3 * DAY).toISOString(),
    doctor: 'Dr. Benali',
    type: 'ultrasound',
    completed: false,
  });

  await insert('moodLogs', { userId: user.id, date: iso(Date.now() - DAY), mood: 4, stress: 2, anxiety: 2, energy: 3, sleepHours: 7 });
  await insert('moodLogs', { userId: user.id, date: iso(Date.now()), mood: 3, stress: 3, anxiety: 3, energy: 2, sleepHours: 6 });

  const baby = await insert('babies', {
    userId: user.id,
    name: 'Yusuf',
    birthDate: iso(Date.now() - 120 * DAY),
    sex: 'male',
    birthWeight: 3.4,
    birthHeight: 50,
    headCircumference: 35,
    deliveryType: 'vaginal',
  });

  await insert('growthRecords', { babyId: baby.id, date: iso(Date.now() - 90 * DAY), weight: 4.2, height: 54, headCircumference: 37 });
  await insert('growthRecords', { babyId: baby.id, date: iso(Date.now() - 30 * DAY), weight: 5.6, height: 58, headCircumference: 39 });
  await insert('growthRecords', { babyId: baby.id, date: iso(Date.now()), weight: 6.3, height: 61, headCircumference: 40 });

  await insert('vaccinations', { babyId: baby.id, vaccine: 'BCG', givenDate: iso(Date.now() - 119 * DAY) });
  await insert('vaccinations', { babyId: baby.id, vaccine: 'DTaP-1', givenDate: iso(Date.now() - 58 * DAY) });

  await insert('communityPosts', {
    userId: user.id,
    group: 'sleep',
    title: 'Any tips for the 4-month sleep regression?',
    body: 'My little one was sleeping well and now wakes every 2 hours. What worked for you?',
    expert: false,
    likes: 5,
  });

  // ---- School tracking demo data ----
  const student = await insert('students', {
    userId: user.id,
    name: 'Lina',
    babyId: null,
    schoolName: 'École Al Andalous',
    grade: 'CE2',
    teacher: 'Mme Karima',
    year: '2025/2026',
    color: '#7c5cbf',
  });

  const gradeRows = [
    { subject: 'Mathématiques', score: 16, max: 20, term: 'T1', days: 40 },
    { subject: 'Mathématiques', score: 14, max: 20, term: 'T1', days: 15 },
    { subject: 'Français', score: 17, max: 20, term: 'T1', days: 35 },
    { subject: 'Arabe', score: 18, max: 20, term: 'T1', days: 30 },
    { subject: 'Sciences', score: 13, max: 20, term: 'T1', days: 20 },
    { subject: 'Anglais', score: 15, max: 20, term: 'T1', days: 10 },
  ];
  for (const g of gradeRows) {
    await insert('grades', {
      userId: user.id, studentId: student.id,
      subject: g.subject, score: g.score, max: g.max, term: g.term,
      date: new Date(Date.now() - g.days * DAY).toISOString(),
    });
  }

  await insert('assignments', { userId: user.id, studentId: student.id, title: 'Exercices p.42', subject: 'Mathématiques', type: 'homework', dueDate: new Date(Date.now() + 2 * DAY).toISOString(), done: false });
  await insert('assignments', { userId: user.id, studentId: student.id, title: 'Lecture chapitre 3', subject: 'Français', type: 'homework', dueDate: new Date(Date.now() + 5 * DAY).toISOString(), done: false });
  await insert('assignments', { userId: user.id, studentId: student.id, title: 'Contrôle de sciences', subject: 'Sciences', type: 'exam', dueDate: new Date(Date.now() + 9 * DAY).toISOString(), done: false });
  await insert('assignments', { userId: user.id, studentId: student.id, title: 'Poésie à réciter', subject: 'Arabe', type: 'homework', dueDate: new Date(Date.now() - 1 * DAY).toISOString(), done: true });

  const attRows = [
    { days: 1, status: 'present' }, { days: 2, status: 'present' }, { days: 3, status: 'late' },
    { days: 4, status: 'present' }, { days: 5, status: 'absent' }, { days: 8, status: 'present' },
  ];
  for (const a of attRows) {
    await insert('attendance', { userId: user.id, studentId: student.id, status: a.status, date: new Date(Date.now() - a.days * DAY).toISOString() });
  }

  const timetable = [
    { day: 0, subject: 'Mathématiques', startTime: '08:30', endTime: '09:30', room: 'A1' },
    { day: 0, subject: 'Français', startTime: '09:45', endTime: '10:45', room: 'A1' },
    { day: 1, subject: 'Sciences', startTime: '08:30', endTime: '09:30', room: 'Lab' },
    { day: 1, subject: 'Anglais', startTime: '10:00', endTime: '11:00', room: 'B2' },
    { day: 2, subject: 'Arabe', startTime: '08:30', endTime: '09:30', room: 'A1' },
    { day: 3, subject: 'Mathématiques', startTime: '08:30', endTime: '09:30', room: 'A1' },
    { day: 4, subject: 'Sport', startTime: '10:00', endTime: '11:30', room: 'Gym' },
  ];
  for (const t of timetable) {
    await insert('timetable', { userId: user.id, studentId: student.id, ...t });
  }

  console.log('Seed complete at', now());
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
