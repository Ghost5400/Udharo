import { getDatabase } from './schema';
import { recalculatePersonBalance } from './peopleRepository';
import {
  Transaction,
  Attachment,
  AddTransactionInput,
  AttachmentInput,
  TransactionGroup,
} from '../types';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// ─── Row → Entity Mappers ────────────────────────────────────────────────────
function rowToTransaction(row: any): Transaction {
  return {
    id: row.id,
    personId: row.person_id,
    type: row.type,
    amount: row.amount,
    note: row.note ?? undefined,
    date: row.date,
    status: row.status,
    settledAmount: row.settled_amount ?? 0,
    tag: row.tag ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isDeleted: row.is_deleted === 1,
  };
}

function rowToAttachment(row: any): Attachment {
  return {
    id: row.id,
    transactionId: row.transaction_id,
    type: row.type,
    fileUri: row.file_uri,
    mimeType: row.mime_type ?? undefined,
    fileSize: row.file_size ?? undefined,
    createdAt: row.created_at,
  };
}

// ─── Get Transactions for a Person ──────────────────────────────────────────
export async function getTransactionsForPerson(personId: string): Promise<Transaction[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM transactions WHERE person_id = ? AND is_deleted = 0 ORDER BY date DESC, created_at DESC`,
    personId
  );
  return rows.map(rowToTransaction);
}

// ─── Get Grouped Transactions (for date-grouped history UI) ──────────────────
export async function getGroupedTransactions(personId: string): Promise<TransactionGroup[]> {
  const transactions = await getTransactionsForPerson(personId);

  const groupMap = new Map<string, Transaction[]>();

  for (const txn of transactions) {
    const dateKey = txn.date.substring(0, 10); // "2023-10-20"
    if (!groupMap.has(dateKey)) groupMap.set(dateKey, []);
    groupMap.get(dateKey)!.push(txn);
  }

  const groups: TransactionGroup[] = [];
  for (const [dateKey, txns] of groupMap.entries()) {
    const d = new Date(dateKey);
    const formatted = d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    groups.push({ date: formatted, dateKey, transactions: txns });
  }

  return groups.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

// ─── Get Transaction by ID ───────────────────────────────────────────────────
export async function getTransactionById(id: string): Promise<Transaction | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    `SELECT * FROM transactions WHERE id = ? AND is_deleted = 0`,
    id
  );
  return row ? rowToTransaction(row) : null;
}

// ─── Add Transaction + Attachments ───────────────────────────────────────────
export async function addTransaction(input: AddTransactionInput): Promise<Transaction> {
  const db = await getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    // Insert transaction (now includes tag)
    await db.runAsync(
      `INSERT INTO transactions (id, person_id, type, amount, note, date, status, settled_amount, tag, created_at, updated_at, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', 0, ?, ?, ?, 0)`,
      id, input.personId, input.type, input.amount, input.note ?? null, input.date, input.tag ?? null, now, now
    );

    // Save attachments
    if (input.attachments && input.attachments.length > 0) {
      for (const att of input.attachments) {
        await saveAttachment(db, id, att);
      }
    }
  });

  // Recalculate person balance
  await recalculatePersonBalance(input.personId);

  return (await getTransactionById(id))!;
}

// ─── Save Attachment (internal) ──────────────────────────────────────────────
async function saveAttachment(db: any, transactionId: string, att: AttachmentInput): Promise<void> {
  const attId = uuidv4();
  const now = new Date().toISOString();

  // File copy is only supported on native — FileSystem is unavailable / has no
  // documentDirectory on web. Skip silently and store the original URI.
  let finalUri = att.fileUri;
  if (Platform.OS !== 'web') {
    try {
      const proofDir = `${FileSystem.documentDirectory}proof/`;
      const dirInfo = await FileSystem.getInfoAsync(proofDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(proofDir, { intermediates: true });
      }
      const ext = att.fileUri.split('.').pop()?.split('?')[0] ?? (att.type === 'IMAGE' ? 'jpg' : 'm4a');
      const destUri = `${proofDir}${attId}.${ext}`;
      await FileSystem.copyAsync({ from: att.fileUri, to: destUri });
      finalUri = destUri;
    } catch {
      // Copy failed (e.g., already in sandbox or permissions issue) — keep original URI
    }
  }

  await db.runAsync(
    `INSERT INTO attachments (id, transaction_id, type, file_uri, mime_type, file_size, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    attId, transactionId, att.type, finalUri, att.mimeType ?? null, att.fileSize ?? null, now
  );
}

// ─── Get Attachments for Transaction ────────────────────────────────────────
export async function getAttachmentsForTransaction(transactionId: string): Promise<Attachment[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM attachments WHERE transaction_id = ? ORDER BY created_at ASC`,
    transactionId
  );
  return rows.map(rowToAttachment);
}

// ─── Update Transaction ──────────────────────────────────────────────────────
export async function updateTransaction(
  id: string,
  updates: Partial<Pick<Transaction, 'amount' | 'note' | 'date' | 'type' | 'tag'>>
): Promise<Transaction> {
  const db = await getDatabase();
  const txn = await getTransactionById(id);
  if (!txn) throw new Error('Transaction not found');

  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.amount !== undefined) { fields.push('amount = ?'); values.push(updates.amount); }
  if (updates.note !== undefined) { fields.push('note = ?'); values.push(updates.note); }
  if (updates.date !== undefined) { fields.push('date = ?'); values.push(updates.date); }
  if (updates.type !== undefined) { fields.push('type = ?'); values.push(updates.type); }
  if (updates.tag !== undefined) { fields.push('tag = ?'); values.push(updates.tag); }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  await db.runAsync(`UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`, ...values);

  // Recalculate balance since amount or type changed
  await recalculatePersonBalance(txn.personId);

  return (await getTransactionById(id))!;
}

// ─── Soft Delete Transaction ─────────────────────────────────────────────────
export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDatabase();
  const txn = await getTransactionById(id);
  if (!txn) return;

  await db.runAsync(
    `UPDATE transactions SET is_deleted = 1, updated_at = ? WHERE id = ?`,
    new Date().toISOString(), id
  );

  await recalculatePersonBalance(txn.personId);
}

// ─── Get Recent Transactions (global, for Insights) ──────────────────────────
export async function getRecentTransactions(limit = 10): Promise<Transaction[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM transactions WHERE is_deleted = 0 ORDER BY date DESC, created_at DESC LIMIT ?`,
    limit
  );
  return rows.map(rowToTransaction);
}

// ─── Get Top Pending People (for Insights) ───────────────────────────────────
export async function getTopPendingPeople(limit = 5): Promise<{ personId: string; name: string; netBalance: number }[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT p.id as personId, p.name, p.net_balance as netBalance
     FROM people p
     WHERE p.is_deleted = 0 AND p.net_balance < 0
     ORDER BY p.net_balance ASC
     LIMIT ?`,
    limit
  );
  return rows as any[];
}
