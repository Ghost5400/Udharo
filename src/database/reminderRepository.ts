import { getDatabase } from './schema';
import { Reminder, AddReminderInput } from '../types';
import * as Notifications from 'expo-notifications';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

function rowToReminder(row: any): Reminder {
  return {
    id: row.id,
    personId: row.person_id,
    transactionId: row.transaction_id ?? undefined,
    remindAt: row.remind_at,
    message: row.message ?? undefined,
    status: row.status,
    notificationId: row.notification_id ?? undefined,
    createdAt: row.created_at,
  };
}

// ─── Add Reminder ────────────────────────────────────────────────────────────
export async function addReminder(input: AddReminderInput, personName: string, amount?: number): Promise<Reminder> {
  const db = await getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();

  // Schedule local notification
  const notificationBody = input.message
    ?? (amount ? `₹${amount.toLocaleString('en-IN')} pending from ${personName}` : `Reminder for ${personName}`);

  let notificationId: string | undefined;
  try {
    notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Udharo Reminder 💰',
        body: notificationBody,
        data: { personId: input.personId, transactionId: input.transactionId },
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(input.remindAt) },
    });
  } catch (e) {
    console.warn('Could not schedule notification:', e);
  }

  await db.runAsync(
    `INSERT INTO reminders (id, person_id, transaction_id, remind_at, message, status, notification_id, created_at)
     VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?)`,
    id, input.personId, input.transactionId ?? null, input.remindAt, input.message ?? null, notificationId ?? null, now
  );

  const row = await db.getFirstAsync(`SELECT * FROM reminders WHERE id = ?`, id);
  return rowToReminder(row);
}

// ─── Get Reminders for Person ────────────────────────────────────────────────
export async function getRemindersForPerson(personId: string): Promise<Reminder[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM reminders WHERE person_id = ? ORDER BY remind_at ASC`,
    personId
  );
  return rows.map(rowToReminder);
}

// ─── Cancel Reminder ─────────────────────────────────────────────────────────
export async function cancelReminder(id: string): Promise<void> {
  const db = await getDatabase();
  const row = await db.getFirstAsync(`SELECT * FROM reminders WHERE id = ?`, id) as any;
  if (!row) return;

  if (row.notification_id) {
    try {
      await Notifications.cancelScheduledNotificationAsync(row.notification_id);
    } catch (e) {
      console.warn('Could not cancel notification:', e);
    }
  }

  await db.runAsync(
    `UPDATE reminders SET status = 'CANCELLED' WHERE id = ?`,
    id
  );
}

// ─── Mark Reminder as Fired ──────────────────────────────────────────────────
export async function markReminderFired(notificationId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE reminders SET status = 'FIRED' WHERE notification_id = ?`,
    notificationId
  );
}

// ─── Get Active Reminders ────────────────────────────────────────────────────
export async function getActiveReminders(): Promise<Reminder[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync(
    `SELECT * FROM reminders WHERE status = 'ACTIVE' ORDER BY remind_at ASC`
  );
  return rows.map(rowToReminder);
}
