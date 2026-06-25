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
];

const models = {};

function model(name) {
  if (!models[name]) {
    const schema = new mongoose.Schema(
      { id: { type: String, index: true, unique: true } },
      { strict: false, versionKey: false, minimize: false },
    );
    models[name] = mongoose.model(name, schema, name);
  }
  return models[name];
}

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

export async function find(name, predicate = () => true) {
  const docs = await model(name).find({}).lean();
  return docs.map(clean).filter(predicate);
}

export async function findOne(name, predicate) {
  const docs = await find(name);
  return docs.find(predicate) || null;
}

export async function update(name, recordId, patch) {
  const updated = { ...patch, updatedAt: now() };
  await model(name).updateOne({ id: recordId }, { $set: updated });
  const doc = await model(name).findOne({ id: recordId }).lean();
  return clean(doc);
}

export async function remove(name, recordId) {
  const res = await model(name).deleteOne({ id: recordId });
  return res.deletedCount > 0;
}

export async function reset() {
  for (const name of COLLECTIONS) {
    await model(name).deleteMany({});
  }
}
