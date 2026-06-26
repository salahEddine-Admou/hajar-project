/**
 * MongoDB persistence layer (Mongoose).
 *
 * Keeps a stable, collection-oriented API (insert / find / findOne / update /
 * remove) so route handlers stay simple. Each logical collection maps to a
 * Mongoose model with a flexible (schema-less) shape. Documents carry a custom
 * string `id` (UUID) used throughout the app and by the mobile client, while
 * Mongo's internal `_id` is stripped from responses.
 */
import mongoose from 'mongoose';
import crypto from 'crypto';

const COLLECTIONS = [
  'users',
  'pregnancies',
  'appointments',
  'babies',
  'growthRecords',
  'vaccinations',
  'trackingLogs',
  'medications',
  'moodLogs',
  'screenings',
  'healthRecords',
  'communityPosts',
  'communityReplies',
  'chatMessages',
  'kickSessions',
  'contractions',
  'students',
  'grades',
  'assignments',
  'attendance',
  'timetable',
];

const models = {};

function model(name) {
  if (!models[name]) {
    const schema = new mongoose.Schema(
      { id: { type: String, index: true, unique: true } },
      // autoIndex is disabled so cold starts (e.g. serverless) don't trigger
      // index builds on every boot. Indexes are created explicitly via
      // ensureIndexes() (run from the seed/migration step).
      { strict: false, versionKey: false, minimize: false, autoIndex: false },
    );
    // Indexes for the foreign-key-style fields the app filters on. They are
    // harmless on collections that don't use a given field (values are null).
    schema.index({ userId: 1 });
    schema.index({ babyId: 1 });
    schema.index({ studentId: 1 });
    schema.index({ postId: 1 });
    schema.index({ email: 1 }, { sparse: true });
    models[name] = mongoose.model(name, schema, name);
  }
  return models[name];
}

/**
 * Builds/updates all indexes once. Call from a migration or the seed script
 * rather than on every request/boot.
 */
export async function ensureIndexes() {
  for (const name of COLLECTIONS) {
    await model(name).syncIndexes();
  }
}

// Fields a client must never be able to overwrite via an update payload.
const PROTECTED_FIELDS = ['id', '_id', 'userId', 'createdAt'];

let connectPromise = null;

export async function connect(uri) {
  // Reuse an existing (or in-flight) connection. On serverless platforms like
  // Vercel the module is cached between warm invocations, so this prevents
  // opening a new MongoDB connection on every request.
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!connectPromise) {
    mongoose.set('strictQuery', false);
    connectPromise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 15000 })
      .then((m) => {
        // Pre-register models so indexes are built.
        COLLECTIONS.forEach(model);
        return m.connection;
      })
      .catch((err) => {
        connectPromise = null;
        throw err;
      });
  }
  return connectPromise;
}

export function id() {
  return crypto.randomUUID();
}

export function now() {
  return new Date().toISOString();
}

function clean(doc) {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj._id;
  return obj;
}

export async function insert(name, doc) {
  const record = { id: id(), createdAt: now(), updatedAt: now(), ...doc };
  await model(name).create(record);
  return record;
}

/**
 * Query a collection with a MongoDB filter object (indexed server-side).
 * @param {string} name collection
 * @param {object} filter Mongo query (e.g. { userId, active: true })
 * @param {object} [options] { sort, limit }
 */
export async function find(name, filter = {}, options = {}) {
  let query = model(name).find(filter);
  if (options.sort) query = query.sort(options.sort);
  if (options.limit) query = query.limit(options.limit);
  const docs = await query.lean();
  return docs.map(clean);
}

export async function findOne(name, filter = {}) {
  const doc = await model(name).findOne(filter).lean();
  return clean(doc);
}

export async function update(name, recordId, patch) {
  const safe = { ...patch };
  for (const key of PROTECTED_FIELDS) delete safe[key];
  safe.updatedAt = now();
  await model(name).updateOne({ id: recordId }, { $set: safe });
  const doc = await model(name).findOne({ id: recordId }).lean();
  return clean(doc);
}

export async function remove(name, recordId) {
  const res = await model(name).deleteOne({ id: recordId });
  return res.deletedCount > 0;
}

export async function reset() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_RESET !== 'true') {
    throw new Error('reset() is disabled in production. Set ALLOW_RESET=true to override.');
  }
  for (const name of COLLECTIONS) {
    await model(name).deleteMany({});
  }
}
