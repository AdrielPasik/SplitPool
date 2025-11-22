import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { StatusPill } from '../ui/StatusPill';
import { formatAddress, formatCurrency } from '../../lib/utils/format';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../lib/constants/theme';
import type { Address } from '../../types/models';

interface PoolCardProps {
  address: Address;
  merchant: Address;
  totalAmount: bigint;
  collectedAmount: bigint;
  sharePerUser: bigint;
  status: 'Open' | 'Paid' | 'Cancelled';
  paidCount: number;
  participantsTotal: number;
  hasPaid: boolean;
  onPress: () => void;
}

export function PoolCard({
  address,
  merchant,
  totalAmount,
  collectedAmount,
  sharePerUser,
  status,
  paidCount,
  participantsTotal,
  hasPaid,
  onPress,
}: PoolCardProps) {
  const progress = Number(collectedAmount) / Number(totalAmount);
  const progressPercent = Math.round(progress * 100);

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.merchant}>
              {formatAddress(merchant)}
            </Text>
            <Text style={styles.amount}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
          <StatusPill status={status} size="sm" />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercent}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {paidCount}/{participantsTotal} paid • {progressPercent}%
          </Text>
        </View>

        {hasPaid ? (
          <View style={styles.paidBadge}>
            <Text style={styles.paidText}>✓ You paid</Text>
          </View>
        ) : status === 'Open' && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>
              Your share: {formatCurrency(sharePerUser)}
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  merchant: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  amount: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  progressContainer: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.neutral[200],
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary[500],
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  paidBadge: {
    backgroundColor: COLORS.success + '20',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  paidText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.success,
    fontWeight: '600',
    textAlign: 'center',
  },
  pendingBadge: {
    backgroundColor: COLORS.warning + '20',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  pendingText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
});