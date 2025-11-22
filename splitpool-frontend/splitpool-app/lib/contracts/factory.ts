import type { Address } from '../../types/models';

/**
 * SplitPoolFactory ABI
 * Extraído del contrato desplegado en Base Sepolia
 */
export const SPLITPOOL_FACTORY_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'pool', type: 'address' },
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: true, name: 'group', type: 'address' },
      { indexed: false, name: 'merchant', type: 'address' },
      { indexed: false, name: 'settlementToken', type: 'address' },
      { indexed: false, name: 'totalAmount', type: 'uint256' },
      { indexed: false, name: 'metadataPointer', type: 'uint256' },
      { indexed: false, name: 'participantsLength', type: 'uint256' },
    ],
    name: 'PoolCreated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'allPoolsLength',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'index', type: 'uint256' }],
    name: 'allPools',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'group', type: 'address' },
      { name: 'merchant', type: 'address' },
      { name: 'settlementToken', type: 'address' },
      { name: 'totalAmount', type: 'uint256' },
      { name: 'metadataPointer', type: 'uint256' },
      { name: 'participants', type: 'address[]' },
    ],
    name: 'createPool',
    outputs: [{ name: 'pool', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'group', type: 'address' }],
    name: 'getPoolsByGroup',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllPools',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Error types del Factory
 */
export const FACTORY_ERRORS = {
  InvalidMerchant: 'InvalidMerchant(address)',
  InvalidTotalAmount: 'InvalidTotalAmount()',
  UnsupportedSettlementToken: 'UnsupportedSettlementToken(address)',
} as const;

/**
 * Helper: Parse PoolCreated event
 */
export interface PoolCreatedEvent {
  pool: Address;
  creator: Address;
  group: Address;
  merchant: Address;
  settlementToken: Address;
  totalAmount: bigint;
  metadataPointer: bigint;
  participantsLength: bigint;
}

export function parsePoolCreatedEvent(log: any): PoolCreatedEvent {
  return {
    pool: log.args.pool,
    creator: log.args.creator,
    group: log.args.group,
    merchant: log.args.merchant,
    settlementToken: log.args.settlementToken,
    totalAmount: log.args.totalAmount,
    metadataPointer: log.args.metadataPointer,
    participantsLength: log.args.participantsLength,
  };
}

/**
 * Constantes útiles
 */
export const ZERO_ADDRESS: Address = '0x0000000000000000000000000000000000000000';
export const ETH_ADDRESS: Address = ZERO_ADDRESS; // ETH sentinel value