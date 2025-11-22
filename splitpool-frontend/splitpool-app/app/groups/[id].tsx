import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useGroupDetails, useGroupBalances, useUserBalance } from '../../hooks/useGroups';
import { useWallet } from '../../hooks/useWallet';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { formatAddress, formatBalance } from '../../lib/utils/format';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../lib/constants/theme';

export default function GroupDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { address: userAddress } = useWallet();
  
  const groupId = BigInt(id);
  const { data: group, isLoading, refetch } = useGroupDetails(groupId);
  const { data: balances } = useGroupBalances(groupId);
  const userBalance = useUserBalance(groupId);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading || !group) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loading}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  const isUserOwed = userBalance && userBalance > 0n;
  const userOwes = userBalance && userBalance < 0n;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Group #{id}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* User Balance Card */}
        {userBalance !== null && userBalance !== 0n && (
          <Card variant="elevated" style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <Text style={[
              styles.balanceAmount,
              isUserOwed ? styles.balancePositive : styles.balanceNegative
            ]}>
              {isUserOwed ? '+' : ''}{formatBalance(userBalance)} ETH
            </Text>
            <Text style={styles.balanceText}>
              {isUserOwed ? 'You are owed' : 'You owe'}
            </Text>
            {userOwes && (
              <Button
                label="Settle Debts"
                variant="primary"
                size="sm"
                onPress={() => router.push({
                  pathname: '/groups/settle',
                  params: { groupId: id },
                })}
              />
            )}
          </Card>
        )}

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push({
                pathname: '/groups/expense/create',
                params: { groupId: id },
              })}
            >
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionLabel}>Add Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push({
                pathname: '/groups/settle',
                params: { groupId: id },
              })}
            >
              <Text style={styles.actionIcon}>💸</Text>
              <Text style={styles.actionLabel}>Settle</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Balances */}
        <Card>
          <Text style={styles.cardTitle}>Member Balances</Text>
          <View style={styles.balancesList}>
            {balances?.map((balance, i) => (
              <BalanceRow
                key={i}
                address={balance.address}
                balance={balance.balance}
                isCurrentUser={balance.address.toLowerCase() === userAddress?.toLowerCase()}
              />
            ))}
          </View>
        </Card>

        {/* Members */}
        <Card>
          <Text style={styles.cardTitle}>Members ({group.members.length})</Text>
          <View style={styles.membersList}>
            {group.members.map((member, i) => (
              <MemberRow
                key={i}
                address={member}
                isCreator={member.toLowerCase() === group.creator.toLowerCase()}
                isCurrentUser={member.toLowerCase() === userAddress?.toLowerCase()}
              />
            ))}
          </View>
        </Card>

        {/* Group Info */}
        <View style={styles.groupInfo}>
          <Text style={styles.groupInfoLabel}>Creator</Text>
          <Text style={styles.groupInfoValue}>
            {formatAddress(group.creator)}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function BalanceRow({ address, balance, isCurrentUser }: any) {
  const isPositive = balance > 0n;
  const isZero = balance === 0n;

  return (
    <View style={styles.balanceRow}>
      <View>
        <Text style={styles.balanceRowAddress}>
          {formatAddress(address)}
          {isCurrentUser && ' (You)'}
        </Text>
      </View>
      {!isZero && (
        <Text style={[
          styles.balanceRowAmount,
          isPositive ? styles.balanceRowPositive : styles.balanceRowNegative
        ]}>
          {isPositive ? '+' : ''}{formatBalance(balance)} ETH
        </Text>
      )}
      {isZero && (
        <Text style={styles.balanceRowSettled}>Settled</Text>
      )}
    </View>
  );
}

function MemberRow({ address, isCreator, isCurrentUser }: any) {
  return (
    <View style={styles.memberRow}>
      <View style={styles.memberLeft}>
        <View style={styles.memberAvatar}>
          <Text style={styles.memberAvatarText}>
            {isCreator ? '👑' : '👤'}
          </Text>
        </View>
        <View>
          <Text style={styles.memberAddress}>
            {formatAddress(address)}
          </Text>
          {(isCreator || isCurrentUser) && (
            <Text style={styles.memberLabel}>
              {isCreator && 'Creator'}
              {isCreator && isCurrentUser && ' • '}
              {isCurrentUser && 'You'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: SPACING.xxl + 20,
  },
  backButton: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary[600],
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  balanceCard: {
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  balanceLabel: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
  },
  balanceAmount: {
    ...TYPOGRAPHY.h1,
    fontSize: 48,
    fontWeight: '700',
  },
  balancePositive: {
    color: COLORS.success,
  },
  balanceNegative: {
    color: COLORS.error,
  },
  balanceText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  actionsCard: {
    marginBottom: SPACING.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.background.tertiary,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  actionIcon: {
    fontSize: 32,
  },
  actionLabel: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  cardTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  balancesList: {
    gap: SPACING.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  balanceRowAddress: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.primary,
  },
  balanceRowAmount: {
    ...TYPOGRAPHY.bodySm,
    fontWeight: '700',
  },
  balanceRowPositive: {
    color: COLORS.success,
  },
  balanceRowNegative: {
    color: COLORS.error,
  },
  balanceRowSettled: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
  membersList: {
    gap: SPACING.sm,
  },
  memberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary[100],
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontSize: 20,
  },
  memberAddress: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.primary,
  },
  memberLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  groupInfo: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  groupInfoLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
  groupInfoValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontFamily: 'monospace',
  },
});