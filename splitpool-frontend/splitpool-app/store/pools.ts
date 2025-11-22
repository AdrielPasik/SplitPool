import { create } from 'zustand';
import type { Address } from '../types/models';

interface PoolCache {
  address: Address;
  merchant: Address;
  totalAmount: bigint;
  collectedAmount: bigint;
  sharePerUser: bigint;
  status: 'Open' | 'Paid' | 'Cancelled';
  participants: Address[];
  paidCount: number;
  lastUpdated: number;
}

interface PoolsState {
  // Cache de pools visitados
  poolsCache: Map<Address, PoolCache>;
  
  // Pool actual siendo visualizado
  currentPoolAddress: Address | null;
  
  // Filtros
  filters: {
    status: 'all' | 'active' | 'completed';
    sortBy: 'newest' | 'oldest' | 'amount';
  };
  
  // Actions
  setCurrentPool: (address: Address | null) => void;
  cachePool: (pool: PoolCache) => void;
  getCachedPool: (address: Address) => PoolCache | undefined;
  setFilters: (filters: Partial<PoolsState['filters']>) => void;
  updatePoolProgress: (address: Address, collectedAmount: bigint, paidCount: number) => void;
  clearCache: () => void;
}

export const usePoolsStore = create<PoolsState>((set, get) => ({
  poolsCache: new Map(),
  currentPoolAddress: null,
  filters: {
    status: 'all',
    sortBy: 'newest',
  },

  setCurrentPool: (address) => set({ currentPoolAddress: address }),

  cachePool: (pool) =>
    set((state) => {
      const newCache = new Map(state.poolsCache);
      newCache.set(pool.address, {
        ...pool,
        lastUpdated: Date.now(),
      });
      return { poolsCache: newCache };
    }),

  getCachedPool: (address) => {
    const cache = get().poolsCache.get(address);
    // Cache válido por 3 minutos para pools activos
    if (cache && Date.now() - cache.lastUpdated < 3 * 60 * 1000) {
      return cache;
    }
    return undefined;
  },

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  updatePoolProgress: (address, collectedAmount, paidCount) =>
    set((state) => {
      const newCache = new Map(state.poolsCache);
      const existing = newCache.get(address);
      if (existing) {
        newCache.set(address, {
          ...existing,
          collectedAmount,
          paidCount,
          lastUpdated: Date.now(),
        });
      }
      return { poolsCache: newCache };
    }),

  clearCache: () =>
    set({
      poolsCache: new Map(),
      currentPoolAddress: null,
    }),
}));