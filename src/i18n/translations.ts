// ─── Udharo i18n Translation System ─────────────────────────────────────────

export type AppLanguage =
  | 'en' | 'hi' | 'kn' | 'mr' | 'ta' | 'te'
  | 'bn' | 'gu' | 'pa' | 'ml' | 'or' | 'ur' | 'as';

export interface Translations {
  // Common
  appName: string;
  back: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  close: string;
  loading: string;
  error: string;
  success: string;
  confirm: string;
  yes: string;
  no: string;
  ok: string;

  // Home
  home: string;
  netBalance: string;
  totalGiven: string;
  totalReceived: string;
  pendingRecovery: string;
  totalInflow: string;
  people: string;
  viewAll: string;
  noPeopleYet: string;
  noPeopleBody: string;
  addPerson: string;
  searchPeople: string;

  // Add Person
  addPersonTitle: string;
  fullName: string;
  fullNamePlaceholder: string;
  phoneOptional: string;
  phonePlaceholder: string;
  nameRequired: string;
  camera: string;
  gallery: string;
  personAlreadyExists: string;
  addAnyway: string;

  // Person Detail
  theyOweYou: string;
  youOweThem: string;
  allSettled: string;
  totalBalance: string;
  give: string;
  receive: string;
  remind: string;
  recentActivity: string;
  noTransactionsYet: string;
  noTransactionsBody: string;
  deletePerson: string;
  confirmDeletePerson: string;
  deletePersonBody: string;

  // Add Transaction
  newTransaction: string;
  with: string;
  enterAmount: string;
  selectPerson: string;
  date: string;
  noteOptional: string;
  notePlaceholder: string;
  addProof: string;
  voice: string;
  saveGiven: string;
  saveReceived: string;
  invalidAmount: string;
  selectPersonAlert: string;

  // Insights
  financialHealth: string;
  insights: string;
  pending: string;
  transactionActivity: string;
  recentActivity2: string;
  topPending: string;
  peopleWhoOweYou: string;
  allSettledBang: string;
  activeToday: string;
  overdue: string;
  dueSoon: string;
  monthlySummary: string;
  settlementRate: string;
  settled: string;
  debtHealthScore: string;
  excellent: string;
  good: string;
  fair: string;
  needsAttention: string;

  // Settings
  settings: string;
  manageYourLedger: string;
  language: string;
  darkMode: string;
  followSystemTheme: string;
  backupRestore: string;
  exportYourData: string;
  appLock: string;
  biometricActive: string;
  disabled: string;
  aboutUdharo: string;
  version: string;
  exportData: string;
  changePin: string;
  pinEnabled: string;

  // Language
  languageTitle: string;

  // App Lock
  appLockTitle: string;
  enterPin: string;
  setPin: string;
  confirmPin: string;
  pinMismatch: string;
  pinSet: string;
  wrongPin: string;
  forgotPin: string;

  // Backup
  backupTitle: string;
  backupNow: string;
  restoreBackup: string;
  lastBackup: string;
  never: string;
  backupSuccess: string;
  restoreSuccess: string;
  backupFailed: string;

  // About
  aboutTitle: string;
  createdBy: string;
  madeWithLove: string;
  feedback: string;
  sendFeedback: string;
  version1: string;

  // Reminder
  reminderTitle: string;
  setReminder: string;
  reminderDate: string;
  reminderMessage: string;
  reminderSaved: string;
}

// ─── English ────────────────────────────────────────────────────────────────
const en: Translations = {
  appName: 'Udharo',
  back: 'Back',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  edit: 'Edit',
  close: 'Close',
  loading: 'Loading...',
  error: 'Error',
  success: 'Success',
  confirm: 'Confirm',
  yes: 'Yes',
  no: 'No',
  ok: 'OK',

  home: 'Home',
  netBalance: 'Net Balance',
  totalGiven: 'Total Given',
  totalReceived: 'Total Received',
  pendingRecovery: 'Pending Recovery',
  totalInflow: 'Total Inflow',
  people: 'People',
  viewAll: 'View All',
  noPeopleYet: 'No people yet',
  noPeopleBody: 'Add your first person to start tracking money',
  addPerson: 'Add Person',
  searchPeople: 'Search people...',

  addPersonTitle: 'Add Person',
  fullName: 'FULL NAME *',
  fullNamePlaceholder: 'e.g. Rahul Sharma',
  phoneOptional: 'PHONE (OPTIONAL)',
  phonePlaceholder: '+91 98765 43210',
  nameRequired: 'Name is required',
  camera: 'Camera',
  gallery: 'Gallery',
  personAlreadyExists: 'Person already exists',
  addAnyway: 'Add Anyway',

  theyOweYou: 'They owe you',
  youOweThem: 'You owe them',
  allSettled: 'All settled',
  totalBalance: 'Total Balance',
  give: 'Give',
  receive: 'Receive',
  remind: 'Remind',
  recentActivity: 'Recent Activity',
  noTransactionsYet: 'No transactions yet',
  noTransactionsBody: 'Tap Give or Receive to add one',
  deletePerson: 'Delete',
  confirmDeletePerson: 'Delete person?',
  deletePersonBody: 'All their transactions will be hidden. This cannot be undone.',

  newTransaction: 'New Transaction',
  with: 'with',
  enterAmount: 'ENTER AMOUNT',
  selectPerson: 'SELECT PERSON',
  date: 'DATE',
  noteOptional: 'NOTE (OPTIONAL)',
  notePlaceholder: 'Lunch, Rent, Groceries…',
  addProof: 'ADD PROOF',
  voice: 'Voice',
  saveGiven: 'Save Given',
  saveReceived: 'Save Received',
  invalidAmount: 'Please enter a valid amount.',
  selectPersonAlert: 'Please select who this transaction is with.',

  financialHealth: 'Financial Health',
  insights: 'Insights',
  pending: 'Pending',
  transactionActivity: 'Transaction Activity',
  recentActivity2: 'Last 6 days of activity',
  topPending: 'Top Pending',
  peopleWhoOweYou: 'People who owe you',
  allSettledBang: 'All accounts settled!',
  activeToday: 'Active today',
  overdue: 'OVERDUE',
  dueSoon: 'DUE SOON',
  monthlySummary: 'Monthly Summary',
  settlementRate: 'Settlement Rate',
  settled: 'Settled',
  debtHealthScore: 'Debt Health Score',
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  needsAttention: 'Needs Attention',

  settings: 'Settings',
  manageYourLedger: 'Manage your personal ledger',
  language: 'Language',
  darkMode: 'Dark Mode',
  followSystemTheme: 'Follow system theme',
  backupRestore: 'Backup & Restore',
  exportYourData: 'Export your data',
  appLock: 'App Lock',
  biometricActive: 'PIN lock active',
  disabled: 'Disabled',
  aboutUdharo: 'About Udharo',
  version: 'Version 1.0.0',
  exportData: 'Export Data',
  changePin: 'Change PIN',
  pinEnabled: 'PIN lock active',

  languageTitle: 'Language',

  appLockTitle: 'App Lock',
  enterPin: 'Enter PIN',
  setPin: 'Set a PIN',
  confirmPin: 'Confirm PIN',
  pinMismatch: 'PINs do not match. Please try again.',
  pinSet: 'PIN set successfully!',
  wrongPin: 'Incorrect PIN. Please try again.',
  forgotPin: 'Forgot PIN? Reinstall the app to reset.',

  backupTitle: 'Backup & Restore',
  backupNow: 'Backup Now',
  restoreBackup: 'Restore Backup',
  lastBackup: 'Last backup',
  never: 'Never',
  backupSuccess: 'Backup saved successfully!',
  restoreSuccess: 'Data restored successfully!',
  backupFailed: 'Backup failed. Please try again.',

  aboutTitle: 'About Udharo',
  createdBy: 'Created by',
  madeWithLove: 'MADE WITH ❤️ IN INDIA',
  feedback: 'Feedback',
  sendFeedback: 'Send Feedback',
  version1: 'Version 1.0.0',

  reminderTitle: 'Set Reminder',
  setReminder: 'Set Reminder',
  reminderDate: 'Reminder Date',
  reminderMessage: 'Message (Optional)',
  reminderSaved: 'Reminder set successfully!',
};

// ─── Hindi ───────────────────────────────────────────────────────────────────
const hi: Translations = {
  ...en,
  appName: 'उधारो',
  back: 'वापस',
  save: 'सहेजें',
  cancel: 'रद्द करें',
  delete: 'हटाएं',
  home: 'होम',
  netBalance: 'कुल बकाया',
  totalGiven: 'कुल दिया',
  totalReceived: 'कुल मिला',
  pendingRecovery: 'बाकी वसूली',
  totalInflow: 'कुल आया',
  people: 'लोग',
  viewAll: 'सब देखें',
  noPeopleYet: 'कोई नहीं जोड़ा',
  noPeopleBody: 'पैसे ट्रैक करने के लिए पहला व्यक्ति जोड़ें',
  addPerson: 'व्यक्ति जोड़ें',
  searchPeople: 'लोगों को खोजें...',
  theyOweYou: 'वो आपके देनदार हैं',
  youOweThem: 'आप उनके देनदार हैं',
  allSettled: 'सब चुकता',
  give: 'दिया',
  receive: 'मिला',
  remind: 'याद दिलाएं',
  settings: 'सेटिंग्स',
  language: 'भाषा',
  darkMode: 'डार्क मोड',
  appLock: 'ऐप लॉक',
  aboutUdharo: 'उधारो के बारे में',
  insights: 'जानकारी',
  madeWithLove: 'MADE WITH ❤️ IN INDIA',
};

// ─── Kannada ─────────────────────────────────────────────────────────────────
const kn: Translations = {
  ...en,
  appName: 'ಉಧಾರೋ',
  back: 'ಹಿಂದೆ',
  save: 'ಉಳಿಸಿ',
  cancel: 'ರದ್ದು',
  delete: 'ಅಳಿಸಿ',
  home: 'ಮನೆ',
  netBalance: 'ನಿಕರ ಬಾಕಿ',
  totalGiven: 'ಒಟ್ಟು ಕೊಟ್ಟದ್ದು',
  totalReceived: 'ಒಟ್ಟು ಪಡೆದದ್ದು',
  people: 'ಜನರು',
  viewAll: 'ಎಲ್ಲ ನೋಡಿ',
  noPeopleYet: 'ಯಾರೂ ಇಲ್ಲ',
  noPeopleBody: 'ಹಣ ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಮೊದಲ ವ್ಯಕ್ತಿಯನ್ನು ಸೇರಿಸಿ',
  addPerson: 'ವ್ಯಕ್ತಿ ಸೇರಿಸಿ',
  searchPeople: 'ಜನರನ್ನು ಹುಡುಕಿ...',
  theyOweYou: 'ಅವರು ನಿಮಗೆ ಕೊಡಬೇಕು',
  youOweThem: 'ನೀವು ಅವರಿಗೆ ಕೊಡಬೇಕು',
  allSettled: 'ಎಲ್ಲ ಚುಕ್ತಾ',
  give: 'ಕೊಡಿ',
  receive: 'ಪಡೆಯಿರಿ',
  remind: 'ನೆನಪಿಸಿ',
  settings: 'ಸೆಟ್ಟಿಂಗ್ಸ್',
  language: 'ಭಾಷೆ',
  darkMode: 'ಡಾರ್ಕ್ ಮೋಡ್',
  appLock: 'ಆ್ಯಪ್ ಲಾಕ್',
  aboutUdharo: 'ಉಧಾರೋ ಬಗ್ಗೆ',
  insights: 'ಒಳನೋಟ',
  madeWithLove: 'MADE WITH ❤️ IN INDIA',
};

// ─── Marathi ─────────────────────────────────────────────────────────────────
const mr: Translations = {
  ...en,
  appName: 'उधारो',
  back: 'मागे',
  save: 'जतन करा',
  cancel: 'रद्द करा',
  delete: 'हटवा',
  home: 'मुख्यपृष्ठ',
  netBalance: 'एकूण शिल्लक',
  totalGiven: 'एकूण दिले',
  totalReceived: 'एकूण मिळाले',
  people: 'लोक',
  viewAll: 'सर्व पाहा',
  noPeopleYet: 'अजून कोणी नाही',
  addPerson: 'व्यक्ती जोडा',
  theyOweYou: 'ते तुमचे देणेकरी आहेत',
  youOweThem: 'तुम्ही त्यांचे देणेकरी आहेत',
  allSettled: 'सर्व चुकते',
  give: 'दिले',
  receive: 'मिळाले',
  settings: 'सेटिंग्ज',
  language: 'भाषा',
  insights: 'अंतर्दृष्टी',
  madeWithLove: 'MADE WITH ❤️ IN INDIA',
};

// ─── Tamil ───────────────────────────────────────────────────────────────────
const ta: Translations = {
  ...en,
  appName: 'உதாரோ',
  back: 'திரும்பு',
  save: 'சேமி',
  cancel: 'ரத்து',
  delete: 'நீக்கு',
  home: 'முகப்பு',
  netBalance: 'நிகர இருப்பு',
  totalGiven: 'மொத்தம் கொடுத்தது',
  totalReceived: 'மொத்தம் பெற்றது',
  people: 'நபர்கள்',
  viewAll: 'அனைத்தும் காண்க',
  addPerson: 'நபர் சேர்க்க',
  theyOweYou: 'அவர்கள் உங்களுக்கு கடன்பட்டார்கள்',
  youOweThem: 'நீங்கள் அவர்களுக்கு கடன்பட்டீர்கள்',
  allSettled: 'அனைத்தும் தீர்த்தது',
  give: 'கொடு',
  receive: 'பெறு',
  settings: 'அமைப்புகள்',
  language: 'மொழி',
  insights: 'நுண்ணறிவு',
  madeWithLove: 'MADE WITH ❤️ IN INDIA',
};

// ─── Telugu ──────────────────────────────────────────────────────────────────
const te: Translations = {
  ...en,
  appName: 'ఉధారో',
  back: 'వెనుకకు',
  save: 'సేవ్ చేయి',
  cancel: 'రద్దు',
  delete: 'తొలగించు',
  home: 'హోమ్',
  netBalance: 'నికర బ్యాలెన్స్',
  totalGiven: 'మొత్తం ఇచ్చినది',
  totalReceived: 'మొత్తం అందినది',
  people: 'వ్యక్తులు',
  viewAll: 'అన్నీ చూడు',
  addPerson: 'వ్యక్తిని జోడించు',
  theyOweYou: 'వారు మీకు బాకీ ఉన్నారు',
  youOweThem: 'మీరు వారికి బాకీ ఉన్నారు',
  allSettled: 'అన్నీ పరిష్కరించబడ్డాయి',
  give: 'ఇచ్చు',
  receive: 'తీసుకో',
  settings: 'సెట్టింగులు',
  language: 'భాష',
  insights: 'అంతర్దృష్టి',
  madeWithLove: 'MADE WITH ❤️ IN INDIA',
};

// ─── Bengali ─────────────────────────────────────────────────────────────────
const bn: Translations = {
  ...en,
  appName: 'উধারো',
  back: 'ফিরে',
  save: 'সংরক্ষণ',
  cancel: 'বাতিল',
  delete: 'মুছুন',
  home: 'হোম',
  netBalance: 'নেট ব্যালেন্স',
  totalGiven: 'মোট দেওয়া',
  totalReceived: 'মোট পাওয়া',
  people: 'মানুষ',
  viewAll: 'সব দেখুন',
  addPerson: 'ব্যক্তি যোগ করুন',
  theyOweYou: 'তারা আপনার কাছে ঋণী',
  youOweThem: 'আপনি তাদের কাছে ঋণী',
  allSettled: 'সব মিটিয়ে গেছে',
  give: 'দিন',
  receive: 'নিন',
  settings: 'সেটিং',
  language: 'ভাষা',
  insights: 'অন্তর্দৃষ্টি',
  madeWithLove: 'MADE WITH ❤️ IN INDIA',
};

// ─── Gujarati ────────────────────────────────────────────────────────────────
const gu: Translations = {
  ...en,
  appName: 'ઉધારો',
  back: 'પાછળ',
  save: 'સાચવો',
  cancel: 'રદ કરો',
  delete: 'ભૂંસો',
  home: 'હોમ',
  netBalance: 'ચોખ્ખું બેલેન્સ',
  totalGiven: 'કુલ આપ્યું',
  totalReceived: 'કુલ મળ્યું',
  people: 'લોકો',
  viewAll: 'બધું જુઓ',
  addPerson: 'વ્યક્તિ ઉમેરો',
  theyOweYou: 'તેઓ તમારા ઋણી છે',
  youOweThem: 'તમે તેમના ઋણી છો',
  allSettled: 'બધું ચૂકવ્યું',
  give: 'આપ્યું',
  receive: 'મળ્યું',
  settings: 'સેટિંગ્સ',
  language: 'ભાષા',
  insights: 'આંતરદૃષ્ટિ',
  madeWithLove: 'MADE WITH ❤️ IN INDIA',
};

// ─── Punjabi ─────────────────────────────────────────────────────────────────
const pa: Translations = {
  ...en,
  appName: 'ਉਧਾਰੋ',
  back: 'ਵਾਪਸ',
  save: 'ਸੇਵ ਕਰੋ',
  cancel: 'ਰੱਦ ਕਰੋ',
  delete: 'ਮਿਟਾਓ',
  home: 'ਹੋਮ',
  netBalance: 'ਕੁੱਲ ਬਕਾਇਆ',
  totalGiven: 'ਕੁੱਲ ਦਿੱਤਾ',
  totalReceived: 'ਕੁੱਲ ਮਿਲਿਆ',
  people: 'ਲੋਕ',
  viewAll: 'ਸਭ ਵੇਖੋ',
  addPerson: 'ਵਿਅਕਤੀ ਜੋੜੋ',
  theyOweYou: 'ਉਹ ਤੁਹਾਡੇ ਕਰਜ਼ਦਾਰ ਹਨ',
  youOweThem: 'ਤੁਸੀਂ ਉਨ੍ਹਾਂ ਦੇ ਕਰਜ਼ਦਾਰ ਹੋ',
  allSettled: 'ਸਭ ਚੁਕਾਇਆ',
  give: 'ਦਿੱਤਾ',
  receive: 'ਮਿਲਿਆ',
  settings: 'ਸੈਟਿੰਗਾਂ',
  language: 'ਭਾਸ਼ਾ',
  insights: 'ਸੂਝ',
  madeWithLove: 'MADE WITH ❤️ IN INDIA',
};

// ─── Malayalam ───────────────────────────────────────────────────────────────
const ml: Translations = {
  ...en,
  appName: 'ഉധാരോ',
  back: 'തിരികെ',
  save: 'സേവ് ചെയ്യൂ',
  cancel: 'റദ്ദ് ചെയ്യൂ',
  delete: 'ഇല്ലാതാക്കൂ',
  home: 'ഹോം',
  netBalance: 'മൊത്തം ബാക്കി',
  totalGiven: 'മൊത്തം കൊടുത്തത്',
  totalReceived: 'മൊത്തം കിട്ടിയത്',
  people: 'ആളുകൾ',
  viewAll: 'എല്ലാം കാണൂ',
  addPerson: 'ആൾ ചേർക്കൂ',
  theyOweYou: 'അവർ നിങ്ങൾക്ക് കടപ്പെട്ടിരിക്കുന്നു',
  youOweThem: 'നിങ്ങൾ അവർക്ക് കടപ്പെട്ടിരിക്കുന്നു',
  allSettled: 'എല്ലാം തീർചെയ്‍തു',
  give: 'കൊടുത്തു',
  receive: 'കിട്ടി',
  settings: 'ക്രമീകരണം',
  language: 'ഭാഷ',
  insights: 'ഉൾക്കാഴ്ച',
  madeWithLove: 'MADE WITH ❤️ IN INDIA',
};

// ─── Odia ────────────────────────────────────────────────────────────────────
const or: Translations = {
  ...en,
  appName: 'ଉଧାରୋ',
  back: 'ଫେରନ୍ତୁ',
  save: 'ସଞ୍ଚୟ କରନ୍ତୁ',
  cancel: 'ବାତିଲ',
  delete: 'ଅପସାରଣ',
  home: 'ହୋମ',
  totalGiven: 'ମୋଟ ଦିଆ',
  totalReceived: 'ମୋଟ ପାଇଲା',
  people: 'ଲୋକ',
  viewAll: 'ସବୁ ଦେଖ',
  addPerson: 'ବ୍ୟକ୍ତି ଯୋଡ଼ନ୍ତୁ',
  madeWithLove: 'MADE WITH ❤️ IN INDIA',
};

// ─── Urdu ────────────────────────────────────────────────────────────────────
const ur: Translations = {
  ...en,
  appName: 'ادھارو',
  back: 'واپس',
  save: 'محفوظ کریں',
  cancel: 'منسوخ',
  delete: 'مٹائیں',
  home: 'ہوم',
  netBalance: 'کل بقایا',
  totalGiven: 'کل دیا',
  totalReceived: 'کل ملا',
  people: 'لوگ',
  viewAll: 'سب دیکھیں',
  addPerson: 'شخص شامل کریں',
  theyOweYou: 'وہ آپ کے مقروض ہیں',
  youOweThem: 'آپ ان کے مقروض ہیں',
  allSettled: 'سب صاف',
  give: 'دیا',
  receive: 'ملا',
  settings: 'ترتیبات',
  language: 'زبان',
  madeWithLove: 'MADE WITH ❤️ IN INDIA',
};

// ─── Assamese ────────────────────────────────────────────────────────────────
const as: Translations = {
  ...en,
  appName: 'উধাৰো',
  back: 'উভতি যাওক',
  save: 'সংৰক্ষণ কৰক',
  cancel: 'বাতিল',
  delete: 'মচি দিয়ক',
  home: 'হোম',
  totalGiven: 'মুঠ দিয়া',
  totalReceived: 'মুঠ পোৱা',
  people: 'মানুহ',
  viewAll: 'সকলো চাওক',
  addPerson: 'ব্যক্তি যোগ কৰক',
  madeWithLove: 'MADE WITH ❤️ IN INDIA',
};

// ─── Translation Map ─────────────────────────────────────────────────────────
export const TRANSLATIONS: Record<AppLanguage, Translations> = {
  en, hi, kn, mr, ta, te, bn, gu, pa, ml, or, ur, as,
};

export const LANGUAGE_META: { code: AppLanguage; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
];
