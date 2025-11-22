import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { usePoolDetails } from '../../hooks/usePools';
import { useWallet } from '../../hooks/useWallet';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusPill } from '../../components/ui/StatusPill';
import { formatAddress, formatCurrency } from '../../lib/utils/format';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../lib/constants/theme';
import type { Address } from '../../types/models';

export default function PoolDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { address: userAddress } = useWallet();
  
  const { data: pool, isLoading, refetch } = usePoolDetails(id as Address);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading || !pool) {
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

  // Normalizar valores numéricos (collectedAmount y totalAmount pueden llegar como bigint o string)
  const collected = typeof pool.collectedAmount === 'bigint' ? Number(pool.collectedAmount) : Number(pool.collectedAmount || 0);
  const total = typeof pool.totalAmount === 'bigint' ? Number(pool.totalAmount) : Number(pool.totalAmount || 0);
  const progress = total > 0 ? collected / total : 0;
  const progressPercent = Math.min(100, Math.round(progress * 100));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pool Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Status Card */}
        <Card variant="elevated" style={styles.statusCard}>
          <StatusPill status={pool.status} size="md" />
          <Text style={styles.amountLabel}>Total Pool</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(pool.totalAmount)}
          </Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {formatCurrency(pool.collectedAmount)} collected ({progressPercent}%)
            </Text>
          </View>
        </Card>

        {/* Pool Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Merchant</Text>
            <Text style={styles.infoValue}>{formatAddress(pool.merchant)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Share per person</Text>
            <Text style={styles.infoValue}>{formatCurrency(pool.sharePerUser)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Participants</Text>
            <Text style={styles.infoValue}>{pool.participants.length}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Paid</Text>
            <Text style={styles.infoValue}>
              {pool.paidCount}/{pool.participants.length}
            </Text>
          </View>
        </Card>

        {/* Participants */}
        <Card style={styles.participantsCard}>
          <Text style={styles.cardTitle}>Participants</Text>
          {pool.participants.map((participant, i) => {
            const isPaid = i < pool.paidCount; // Simplified check
            const isCurrentUser = participant.toLowerCase() === userAddress?.toLowerCase();
            
            return (
              <View key={i} style={styles.participantRow}>
                <View style={styles.participantLeft}>
                  <View style={[
                    styles.participantIcon,
                    isPaid && styles.participantIconPaid,
                  ]}>
                    <Text style={styles.participantIconText}>
                      {isPaid ? '✓' : '👤'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.participantAddress}>
                      {formatAddress(participant)}
                      {isCurrentUser && ' (You)'}
                    </Text>
                    <Text style={[
                      styles.participantStatus,
                      isPaid && styles.participantStatusPaid,
                    ]}>
                      {isPaid ? 'Paid' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </Card>

        {/* Action */}
        {!pool.hasPaid && pool.status === 'Open' && (
          <View style={styles.actions}>
            <Button
              label={`Pay ${formatCurrency(pool.sharePerUser)}`}
              variant="primary"
              size="lg"
              fullWidth
              onPress={() => router.push({
                pathname: '/pools/pay',
                params: { poolAddress: pool.address },
              })}
            />
          </View>
        )}

        {pool.hasPaid && (
          <View style={styles.paidBanner}>
            <Text style={styles.paidText}>✓ You've paid your share</Text>
          </View>
        )}

        {/* Contract Info */}
        <View style={styles.footer}>
          <Text style={styles.footerLabel}>Contract Address</Text>
          <Text style={styles.footerValue}>{formatAddress(pool.address, 8)}</Text>
        </View>
      </ScrollView>
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
  statusCard: {
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  amountLabel: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
  },
  amountValue: {
    ...TYPOGRAPHY.h1,
    fontSize: 48,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  progressContainer: {
    width: '100%',
    gap: SPACING.xs,
    marginTop: SPACING.md,
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
    textAlign: 'center',
  },
  infoCard: {
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  cardTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  infoLabel: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
  },
  infoValue: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
    marginVertical: SPACING.sm,
  },
  participantsCard: {
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  participantIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.neutral[200],
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantIconPaid: {
    backgroundColor: COLORS.success + '20',
  },
  participantIconText: {
    fontSize: 20,
  },
  participantAddress: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.primary,
  },
  participantStatus: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
  participantStatusPaid: {
    color: COLORS.success,
  },
  actions: {
    paddingVertical: SPACING.xl,
  },
  paidBanner: {
    backgroundColor: COLORS.success + '20',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  paidText: {
    ...TYPOGRAPHY.body,
    color: COLORS.success,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.xs,
  },
  footerLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
  footerValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    fontFamily: 'monospace',
  },
});