import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePoolDetails } from '../../hooks/usePools';
import { useWallet } from '../../hooks/useWallet';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { formatCurrency, formatAddress } from '../../lib/utils/format';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../lib/constants/theme';
import type { Address } from '../../types/models';

export default function PayPoolScreen() {
  const router = useRouter();
  const { poolAddress } = useLocalSearchParams<{ poolAddress: string }>();
  const { address: userAddress } = useWallet();
  
  const { data: pool } = usePoolDetails(poolAddress as Address);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handlePay = async () => {
    if (!pool || !userAddress) return;

    setLoading(true);
    try {
      // TODO: Implement actual payment transaction
      // const { request } = await publicClient.simulateContract({
      //   address: pool.address,
      //   abi: SPLITPOOL_ABI,
      //   functionName: 'payShare',
      //   account: userAddress,
      //   value: pool.sharePerUser,
      // });
      // await walletClient.writeContract(request);

      Alert.alert(
        'Payment Sent',
        'Your payment is being processed',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!pool) {
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pay Your Share</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Amount Card */}
        <Card variant="elevated" style={styles.amountCard}>
          <Text style={styles.amountLabel}>You're paying</Text>
          <Text style={styles.amountValue}>
            {formatCurrency(pool.sharePerUser)}
          </Text>
          <View style={styles.tokenBadge}>
            <Text style={styles.tokenText}>ETH on Base</Text>
          </View>
        </Card>

        {/* Pool Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Pool Details</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Merchant</Text>
            <Text style={styles.infoValue}>{formatAddress(pool.merchant)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Pool</Text>
            <Text style={styles.infoValue}>{formatCurrency(pool.totalAmount)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Participants</Text>
            <Text style={styles.infoValue}>{pool.participants.length}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Already Paid</Text>
            <Text style={styles.infoValue}>
              {pool.paidCount}/{pool.participants.length}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Collected</Text>
            <Text style={styles.infoValue}>
              {formatCurrency(pool.collectedAmount)}
            </Text>
          </View>
        </Card>

        {/* Important Notice */}
        <Card style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Text style={styles.noticeIcon}>⚠️</Text>
            <Text style={styles.noticeTitle}>Important</Text>
          </View>
          <Text style={styles.noticeText}>
            • This transaction is non-refundable{'\n'}
            • Funds will be sent to the merchant when the pool is complete{'\n'}
            • You can only pay once per pool{'\n'}
            • Make sure you trust the merchant
          </Text>
        </Card>

        {/* Confirmation */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setConfirmed(!confirmed)}
        >
          <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
            {confirmed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I understand and want to proceed with this payment
          </Text>
        </TouchableOpacity>

        {/* Action */}
        <View style={styles.actions}>
          <Button
            label={`Pay ${formatCurrency(pool.sharePerUser)}`}
            variant="primary"
            size="lg"
            fullWidth
            onPress={handlePay}
            loading={loading}
            disabled={!confirmed}
          />
          <Button
            label="Cancel"
            variant="ghost"
            size="md"
            fullWidth
            onPress={() => router.back()}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Pool Contract: {formatAddress(pool.address)}
          </Text>
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
  amountCard: {
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  amountLabel: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
  },
  amountValue: {
    ...TYPOGRAPHY.h1,
    fontSize: 48,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  tokenBadge: {
    backgroundColor: COLORS.primary[100],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  tokenText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  infoCard: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  infoTitle: {
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
  noticeCard: {
    backgroundColor: COLORS.warning + '10',
    borderWidth: 1,
    borderColor: COLORS.warning + '40',
    marginBottom: SPACING.lg,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  noticeIcon: {
    fontSize: 20,
  },
  noticeTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  noticeText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.neutral[400],
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[500],
  },
  checkmark: {
    color: COLORS.text.inverse,
    fontWeight: '700',
  },
  checkboxLabel: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.primary,
    flex: 1,
  },
  actions: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
});