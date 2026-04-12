// ─── Core Entity Types ────────────────────────────────────────────────────────

export type TransactionType = 'GIVE' | 'RECEIVE';
export type TransactionStatus = 'PENDING' | 'PARTIAL' | 'SETTLED';
export type AttachmentType = 'IMAGE' | 'AUDIO';
export type ReminderStatus = 'ACTIVE' | 'FIRED' | 'CANCELLED';

export interface Person {
  id: string;
  name: string;
  phone?: string;
  photoUri?: string;
  notes?: string;
  netBalance: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface Transaction {
  id: string;
  personId: string;
  type: TransactionType;
  amount: number;
  note?: string;
  date: string;
  status: TransactionStatus;
  settledAmount: number;
  tag?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface Attachment {
  id: string;
  transactionId: string;
  type: AttachmentType;
  fileUri: string;
  mimeType?: string;
  fileSize?: number;
  createdAt: string;
}

export interface Reminder {
  id: string;
  personId: string;
  transactionId?: string;
  remindAt: string;
  message?: string;
  status: ReminderStatus;
  notificationId?: string;
  createdAt: string;
}

// ─── Computed/Derived Types ──────────────────────────────────────────────────

export type BalanceStatus = 'THEY_OWE_YOU' | 'YOU_OWE_THEM' | 'SETTLED';

export interface PersonBalance {
  totalGiven: number;
  totalReceived: number;
  netBalance: number;
  status: BalanceStatus;
}

export interface GlobalBalance {
  totalGiven: number;
  totalReceived: number;
  netBalance: number;
  peopleCount: number;
  pendingCount: number;
}

export interface TransactionWithPerson extends Transaction {
  person: Person;
}

export interface PersonWithTransactions extends Person {
  transactions: Transaction[];
  attachments?: Attachment[];
  reminders?: Reminder[];
}

export interface TransactionGroup {
  date: string;
  dateKey: string;
  transactions: (Transaction & { attachments?: Attachment[] })[];
}

// ─── Form Input Types ────────────────────────────────────────────────────────

export interface AddPersonInput {
  name: string;
  phone?: string;
  photoUri?: string;
}

export interface AddTransactionInput {
  personId: string;
  type: TransactionType;
  amount: number;
  note?: string;
  date: string;
  tag?: string;
  attachments?: AttachmentInput[];
}

export interface AttachmentInput {
  type: AttachmentType;
  fileUri: string;
  mimeType?: string;
  fileSize?: number;
}

export interface AddReminderInput {
  personId: string;
  transactionId?: string;
  remindAt: string;
  message?: string;
}

// ─── App Settings ────────────────────────────────────────────────────────────

export type AppLanguage =
  | 'en' | 'hi' | 'kn' | 'mr' | 'ta' | 'te'
  | 'bn' | 'gu' | 'pa' | 'ml' | 'or' | 'ur' | 'as';

export type AppTheme = 'light' | 'dark' | 'system';

export interface AppSettings {
  language: AppLanguage;
  theme: AppTheme;
  appLockEnabled: boolean;
  appLockType?: 'pin' | 'biometric';
  appPin?: string;
  onboardingComplete: boolean;
  lastBackupAt?: string;
}

// ─── Transaction Tags ────────────────────────────────────────────────────────
export const TRANSACTION_TAGS = [
  'Food', 'Rent', 'Travel', 'Groceries', 'Medical',
  'Utilities', 'Entertainment', 'Shopping', 'Education', 'Other',
] as const;
export type TransactionTag = typeof TRANSACTION_TAGS[number];

// ─── Navigation Types ────────────────────────────────────────────────────────

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  AppLock: { mode: 'setup' | 'verify' | 'change' };
  Main: undefined;
};

export type OnboardingStackParamList = {
  Onboarding1: undefined;
  Onboarding2: undefined;
  Onboarding3: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  InsightsTab: undefined;
  SettingsTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  PersonDetail: { personId: string };
  TransactionDetail: { transactionId: string };
  AddPerson: { mode?: 'add' | 'edit'; personId?: string };
  AddTransaction: { personId?: string; type?: TransactionType };
  AllPeople: undefined;
  ReminderSetup: { personId: string; transactionId?: string };
};

export type SettingsStackParamList = {
  Settings: undefined;
  Language: undefined;
  AppLockSetup: { mode?: 'setup' | 'change' };
  BackupRestore: undefined;
  About: undefined;
};
