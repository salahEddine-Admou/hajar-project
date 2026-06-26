/**
 * Strips MongoDB operator injection from client-supplied data.
 *
 * Express parses query strings like `?role[$ne]=x` and JSON bodies into nested
 * objects. If those objects reach a Mongo query they become operators
 * ($ne, $gt, $where, …) — a NoSQL injection vector. We recursively remove any
 * key that starts with `$` or contains a `.` from req.body, req.query and
 * req.params before route handlers build database filters.
 */
function scrub(value) {
  if (Array.isArray(value)) {
    return value.map(scrub);
  }
  if (value && typeof value === 'object') {
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      clean[key] = scrub(val);
    }
    return clean;
  }
  return value;
}

export function sanitizeMongo(req, _res, next) {
  if (req.body) req.body = scrub(req.body);
  if (req.params) req.params = scrub(req.params);
  // req.query is a getter in some setups; mutate in place to stay compatible.
  if (req.query) {
    const cleaned = scrub(req.query);
    for (const key of Object.keys(req.query)) delete req.query[key];
    Object.assign(req.query, cleaned);
  }
  next();
}
