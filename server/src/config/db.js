import mongoose from 'mongoose';

/**
 * Single shared connection. Mongoose buffers commands until connected,
 * so route handlers never need to await this themselves.
 */
export async function connectDB(uri) {
  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () =>
    console.log('[db] connected to MongoDB')
  );
  mongoose.connection.on('error', (err) =>
    console.error('[db] connection error:', err.message)
  );
  mongoose.connection.on('disconnected', () =>
    console.warn('[db] disconnected')
  );

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: process.env.NODE_ENV !== 'production',
  });

  // autoIndex is off in production on purpose — building indexes on every
  // model access is not something a live app should do implicitly. Without
  // this, a schema-declared index (e.g. a text search index) would simply
  // never get created on a fresh production database, and the feature that
  // depends on it would fail silently instead of erroring.
  if (process.env.NODE_ENV === 'production') {
    await mongoose.syncIndexes();
  }

  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.connection.close();
}
