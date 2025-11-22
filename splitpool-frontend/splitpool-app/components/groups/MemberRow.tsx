import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatAddress } from '../../lib/utils/format';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../lib/constants/theme';
import type { Address } from '../../types/models';

interface MemberRowProps {
  address: Address;
  isCreator?: boolean;
  isCurrentUser?: boolean;
  role?: string;
}

export function MemberRow({
  address,
  isCreator = false,
  isCurrentUser = false,
  role,
}: MemberRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={[
          styles.avatar,
          isCreator && styles.avatarCreator,
        ]}>
          <Text style={styles.avatarText}>
            {isCreator ? '👑' : '👤'}
          </Text>
        </View>
        
        <View style={styles.info}>
          <Text style={styles.address}>
            {formatAddress(address)}
            {isCurrentUser && ' (You)'}
          </Text>
          {(isCreator || isCurrentUser || role) && (
            <View style={styles.badges}>
              {isCreator && (
                <Text style={styles.badge}>Creator</Text>
              )}
              {isCreator && isCurrentUser && (
                <Text style={styles.badgeSeparator}>•</Text>
              )}
              {isCurrentUser && !isCreator && (
                <Text style={styles.badge}>You</Text>
              )}
              {role && (
                <>
                  {(isCreator || isCurrentUser) && (
                    <Text style={styles.badgeSeparator}>•</Text>
                  )}
                  <Text style={styles.badge}>{role}</Text>
                </>
              )}
            </View>
          )}
        </View>
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
  avatarCreator: {
    backgroundColor: COLORS.primary[100],
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
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  badge: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  badgeSeparator: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
});