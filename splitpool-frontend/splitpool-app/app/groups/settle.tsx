import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGroupBalances, useUserBalance, useGroupDetails } from '../../hooks/useGroups';
import { useWallet } from '../../hooks/useWallet';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { parseInputAmount, formatCurrency, formatAddress, formatBalance } from '../../lib/utils/format';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../lib/constants/theme';

export default function SettleDebtScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { address: userAddress } = useWallet();
  
  const { data: group } = useGroupDetails(BigInt(groupId));
  const { data: balances } = useGroupBalances(BigInt(groupId));
  const userBalance = useUserBalance(BigInt(groupId));
  
  const [selectedCreditor, setSelectedCreditor] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Find people the user owes money to
  const creditors = balances?.filter(b => 
    b.balance > 0n && 
    userBalance !== null && 
    userBalance < 0n
  ) || [];

  const selectedCreditorBalance = creditors.find(
    c => c.address.toLowerCase() === selectedCreditor?.toLowerCase()
  );

  const maxOwed = userBalance ? -userBalance : 0n;
  const amountWei = parseInputAmount(amount);

  const handleSettle = async () => {
    if (!selectedCreditor || amountWei === 0n) {
      Alert.alert('Error', 'Please select a creditor and enter an amount');
      return;
    }

    if (amountWei > maxOwed) {
      Alert.alert('Error', 'Amount exceeds your debt');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual contract call
      // await settleDebt(groupId, selectedCreditor, amountWei, ETH_ADDRESS);
      
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

  if (!group || !balances) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (userBalance === null || userBalance >= 0n) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settle Debts</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✓</Text>
          <Text style={styles.emptyTitle}>All Settled!</Text>
          <Text style={styles.emptyText}>
            You don't owe anyone in this group
          </Text>
          <Button
            label="Back to Group"
            variant="primary"
            onPress={() => router.back()}
          />
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
        <Text style={styles.title}>Settle Debts</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <Card variant="elevated" style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>You Owe</Text>
          <Text style={styles.balanceAmount}>
            {formatBalance(-userBalance)} ETH
          </Text>
        </Card>

        {/* Select Creditor */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>💸 Pay To</Text>
          
          <View style={styles.creditorsList}>
            {creditors.map((creditor, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.creditorItem,
                  selectedCreditor?.toLowerCase() === creditor.address.toLowerCase() && 
                    styles.creditorSelected,
                ]}
                onPress={() => setSelectedCreditor(creditor.address)}
              >
                <View style={styles.creditorLeft}>
                  <View style={[
                    styles.radio,
                    selectedCreditor?.toLowerCase() === creditor.address.toLowerCase() && 
                      styles.radioSelected,
                  ]}>
                    {selectedCreditor?.toLowerCase() === creditor.address.toLowerCase() && (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                  <Text style={styles.creditorAddress}>
                    {formatAddress(creditor.address)}
                  </Text>
                </View>
                <Text style={styles.creditorBalance}>
                  +{formatBalance(creditor.balance)} ETH
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Amount Input */}
        {selectedCreditor && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Amount</Text>
            
            <Input
              label="Amount to Pay (ETH)"
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              helperText={`Maximum: ${formatBalance(maxOwed)} ETH`}
            />

            <View style={styles.quickAmounts}>
              <TouchableOpacity
                style={styles.quickAmount}
                onPress={() => setAmount(formatBalance(maxOwed / 4n).replace(' ETH', ''))}
              >
                <Text style={styles.quickAmountText}>25%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAmount}
                onPress={() => setAmount(formatBalance(maxOwed / 2n).replace(' ETH', ''))}
              >
                <Text style={styles.quickAmountText}>50%</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAmount}
                onPress={() => setAmount(formatBalance(maxOwed).replace(' ETH', ''))}
              >
                <Text style={styles.quickAmountText}>Full</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Summary */}
        {selectedCreditor && amountWei > 0n && (
          <Card variant="elevated" style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Payment Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Paying to:</Text>
              <Text style={styles.summaryValue}>
                {formatAddress(selectedCreditor)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(amountWei)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelBold}>Remaining debt:</Text>
              <Text style={styles.summaryValueBold}>
                {formatBalance(-(userBalance + amountWei))} ETH
              </Text>
            </View>
          </Card>
        )}

        {/* Notice */}
        <Card variant="outlined" style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Text style={styles.noticeIcon}>⚠️</Text>
            <Text style={styles.noticeTitle}>Important</Text>
          </View>
          <Text style={styles.noticeText}>
            • Payment is sent directly on-chain{'\n'}
            • Transaction is immediate and non-refundable{'\n'}
            • Balances update after confirmation
          </Text>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            label={`Pay ${amountWei > 0n ? formatCurrency(amountWei) : 'Amount'}`}
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSettle}
            loading={loading}
            disabled={!selectedCreditor || amountWei === 0n || amountWei > maxOwed}
          />
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
    color: COLORS.error,
    fontWeight: '700',
  },
  section: {
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
  },
  creditorsList: {
    gap: SPACING.sm,
  },
  creditorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background.tertiary,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  creditorSelected: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  creditorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  radio: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.neutral[400],
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary[500],
  },
  radioDot: {
    width: 12,
    height: 12,
    backgroundColor: COLORS.primary[500],
    borderRadius: RADIUS.full,
  },
  creditorAddress: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.primary,
  },
  creditorBalance: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.success,
    fontWeight: '700',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickAmount: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.primary[100],
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  quickAmountText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.primary[600],
    fontWeight: '600',
  },
  summaryCard: {
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  summaryTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
  },
  summaryValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
  },
  summaryLabelBold: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  summaryValueBold: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary[600],
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
    marginVertical: SPACING.sm,
  },
  noticeCard: {
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
  actions: {
    paddingVertical: SPACING.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});