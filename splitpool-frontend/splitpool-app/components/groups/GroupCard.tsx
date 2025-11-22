import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { formatAddress, formatBalance } from '../../lib/utils/format';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../lib/constants/theme';
import type { Address } from '../../types/models';

interface GroupCardProps {
  groupId: bigint;
  creator: Address;
  membersCount: number;
  userBalance?: bigint | null;
  onPress: () => void;
}

export function GroupCard({
  groupId,
  creator,
  membersCount,
  userBalance,
  onPress,
}: GroupCardProps) {
  const hasBalance = userBalance !== null && userBalance !== undefined && userBalance !== 0n;
  const isOwed = hasBalance && userBalance > 0n;
  const owes = hasBalance && userBalance < 0n;

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>👥</Text>
          </View>
          
          <View style={styles.info}>
            <Text style={styles.title}>
              Group #{groupId.toString()}
            </Text>
            <Text style={styles.subtitle}>
              {membersCount} member{membersCount !== 1 ? 's' : ''}
            </Text>
          </View>

          {hasBalance && (
            <View style={styles.balanceContainer}>
              <Text style={[
                styles.balanceAmount,
                isOwed ? styles.balancePositive : styles.balanceNegative,
              ]}>
                {isOwed ? '+' : ''}{formatBalance(userBalance)}
              </Text>
              <Text style={styles.balanceLabel}>
                {isOwed ? 'owed' : 'you owe'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.creator}>
            Creator: {formatAddress(creator)}
          </Text>
        </View>
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
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    gap: SPACING.xs / 2,
  },
  title: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
  },
  balanceContainer: {
    alignItems: 'flex-end',
    gap: SPACING.xs / 2,
  },
  balanceAmount: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
  },
  balancePositive: {
    color: COLORS.success,
  },
  balanceNegative: {
    color: COLORS.error,
  },
  balanceLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  footer: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  creator: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
});