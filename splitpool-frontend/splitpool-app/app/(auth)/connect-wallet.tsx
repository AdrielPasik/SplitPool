import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../lib/constants/theme';

export default function ConnectWalletScreen() {
  const router = useRouter();
  const { address, isConnected, connect } = useWallet();

  useEffect(() => {
    if (isConnected && address) {
      // Navegar a home cuando se conecta exitosamente
      router.replace('/(tabs)/home');
    }
  }, [isConnected, address, router]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error: any) {
      Alert.alert('Connection Failed', error.message || 'Failed to connect wallet');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.icon}>🔐</Text>
          <Text style={styles.title}>Connect Your Wallet</Text>
          <Text style={styles.subtitle}>
            Connect your wallet to start splitting bills and managing expenses
          </Text>
        </View>

        <View style={styles.features}>
          <Card style={styles.feature}>
            <Text style={styles.featureIcon}>✓</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Secure</Text>
              <Text style={styles.featureDescription}>
                Your keys, your crypto
              </Text>
            </View>
          </Card>

          <Card style={styles.feature}>
            <Text style={styles.featureIcon}>✓</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>On-Chain</Text>
              <Text style={styles.featureDescription}>
                All settlements on Base
              </Text>
            </View>
          </Card>

          <Card style={styles.feature}>
            <Text style={styles.featureIcon}>✓</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Transparent</Text>
              <Text style={styles.featureDescription}>
                Track every transaction
              </Text>
            </View>
          </Card>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          label="Connect Wallet"
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleConnect}
        />
        
        <View style={styles.info}>
          <Text style={styles.infoText}>
            By connecting, you agree to our Terms of Service
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  icon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  features: {
    gap: SPACING.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  featureIcon: {
    fontSize: 24,
    color: COLORS.success,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  featureDescription: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.secondary,
  },
  actions: {
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  info: {
    alignItems: 'center',
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    textAlign: 'center',
  },
});