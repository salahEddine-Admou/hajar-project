import app from '../src/app.js';
import { connect } from '../src/db.js';
import { isAuthConfigured } from '../src/middleware/auth.js';

if (!isAuthConfigured()) {
  // Log loudly but don't throw: /health and clear 500s from requireAuth are
  // more useful than a function that won't boot at all.
  console.error('WARNING: JWT_SECRET is missing or too short. Authenticated endpoints will return 500 until it is set.');
}

// Vercel serverless entry. Ensures the MongoDB connection is established
// (and reused on warm invocations) before handing the request to Express.
export default async function handler(req, res) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Missing MONGODB_URI environment variable' }));
    return;
  }
  try {
    await connect(uri);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Database connection failed', detail: err.message }));
    return;
  }
  return app(req, res);
}
