import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  // Fail fast: a missing secret means tokens could be forged with a known
  // default. Refuse to start instead of silently using an insecure value.
  throw new Error(
    'JWT_SECRET is not set. Add a long random value to your environment (e.g. `openssl rand -hex 32`).',
  );
}

if (SECRET.length < 16) {
  throw new Error('JWT_SECRET is too short. Use at least 32 random characters.');
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' },
  );
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const payload = jwt.verify(token, SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
