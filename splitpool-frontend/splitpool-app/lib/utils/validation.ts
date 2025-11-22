import type { Address } from '../../types/models';

export function isValidAddress(address: string): address is Address {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function isValidAmount(amount: string): boolean {
  if (!amount || amount.trim() === '') return false;
  
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && isFinite(num);
}

export function validatePoolCreation(data: {
  merchantAddress: string;
  totalAmount: string;
  participants: string[];
}): { valid: boolean; error?: string } {
  if (!isValidAddress(data.merchantAddress)) {
    return { valid: false, error: 'Invalid merchant address' };
  }

  if (!isValidAmount(data.totalAmount)) {
    return { valid: false, error: 'Invalid total amount' };
  }

  const validParticipants = data.participants.filter(isValidAddress);
  if (validParticipants.length === 0) {
    return { valid: false, error: 'At least one valid participant required' };
  }

  const amount = parseFloat(data.totalAmount);
  if (amount % validParticipants.length !== 0) {
    return { 
      valid: false, 
      error: 'Total amount must be evenly divisible by number of participants' 
    };
  }

  return { valid: true };
}

export function validateGroupCreation(data: {
  name: string;
  members: string[];
}): { valid: boolean; error?: string } {
  if (!data.name.trim()) {
    return { valid: false, error: 'Group name is required' };
  }

  const validMembers = data.members.filter(isValidAddress);
  if (validMembers.length < 2) {
    return { valid: false, error: 'At least 2 valid members required' };
  }

  // Check for duplicates
  const uniqueMembers = new Set(validMembers.map(m => m.toLowerCase()));
  if (uniqueMembers.size !== validMembers.length) {
    return { valid: false, error: 'Duplicate member addresses detected' };
  }

  return { valid: true };
}

export function validateExpenseCreation(data: {
  title: string;
  amount: string;
  participants: string[];
  groupMembers: string[];
}): { valid: boolean; error?: string } {
  if (!data.title.trim()) {
    return { valid: false, error: 'Expense title is required' };
  }

  if (!isValidAmount(data.amount)) {
    return { valid: false, error: 'Invalid amount' };
  }

  if (data.participants.length === 0) {
    return { valid: false, error: 'At least one participant required' };
  }

  // Validate all participants are group members
  const groupMembersLower = data.groupMembers.map(m => m.toLowerCase());
  const invalidParticipants = data.participants.filter(
    p => !groupMembersLower.includes(p.toLowerCase())
  );

  if (invalidParticipants.length > 0) {
    return { valid: false, error: 'All participants must be group members' };
  }

  return { valid: true };
}

export function validateSettlement(data: {
  creditor: string | null;
  amount: string;
  maxDebt: bigint;
}): { valid: boolean; error?: string } {
  if (!data.creditor || !isValidAddress(data.creditor)) {
    return { valid: false, error: 'Select a valid creditor' };
  }

  if (!isValidAmount(data.amount)) {
    return { valid: false, error: 'Invalid amount' };
  }

  // Check if amount exceeds debt (will be checked in component with parseInputAmount)
  return { valid: true };
}

export function sanitizeAddress(address: string): string {
  return address.trim().toLowerCase();
}

export function deduplicateAddresses(addresses: string[]): Address[] {
  const unique = new Set(
    addresses
      .filter(isValidAddress)
      .map(sanitizeAddress)
  );
  return Array.from(unique) as Address[];
}