import { create } from 'zustand';
import type { Address } from '../types/models';

interface WalletState {
  address: Address | null;
  isConnected: boolean;
  ens: string | null;
  connect: (address: Address) => void;
  disconnect: () => void;
  setENS: (ens: string | null) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnected: false,
  ens: null,
  connect: (address) => set({ address, isConnected: true }),
  disconnect: () => set({ address: null, isConnected: false, ens: null }),
  setENS: (ens) => set({ ens }),
}));