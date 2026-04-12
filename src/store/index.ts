import { create } from 'zustand';
import {
  Person, AddPersonInput, GlobalBalance, Transaction,
  TransactionGroup, AddTransactionInput, Attachment,
} from '../types';
import * as PeopleRepo from '../database/peopleRepository';
import * as TxnRepo from '../database/transactionRepository';

// ─── People Store ─────────────────────────────────────────────────────────────
interface PeopleState {
  people: Person[];
  globalBalance: GlobalBalance | null;
  isLoading: boolean;
  error: string | null;

  loadPeople: () => Promise<void>;
  addPerson: (input: AddPersonInput) => Promise<Person>;
  updatePerson: (id: string, input: Partial<AddPersonInput>) => Promise<Person>;
  updatePersonNotes: (id: string, notes: string) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  searchPeople: (query: string) => Promise<Person[]>;
  refreshBalance: () => Promise<void>;
}

export const usePeopleStore = create<PeopleState>((set, get) => ({
  people: [],
  globalBalance: null,
  isLoading: false,
  error: null,

  loadPeople: async () => {
    set({ isLoading: true, error: null });
    try {
      const [people, globalBalance] = await Promise.all([
        PeopleRepo.getAllPeople(),
        PeopleRepo.getGlobalBalance(),
      ]);
      set({ people, globalBalance, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  addPerson: async (input) => {
    const person = await PeopleRepo.addPerson(input);
    set(state => ({ people: [person, ...state.people] }));
    get().refreshBalance();
    return person;
  },

  updatePerson: async (id, input) => {
    const updated = await PeopleRepo.updatePerson(id, input);
    set(state => ({
      people: state.people.map(p => (p.id === id ? updated : p)),
    }));
    return updated;
  },

  updatePersonNotes: async (id, notes) => {
    await PeopleRepo.updatePersonNotes(id, notes);
    set(state => ({
      people: state.people.map(p => (p.id === id ? { ...p, notes, updatedAt: new Date().toISOString() } : p)),
    }));
  },

  deletePerson: async (id) => {
    await PeopleRepo.deletePerson(id);
    set(state => ({
      people: state.people.filter(p => p.id !== id),
    }));
    get().refreshBalance();
  },

  searchPeople: async (query) => {
    return PeopleRepo.searchPeople(query);
  },

  refreshBalance: async () => {
    const globalBalance = await PeopleRepo.getGlobalBalance();
    set({ globalBalance });
  },
}));

// ─── Transactions Store ───────────────────────────────────────────────────────
interface TransactionsState {
  transactionsByPerson: Map<string, TransactionGroup[]>;
  isLoading: boolean;
  error: string | null;

  loadTransactions: (personId: string) => Promise<void>;
  addTransaction: (input: AddTransactionInput) => Promise<Transaction>;
  updateTransaction: (id: string, personId: string, updates: Partial<Pick<Transaction, 'amount' | 'note' | 'date' | 'type'>>) => Promise<void>;
  deleteTransaction: (id: string, personId: string) => Promise<void>;
  getAttachments: (transactionId: string) => Promise<Attachment[]>;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactionsByPerson: new Map(),
  isLoading: false,
  error: null,

  loadTransactions: async (personId) => {
    set({ isLoading: true, error: null });
    try {
      const groups = await TxnRepo.getGroupedTransactions(personId);
      set(state => {
        const map = new Map(state.transactionsByPerson);
        map.set(personId, groups);
        return { transactionsByPerson: map, isLoading: false };
      });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  addTransaction: async (input) => {
    const txn = await TxnRepo.addTransaction(input);
    // Reload transactions for this person
    await get().loadTransactions(input.personId);
    // Also refresh person in people store
    const updatedPerson = await PeopleRepo.getPersonById(input.personId);
    if (updatedPerson) {
      usePeopleStore.setState(s => ({
        people: s.people.map(p => p.id === input.personId ? updatedPerson : p),
      }));
      usePeopleStore.getState().refreshBalance();
    }
    return txn;
  },

  updateTransaction: async (id, personId, updates) => {
    await TxnRepo.updateTransaction(id, updates);
    await get().loadTransactions(personId);
    const updatedPerson = await PeopleRepo.getPersonById(personId);
    if (updatedPerson) {
      usePeopleStore.setState(s => ({
        people: s.people.map(p => p.id === personId ? updatedPerson : p),
      }));
      usePeopleStore.getState().refreshBalance();
    }
  },

  deleteTransaction: async (id, personId) => {
    await TxnRepo.deleteTransaction(id);
    await get().loadTransactions(personId);
    const updatedPerson = await PeopleRepo.getPersonById(personId);
    if (updatedPerson) {
      usePeopleStore.setState(s => ({
        people: s.people.map(p => p.id === personId ? updatedPerson : p),
      }));
      usePeopleStore.getState().refreshBalance();
    }
  },

  getAttachments: async (transactionId) => {
    return TxnRepo.getAttachmentsForTransaction(transactionId);
  },
}));
