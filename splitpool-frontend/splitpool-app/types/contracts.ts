import type { Address } from './models';

/**
 * Contract deployment info
 */

export interface ContractDeployment {
  address: Address;
  chainId: number;
  blockNumber: bigint;
  transactionHash: Address;
  deployedAt: number;
}

export interface NetworkContracts {
  chainId: number;
  chainName: string;
  splitGroup: Address;
  splitPoolFactory: Address;
  poolAnalytics: Address;
  storagePointer: Address;
}

/**
 * Contract call types
 */

export interface ContractCall<T = any> {
  address: Address;
  abi: any;
  functionName: string;
  args?: any[];
  value?: bigint;
}

export interface ContractWriteResult {
  hash: Address;
  wait: () => Promise<TransactionReceipt>;
}

export interface TransactionReceipt {
  hash: Address;
  blockNumber: bigint;
  blockHash: string;
  status: 'success' | 'reverted';
  gasUsed: bigint;
  effectiveGasPrice: bigint;
  from: Address;
  to: Address | null;
  contractAddress: Address | null;
  logs: ContractLog[];
}

export interface ContractLog {
  address: Address;
  topics: string[];
  data: string;
  blockNumber: bigint;
  transactionHash: Address;
  logIndex: number;
  removed: boolean;
}

/**
 * Contract state types
 */

export interface PoolState {
  settlementToken: Address;
  merchant: Address;
  totalAmount: bigint;
  collectedAmount: bigint;
  status: 0 | 1 | 2; // Open, Paid, Cancelled
  metadataPointer: bigint;
  sharePerUser: bigint;
  paidCount: bigint;
  factory: Address;
  creator: Address;
}

export interface GroupState {
  creator: Address;
  members: Address[];
  metadataPointer: bigint;
  exists: boolean;
}

export interface ExpenseState {
  groupId: bigint;
  payer: Address;
  amount: bigint;
  metadataPointer: bigint;
  participants: Address[];
  applied: boolean;
  exists: boolean;
}

/**
 * Contract event types
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
  blockNumber: bigint;
  transactionHash: Address;
}

export interface ParticipantPaidEvent {
  pool: Address;
  payer: Address;
  amount: bigint;
  paidCount: bigint;
  remainingParticipants: bigint;
  blockNumber: bigint;
  transactionHash: Address;
}

export interface PoolPaidEvent {
  pool: Address;
  settlementToken: Address;
  amount: bigint;
  merchant: Address;
  blockNumber: bigint;
  transactionHash: Address;
}

export interface GroupCreatedEvent {
  groupId: bigint;
  creator: Address;
  metadataPointer: bigint;
  membersLength: bigint;
  blockNumber: bigint;
  transactionHash: Address;
}

export interface ExpenseCreatedEvent {
  expenseId: bigint;
  groupId: bigint;
  payer: Address;
  amount: bigint;
  metadataPointer: bigint;
  participantsLength: bigint;
  blockNumber: bigint;
  transactionHash: Address;
}

export interface ExpenseApprovedEvent {
  expenseId: bigint;
  groupId: bigint;
  approver: Address;
  blockNumber: bigint;
  transactionHash: Address;
}

export interface ExpenseAppliedEvent {
  expenseId: bigint;
  groupId: bigint;
  amount: bigint;
  blockNumber: bigint;
  transactionHash: Address;
}

export interface DebtSettledEvent {
  groupId: bigint;
  from: Address;
  to: Address;
  amount: bigint;
  settlementToken: Address;
  blockNumber: bigint;
  transactionHash: Address;
}

/**
 * Contract error types
 */

export interface ContractError {
  name: string;
  message: string;
  cause?: any;
  metaMessages?: string[];
  shortMessage?: string;
}

export interface RevertError extends ContractError {
  name: 'ContractFunctionRevertedError';
  data?: {
    errorName: string;
    args?: any[];
  };
}

/**
 * Gas estimation types
 */

export interface GasEstimate {
  gasLimit: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  estimatedCost: bigint;
}

/**
 * Contract constants
 */

export const POOL_STATUS = {
  OPEN: 0,
  PAID: 1,
  CANCELLED: 2,
} as const;

export type PoolStatusValue = typeof POOL_STATUS[keyof typeof POOL_STATUS];

/**
 * ABI types (simplified)
 */

export interface AbiFunction {
  type: 'function';
  name: string;
  inputs: AbiParameter[];
  outputs: AbiParameter[];
  stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
}

export interface AbiEvent {
  type: 'event';
  name: string;
  inputs: AbiParameter[];
  anonymous?: boolean;
}

export interface AbiParameter {
  name: string;
  type: string;
  indexed?: boolean;
  components?: AbiParameter[];
}

export type AbiItem = AbiFunction | AbiEvent;

/**
 * Contract interaction options
 */

export interface ContractReadOptions {
  blockNumber?: bigint;
  blockTag?: 'latest' | 'earliest' | 'pending' | 'safe' | 'finalized';
}

export interface ContractWriteOptions {
  gas?: bigint;
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  nonce?: number;
  value?: bigint;
}

/**
 * Event filter types
 */

export interface EventFilter {
  address?: Address | Address[];
  topics?: (string | string[] | null)[];
  fromBlock?: bigint | 'latest' | 'earliest' | 'pending';
  toBlock?: bigint | 'latest' | 'earliest' | 'pending';
}

/**
 * Contract metadata
 */

export interface ContractMetadata {
  name: string;
  version: string;
  chainId: number;
  verificationStatus: 'verified' | 'unverified' | 'partial';
  compiler: {
    version: string;
    settings: {
      optimizer: {
        enabled: boolean;
        runs: number;
      };
    };
  };
  sources: string[];
}