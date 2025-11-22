import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../lib/constants/theme';
import type { PoolStatus, ExpenseStatus } from '../../types/models';

interface StatusPillProps {
  status: PoolStatus | ExpenseStatus | string;
  size?: 'sm' | 'md';
}

export function StatusPill({ status, size = 'md' }: StatusPillProps) {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'collecting':
        return COLORS.status.collecting;
      case 'paid':
        return COLORS.status.paid;
      case 'pending':
        return COLORS.status.pending;
      case 'approved':
        return COLORS.status.approved;
      case 'closed':
      case 'cancelled':
        return COLORS.status.closed;
      default:
        return COLORS.neutral[400];
    }
  };

  return (
    <View style={[
      styles.container,
      styles[`size_${size}`],
      { backgroundColor: getStatusColor() }
    ]}>
      <Text style={[styles.text, styles[`text_${size}`]]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  size_sm: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
  },
  size_md: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  text: {
    color: COLORS.text.inverse,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  text_sm: {
    ...TYPOGRAPHY.caption,
  },
  text_md: {
    ...TYPOGRAPHY.bodySm,
  },
});