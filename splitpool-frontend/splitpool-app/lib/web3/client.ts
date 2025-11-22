import { createPublicClient, createWalletClient, http, custom, type Address } from 'viem';
import { baseSepolia } from './chains';
import { CONTRACTS, RPC_URL } from '../contracts/contracts';

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

export function createWalletClientForProvider(provider: any) {
  return createWalletClient({
    chain: baseSepolia,
    transport: custom(provider),
  });
}

// Address constants typed properly
export const SPLIT_GROUP_ADDRESS: Address = CONTRACTS.baseSepolia.splitGroup as Address;
export const SPLIT_POOL_FACTORY_ADDRESS: Address = CONTRACTS.baseSepolia.splitPoolFactory as Address;
export const POOL_ANALYTICS_ADDRESS: Address = CONTRACTS.baseSepolia.poolAnalytics as Address;
export const STORAGE_POINTER_ADDRESS: Address = CONTRACTS.baseSepolia.storagePointer as Address;