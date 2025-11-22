import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useWallet } from '../../hooks/useWallet';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../lib/constants/theme';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { address, isConnected } = useWallet();
  
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<string[]>([address || '']);
  const [loading, setLoading] = useState(false);

  const handleAddMember = () => {
    setMembers([...members, '']);
  };

  const handleRemoveMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...members];
    newMembers[index] = value;
    setMembers(newMembers);
  };

  const validateForm = () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return false;
    }

    const validMembers = members.filter(m => 
      m.match(/^0x[a-fA-F0-9]{40}$/)
    );

    if (validMembers.length < 2) {
      Alert.alert('Error', 'Group must have at least 2 valid members');
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
      // 2. Call createGroup on SplitGroup contract
      // const metadata = { name: groupName, description };
      // const cid = await uploadToFilecoin(metadata);
      // const metadataPointer = keccak256(cid);
      // const validMembers = members.filter(m => m.match(/^0x[a-fA-F0-9]{40}$/));
      // await createGroup(validMembers, metadataPointer);
      
      Alert.alert(
        'Success',
        'Group created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const validMembersCount = members.filter(m => 
    m.match(/^0x[a-fA-F0-9]{40}$/)
  ).length;

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
        <Text style={styles.title}>Create Group</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Group Info</Text>
          
          <Input
            label="Group Name"
            placeholder="e.g., Weekend Trip, Apartment Expenses"
            value={groupName}
            onChangeText={setGroupName}
          />

          <Input
            label="Description (Optional)"
            placeholder="What's this group for?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👥 Members</Text>
            <TouchableOpacity onPress={handleAddMember}>
              <Text style={styles.addButton}>+ Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Add wallet addresses of people you want to split expenses with
            </Text>
          </View>

          {members.map((member, index) => (
            <View key={index} style={styles.memberRow}>
              <Input
                placeholder={index === 0 ? 'You (creator)' : `Member ${index + 1} address (0x...)`}
                value={member}
                onChangeText={(value) => handleMemberChange(index, value)}
                autoCapitalize="none"
                autoCorrect={false}
                editable={index !== 0} // First member (creator) is not editable
                style={{ flex: 1 }}
              />
              {members.length > 2 && index !== 0 && (
                <TouchableOpacity
                  onPress={() => handleRemoveMember(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <View style={styles.memberInfo}>
            <Text style={styles.memberInfoText}>
              {validMembersCount} valid member{validMembersCount !== 1 ? 's' : ''}
              {validMembersCount < 2 && ' (minimum 2 required)'}
            </Text>
          </View>
        </Card>

        <Card variant="outlined" style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>How it works</Text>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>
              Create a group with your friends
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>
              Add expenses and specify who participated
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>
              Everyone approves expenses they were part of
            </Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.stepText}>
              Settle balances on-chain when ready
            </Text>
          </View>
        </Card>

        <View style={styles.actions}>
          <Button
            label="Create Group"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleCreate}
            loading={loading}
            disabled={!groupName.trim() || validMembersCount < 2}
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
  memberRow: {
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
  memberInfo: {
    padding: SPACING.sm,
    backgroundColor: COLORS.primary[50],
    borderRadius: RADIUS.sm,
  },
  memberInfoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  summaryCard: {
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  summaryTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  step: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.primary[500],
    color: COLORS.text.inverse,
    borderRadius: RADIUS.full,
    textAlign: 'center',
    lineHeight: 24,
    ...TYPOGRAPHY.bodySm,
    fontWeight: '700',
  },
  stepText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
    flex: 1,
  },
  actions: {
    paddingVertical: SPACING.xl,
  },
});