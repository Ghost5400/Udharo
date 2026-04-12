import { AppSettings, AppLanguage, AppTheme } from '../types';
import { getDatabase } from './schema';

const DEFAULTS: AppSettings = {
  language: 'en',
  theme: 'light',
  appLockEnabled: false,
  onboardingComplete: false,
};

async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_settings WHERE key = ?`,
    [key]
  );
  return row?.value ?? null;
}

async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`,
    [key, value]
  );
}

export async function getAppSettings(): Promise<AppSettings> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    `SELECT key, value FROM app_settings`
  );
  const map = new Map(rows.map(r => [r.key, r.value]));
  return {
    language: (map.get('language') as AppLanguage) ?? DEFAULTS.language,
    theme: (map.get('theme') as AppTheme) ?? DEFAULTS.theme,
    appLockEnabled: map.get('appLockEnabled') === 'true',
    appLockType: (map.get('appLockType') as any) ?? undefined,
    onboardingComplete: map.get('onboardingComplete') === 'true',
    lastBackupAt: map.get('lastBackupAt') ?? undefined,
    appPin: map.get('appPin') ?? undefined,
  };
}

export async function setOnboardingComplete(): Promise<void> {
  await setSetting('onboardingComplete', 'true');
}

export async function setLanguage(lang: AppLanguage): Promise<void> {
  await setSetting('language', lang);
}

export async function setTheme(theme: AppTheme): Promise<void> {
  await setSetting('theme', theme);
}

export async function setAppLock(enabled: boolean, type?: 'pin' | 'biometric'): Promise<void> {
  await setSetting('appLockEnabled', String(enabled));
  if (type) await setSetting('appLockType', type);
}

export async function setPin(pin: string): Promise<void> {
  // Simple storage — in production use expo-secure-store
  await setSetting('appPin', pin);
  await setSetting('appLockEnabled', 'true');
  await setSetting('appLockType', 'pin');
}

export async function clearPin(): Promise<void> {
  await setSetting('appPin', '');
  await setSetting('appLockEnabled', 'false');
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await getSetting('appPin');
  return stored === pin;
}

export async function setLastBackupAt(isoDate: string): Promise<void> {
  await setSetting('lastBackupAt', isoDate);
}
