import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '../ui/Card';
import { StatusPill } from '../ui/StatusPill';
import { formatAddress, formatCurrency, formatRelativeTime } from '../../lib/utils/format';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../lib/constants/theme';
import type { Address } from '../../types/models';

interface ExpenseCardProps {
  expenseId: bigint;
  title: string;
  amount: bigint;
  payer: Address;
  participants: Address[];
  status: 'pending' | 'approved' | 'applied';
  createdAt: number;
  isCurrentUserPayer: boolean;
  isCurrentUserParticipant: boolean;
  hasCurrentUserApproved: boolean;
  onPress: () => void;
}

export function ExpenseCard({
  expenseId,
  title,
  amount,
  payer,
  participants,
  status,
  createdAt,
  isCurrentUserPayer,
  isCurrentUserParticipant,
  hasCurrentUserApproved,
  onPress,
}: ExpenseCardProps) {
  const sharePerPerson = amount / BigInt(participants.length);
  const needsApproval = isCurrentUserParticipant && !isCurrentUserPayer && !hasCurrentUserApproved && status === 'pending';

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>
                {isCurrentUserPayer ? '💰' : '📝'}
              </Text>
            </View>
            
            <View style={styles.info}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>
                Paid by {isCurrentUserPayer ? 'You' : formatAddress(payer)}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.amount}>{formatCurrency(amount)}</Text>
            <Text style={styles.share}>
              {formatCurrency(sharePerPerson)}/person
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <StatusPill status={status} size="sm" />
            <Text style={styles.timeAgo}>
              {formatRelativeTime(createdAt)}
            </Text>
          </View>

          {needsApproval && (
            <View style={styles.actionBadge}>
              <Text style={styles.actionText}>Action needed</Text>
            </View>
          )}

          {hasCurrentUserApproved && status === 'pending' && (
            <View style={styles.approvedBadge}>
              <Text style={styles.approvedText}>✓ Approved</Text>
            </View>
          )}
        </View>

        <View style={styles.participants}>
          <Text style={styles.participantsText}>
            {participants.length} participant{participants.length !== 1 ? 's' : ''}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
    marginRight: SPACING.md,
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
  headerRight: {
    alignItems: 'flex-end',
    gap: SPACING.xs / 2,
  },
  amount: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  share: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  timeAgo: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
  actionBadge: {
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: RADIUS.full,
  },
  actionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning,
    fontWeight: '600',
  },
  approvedBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: RADIUS.full,
  },
  approvedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
  participants: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  participantsText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
});