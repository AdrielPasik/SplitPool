import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../../lib/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ 
  children, 
  style, 
  variant = 'default',
  padding = 'md',
}: CardProps) {
  return (
    <View style={[
      styles.base,
      styles[`variant_${variant}`],
      styles[`padding_${padding}`],
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  // Variants
  variant_default: {
    backgroundColor: COLORS.background.secondary,
  },
  variant_elevated: {
    backgroundColor: COLORS.background.primary,
    ...SHADOWS.md,
  },
  variant_outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
  },
  // Padding
  padding_none: {
    padding: 0,
  },
  padding_sm: {
    padding: SPACING.sm,
  },
  padding_md: {
    padding: SPACING.md,
  },
  padding_lg: {
    padding: SPACING.lg,
  },
});