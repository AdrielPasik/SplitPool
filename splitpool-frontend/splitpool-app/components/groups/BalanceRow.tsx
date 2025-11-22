import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatAddress, formatBalance } from '../../lib/utils/format';
import { COLORS, TYPOGRAPHY, SPACING } from '../../lib/constants/theme';
import type { Address } from '../../types/models';

interface BalanceRowProps {
  address: Address;
  balance: bigint;
  isCurrentUser?: boolean;
}

export function BalanceRow({
  address,
  balance,
  isCurrentUser = false,
}: BalanceRowProps) {
  const isPositive = balance > 0n;
  const isZero = balance === 0n;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.address}>
          {formatAddress(address)}
          {isCurrentUser && ' (You)'}
        </Text>
      </View>

      <View style={styles.right}>
        {isZero ? (
          <Text style={styles.settled}>Settled</Text>
        ) : (
          <Text style={[
            styles.balance,
            isPositive ? styles.balancePositive : styles.balanceNegative,
          ]}>
            {isPositive ? '+' : ''}{formatBalance(balance)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  left: {
    flex: 1,
  },
  address: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.primary,
  },
  right: {
    alignItems: 'flex-end',
  },
  balance: {
    ...TYPOGRAPHY.bodySm,
    fontWeight: '700',
  },
  balancePositive: {
    color: COLORS.success,
  },
  balanceNegative: {
    color: COLORS.error,
  },
  settled: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    fontStyle: 'italic',
  },
});