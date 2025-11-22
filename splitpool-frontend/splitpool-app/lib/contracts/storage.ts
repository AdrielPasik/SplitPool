import type { Address } from '../../types/models';

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
export function getGroupMetadataId(groupId: bigint): 0x${string} {
  // keccak256(abi.encodePacked("GROUP:", groupId))
  const encoder = new TextEncoder();
  const data = encoder.encode(GROUP:${groupId});
  // En práctica, usar ethers.utils.keccak256 o viem's keccak256
  return 0x${Buffer.from(data).toString('hex').padStart(64, '0')} as 0x${string};
}

/**
 * Genera ID para metadata de pool
 */
export function getPoolMetadataId(poolAddress: Address): 0x${string} {
  const encoder = new TextEncoder();
  const data = encoder.encode(POOL:${poolAddress});
  return 0x${Buffer.from(data).toString('hex').padStart(64, '0')} as 0x${string};
}

/**
 * Genera ID para metadata de gasto
 */
export function getExpenseMetadataId(expenseId: bigint): 0x${string} {
  const encoder = new TextEncoder();
  const data = encoder.encode(EXPENSE:${expenseId});
  return 0x${Buffer.from(data).toString('hex').padStart(64, '0')} as 0x${string};
}

/**
 * Genera ID para metadata de usuario
 */
export function getUserMetadataId(userAddress: Address): 0x${string} {
  const encoder = new TextEncoder();
  const data = encoder.encode(USER:${userAddress});
  return 0x${Buffer.from(data).toString('hex').padStart(64, '0')} as 0x${string};
}