import 'dotenv/config';
import app from './app.js';
import { connect } from './db.js';

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

async function start() {
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI. Set it in your .env file.');
    process.exit(1);
  }
  try {
    await connect(MONGODB_URI);
    console.log('  Connected to MongoDB');
  } catch (err) {
    console.error('  MongoDB connection failed:', err.message);
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`\n  Hajar backend running on http://localhost:${PORT}`);
    console.log(`  Health check: http://localhost:${PORT}/api/health\n`);
  });
}

start();

export default app;
