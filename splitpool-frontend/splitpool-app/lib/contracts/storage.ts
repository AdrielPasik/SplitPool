import type { Address } from '../../types/models';
import { keccak256, stringToHex } from 'viem';

/**
 * StoragePointer ABI
 * Contrato para gestionar CIDs de Filecoin/IPFS
 */
export const STORAGE_POINTER_ABI = [
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'id', type: 'bytes32' },
      { indexed: false, name: 'cid', type: 'string' },
      { indexed: true, name: 'setter', type: 'address' },
    ],
    name: 'CidSet',
    type: 'event',
  },
  // State variables
  {
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Main functions
  {
    inputs: [
      { name: 'id', type: 'bytes32' },
      { name: 'cid', type: 'string' },
    ],
    name: 'setCid',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'id', type: 'bytes32' }],
    name: 'getCid',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

/**
 * Error types
 */
export const STORAGE_POINTER_ERRORS = {
  NotOwner: 'NotOwner()',
  EmptyCid: 'EmptyCid()',
} as const;

/**
 * Helpers para generar IDs determinísticos
 */

/**
 * Genera ID para metadata de grupo
 */
export type Bytes32 = `0x${string}`;

function computeId(prefix: string, value: string | bigint): Bytes32 {
  // Deterministic bytes32 via keccak256("PREFIX:value")
  return keccak256(stringToHex(`${prefix}:${value.toString()}`)) as Bytes32;
}

export function getGroupMetadataId(groupId: bigint): Bytes32 {
  return computeId('GROUP', groupId);
}

/**
 * Genera ID para metadata de pool
 */
export function getPoolMetadataId(poolAddress: Address): Bytes32 {
  return computeId('POOL', poolAddress);
}

/**
 * Genera ID para metadata de gasto
 */
export function getExpenseMetadataId(expenseId: bigint): Bytes32 {
  return computeId('EXPENSE', expenseId);
}

/**
 * Genera ID para metadata de usuario
 */
export function getUserMetadataId(userAddress: Address): Bytes32 {
  return computeId('USER', userAddress);
}