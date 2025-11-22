import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGroupDetails } from '../../../hooks/useGroups';
import { useWallet } from '../../../hooks/useWallet';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { StatusPill } from '../../../components/ui/StatusPill';
import { formatAddress, formatCurrency, formatRelativeTime } from '../../../lib/utils/format';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../lib/constants/theme';

export default function ExpenseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { address: userAddress } = useWallet();

  // Mock expense data - en producción vendría de useGroupExpenses
  const expense = {
    id: BigInt(id),
    groupId: 1n,
    payer: '0x4668F3EFcd94f8f13fbC31dECbE7D33af228012A' as const,
    amount: 9000000000000000n,
    metadataPointer: 0n,
    participants: [
      '0x4668F3EFcd94f8f13fbC31dECbE7D33af228012A' as const,
      '0xb7803f1efcb613b6A6bE4FE2fB4dBf860712e28C' as const,
    ],
    applied: false,
    exists: true,
    metadata: {
      title: 'Dinner at Restaurant',
      description: 'Group dinner on Friday night',
    },
    createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
  };

  const sharePerPerson = expense.amount / BigInt(expense.participants.length);
  const isPayer = expense.payer.toLowerCase() === userAddress?.toLowerCase();
  const isParticipant = expense.participants.some(
    p => p.toLowerCase() === userAddress?.toLowerCase()
  );
  const hasApproved = false; // Mock - en producción vendría del contrato

  const handleApprove = async () => {
    Alert.alert(
      'Approve Expense',
      'Are you sure you want to approve this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              // TODO: Implement approveExpense transaction
              Alert.alert('Success', 'Expense approved!', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to approve expense');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Expense Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <Card variant="elevated" style={styles.statusCard}>
          <StatusPill 
            status={expense.applied ? 'approved' : 'pending'} 
            size="md" 
          />
          <Text style={styles.expenseTitle}>
            {expense.metadata?.title || 'Expense'}
          </Text>
          <Text style={styles.amountValue}>
            {formatCurrency(expense.amount)}
          </Text>
          <Text style={styles.timeAgo}>
            {formatRelativeTime(expense.createdAt)}
          </Text>
        </Card>

        {/* Details Card */}
        <Card style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Paid by</Text>
            <Text style={styles.detailValue}>
              {formatAddress(expense.payer)}
              {isPayer && ' (You)'}
            </Text>
          </View>

          {expense.metadata?.description && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={[styles.detailValue, styles.descriptionText]}>
                  {expense.metadata.description}
                </Text>
              </View>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Split</Text>
            <Text style={styles.detailValue}>
              {expense.participants.length} people
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Share per person</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(sharePerPerson)}
            </Text>
          </View>
        </Card>

        {/* Participants Card */}
        <Card style={styles.participantsCard}>
          <Text style={styles.cardTitle}>Participants</Text>
          
          {expense.participants.map((participant, i) => (
            <View key={i} style={styles.participantRow}>
              <View style={styles.participantLeft}>
                <View style={styles.participantAvatar}>
                  <Text style={styles.participantAvatarText}>
                    {participant.toLowerCase() === expense.payer.toLowerCase() 
                      ? '💰' 
                      : '👤'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.participantAddress}>
                    {formatAddress(participant)}
                    {participant.toLowerCase() === userAddress?.toLowerCase() && ' (You)'}
                  </Text>
                  {participant.toLowerCase() === expense.payer.toLowerCase() && (
                    <Text style={styles.participantLabel}>Payer</Text>
                  )}
                </View>
              </View>
              <Text style={styles.participantShare}>
                {formatCurrency(sharePerPerson)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Action */}
        {isParticipant && !isPayer && !hasApproved && !expense.applied && (
          <View style={styles.actions}>
            <Button
              label="Approve Expense"
              variant="primary"
              size="lg"
              fullWidth
              onPress={handleApprove}
            />
          </View>
        )}

        {hasApproved && !expense.applied && (
          <View style={styles.approvedBanner}>
            <Text style={styles.approvedText}>✓ You approved this expense</Text>
            <Text style={styles.approvedSubtext}>
              Waiting for other participants
            </Text>
          </View>
        )}

        {expense.applied && (
          <View style={styles.appliedBanner}>
            <Text style={styles.appliedText}>✓ Expense Applied</Text>
            <Text style={styles.appliedSubtext}>
              Balances have been updated
            </Text>
          </View>
        )}
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  statusCard: {
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  expenseTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  amountValue: {
    ...TYPOGRAPHY.h1,
    fontSize: 48,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  timeAgo: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
  },
  detailsCard: {
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  cardTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  detailLabel: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
  },
  detailValue: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  descriptionText: {
    flex: 1,
    marginLeft: SPACING.md,
    textAlign: 'right',
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
    flex: 1,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary[100],
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  participantAvatarText: {
    fontSize: 20,
  },
  participantAddress: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.primary,
  },
  participantLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  participantShare: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  actions: {
    paddingVertical: SPACING.xl,
  },
  approvedBanner: {
    backgroundColor: COLORS.success + '20',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  approvedText: {
    ...TYPOGRAPHY.body,
    color: COLORS.success,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  approvedSubtext: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
  },
  appliedBanner: {
    backgroundColor: COLORS.primary[100],
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  appliedText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary[600],
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  appliedSubtext: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
  },
});