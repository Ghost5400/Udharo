import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getDatabase } from './schema';
import { setLastBackupAt } from './settingsRepository';

// SDK 55: documentDirectory is on the module directly
const docDir: string = (FileSystem as any).documentDirectory ?? '';

interface BackupData {
  version: number;
  exportedAt: string;
  people: any[];
  transactions: any[];
  attachments: any[];
  reminders: any[];
  settings: any[];
}

// ─── Export Backup ────────────────────────────────────────────────────────────
export async function exportBackup(): Promise<string> {
  const db = await getDatabase();

  const [people, transactions, attachments, reminders, settings] = await Promise.all([
    db.getAllAsync('SELECT * FROM people'),
    db.getAllAsync('SELECT * FROM transactions'),
    db.getAllAsync('SELECT * FROM attachments'),
    db.getAllAsync('SELECT * FROM reminders'),
    db.getAllAsync('SELECT * FROM app_settings'),
  ]);

  const backup: BackupData = {
    version: 2,
    exportedAt: new Date().toISOString(),
    people,
    transactions,
    attachments,
    reminders,
    settings,
  };

  const backupDir = `${docDir}backups/`;
  const dirInfo = await (FileSystem as any).getInfoAsync(backupDir);
  if (!dirInfo.exists) {
    await (FileSystem as any).makeDirectoryAsync(backupDir, { intermediates: true });
  }

  const filename = `udharo_backup_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
  const fileUri = `${backupDir}${filename}`;

  await (FileSystem as any).writeAsStringAsync(fileUri, JSON.stringify(backup, null, 2));

  await setLastBackupAt(new Date().toISOString());

  return fileUri;
}

// ─── Share Backup File ────────────────────────────────────────────────────────
export async function shareBackup(): Promise<void> {
  const fileUri = await exportBackup();
  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Share Udharo Backup',
    });
  } else {
    throw new Error('Sharing is not available on this device.');
  }
}

// ─── Import / Restore Backup ──────────────────────────────────────────────────
export async function importBackup(fileUri: string): Promise<void> {
  const content = await (FileSystem as any).readAsStringAsync(fileUri);

  const backup: BackupData = JSON.parse(content);

  if (!backup.version || !backup.people || !backup.transactions) {
    throw new Error('Invalid backup file. Please select a valid Udharo backup.');
  }

  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    // Clear all existing data (in dependency order)
    await db.runAsync('DELETE FROM reminders');
    await db.runAsync('DELETE FROM attachments');
    await db.runAsync('DELETE FROM transactions');
    await db.runAsync('DELETE FROM people');

    // Restore people
    for (const p of backup.people) {
      await db.runAsync(
        `INSERT OR REPLACE INTO people (id, name, phone, photo_uri, notes, net_balance, created_at, updated_at, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.phone ?? null, p.photo_uri ?? null, p.notes ?? null, p.net_balance, p.created_at, p.updated_at, p.is_deleted]
      );
    }

    // Restore transactions
    for (const t of backup.transactions) {
      await db.runAsync(
        `INSERT OR REPLACE INTO transactions
         (id, person_id, type, amount, note, date, status, settled_amount, tag, created_at, updated_at, is_deleted)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.id, t.person_id, t.type, t.amount, t.note, t.date, t.status, t.settled_amount, t.tag ?? null, t.created_at, t.updated_at, t.is_deleted]
      );
    }

    // Restore attachments
    for (const a of backup.attachments ?? []) {
      await db.runAsync(
        `INSERT OR REPLACE INTO attachments (id, transaction_id, type, file_uri, mime_type, file_size, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [a.id, a.transaction_id, a.type, a.file_uri, a.mime_type, a.file_size, a.created_at]
      );
    }

    // Restore reminders (added in v2)
    for (const r of backup.reminders ?? []) {
      await db.runAsync(
        `INSERT OR REPLACE INTO reminders (id, person_id, transaction_id, remind_at, message, status, notification_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [r.id, r.person_id, r.transaction_id ?? null, r.remind_at, r.message ?? null, r.status, r.notification_id ?? null, r.created_at]
      );
    }

    // Restore settings (skip sensitive keys like appPin for security)
    for (const s of backup.settings ?? []) {
      if (s.key === 'appPin') continue; // Never restore PIN from backup
      await db.runAsync(
        `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`,
        [s.key, s.value]
      );
    }
  });
}

// ─── Get Backup Stats ─────────────────────────────────────────────────────────
export async function getBackupStats(): Promise<{ peopleCount: number; transactionCount: number }> {
  const db = await getDatabase();
  const [p, t] = await Promise.all([
    db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM people WHERE is_deleted = 0'),
    db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM transactions WHERE is_deleted = 0'),
  ]);
  return { peopleCount: p?.count ?? 0, transactionCount: t?.count ?? 0 };
}
