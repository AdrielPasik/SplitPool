import { createPublicClient, createWalletClient, http, custom } from 'viem';
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

export const SPLIT_GROUP_ADDRESS = CONTRACTS.baseSepolia.splitGroup as 0x${string};
export const SPLIT_POOL_FACTORY_ADDRESS = CONTRACTS.baseSepolia.splitPoolFactory as 0x${string};
export const POOL_ANALYTICS_ADDRESS = CONTRACTS.baseSepolia.poolAnalytics as 0x${string};
export const STORAGE_POINTER_ADDRESS = CONTRACTS.baseSepolia.storagePointer as 0x${string};