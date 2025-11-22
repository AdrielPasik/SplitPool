import { create } from 'zustand';
import type { Address } from '../types/models';

interface Expense {
  id: string;
  groupId: string;
  payer: Address;
  amount: bigint;
  participants: Address[];
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'applied';
  approvals: Address[];
  createdAt: number;
}

interface GroupCache {
  id: string;
  members: Address[];
  balances: Map<Address, bigint>;
  lastUpdated: number;
}

interface GroupsState {
  // Cache de grupos visitados recientemente
  groupsCache: Map<string, GroupCache>;
  
  // Gastos pendientes de aprobación
  pendingExpenses: Expense[];
  
  // Grupo actual siendo visualizado
  currentGroupId: string | null;
  
  // Actions
  setCurrentGroup: (groupId: string | null) => void;
  cacheGroup: (groupId: string, members: Address[], balances: Map<Address, bigint>) => void;
  getCachedGroup: (groupId: string) => GroupCache | undefined;
  addPendingExpense: (expense: Expense) => void;
  removePendingExpense: (expenseId: string) => void;
  getPendingExpensesForGroup: (groupId: string) => Expense[];
  clearCache: () => void;
}

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groupsCache: new Map(),
  pendingExpenses: [],
  currentGroupId: null,

  setCurrentGroup: (groupId) => set({ currentGroupId: groupId }),

  cacheGroup: (groupId, members, balances) =>
    set((state) => {
      const newCache = new Map(state.groupsCache);
      newCache.set(groupId, {
        id: groupId,
        members,
        balances,
        lastUpdated: Date.now(),
      });
      return { groupsCache: newCache };
    }),

  getCachedGroup: (groupId) => {
    const cache = get().groupsCache.get(groupId);
    // Cache válido por 5 minutos
    if (cache && Date.now() - cache.lastUpdated < 5 * 60 * 1000) {
      return cache;
    }
    return undefined;
  },

  addPendingExpense: (expense) =>
    set((state) => ({
      pendingExpenses: [...state.pendingExpenses, expense],
    })),

  removePendingExpense: (expenseId) =>
    set((state) => ({
      pendingExpenses: state.pendingExpenses.filter((e) => e.id !== expenseId),
    })),

  getPendingExpensesForGroup: (groupId) => {
    return get().pendingExpenses.filter((e) => e.groupId === groupId);
  },

  clearCache: () =>
    set({
      groupsCache: new Map(),
      pendingExpenses: [],
      currentGroupId: null,
    }),
}));