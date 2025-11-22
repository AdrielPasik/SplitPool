import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useWallet } from '../../hooks/useWallet';
import { formatAddress } from '../../lib/utils/format';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../../lib/constants/theme';

interface WalletConnectButtonProps {
  variant?: 'full' | 'compact';
  showBalance?: boolean;
  onPress?: () => void;
}

export function WalletConnectButton({
  variant = 'full',
  showBalance = false,
  onPress,
}: WalletConnectButtonProps) {
  const { address, isConnected, loading, connect } = useWallet();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (!isConnected) {
      connect();
    }
  };

  if (loading) {
    return (
      <View style={[styles.button, styles.buttonLoading]}>
        <ActivityIndicator size="small" color={COLORS.primary[600]} />
      </View>
    );
  }

  if (!isConnected) {
    return (
      <TouchableOpacity
        style={[styles.button, styles.buttonConnect]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonConnectText}>Connect Wallet</Text>
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.button, styles.buttonCompact]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.addressText}>
          {formatAddress(address!, 4)}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.button, styles.buttonFull]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>👤</Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.label}>Connected</Text>
        <Text style={styles.addressText}>
          {formatAddress(address!, 6)}
        </Text>
      </View>

      <View style={styles.statusDot} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  buttonLoading: {
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
  },
  buttonConnect: {
    backgroundColor: COLORS.primary[500],
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  buttonConnectText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.inverse,
  },
  buttonCompact: {
    backgroundColor: COLORS.background.secondary,
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  buttonFull: {
    backgroundColor: COLORS.background.secondary,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
  },
  info: {
    flex: 1,
    gap: SPACING.xs / 2,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  addressText: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.primary,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.success,
  },
});