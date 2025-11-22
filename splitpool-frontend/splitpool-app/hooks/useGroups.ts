import { useQuery } from '@tanstack/react-query';
import { publicClient, SPLIT_GROUP_ADDRESS } from '../lib/web3/client';
import { SPLITGROUP_ABI } from '../lib/contracts/splitGroup';
import { useWallet } from './useWallet';
import type { Address } from '../types/models';

/**
 * Hook para obtener todos los grupos donde el usuario es miembro
 * Nota: Requiere eventos indexados o función auxiliar en el contrato
 */
export function useUserGroups() {
  const { address } = useWallet();

  return useQuery({
    queryKey: ['groups', 'user', address],
    queryFn: async () => {
      if (!address) return [];

      // Obtener total de grupos
      const groupCount = await publicClient.readContract({
        address: SPLIT_GROUP_ADDRESS,
        abi: SPLITGROUP_ABI,
        functionName: 'groupCount',
      });

      // Buscar grupos donde el usuario es miembro
      const userGroupIds: bigint[] = [];
      
      for (let i = 1n; i <= groupCount; i++) {
        const members = await publicClient.readContract({
          address: SPLIT_GROUP_ADDRESS,
          abi: SPLITGROUP_ABI,
          functionName: 'getMembers',
          args: [i],
        });

        if (members.some(m => m.toLowerCase() === address.toLowerCase())) {
          userGroupIds.push(i);
        }
      }

      return userGroupIds;
    },
    enabled: !!address,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener detalles de un grupo específico
 */
export function useGroupDetails(groupId: bigint) {
  return useQuery({
    queryKey: ['group', groupId.toString()],
    queryFn: async () => {
      const [groupData, members] = await Promise.all([
        publicClient.readContract({
          address: SPLIT_GROUP_ADDRESS,
          abi: SPLITGROUP_ABI,
          functionName: 'groups',
          args: [groupId],
        }),
        publicClient.readContract({
          address: SPLIT_GROUP_ADDRESS,
          abi: SPLITGROUP_ABI,
          functionName: 'getMembers',
          args: [groupId],
        }),
      ]);

      return {
        id: groupId,
        creator: groupData[0] as Address,
        metadataPointer: groupData[1] as bigint,
        exists: groupData[2] as boolean,
        members: members as Address[],
      };
    },
    enabled: !!groupId && groupId > 0n,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para obtener balances de todos los miembros de un grupo
 */
export function useGroupBalances(groupId: bigint) {
  return useQuery({
    queryKey: ['group', groupId.toString(), 'balances'],
    queryFn: async () => {
      const [members, balances] = await publicClient.readContract({
        address: SPLIT_GROUP_ADDRESS,
        abi: SPLITGROUP_ABI,
        functionName: 'getGroupBalances',
        args: [groupId],
      });

      return (members as Address[]).map((address, i) => ({
        address,
        balance: (balances as bigint[])[i],
      }));
    },
    enabled: !!groupId && groupId > 0n,
    staleTime: 3 * 60 * 1000, // 3 minutos
  });
}

/**
 * Hook para obtener el balance neto del usuario en un grupo
 */
export function useUserBalance(groupId: bigint) {
  const { address } = useWallet();

  const { data } = useQuery({
    queryKey: ['group', groupId.toString(), 'balance', address],
    queryFn: async () => {
      if (!address) return null;

      const balance = await publicClient.readContract({
        address: SPLIT_GROUP_ADDRESS,
        abi: SPLITGROUP_ABI,
        functionName: 'netBalance',
        args: [groupId, address],
      });

      return balance as bigint;
    },
    enabled: !!address && !!groupId && groupId > 0n,
    staleTime: 3 * 60 * 1000,
  });

  return data ?? null;
}

/**
 * Hook para obtener gastos de un grupo
 */
export function useGroupExpenses(groupId: bigint) {
  return useQuery({
    queryKey: ['group', groupId.toString(), 'expenses'],
    queryFn: async () => {
      // Obtener total de gastos
      const expenseCount = await publicClient.readContract({
        address: SPLIT_GROUP_ADDRESS,
        abi: SPLITGROUP_ABI,
        functionName: 'expenseCount',
      });

      // Filtrar gastos del grupo
      const groupExpenses = [];
      
      for (let i = 1n; i <= expenseCount; i++) {
        const expense = await publicClient.readContract({
          address: SPLIT_GROUP_ADDRESS,
          abi: SPLITGROUP_ABI,
          functionName: 'expenses',
          args: [i],
        });

        if ((expense[0] as bigint) === groupId) {
          const participants = await publicClient.readContract({
            address: SPLIT_GROUP_ADDRESS,
            abi: SPLITGROUP_ABI,
            functionName: 'getExpenseParticipants',
            args: [i],
          });

          groupExpenses.push({
            id: i,
            groupId: expense[0] as bigint,
            payer: expense[1] as Address,
            amount: expense[2] as bigint,
            metadataPointer: expense[3] as bigint,
            applied: expense[4] as boolean,
            exists: expense[5] as boolean,
            participants: participants as Address[],
          });
        }
      }

      return groupExpenses;
    },
    enabled: !!groupId && groupId > 0n,
    staleTime: 3 * 60 * 1000,
  });
}