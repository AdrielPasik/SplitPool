import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { publicClient } from '../../lib/web3/client';
import { TYPOGRAPHY, COLORS } from '../../lib/constants/theme';
import type { Address } from '../../types/models';

interface ENSResolverProps {
  address: Address;
  style?: any;
}

export function ENSResolver({ address, style }: ENSResolverProps) {
  const [ens, setEns] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const resolveENS = async () => {
      try {
        // Base Sepolia no tiene soporte nativo de ENS
        // Esta función está preparada para cuando se agregue soporte
        // o se use mainnet
        
        // const ensName = await publicClient.getEnsName({
        //   address,
        // });
        
        // Por ahora, retornar null
        const ensName = null;
        
        if (mounted) {
          setEns(ensName);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to resolve ENS:', error);
        if (mounted) {
          setEns(null);
          setLoading(false);
        }
      }
    };

    resolveENS();

    return () => {
      mounted = false;
    };
  }, [address]);

  if (loading || !ens) {
    return null;
  }

  return (
    <Text style={[styles.ens, style]}>
      {ens}
    </Text>
  );
}

const styles = StyleSheet.create({
  ens: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.primary[600],
    fontWeight: '600',
  },
});