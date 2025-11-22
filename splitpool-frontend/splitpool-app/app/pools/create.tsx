import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useWallet } from '../../hooks/useWallet';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { parseInputAmount, formatCurrency } from '../../lib/utils/format';
import { validatePoolCreation } from '../../lib/utils/validation';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../lib/constants/theme';

export default function CreatePoolScreen() {
  const router = useRouter();
  const { address, isConnected } = useWallet();
  
  const [merchantAddress, setMerchantAddress] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState<string[]>([address || '']);
  const [loading, setLoading] = useState(false);

  const handleAddParticipant = () => {
    setParticipants([...participants, '']);
  };

  const handleRemoveParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const handleParticipantChange = (index: number, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = value;
    setParticipants(newParticipants);
  };

  const handleCreate = async () => {
    const validation = validatePoolCreation({
      merchantAddress,
      totalAmount,
      participants,
    });

    if (!validation.valid) {
      Alert.alert('Error', validation.error);
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual contract call
      // const validParticipants = participants.filter(p => isValidAddress(p));
      // const amountWei = parseInputAmount(totalAmount);
      // await executeCreatePool(
      //   FACTORY_ADDRESS,
      //   ZERO_ADDRESS, // no group
      //   merchantAddress,
      //   amountWei,
      //   validParticipants
      // );
      
      Alert.alert(
        'Success',
        'Pool created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create pool');
    } finally {
      setLoading(false);
    }
  };

  const amountWei = parseInputAmount(totalAmount);
  const validParticipants = participants.filter(p => 
    p.match(/^0x[a-fA-F0-9]{40}$/)
  );
  const sharePerUser = validParticipants.length > 0
    ? amountWei / BigInt(validParticipants.length)
    : 0n;

  if (!isConnected) {
    return (
      <View style={styles.container}>
        <Text>Please connect your wallet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Pool</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Pool Details</Text>
          
          <Input
            label="Merchant Address"
            placeholder="0x..."
            value={merchantAddress}
            onChangeText={setMerchantAddress}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Total Amount (ETH)"
            placeholder="0.00"
            value={totalAmount}
            onChangeText={setTotalAmount}
            keyboardType="decimal-pad"
            helperText="Must be evenly divisible by number of participants"
          />

          <Input
            label="Description (Optional)"
            placeholder="What is this payment for?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👥 Participants</Text>
            <TouchableOpacity onPress={handleAddParticipant}>
              <Text style={styles.addButton}>+ Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Add wallet addresses of people who will split this payment
            </Text>
          </View>

          {participants.map((participant, index) => (
            <View key={index} style={styles.participantRow}>
              <Input
                placeholder={index === 0 ? 'You (creator)' : Participant ${index + 1} (0x...)}
                value={participant}
                onChangeText={(value) => handleParticipantChange(index, value)}
                autoCapitalize="none"
                autoCorrect={false}
                editable={index !== 0}
                style={{ flex: 1 }}
              />
              {participants.length > 2 && index !== 0 && (
                <TouchableOpacity
                  onPress={() => handleRemoveParticipant(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <View style={styles.participantInfo}>
            <Text style={styles.participantInfoText}>
              {validParticipants.length} valid participant{validParticipants.length !== 1 ? 's' : ''}
              {validParticipants.length === 0 && ' (minimum 1 required)'}
            </Text>
          </View>
        </Card>

        {amountWei > 0n && validParticipants.length > 0 && (
          <Card variant="elevated" style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Payment Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount:</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(amountWei)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Participants:</Text>
              <Text style={styles.summaryValue}>
                {validParticipants.length}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelBold}>Share per person:</Text>
              <Text style={styles.summaryValueBold}>
                {formatCurrency(sharePerUser)}
              </Text>
            </View>
          </Card>
        )}

        <Card variant="outlined" style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>📝 How it works</Text>
          <Text style={styles.noticeText}>
            • Each participant pays their equal share{'\n'}
            • Funds are pooled in the contract{'\n'}
            • When everyone pays, funds go to merchant{'\n'}
            • Payments are non-refundable
          </Text>
        </Card>

        <View style={styles.actions}>
          <Button
            label="Create Pool"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleCreate}
            loading={loading}
            disabled={!merchantAddress || !totalAmount || validParticipants.length === 0}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
  },
  addButton: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.primary[600],
    fontWeight: '600',
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
  participantRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  removeButton: {
    width: 40,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.error + '20',
    borderRadius: RADIUS.md,
  },
  removeButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.error,
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