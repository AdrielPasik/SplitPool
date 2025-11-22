import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useWallet } from '../../hooks/useWallet';
import { COLORS, TYPOGRAPHY, SPACING } from '../../lib/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const { isConnected } = useWallet();

  useEffect(() => {
    // Simular carga inicial
    const timer = setTimeout(() => {
      if (isConnected) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(auth)/onboarding');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isConnected, router]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>💰</Text>
        <Text style={styles.title}>SplitPool</Text>
        <Text style={styles.subtitle}>Split bills, settle on-chain</Text>
        
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary[600]} />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Built on Base</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  logo: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xxl,
  },
  loader: {
    marginTop: SPACING.xl,
  },
  footer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
});