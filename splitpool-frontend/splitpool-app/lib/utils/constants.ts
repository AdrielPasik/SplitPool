import type { Address } from '../../types/models';

/**
 * Network constants
 */
export const CHAIN_ID = 84532; // Base Sepolia
export const CHAIN_NAME = 'Base Sepolia';
export const CHAIN_CURRENCY = 'ETH';

/**
 * Zero addresses
 */
export const ZERO_ADDRESS: Address = '0x0000000000000000000000000000000000000000';
export const ETH_SENTINEL: Address = ZERO_ADDRESS;

/**
 * Transaction confirmations
 */
export const CONFIRMATIONS_REQUIRED = 1;
export const TRANSACTION_TIMEOUT = 60000; // 60 seconds

/**
 * Cache durations (milliseconds)
 */
export const CACHE_DURATION = {
  GROUPS: 5 * 60 * 1000, // 5 minutes
  POOLS: 3 * 60 * 1000, // 3 minutes
  METADATA: 10 * 60 * 1000, // 10 minutes
} as const;

/**
 * Query keys
 */
export const QUERY_KEYS = {
  WALLET: 'wallet',
  POOLS: 'pools',
  POOL: 'pool',
  GROUPS: 'groups',
  GROUP: 'group',
  BALANCES: 'balances',
  EXPENSES: 'expenses',
  TRANSACTIONS: 'transactions',
} as const;

/**
 * Limits
 */
export const LIMITS = {
  MAX_PARTICIPANTS: 50,
  MAX_GROUP_MEMBERS: 100,
  MIN_PARTICIPANTS: 1,
  MIN_GROUP_MEMBERS: 2,
  MAX_TRANSACTION_HISTORY: 50,
} as const;

/**
 * UI Constants
 */
export const UI = {
  REFRESH_INTERVAL: 30000, // 30 seconds
  DEBOUNCE_DELAY: 300, // 300ms
  ANIMATION_DURATION: 200, // 200ms
} as const;

/**
 * External links
 */
export const LINKS = {
  BLOCK_EXPLORER: 'https://sepolia.basescan.org',
  DOCS: 'https://docs.splitpool.app',
  SUPPORT: 'https://support.splitpool.app',
  GITHUB: 'https://github.com/splitpool/splitpool',
} as const;

/**
 * Feature flags
 */
export const FEATURES = {
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: false,
  ENABLE_DARK_MODE: false,
  USE_MOCK_DATA: false,
} as const;