import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useUserGroups, useGroupDetails, useUserBalance } from '../../hooks/useGroups';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { formatAddress, formatBalance } from '../../lib/utils/format';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../lib/constants/theme';

export default function GroupsScreen() {
  const router = useRouter();
  const { data: groupIds, isLoading, refetch } = useUserGroups();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
        <Button
          label="New Group"
          variant="primary"
          size="sm"
          onPress={() => router.push('/groups/create')}
        />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {groupIds && groupIds.length > 0 ? (
          <View style={styles.groupsList}>
            {groupIds.map((groupId) => (
              <GroupCard
                key={groupId.toString()}
                groupId={groupId}
                onPress={() => router.push(`/groups/${groupId.toString()}`)}
              />
            ))}
          </View>
        ) : !isLoading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>No groups yet</Text>
            <Text style={styles.emptyText}>
              Create a group to track shared expenses with friends
            </Text>
            <Button
              label="Create Your First Group"
              variant="primary"
              onPress={() => router.push('/groups/create')}
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function GroupCard({ groupId, onPress }: { groupId: bigint; onPress: () => void }) {
  const { data: group } = useGroupDetails(groupId);
  const userBalance = useUserBalance(groupId);

  if (!group) return null;

  const isOwed = userBalance && userBalance > 0n;
  const owes = userBalance && userBalance < 0n;

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.groupCard}>
        <View style={styles.groupHeader}>
          <View style={styles.groupIcon}>
            <Text style={styles.groupIconText}>👥</Text>
          </View>
          <View style={styles.groupInfo}>
            <Text style={styles.groupName}>
              Group #{groupId.toString()}
            </Text>
            <Text style={styles.groupMembers}>
              {group.members.length} members
            </Text>
          </View>
          {userBalance !== null && userBalance !== 0n && (
            <View style={styles.balanceContainer}>
              <Text style={[
                styles.balanceAmount,
                isOwed ? styles.balancePositive : styles.balanceNegative
              ]}>
                {isOwed ? '+' : ''}{formatBalance(userBalance)} ETH
              </Text>
              <Text style={styles.balanceLabel}>
                {isOwed ? 'you are owed' : 'you owe'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.groupFooter}>
          <Text style={styles.groupCreator}>
            Creator: {formatAddress(group.creator)}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
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
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  groupsList: {
    gap: SPACING.md,
  },
  groupCard: {
    gap: SPACING.md,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  groupIcon: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.primary[100],
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupIconText: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
    gap: SPACING.xs,
  },
  groupName: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  groupMembers: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
  },
  balanceContainer: {
    alignItems: 'flex-end',
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
  groupFooter: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  groupCreator: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
    gap: SPACING.md,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});