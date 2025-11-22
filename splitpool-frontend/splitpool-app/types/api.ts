import type { Address } from './models';

/**
 * API Response types
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Metadata API responses
 */

export interface GroupMetadataResponse {
  cid: string;
  data: {
    name: string;
    description?: string;
    avatar?: string;
    createdAt: number;
    members?: Array<{
      address: Address;
      name?: string;
      role?: string;
    }>;
  };
}

export interface PoolMetadataResponse {
  cid: string;
  data: {
    merchantName: string;
    description?: string;
    category?: string;
    createdAt: number;
    images?: string[];
  };
}

export interface ExpenseMetadataResponse {
  cid: string;
  data: {
    title: string;
    description?: string;
    category?: string;
    receiptImage?: string;
    createdAt: number;
    tags?: string[];
  };
}

/**
 * Analytics API responses
 */

export interface PoolAnalyticsResponse {
  pool: Address;
  merchant: Address;
  settlementToken: Address;
  amount: string;
  amountInLocal: string;
  timestamp: number;
  currency: string;
}

export interface UserAnalyticsResponse {
  address: Address;
  totalPools: number;
  totalGroups: number;
  totalSpent: string;
  totalOwed: string;
  totalOwing: string;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  type: 'pool_created' | 'pool_paid' | 'expense_added' | 'expense_approved' | 'debt_settled';
  timestamp: number;
  description: string;
  amount?: string;
  relatedAddress?: Address;
}

/**
 * Web3.Storage API types
 */

export interface Web3StorageUploadResponse {
  cid: string;
  url: string;
  gateway: string;
}

export interface Web3StorageStatusResponse {
  cid: string;
  dagSize: number;
  created: string;
  pins: Array<{
    peerId: string;
    peerName: string;
    region: string;
    status: 'pinned' | 'pinning' | 'failed';
  }>;
}

/**
 * Blockchain query types
 */

export interface TransactionReceipt {
  hash: Address;
  blockNumber: bigint;
  blockHash: string;
  status: 'success' | 'reverted';
  gasUsed: bigint;
  effectiveGasPrice: bigint;
  logs: Log[];
}

export interface Log {
  address: Address;
  topics: string[];
  data: string;
  blockNumber: bigint;
  transactionHash: Address;
  logIndex: number;
}

/**
 * Event types
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

export interface GroupCreatedEvent {
  groupId: bigint;
  creator: Address;
  metadataPointer: bigint;
  membersLength: bigint;
}

export interface ExpenseCreatedEvent {
  expenseId: bigint;
  groupId: bigint;
  payer: Address;
  amount: bigint;
  metadataPointer: bigint;
  participantsLength: bigint;
}

export interface DebtSettledEvent {
  groupId: bigint;
  from: Address;
  to: Address;
  amount: bigint;
  settlementToken: Address;
}

/**
 * Request types
 */

export interface CreatePoolRequest {
  group?: Address;
  merchant: Address;
  settlementToken: Address;
  totalAmount: bigint;
  metadataPointer: bigint;
  participants: Address[];
}

export interface CreateGroupRequest {
  members: Address[];
  metadataPointer: bigint;
}

export interface AddExpenseRequest {
  groupId: bigint;
  amount: bigint;
  metadataPointer: bigint;
  participants: Address[];
}

export interface SettleDebtRequest {
  groupId: bigint;
  to: Address;
  amount: bigint;
  settlementToken: Address;
}

/**
 * Pagination types
 */

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter types
 */

export interface PoolFilters {
  status?: 'Open' | 'Paid' | 'Cancelled';
  merchant?: Address;
  participant?: Address;
  minAmount?: bigint;
  maxAmount?: bigint;
  dateFrom?: number;
  dateTo?: number;
}

export interface GroupFilters {
  creator?: Address;
  member?: Address;
  hasActiveExpenses?: boolean;
  dateFrom?: number;
  dateTo?: number;
}

/**
 * Error codes
 */

export enum ApiErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // Contract errors
  CONTRACT_ERROR = 'CONTRACT_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  
  // Validation errors
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_PARAMS = 'INVALID_PARAMS',
  
  // Business logic errors
  NOT_PARTICIPANT = 'NOT_PARTICIPANT',
  ALREADY_PAID = 'ALREADY_PAID',
  POOL_NOT_FOUND = 'POOL_NOT_FOUND',
  GROUP_NOT_FOUND = 'GROUP_NOT_FOUND',
  
  // Storage errors
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  FETCH_FAILED = 'FETCH_FAILED',
  
  // Auth errors
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}