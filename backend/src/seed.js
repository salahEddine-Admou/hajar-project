import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connect, reset, insert, now } from './db.js';

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

  await reset();
  console.log('Database reset.');

  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await insert('users', {
    name: 'Amina Demo',
    email: 'demo@hajar.app',
    passwordHash,
    locale: 'en',
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

  console.log('Seed complete at', now());
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
