export type Address = `0x${string}`;

export interface Group {
  id: number;
  creator: Address;
  members: Address[];
  metadataPointer: number;
  exists: boolean;
  metadata?: {
    name: string;
    description?: string;
    avatar?: string;
  };
}

export interface Expense {
  id: number;
  groupId: number;
  payer: Address;
  amount: bigint;
  metadataPointer: number;
  participants: Address[];
  applied: boolean;
  exists: boolean;
  metadata?: {
    title: string;
    description?: string;
    receiptImage?: string;
  };
}

export interface Pool {
  address: Address;
  creator: Address;
  merchant: Address;
  settlementToken: Address;
  totalAmount: bigint;
  collectedAmount: bigint;
  status: 'Open' | 'Paid' | 'Cancelled';
  metadataPointer: number;
  sharePerUser: bigint;
  participants: Address[];
  paidCount?: number; // number of participants who paid
  hasPaid?: boolean; // whether current connected user paid
  metadata?: {
    merchantName: string;
    description?: string;
  };
}

// Relaxed partial version used when data comes from API without full fields
export type PartialPool = Partial<Pool> & Pick<Pool, 'address' | 'status' | 'participants' | 'sharePerUser' | 'merchant' | 'totalAmount' | 'collectedAmount'>;

export type PoolStatus = 'collecting' | 'paid' | 'closed';
export type ExpenseStatus = 'pending' | 'approved';