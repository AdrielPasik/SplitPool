import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Address } from 'viem';
import { publicClient, createWalletClientForProvider } from '../lib/web3/client';
// TODO: Integrate a real wallet provider (Web3Modal RN wagmi/ethers adapter)
// Removed invalid import `useWeb3ModalProvider` (not exported in current version)

export function useTransaction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();
  // Placeholder provider until Web3Modal RN integration is finalized.
  const walletProvider: any | null = null; // TODO: obtain from context or connection hook

  const executeTransaction = async (
    contractAddress: Address,
    abi: any,
    functionName: string,
    args: any[],
    value?: bigint
  ) => {
    if (!walletProvider) {
      throw new Error('Wallet not connected (provider missing)');
    }

    setLoading(true);
    setError(null);

    try {
      const walletClient = createWalletClientForProvider(walletProvider);
      const [account] = await walletClient.getAddresses();

      // Simulate the transaction first
      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi,
        functionName,
        args,
        account,
        value,
      });

      // Execute the transaction
      const hash = await walletClient.writeContract(request as any);

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        confirmations: 1,
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['pools'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });

      return { hash, receipt };
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const executePayShare = async (poolAddress: Address, shareAmount: bigint) => {
    const SPLITPOOL_ABI = [
      {
        inputs: [],
        name: 'payShare',
        outputs: [],
        stateMutability: 'payable',
        type: 'function',
      },
    ] as const;

    return executeTransaction(
      poolAddress,
      SPLITPOOL_ABI,
      'payShare',
      [],
      shareAmount
    );
  };

  const executeCreatePool = async (
    factoryAddress: Address,
    groupAddress: Address,
    merchantAddress: Address,
    totalAmount: bigint,
    participants: Address[]
  ) => {
    const FACTORY_ABI = [
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
        outputs: [{ type: 'address' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ] as const;

    return executeTransaction(
      factoryAddress,
      FACTORY_ABI,
      'createPool',
      [
        groupAddress,
        merchantAddress,
        '0x0000000000000000000000000000000000000000', // ETH
        totalAmount,
        0n, // metadataPointer
        participants,
      ]
    );
  };

  const executeCreateGroup = async (
    groupContractAddress: Address,
    members: Address[],
    metadataPointer: bigint
  ) => {
    const SPLITGROUP_ABI = [
      {
        inputs: [
          { name: 'members', type: 'address[]' },
          { name: 'metadataPointer', type: 'uint256' },
        ],
        name: 'createGroup',
        outputs: [{ type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ] as const;

    return executeTransaction(
      groupContractAddress,
      SPLITGROUP_ABI,
      'createGroup',
      [members, metadataPointer]
    );
  };

  const executeAddExpense = async (
    groupContractAddress: Address,
    groupId: bigint,
    amount: bigint,
    metadataPointer: bigint,
    participants: Address[]
  ) => {
    const SPLITGROUP_ABI = [
      {
        inputs: [
          { name: 'groupId', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'metadataPointer', type: 'uint256' },
          { name: 'participants', type: 'address[]' },
        ],
        name: 'addExpense',
        outputs: [{ type: 'uint256' }],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ] as const;

    return executeTransaction(
      groupContractAddress,
      SPLITGROUP_ABI,
      'addExpense',
      [groupId, amount, metadataPointer, participants]
    );
  };

  const executeSettleDebt = async (
    groupContractAddress: Address,
    groupId: bigint,
    to: Address,
    amount: bigint
  ) => {
    const SPLITGROUP_ABI = [
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
    ] as const;

    return executeTransaction(
      groupContractAddress,
      SPLITGROUP_ABI,
      'settleDebt',
      [
        groupId,
        to,
        amount,
        '0x0000000000000000000000000000000000000000', // ETH
      ],
      amount
    );
  };

  return {
    loading,
    error,
    executeTransaction,
    executePayShare,
    executeCreatePool,
    executeCreateGroup,
    executeAddExpense,
    executeSettleDebt,
  };
}