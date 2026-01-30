import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = process.env.DB_PATH || './db/marketplace.sqlite';
    db = new Database(resolve(dbPath));

    // Enable WAL mode for better concurrent reads
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initializeDatabase(): void {
  const database = getDb();
  const schemaPath = resolve(__dirname, '../../db/schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  database.exec(schema);
  console.log('✅ Database schema initialized');
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
