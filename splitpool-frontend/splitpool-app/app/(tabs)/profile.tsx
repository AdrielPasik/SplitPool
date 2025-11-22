import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useWallet } from '../../hooks/useWallet';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { formatAddress } from '../../lib/utils/format';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../lib/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { address, isConnected } = useWallet();

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement disconnect
            router.replace('/(auth)/connect-wallet');
          },
        },
      ]
    );
  };

  if (!isConnected || !address) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔌</Text>
          <Text style={styles.emptyTitle}>Not Connected</Text>
          <Text style={styles.emptyText}>
            Connect your wallet to view your profile
          </Text>
          <Button
            label="Connect Wallet"
            variant="primary"
            onPress={() => router.push('/(auth)/connect-wallet')}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Wallet Card */}
        <Card variant="elevated" style={styles.walletCard}>
          <View style={styles.walletAvatar}>
            <Text style={styles.walletAvatarText}>👤</Text>
          </View>
          <Text style={styles.walletLabel}>Connected Wallet</Text>
          <Text style={styles.walletAddress}>{formatAddress(address, 6)}</Text>
          <TouchableOpacity style={styles.copyButton}>
            <Text style={styles.copyButtonText}>📋 Copy Address</Text>
          </TouchableOpacity>
        </Card>

        {/* Network Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Network</Text>
          <View style={styles.networkRow}>
            <Text style={styles.networkLabel}>Base Sepolia</Text>
            <View style={styles.networkBadge}>
              <View style={styles.networkDot} />
              <Text style={styles.networkStatus}>Connected</Text>
            </View>
          </View>
        </Card>

        {/* Settings */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>🔔 Notifications</Text>
            <Text style={styles.settingValue}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>🌐 Language</Text>
            <Text style={styles.settingValue}>English ›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>💱 Currency</Text>
            <Text style={styles.settingValue}>ETH ›</Text>
          </TouchableOpacity>
        </Card>

        {/* About */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>📖 Documentation</Text>
            <Text style={styles.settingValue}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>💬 Support</Text>
            <Text style={styles.settingValue}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>ℹ Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </TouchableOpacity>
        </Card>

        {/* Disconnect */}
        <View style={styles.actions}>
          <Button
            label="Disconnect Wallet"
            variant="danger"
            size="lg"
            fullWidth
            onPress={handleDisconnect}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Built on Base • Powered by Filecoin
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
  walletCard: {
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  walletAvatar: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.primary[100],
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  walletAvatarText: {
    fontSize: 40,
  },
  walletLabel: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
  },
  walletAddress: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    fontFamily: 'monospace',
  },
  copyButton: {
    marginTop: SPACING.sm,
  },
  copyButtonText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.primary[600],
  },
  section: {
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
  },
  networkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  networkLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  networkDot: {
    width: 8,
    height: 8,
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.full,
  },
  networkStatus: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  settingLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
  },
  settingValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
  },
  actions: {
    paddingVertical: SPACING.xl,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
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