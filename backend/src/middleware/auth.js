import jwt from 'jsonwebtoken';

const MIN_SECRET_LENGTH = 16;

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) return null;
  return secret;
}

/**
 * Bootstrap-time guard. Call this from the server/serverless entry point so a
 * misconfiguration is reported clearly — without crashing at import time, which
 * would also take down the unauthenticated /health endpoint.
 * @returns {boolean} true when a usable secret is configured
 */
export function isAuthConfigured() {
  return getSecret() !== null;
}

export function signToken(user) {
  const secret = getSecret();
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign(
    { sub: user.id, email: user.email },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' },
  );
}

export function requireAuth(req, res, next) {
  const secret = getSecret();
  if (!secret) {
    return res.status(500).json({ error: 'Server authentication is not configured' });
  }
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const payload = jwt.verify(token, secret);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
