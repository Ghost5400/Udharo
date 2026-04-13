import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

import { Platform } from 'react-native';

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    const instance = await SQLite.openDatabaseAsync('udharo_v2.db');
    try {
      await initializeSchema(instance);
      db = instance;
    } catch (error) {
      console.error('Schema initialization failed:', error);
      try { await instance.closeAsync(); } catch (e) {}
      throw error;
    }
  }
  return db;
}

export async function initializeSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  // NOTE: expo-sqlite on web uses a SQLite WASM worker that does NOT support
  // multiple statements in a single execAsync call (throws Error Code 21 / SQLITE_MISUSE).
  // Every statement MUST be its own execAsync call.

  if (Platform.OS !== 'web') {
    await db.execAsync(`PRAGMA journal_mode = WAL;`);
    await db.execAsync(`PRAGMA foreign_keys = ON;`);
  } else {
    await db.execAsync(`PRAGMA journal_mode = MEMORY;`);
    await db.execAsync(`PRAGMA temp_store = MEMORY;`);
  }

  // People table
  await db.execAsync(`
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
  await db.execAsync(`
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
  await db.execAsync(`
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
  await db.execAsync(`
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
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Indexes — each must be its own call on web
  await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_transactions_person ON transactions(person_id);`);
  await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);`);
  await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_transactions_not_deleted ON transactions(is_deleted);`);
  await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_attachments_transaction ON attachments(transaction_id);`);
  await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_reminders_person ON reminders(person_id);`);
  await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);`);
  await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_people_not_deleted ON people(is_deleted);`);


  // Migrations for existing databases
  const migrations = [
    `ALTER TABLE people ADD COLUMN notes TEXT;`,
    `ALTER TABLE transactions ADD COLUMN tag TEXT;`,
  ];

  for (const migration of migrations) {
    try {
      await db.execAsync(migration);
    } catch (e) {
      // Column likely already exists — safe to ignore
    }
  }
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
