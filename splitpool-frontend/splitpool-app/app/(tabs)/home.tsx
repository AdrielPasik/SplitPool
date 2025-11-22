import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useWallet } from '../../hooks/useWallet';
import { useUserPools } from '../../hooks/usePools';
import { useUserGroups } from '../../hooks/useGroups';
import { Button } from '../../components/ui/Button';
import { formatAddress } from '../../lib/utils/format';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../lib/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { address, isConnected } = useWallet();
  const { data: pools, isLoading: poolsLoading } = useUserPools();
  const { data: groupIds, isLoading: groupsLoading } = useUserGroups();

  if (!isConnected) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please connect your wallet</Text>
        <Button 
          label="Connect" 
          onPress={() => router.push('/(auth)/connect-wallet')}
        />
      </View>
    );
  }

  const activePools = pools?.filter(p => p?.status === 'Open') ?? [];
  const activeGroups = groupIds ?? [];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back! 👋</Text>
          <Text style={styles.address}>{formatAddress(address!)}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <StatCard
          label="Active Pools"
          value={activePools.length}
          icon="💰"
          onPress={() => router.push('/(tabs)/pools')}
        />
        <StatCard
          label="Groups"
          value={activeGroups.length}
          icon="👥"
          onPress={() => router.push('/(tabs)/groups')}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.actions}>
          <ActionCard
            icon="➕"
            title="Create Pool"
            subtitle="Split a new bill"
            onPress={() => router.push('/pools/create')}
          />
          <ActionCard
            icon="👥"
            title="New Group"
            subtitle="Start a new group"
            onPress={() => router.push('/groups/create')}
          />
        </View>
      </View>

      {activePools.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Pools</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/pools')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {activePools.slice(0, 3).map((pool, i) => (
            <TouchableOpacity
              key={i}
              style={styles.poolItem}
              onPress={() => router.push(`/pools/${pool.address}`)}
            >
              <View style={styles.poolInfo}>
                <Text style={styles.poolMerchant}>
                  {formatAddress(pool.merchant)}
                </Text>
                <Text style={styles.poolStatus}>
                  {pool.paidCount}/{pool.participants.length} paid
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function StatCard({ label, value, icon, onPress }: any) {
  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function ActionCard({ icon, title, subtitle, onPress }: any) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    padding: SPACING.xl,
    paddingTop: SPACING.xxl + 20,
  },
  greeting: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  address: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
  },
  stats: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
  },
  section: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  seeAll: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.primary[600],
  },
  actions: {
    gap: SPACING.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  actionIcon: {
    fontSize: 32,
  },
  actionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
  },
  actionSubtitle: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
  },
  poolItem: {
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  poolInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  poolMerchant: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
  },
  poolStatus: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
});