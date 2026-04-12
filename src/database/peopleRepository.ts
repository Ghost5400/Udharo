import { getDatabase } from './schema';
import { Person, AddPersonInput, GlobalBalance } from '../types';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// ─── Row → Entity Mapper ─────────────────────────────────────────────────────
function rowToPerson(row: any): Person {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? undefined,
    photoUri: row.photo_uri ?? undefined,
    notes: row.notes ?? undefined,
    netBalance: row.net_balance ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isDeleted: row.is_deleted === 1,
  };
}

// ─── Get All People ──────────────────────────────────────────────────────────
export async function getAllPeople(): Promise<Person[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM people WHERE is_deleted = 0 ORDER BY updated_at DESC`
  );
  return rows.map(rowToPerson);
}

// ─── Get Person by ID ────────────────────────────────────────────────────────
export async function getPersonById(id: string): Promise<Person | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync(
    `SELECT * FROM people WHERE id = ? AND is_deleted = 0`,
    [id]
  );
  return row ? rowToPerson(row) : null;
}

// ─── Search People ───────────────────────────────────────────────────────────
export async function searchPeople(query: string): Promise<Person[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM people WHERE is_deleted = 0 AND (name LIKE ? OR phone LIKE ?) ORDER BY name ASC`,
    [`%${query}%`, `%${query}%`]
  );
  return rows.map(rowToPerson);
}

// ─── Add Person ──────────────────────────────────────────────────────────────
export async function addPerson(input: AddPersonInput): Promise<Person> {
  const db = await getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO people (id, name, phone, photo_uri, notes, net_balance, created_at, updated_at, is_deleted)
     VALUES (?, ?, ?, ?, NULL, 0, ?, ?, 0)`,
    [id, input.name.trim(), input.phone ?? null, input.photoUri ?? null, now, now]
  );

  return (await getPersonById(id))!;
}

// ─── Update Person Notes ─────────────────────────────────────────────────────
export async function updatePersonNotes(id: string, notes: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE people SET notes = ?, updated_at = ? WHERE id = ?`,
    [notes, new Date().toISOString(), id]
  );
}

// ─── Update Person ───────────────────────────────────────────────────────────
export async function updatePerson(id: string, input: Partial<AddPersonInput>): Promise<Person> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const fields: string[] = [];
  const values: any[] = [];

  if (input.name !== undefined) { fields.push('name = ?'); values.push(input.name.trim()); }
  if (input.phone !== undefined) { fields.push('phone = ?'); values.push(input.phone); }
  if (input.photoUri !== undefined) { fields.push('photo_uri = ?'); values.push(input.photoUri); }

  fields.push('updated_at = ?');
  values.push(now);
  values.push(id);

  await db.runAsync(
    `UPDATE people SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return (await getPersonById(id))!;
}

// ─── Update Person Balance ───────────────────────────────────────────────────
export async function recalculatePersonBalance(personId: string): Promise<number> {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{ received: number; given: number }>(
    `SELECT
      COALESCE(SUM(CASE WHEN type = 'RECEIVE' AND is_deleted = 0 THEN amount ELSE 0 END), 0) as received,
      COALESCE(SUM(CASE WHEN type = 'GIVE' AND is_deleted = 0 THEN amount ELSE 0 END), 0) as given
     FROM transactions
     WHERE person_id = ?`,
    [personId]
  );

  const netBalance = (result?.received ?? 0) - (result?.given ?? 0);

  await db.runAsync(
    `UPDATE people SET net_balance = ?, updated_at = ? WHERE id = ?`,
    [netBalance, new Date().toISOString(), personId]
  );

  return netBalance;
}

// ─── Soft Delete Person ──────────────────────────────────────────────────────
export async function deletePerson(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE people SET is_deleted = 1, updated_at = ? WHERE id = ?`,
    [new Date().toISOString(), id]
  );
}

// ─── Get Global Balance ──────────────────────────────────────────────────────
export async function getGlobalBalance(): Promise<GlobalBalance> {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{
    totalGiven: number;
    totalReceived: number;
    peopleCount: number;
  }>(
    `SELECT
      COALESCE(SUM(CASE WHEN t.type = 'GIVE' AND t.is_deleted = 0 THEN t.amount ELSE 0 END), 0) as totalGiven,
      COALESCE(SUM(CASE WHEN t.type = 'RECEIVE' AND t.is_deleted = 0 THEN t.amount ELSE 0 END), 0) as totalReceived,
      COUNT(DISTINCT p.id) as peopleCount
     FROM people p
     LEFT JOIN transactions t ON t.person_id = p.id
     WHERE p.is_deleted = 0`
  );

  const totalGiven = result?.totalGiven ?? 0;
  const totalReceived = result?.totalReceived ?? 0;

  const pendingResult = await db.getFirstAsync<{ pendingCount: number }>(
    `SELECT COUNT(*) as pendingCount FROM people WHERE is_deleted = 0 AND net_balance != 0`
  );

  return {
    totalGiven,
    totalReceived,
    netBalance: totalReceived - totalGiven,
    peopleCount: result?.peopleCount ?? 0,
    pendingCount: pendingResult?.pendingCount ?? 0,
  };
}

// ─── Check Duplicate ─────────────────────────────────────────────────────────
export async function checkDuplicateName(name: string, excludeId?: string): Promise<boolean> {
  const db = await getDatabase();
  const query = excludeId
    ? `SELECT COUNT(*) as count FROM people WHERE LOWER(name) = LOWER(?) AND is_deleted = 0 AND id != ?`
    : `SELECT COUNT(*) as count FROM people WHERE LOWER(name) = LOWER(?) AND is_deleted = 0`;
  const args = excludeId ? [name, excludeId] : [name];
  const result = await db.getFirstAsync<{ count: number }>(query, args);
  return (result?.count ?? 0) > 0;
}
