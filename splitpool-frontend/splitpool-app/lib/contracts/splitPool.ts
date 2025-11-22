import type { Address } from '../../types/models';

/**
 * SplitPool ABI
 * Contrato individual de pool de pagos
 */
export const SPLITPOOL_ABI = [
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'pool', type: 'address' },
      { indexed: true, name: 'payer', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'pooledAmount', type: 'uint256' },
    ],
    name: 'Deposit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'pool', type: 'address' },
      { indexed: true, name: 'payer', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'paidCount', type: 'uint256' },
      { indexed: false, name: 'remainingParticipants', type: 'uint256' },
    ],
    name: 'ParticipantPaid',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'pool', type: 'address' },
      { indexed: true, name: 'settlementToken', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: true, name: 'merchant', type: 'address' },
    ],
    name: 'PoolPaid',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'pool', type: 'address' },
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'Refunded',
    type: 'event',
  },
  // State variables
  {
    inputs: [],
    name: 'settlementToken',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'merchant',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalAmount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'collectedAmount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'status',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'metadataPointer',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'sharePerUser',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paidCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'factory',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'creator',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  // View functions
  {
    inputs: [],
    name: 'remainingAmount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'participantsLength',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'index', type: 'uint256' }],
    name: 'participantAt',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'hasPaid',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Main functions
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'payShare',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'autoPay',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

/**
 * Pool Status enum
 */
export enum PoolStatus {
  Open = 0,
  Paid = 1,
  Cancelled = 2,
}

export const POOL_STATUS_NAMES = ['Open', 'Paid', 'Cancelled'] as const;

/**
 * Error types
 */
export const SPLITPOOL_ERRORS = {
  InvalidSettlementToken: 'InvalidSettlementToken(address)',
  PoolAlreadyPaid: 'PoolAlreadyPaid()',
  PoolCancelled: 'PoolCancelled()',
  PoolNotFullyFunded: 'PoolNotFullyFunded(uint256,uint256)',
  OutstandingDebts: 'OutstandingDebts(address,uint256)',
  NonDivisibleTotal: 'NonDivisibleTotal(uint256,uint256)',
  NotParticipant: 'NotParticipant(address)',
  AlreadyPaid: 'AlreadyPaid(address)',
  IncorrectShareAmount: 'IncorrectShareAmount(uint256,uint256)',
  DirectEthTransferNotAllowed: 'DirectEthTransferNotAllowed()',
} as const;

/**
 * Helper para obtener nombre de status
 */
export function getPoolStatusName(status: number): string {
  return POOL_STATUS_NAMES[status] || 'Unknown';
}