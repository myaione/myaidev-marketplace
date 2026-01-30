/**
 * Database initialization script.
 * Run: npx tsx src/db/init.ts
 */
import 'dotenv/config';
import { initializeDatabase, closeDb } from './connection.js';

try {
  initializeDatabase();
  console.log('🎉 Database ready');
} catch (err) {
  console.error('❌ Database initialization failed:', err);
  process.exit(1);
} finally {
  closeDb();
}
