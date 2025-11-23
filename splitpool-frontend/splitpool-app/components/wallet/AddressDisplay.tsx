import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { formatAddress } from '../../lib/utils/format';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../lib/constants/theme';
import type { Address } from '../../types/models';

interface AddressDisplayProps {
  address: Address;
  showCopy?: boolean;
  showFull?: boolean;
  chars?: number;
  style?: any;
}

export function AddressDisplay({
  address,
  showCopy = true,
  showFull = false,
  chars = 4,
  style,
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Use native clipboard API when available, fallback to web Clipboard
      if (Clipboard && typeof (Clipboard as any).setString === 'function') {
        (Clipboard as any).setString(address);
      } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(address);
      } else {
        throw new Error('No clipboard available');
      }
      setCopied(true);
      Alert.alert('Copied!', 'Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy address');
    }
  };

  const displayAddress = showFull ? address : formatAddress(address, chars);

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.address}>{displayAddress}</Text>
      {showCopy && (
        <TouchableOpacity
          onPress={handleCopy}
          style={styles.copyButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.copyIcon}>
            {copied ? '✓' : '📋'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  address: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.primary,
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: SPACING.xs,
  },
  copyIcon: {
    fontSize: 16,
  },
});