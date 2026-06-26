import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { sanitizeMongo } from './middleware/sanitize.js';
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

// Trust the platform proxy (Vercel/Render/etc.) so rate limiting and logging
// see the real client IP rather than the proxy's.
app.set('trust proxy', 1);

app.use(helmet());

// CORS: restrict to configured origins in production; allow all in dev.
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (no Origin header) and same-origin requests.
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
  }),
);

app.use(express.json({ limit: '5mb' }));
app.use(sanitizeMongo);

// Rate limiting. Auth and AI endpoints are the most sensitive to brute-force
// and abuse, so they get tighter limits than the general API.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' },
});
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

app.use('/api/', generalLimiter);

// Request logging (lightweight)
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  }
  next();
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'hajar-backend', time: new Date().toISOString() }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/pregnancy', pregnancyRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/babies', babyRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
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
