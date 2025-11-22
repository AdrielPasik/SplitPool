import { useQuery } from '@tanstack/react-query';
import { publicClient, SPLIT_POOL_FACTORY_ADDRESS } from '../lib/web3/client';
import { SPLITPOOL_FACTORY_ABI } from '../lib/contracts/factory';
import { SPLITPOOL_ABI, POOL_STATUS_NAMES } from '../lib/contracts/splitPool';
import { useWallet } from './useWallet';
import type { Address } from '../types/models';

/**
 * Hook para obtener todos los pools
 */
export function useAllPools() {
  return useQuery({
    queryKey: ['pools', 'all'],
    queryFn: async () => {
      const pools = await publicClient.readContract({
        address: SPLIT_POOL_FACTORY_ADDRESS,
        abi: SPLITPOOL_FACTORY_ABI,
        functionName: 'getAllPools',
      });

      return pools as Address[];
    },
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Hook para obtener pools donde el usuario es participante
 */
export function useUserPools() {
  const { address } = useWallet();
  const { data: allPools } = useAllPools();

  return useQuery({
    queryKey: ['pools', 'user', address],
    queryFn: async () => {
      if (!address || !allPools) return [];

      // Verificar cada pool si el usuario es participante
      const userPools = [];

      for (const poolAddress of allPools) {
        const participantsLength = await publicClient.readContract({
          address: poolAddress,
          abi: SPLITPOOL_ABI,
          functionName: 'participantsLength',
        });

        // Obtener todos los participantes
        const participants: Address[] = [];
        for (let i = 0; i < Number(participantsLength); i++) {
          const participant = await publicClient.readContract({
            address: poolAddress,
            abi: SPLITPOOL_ABI,
            functionName: 'participantAt',
            args: [BigInt(i)],
          });
          participants.push(participant as Address);
        }

        // Verificar si el usuario es participante
        if (participants.some(p => p.toLowerCase() === address.toLowerCase())) {
          const poolDetails = await fetchPoolDetails(poolAddress, address);
          if (poolDetails) {
            userPools.push(poolDetails);
          }
        }
      }

      return userPools;
    },
    enabled: !!address && !!allPools,
    staleTime: 3 * 60 * 1000,
  });
}

/**
 * Hook para obtener detalles de un pool específico
 */
export function usePoolDetails(poolAddress: Address) {
  const { address: userAddress } = useWallet();

  return useQuery({
    queryKey: ['pool', poolAddress],
    queryFn: async () => {
      return await fetchPoolDetails(poolAddress, userAddress);
    },
    enabled: !!poolAddress && poolAddress !== '0x0000000000000000000000000000000000000000',
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Helper para obtener detalles completos de un pool
 */
async function fetchPoolDetails(poolAddress: Address, userAddress?: Address | null) {
  try {
    const [
      merchant,
      settlementToken,
      totalAmount,
      collectedAmount,
      status,
      sharePerUser,
      paidCount,
      participantsLength,
      creator,
    ] = await Promise.all([
      publicClient.readContract({
        address: poolAddress,
        abi: SPLITPOOL_ABI,
        functionName: 'merchant',
      }),
      publicClient.readContract({
        address: poolAddress,
        abi: SPLITPOOL_ABI,
        functionName: 'settlementToken',
      }),
      publicClient.readContract({
        address: poolAddress,
        abi: SPLITPOOL_ABI,
        functionName: 'totalAmount',
      }),
      publicClient.readContract({
        address: poolAddress,
        abi: SPLITPOOL_ABI,
        functionName: 'collectedAmount',
      }),
      publicClient.readContract({
        address: poolAddress,
        abi: SPLITPOOL_ABI,
        functionName: 'status',
      }),
      publicClient.readContract({
        address: poolAddress,
        abi: SPLITPOOL_ABI,
        functionName: 'sharePerUser',
      }),
      publicClient.readContract({
        address: poolAddress,
        abi: SPLITPOOL_ABI,
        functionName: 'paidCount',
      }),
      publicClient.readContract({
        address: poolAddress,
        abi: SPLITPOOL_ABI,
        functionName: 'participantsLength',
      }),
      publicClient.readContract({
        address: poolAddress,
        abi: SPLITPOOL_ABI,
        functionName: 'creator',
      }),
    ]);

    // Obtener participantes
    const participants: Address[] = [];
    for (let i = 0; i < Number(participantsLength); i++) {
      const participant = await publicClient.readContract({
        address: poolAddress,
        abi: SPLITPOOL_ABI,
        functionName: 'participantAt',
        args: [BigInt(i)],
      });
      participants.push(participant as Address);
    }

    // Verificar si el usuario ha pagado
    let hasPaid = false;
    if (userAddress) {
      hasPaid = await publicClient.readContract({
        address: poolAddress,
        abi: SPLITPOOL_ABI,
        functionName: 'hasPaid',
        args: [userAddress],
      }) as boolean;
    }

    return {
      address: poolAddress,
      creator: creator as Address,
      merchant: merchant as Address,
      settlementToken: settlementToken as Address,
      totalAmount: totalAmount as bigint,
      collectedAmount: collectedAmount as bigint,
      status: POOL_STATUS_NAMES[Number(status)] as 'Open' | 'Paid' | 'Cancelled',
      sharePerUser: sharePerUser as bigint,
      paidCount: Number(paidCount),
      participants,
      hasPaid,
    };
  } catch (error) {
    console.error(`Failed to fetch pool details for ${poolAddress}:`, error);
    return null;
  }
}

/**
 * Hook para obtener pools de un grupo
 */
export function useGroupPools(groupAddress: Address) {
  return useQuery({
    queryKey: ['pools', 'group', groupAddress],
    queryFn: async () => {
      const pools = await publicClient.readContract({
        address: SPLIT_POOL_FACTORY_ADDRESS,
        abi: SPLITPOOL_FACTORY_ABI,
        functionName: 'getPoolsByGroup',
        args: [groupAddress],
      });

      return pools as Address[];
    },
    enabled: !!groupAddress && groupAddress !== '0x0000000000000000000000000000000000000000',
    staleTime: 3 * 60 * 1000,
  });
}