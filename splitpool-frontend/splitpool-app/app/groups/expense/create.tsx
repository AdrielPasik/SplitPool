import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGroupDetails } from '../../../hooks/useGroups';
import { useWallet } from '../../../hooks/useWallet';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { parseInputAmount, formatCurrency, formatAddress } from '../../../lib/utils/format';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../../lib/constants/theme';

export default function CreateExpenseScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { address: userAddress } = useWallet();
  
  const { data: group } = useGroupDetails(BigInt(groupId));
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(
    new Set(userAddress ? [userAddress.toLowerCase()] : [])
  );
  const [loading, setLoading] = useState(false);

  const toggleParticipant = (address: string) => {
    const newSet = new Set(selectedParticipants);
    const lowerAddress = address.toLowerCase();
    
    // Always keep the payer (creator) selected
    if (lowerAddress === userAddress?.toLowerCase()) return;
    
    if (newSet.has(lowerAddress)) {
      newSet.delete(lowerAddress);
    } else {
      newSet.add(lowerAddress);
    }
    setSelectedParticipants(newSet);
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return false;
    }

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return false;
    }

    if (selectedParticipants.size === 0) {
      Alert.alert('Error', 'Select at least one participant');
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Implement actual contract call
      // 1. Upload metadata to Filecoin/IPFS
      // 2. Call addExpense on SplitGroup contract
      // const metadata = { title, description };
      // const cid = await uploadToFilecoin(metadata);
      // const metadataPointer = keccak256(cid);
      // const amountWei = parseInputAmount(amount);
      // const participants = Array.from(selectedParticipants);
      // await addExpense(groupId, amountWei, metadataPointer, participants);
      
      Alert.alert(
        'Success',
        'Expense created! Waiting for approvals.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create expense');
    } finally {
      setLoading(false);
    }
  };

  const amountWei = parseInputAmount(amount);
  const sharePerPerson = selectedParticipants.size > 0
    ? amountWei / BigInt(selectedParticipants.size)
    : 0n;

  if (!group) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Expense</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Expense Details</Text>
          
          <Input
            label="Title"
            placeholder="e.g., Dinner, Groceries, Rent"
            value={title}
            onChangeText={setTitle}
          />

          <Input
            label="Amount (ETH)"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <Input
            label="Description (Optional)"
            placeholder="Add more details..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Split Between</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Select who participated in this expense
            </Text>
          </View>

          <View style={styles.participantsList}>
            {group.members.map((member, i) => {
              const isSelected = selectedParticipants.has(member.toLowerCase());
              const isPayer = member.toLowerCase() === userAddress?.toLowerCase();
              
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.participantItem,
                    isSelected && styles.participantSelected,
                    isPayer && styles.participantPayer,
                  ]}
                  onPress={() => toggleParticipant(member)}
                  disabled={isPayer}
                >
                  <View style={styles.participantLeft}>
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View>
                      <Text style={styles.participantAddress}>
                        {formatAddress(member)}
                      </Text>
                      {isPayer && (
                        <Text style={styles.participantLabel}>You (Payer)</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.participantInfo}>
            <Text style={styles.participantInfoText}>
              {selectedParticipants.size} participant{selectedParticipants.size !== 1 ? 's' : ''} selected
            </Text>
          </View>
        </Card>

        {amountWei > 0n && selectedParticipants.size > 0 && (
          <Card variant="elevated" style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Split Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(amountWei)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Split {selectedParticipants.size} ways:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(sharePerPerson)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelBold}>You paid:</Text>
              <Text style={styles.summaryValueBold}>
                {formatCurrency(amountWei)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelBold}>Others owe you:</Text>
              <Text style={styles.summaryValueBold}>
                {formatCurrency(sharePerPerson * BigInt(selectedParticipants.size - 1))}
              </Text>
            </View>
          </Card>
        )}

        <Card variant="outlined" style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>📝 Note</Text>
          <Text style={styles.noticeText}>
            • All participants must approve this expense{'\n'}
            • Balances will update after all approvals{'\n'}
            • You're automatically included as payer
          </Text>
        </Card>

        <View style={styles.actions}>
          <Button
            label="Create Expense"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleCreate}
            loading={loading}
            disabled={!title.trim() || !amount || selectedParticipants.size === 0}
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
  section: {
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
  },
  infoBox: {
    backgroundColor: COLORS.primary[50],
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  infoText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
  },
  participantsList: {
    gap: SPACING.sm,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.background.tertiary,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  participantSelected: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  participantPayer: {
    backgroundColor: COLORS.primary[100],
  },
  participantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
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
  checkboxSelected: {
    backgroundColor: COLORS.primary[500],
    borderColor: COLORS.primary[500],
  },
  checkmark: {
    color: COLORS.text.inverse,
    fontWeight: '700',
    fontSize: 14,
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
  participantInfo: {
    padding: SPACING.sm,
    backgroundColor: COLORS.primary[50],
    borderRadius: RADIUS.sm,
  },
  participantInfoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
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
  noticeTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  noticeText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  actions: {
    paddingVertical: SPACING.xl,
  },
});