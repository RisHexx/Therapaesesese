const mongoose = require('mongoose');

/**
 * Run index maintenance to clean up stray/legacy indexes that conflict
 * with the current schema. In some environments, a unique index on
 * `username` might have been created historically. Our current schema
 * does not use `username`, so attempts to insert docs with `username: null`
 * will trigger E11000 duplicate key errors.
 */
async function runIndexFixes() {
  try {
    // Ensure we're connected
    if (mongoose.connection.readyState !== 1) {
      // If not connected yet, wait a bit and retry once
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const db = mongoose.connection.db;
    if (!db) return;

    const collection = db.collection('users');
    const indexes = await collection.indexes();

    // Find any index on `username` (commonly named 'username_1')
    const usernameIndex = indexes.find((idx) => idx.name === 'username_1');
    if (usernameIndex) {
      try {
        await collection.dropIndex('username_1');
        console.log('Dropped stray index: username_1');
      } catch (e) {
        // If failing to drop, log and continue (non-fatal)
        console.warn('Failed to drop index username_1:', e?.message || e);
      }
    }

    // Optionally ensure email has a unique index as per schema
    // Mongoose will create it if needed when ensureIndexes runs,
    // so we generally don't need to manage it manually here.
  } catch (err) {
    console.warn('Index maintenance error (non-fatal):', err?.message || err);
  }
}

module.exports = runIndexFixes;
