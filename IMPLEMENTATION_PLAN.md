# Udharo — Implementation Plan & Progress Tracker

> **Version:** 1.0 | **Updated:** April 12, 2026

---

## Phase 1 — MVP (Weeks 1–5)

### ✅ Week 1: Foundation
- [x] Expo + TypeScript project scaffold
- [x] SQLite schema (people, transactions, attachments, reminders, app_settings)
- [x] Navigation skeleton (Root → Onboarding → Main Tabs → Stacks)
- [x] Design system tokens (colors, typography, spacing, shadows, border radius)
- [x] TypeScript types for all entities
- [x] Splash Screen with spring animation

### ✅ Week 2: People
- [x] Home Screen (balance card + people list + search + empty state)
- [x] Add Person Screen (photo picker, duplicate detection, validation)
- [x] PersonCard component (avatar fallback, color-coded balance)
- [x] Zustand store for people + global balance
- [x] People repository (CRUD, balance recalculation, search)

### ✅ Week 3: Transactions
- [x] Add Transaction Screen (Give/Receive toggle, quick amounts, person selector)
- [x] Person Detail Screen (balance card, Give/Receive/Remind actions, history)
- [x] TransactionItem component (smart icons, status badge, attachment indicator)
- [x] Transaction repository (atomic writes, grouping, balance update)
- [x] Zustand store for transactions

### ✅ Week 4: Proof + Balance Engine
- [x] Proof attachment (camera, gallery) in AddTransaction
- [x] Attachment repository with file copying to app sandbox
- [x] Balance calculation engine (recalculate on every mutation)
- [x] Global balance card on Home

### ✅ Week 5: Onboarding
- [x] Onboarding 1 (Track money — Given/Received illustration)
- [x] Onboarding 2 (Proof & fast entry — NEW screen)
- [x] Onboarding 3 (Never forget — reminder illustration)
- [x] First-launch detection via app_settings table

---

## Phase 2 — Enhancements (Weeks 6–9)

### ✅ Week 6: Insights
- [x] Insights Screen (bento metrics, bar chart, top pending)
- [x] Top pending query
- [x] Settlement pulse chart (dynamic bars from real data)

### ✅ Week 7: Reminders
- [x] Reminder Setup Screen (quick selectors + custom message)
- [x] Reminder repository (schedule, cancel, mark fired)
- [x] expo-notifications integration

### ⬜ Week 8 (TODO)
- [x] Language selection screen
- [ ] Dark mode (full implementation)  
- [x] Search/filter all people (AllPeople screen)
- [ ] Transaction edit flow

### ⬜ Week 9 (TODO)
- [x] Transaction Detail screen
- [ ] Empty states (polish)
- [ ] Undo toast after delete
- [ ] Error boundary

---

## Phase 3 — Advanced (Weeks 10–13)

### ⬜ Week 10
- [ ] App Lock setup screen (PIN entry)
- [ ] Biometric auth (expo-local-authentication)

### ⬜ Week 11
- [ ] Backup (JSON export via expo-sharing)
- [ ] Restore (JSON import from file picker)

### ⬜ Week 12
- [ ] Full dark mode
- [ ] Accessibility (minimum 48dp targets, screen reader labels)
- [ ] RTL support

### ⬜ Week 13
- [ ] Performance: paginate transaction queries
- [ ] App icon + splash screen assets
- [ ] App store metadata

---

## File Structure

```
src/
├── constants/
│   ├── colors.ts          ✅ Full design token system
│   └── theme.ts           ✅ Typography, spacing, shadows
├── types/
│   └── index.ts           ✅ All TypeScript types + nav params
├── database/
│   ├── schema.ts          ✅ SQLite init + schema
│   ├── peopleRepository.ts ✅ CRUD, balance, search
│   ├── transactionRepository.ts ✅ Atomic writes, grouping
│   ├── reminderRepository.ts   ✅ Scheduling, cancellation
│   └── settingsRepository.ts  ✅ Key-value settings
├── store/
│   └── index.ts           ✅ Zustand (people + transactions)
├── utils/
│   └── helpers.ts         ✅ Currency, dates, initials, colors
├── components/
│   ├── PersonCard.tsx     ✅
│   ├── TransactionItem.tsx ✅
│   └── ui/Button.tsx      ✅
├── navigation/
│   └── AppNavigator.tsx   ✅ Full tree
└── screens/
    ├── SplashScreen.tsx   ✅
    ├── onboarding/
    │   ├── Onboarding1.tsx ✅
    │   ├── Onboarding2.tsx ✅
    │   └── Onboarding3.tsx ✅
    ├── home/
    │   ├── HomeScreen.tsx  ✅
    │   ├── AddPersonScreen.tsx ✅
    │   ├── AddTransactionScreen.tsx ✅
    │   ├── PersonDetailScreen.tsx ✅
    │   └── ReminderSetupScreen.tsx ✅
    ├── insights/
    │   └── InsightsScreen.tsx ✅
    └── settings/
        └── SettingsScreen.tsx ✅
```

---

## Design Conventions (DO NOT CHANGE)

| Token | Value |
|---|---|
| Primary (green) | `#006b2c` |
| Given/Danger (red) | `#bb0112` |
| Received | `#006b2c` |
| Surface | `#f7f9fb` |
| Card bg | `#ffffff` |
| Font | Plus Jakarta Sans |
| Card radius | 24–32px |
| Button shape | pill (full radius) |
| Shadow | `0 8px 24px rgba(25,28,30,0.06)` |
