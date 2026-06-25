import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from './routes/auth.js';
import pregnancyRoutes from './routes/pregnancy.js';
import appointmentRoutes from './routes/appointments.js';
import medicationRoutes from './routes/medications.js';
import babyRoutes from './routes/babies.js';
import wellnessRoutes from './routes/wellness.js';
import recordRoutes from './routes/records.js';
import communityRoutes from './routes/community.js';
import aiRoutes from './routes/ai.js';
import analyticsRoutes from './routes/analytics.js';
import notificationRoutes from './routes/notifications.js';
import toolRoutes from './routes/tools.js';
import schoolRoutes from './routes/school.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Request logging (lightweight)
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  }
  next();
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'hajar-backend', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/pregnancy', pregnancyRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/babies', babyRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/school', schoolRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found', path: req.originalUrl }));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
