import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useUserPools } from '../../hooks/usePools';
import type { Pool, PartialPool } from '../../types/models';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { formatAddress, formatCurrency, formatPercentage } from '../../lib/utils/format';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../lib/constants/theme';

export default function PoolsScreen() {
  const router = useRouter();
  const { data: pools, isLoading, refetch } = useUserPools();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const normalized: PartialPool[] = (pools ?? []).map(p => p as PartialPool);
  const activePools = normalized.filter(p => p && p.status === 'Open');
  const completedPools = normalized.filter(p => p && p.status === 'Paid');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pools</Text>
        <Button
          label="Create Pool"
          variant="primary"
          size="sm"
          onPress={() => router.push('/pools/create')}
        />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activePools.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active ({activePools.length})</Text>
            {activePools.map((pool: PartialPool, i: number) => (
              <PoolCard
                key={i}
                pool={pool}
                onPress={() => router.push(`/pools/${pool.address}`)}
              />
            ))}
          </View>
        )}

        {completedPools.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed ({completedPools.length})</Text>
            {completedPools.map((pool: PartialPool, i: number) => (
              <PoolCard
                key={i}
                pool={pool}
                onPress={() => router.push(`/pools/${pool.address}`)}
              />
            ))}
          </View>
        )}

        {!isLoading && pools?.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyTitle}>No pools yet</Text>
            <Text style={styles.emptyText}>
              Create a pool to start splitting bills with friends
            </Text>
            <Button
              label="Create Your First Pool"
              variant="primary"
              onPress={() => router.push('/pools/create')}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function PoolCard({ pool, onPress }: { pool: PartialPool; onPress: () => void }) {
  const progress = Number(pool.collectedAmount) / Number(pool.totalAmount);
  const progressPercent = Math.round(progress * 100);

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.poolCard}>
        <View style={styles.poolHeader}>
          <View>
            <Text style={styles.poolMerchant}>
              {formatAddress(pool.merchant)}
            </Text>
            <Text style={styles.poolAmount}>
              {formatCurrency(pool.totalAmount)}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            pool.status === 'Paid' && styles.statusPaid
          ]}>
            <Text style={styles.statusText}>
              {pool.status}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {pool.paidCount}/{pool.participants.length} paid
          </Text>
        </View>

        {pool.hasPaid ? (
          <View style={styles.paidBadge}>
            <Text style={styles.paidText}>✓ You paid</Text>
          </View>
        ) : pool.status === 'Open' && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>
              Your share: {formatCurrency(pool.sharePerUser)}
            </Text>
          </View>
        )}
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
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  poolCard: {
    marginBottom: SPACING.md,
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  poolMerchant: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  poolAmount: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  statusBadge: {
    backgroundColor: COLORS.status.collecting,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    height: 24,
  },
  statusPaid: {
    backgroundColor: COLORS.status.paid,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.inverse,
    fontWeight: '600',
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
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
  },
  paidBadge: {
    backgroundColor: COLORS.primary[100],
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  paidText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.primary[600],
    fontWeight: '600',
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