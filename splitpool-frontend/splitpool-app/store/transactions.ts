import { create } from 'zustand';
import type { Address } from '../types/models';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';
export type TransactionType = 
  | 'payShare'
  | 'createPool'
  | 'createGroup'
  | 'addExpense'
  | 'approveExpense'
  | 'settleDebt';

interface Transaction {
  hash: Address;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: number;
  from: Address;
  description: string;
  // Metadata específica por tipo
  metadata?: {
    poolAddress?: Address;
    groupId?: string;
    amount?: bigint;
    expenseId?: string;
  };
}

interface TransactionsState {
  // Transacciones recientes
  transactions: Transaction[];
  
  // Transacción pendiente actual
  pendingTransaction: Transaction | null;
  
  // Actions
  addTransaction: (tx: Omit<Transaction, 'timestamp' | 'status'>) => void;
  updateTransactionStatus: (hash: Address, status: TransactionStatus) => void;
  setPendingTransaction: (tx: Transaction | null) => void;
  getTransactionsByType: (type: TransactionType) => Transaction[];
  getRecentTransactions: (limit?: number) => Transaction[];
  clearTransactions: () => void;
}

export const useTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  pendingTransaction: null,

  addTransaction: (tx) => {
    const newTx: Transaction = {
      ...tx,
      timestamp: Date.now(),
      status: 'pending',
    };
    
    set((state) => ({
      transactions: [newTx, ...state.transactions].slice(0, 50), // Mantener últimas 50
      pendingTransaction: newTx,
    }));
  },

  updateTransactionStatus: (hash, status) =>
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.hash === hash ? { ...tx, status } : tx
      ),
      pendingTransaction:
        state.pendingTransaction?.hash === hash
          ? { ...state.pendingTransaction, status }
          : state.pendingTransaction,
    })),

  setPendingTransaction: (tx) => set({ pendingTransaction: tx }),

  getTransactionsByType: (type) => {
    return get().transactions.filter((tx) => tx.type === type);
  },

  getRecentTransactions: (limit = 10) => {
    return get().transactions.slice(0, limit);
  },

  clearTransactions: () =>
    set({
      transactions: [],
      pendingTransaction: null,
    }),
}));