import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatAddress } from '../../lib/utils/format';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../lib/constants/theme';
import type { Address } from '../../types/models';

interface ParticipantRowProps {
  address: Address;
  isPaid: boolean;
  isCurrentUser?: boolean;
  shareAmount?: bigint;
}

export function ParticipantRow({
  address,
  isPaid,
  isCurrentUser = false,
  shareAmount,
}: ParticipantRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[
          styles.avatar,
          isPaid && styles.avatarPaid,
        ]}>
          <Text style={styles.avatarText}>
            {isPaid ? '✓' : '👤'}
          </Text>
        </View>
        
        <View style={styles.info}>
          <Text style={styles.address}>
            {formatAddress(address)}
            {isCurrentUser && ' (You)'}
          </Text>
          <Text style={[
            styles.status,
            isPaid && styles.statusPaid,
          ]}>
            {isPaid ? 'Paid' : 'Pending'}
          </Text>
        </View>
      </View>

      {shareAmount && (
        <View style={styles.right}>
          <Text style={styles.amount}>
            {formatAmount(shareAmount)}
          </Text>
        </View>
      )}
    </View>
  );
}

function formatAmount(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  return `${eth.toFixed(4).replace(/\.?0+$/, '')} ETH`;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPaid: {
    backgroundColor: COLORS.success + '20',
  },
  avatarText: {
    fontSize: 20,
  },
  info: {
    flex: 1,
    gap: SPACING.xs / 2,
  },
  address: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  status: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
  statusPaid: {
    color: COLORS.success,
    fontWeight: '600',
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
});