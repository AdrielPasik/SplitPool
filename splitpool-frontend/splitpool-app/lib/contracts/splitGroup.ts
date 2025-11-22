import type { Address } from '../../types/models';

/**
 * SplitGroup ABI
 * Contrato para gestión de grupos y gastos compartidos
 */
export const SPLITGROUP_ABI = [
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'groupId', type: 'uint256' },
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: false, name: 'metadataPointer', type: 'uint256' },
      { indexed: false, name: 'membersLength', type: 'uint256' },
    ],
    name: 'GroupCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'expenseId', type: 'uint256' },
      { indexed: true, name: 'groupId', type: 'uint256' },
      { indexed: true, name: 'payer', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'metadataPointer', type: 'uint256' },
      { indexed: false, name: 'participantsLength', type: 'uint256' },
    ],
    name: 'ExpenseCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'expenseId', type: 'uint256' },
      { indexed: true, name: 'groupId', type: 'uint256' },
      { indexed: true, name: 'approver', type: 'address' },
    ],
    name: 'ExpenseApproved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'expenseId', type: 'uint256' },
      { indexed: true, name: 'groupId', type: 'uint256' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'ExpenseApplied',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'groupId', type: 'uint256' },
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'settlementToken', type: 'address' },
    ],
    name: 'DebtSettled',
    type: 'event',
  },
  // State variables
  {
    inputs: [],
    name: 'groupCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'expenseCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Groups mapping
  {
    inputs: [{ name: 'groupId', type: 'uint256' }],
    name: 'groups',
    outputs: [
      { name: 'creator', type: 'address' },
      { name: 'metadataPointer', type: 'uint256' },
      { name: 'exists', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Expenses mapping
  {
    inputs: [{ name: 'expenseId', type: 'uint256' }],
    name: 'expenses',
    outputs: [
      { name: 'groupId', type: 'uint256' },
      { name: 'payer', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'metadataPointer', type: 'uint256' },
      { name: 'applied', type: 'bool' },
      { name: 'exists', type: 'bool' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Net balances
  {
    inputs: [
      { name: 'groupId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    name: 'netBalance',
    outputs: [{ name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Expense approvals
  {
    inputs: [
      { name: 'expenseId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    name: 'expenseApproved',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Main functions
  {
    inputs: [
      { name: 'members', type: 'address[]' },
      { name: 'metadataPointer', type: 'uint256' },
    ],
    name: 'createGroup',
    outputs: [{ name: 'groupId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'groupId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'metadataPointer', type: 'uint256' },
      { name: 'participants', type: 'address[]' },
    ],
    name: 'addExpense',
    outputs: [{ name: 'expenseId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'expenseId', type: 'uint256' }],
    name: 'approveExpense',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'groupId', type: 'uint256' },
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'settlementToken', type: 'address' },
    ],
    name: 'settleDebt',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  // View functions
  {
    inputs: [{ name: 'groupId', type: 'uint256' }],
    name: 'getMembers',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'groupId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    name: 'getUserNetBalance',
    outputs: [{ name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'groupId', type: 'uint256' }],
    name: 'getGroupBalances',
    outputs: [
      { name: 'members', type: 'address[]' },
      { name: 'balances', type: 'int256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'expenseId', type: 'uint256' }],
    name: 'getExpenseParticipants',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Error types
 */
export const SPLITGROUP_ERRORS = {
  InvalidMembers: 'InvalidMembers()',
  GroupNotFound: 'GroupNotFound(uint256)',
  NotMember: 'NotMember(uint256,address)',
  ZeroAmount: 'ZeroAmount()',
  NothingToSettle: 'NothingToSettle()',
  InvalidMetadataPointer: 'InvalidMetadataPointer()',
  InvalidParticipants: 'InvalidParticipants()',
  ExpenseNotFound: 'ExpenseNotFound(uint256)',
  ExpenseAlreadyApplied: 'ExpenseAlreadyApplied(uint256)',
  NotParticipant: 'NotParticipant(uint256,address)',
  AlreadyApproved: 'AlreadyApproved(uint256,address)',
} as const;