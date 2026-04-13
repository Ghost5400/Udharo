import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

let db: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    let instance: SQLite.SQLiteDatabase;
    try {
      instance = await SQLite.openDatabaseAsync('udharo_v2.db');
    } catch (openError) {
      // OPFS (Origin Private File System) is unavailable — likely missing
      // Cross-Origin-Opener-Policy / Cross-Origin-Embedder-Policy headers.
      // Fall back to an in-memory database so the app can still run.
      console.warn('OPFS unavailable, falling back to :memory: database:', openError);
      instance = await SQLite.openDatabaseAsync(':memory:');
    }
    try {
      await initializeSchema(instance);
      db = instance;
      return db;
    } catch (error) {
      console.error('Schema initialization failed:', error);
      dbPromise = null; // allow retry
      try { await instance.closeAsync(); } catch (e) {}
      throw error;
    }
  })();

  return dbPromise;
}

export async function initializeSchema(database: SQLite.SQLiteDatabase): Promise<void> {
  // On web, expo-sqlite uses a SQLite WASM worker (wa-sqlite + AccessHandlePoolVFS).
  // PRAGMA statements can trigger Error Code 21 (SQLITE_MISUSE) in the WASM worker,
  // so we skip them entirely on web — they are performance hints only and not
  // required for correctness.
  if (Platform.OS !== 'web') {
    await database.execAsync(`PRAGMA journal_mode = WAL;`);
    await database.execAsync(`PRAGMA foreign_keys = ON;`);
  }

  // Each CREATE TABLE/INDEX must be its own execAsync call on web.
  // The WASM worker processes one statement at a time.

  // People table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS people (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      photo_uri TEXT,
      notes TEXT,
      net_balance REAL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_deleted INTEGER DEFAULT 0
    );
  `);

  // Transactions table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('GIVE', 'RECEIVE')),
      amount REAL NOT NULL,
      note TEXT,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PARTIAL', 'SETTLED')),
      settled_amount REAL DEFAULT 0,
      tag TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_deleted INTEGER DEFAULT 0,
      FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
    );
  `);

  // Attachments table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('IMAGE', 'AUDIO')),
      file_uri TEXT NOT NULL,
      mime_type TEXT,
      file_size INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
    );
  `);

  // Reminders table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL,
      transaction_id TEXT,
      remind_at TEXT NOT NULL,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FIRED', 'CANCELLED')),
      notification_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
    );
  `);

  // App settings key-value store
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Indexes — each is its own call (required on web)
  await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_transactions_person ON transactions(person_id);`);
  await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);`);
  await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_transactions_not_deleted ON transactions(is_deleted);`);
  await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_attachments_transaction ON attachments(transaction_id);`);
  await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_reminders_person ON reminders(person_id);`);
  await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);`);
  await database.execAsync(`CREATE INDEX IF NOT EXISTS idx_people_not_deleted ON people(is_deleted);`);

  // Migrations for existing databases — errors are ignored (column already exists)
  const migrations = [
    `ALTER TABLE people ADD COLUMN notes TEXT;`,
    `ALTER TABLE transactions ADD COLUMN tag TEXT;`,
  ];
  for (const migration of migrations) {
    try {
      await database.execAsync(migration);
    } catch (e) {
      // safe to ignore: column already exists
    }
  }
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
