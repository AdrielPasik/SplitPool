import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, RADIUS, TYPOGRAPHY, SHADOWS } from '../../lib/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onPress,
  icon,
}: ButtonProps) {
  const containerStyle: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`],
    styles[`variant_${variant}`],
    fullWidth ? styles.fullWidth : undefined,
    (disabled || loading) ? styles.disabled : undefined,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' || variant === 'danger' ? COLORS.text.inverse : COLORS.primary[600]} 
        />
      ) : (
        <>
          {icon}
          <Text style={textStyle}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  // Sizes
  size_sm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  size_md: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  size_lg: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  // Variants
  variant_primary: {
    backgroundColor: COLORS.primary[500],
    ...SHADOWS.sm,
  },
  variant_secondary: {
    backgroundColor: COLORS.primary[100],
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary[400],
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  variant_danger: {
    backgroundColor: COLORS.error,
    ...SHADOWS.sm,
  },
  // Text styles
  text: {
    ...TYPOGRAPHY.button,
  },
  text_primary: {
    color: COLORS.text.inverse,
  },
  text_secondary: {
    color: COLORS.primary[600],
  },
  text_outline: {
    color: COLORS.primary[600],
  },
  text_ghost: {
    color: COLORS.text.primary,
  },
  text_danger: {
    color: COLORS.text.inverse,
  },
});