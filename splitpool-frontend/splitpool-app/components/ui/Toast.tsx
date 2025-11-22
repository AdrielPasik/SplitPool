import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '../../lib/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  visible: boolean;
  onHide: () => void;
}

export function Toast({
  message,
  type = 'info',
  duration = 3000,
  visible,
  onHide,
}: ToastProps) {
  const [translateY] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (visible) {
      // Mostrar toast
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      // Auto-hide después de duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        styles[`type_${type}`],
        { transform: [{ translateY }] },
      ]}
    >
      <View style={[styles.iconContainer, styles[`iconContainer_${type}`]]}>
        <Text style={styles.icon}>{getIcon()}</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

// Hook para usar Toast fácilmente
export function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    visible: boolean;
  }>({
    message: '',
    type: 'info',
    visible: false,
  });

  const show = (message: string, type: ToastType = 'info') => {
    setToast({ message, type, visible: true });
  };

  const hide = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  const ToastComponent = () => (
    <Toast
      message={toast.message}
      type={toast.type}
      visible={toast.visible}
      onHide={hide}
    />
  );

  return {
    show,
    hide,
    showSuccess: (message: string) => show(message, 'success'),
    showError: (message: string) => show(message, 'error'),
    showWarning: (message: string) => show(message, 'warning'),
    showInfo: (message: string) => show(message, 'info'),
    ToastComponent,
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: SPACING.xl,
    right: SPACING.xl,
    maxWidth: SCREEN_WIDTH - (SPACING.xl * 2),
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.lg,
    zIndex: 9999,
  },
  type_success: {
    backgroundColor: COLORS.success,
  },
  type_error: {
    backgroundColor: COLORS.error,
  },
  type_warning: {
    backgroundColor: COLORS.warning,
  },
  type_info: {
    backgroundColor: COLORS.info,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  iconContainer_success: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconContainer_error: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconContainer_warning: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconContainer_info: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  icon: {
    fontSize: 18,
    color: COLORS.text.inverse,
    fontWeight: '700',
  },
  message: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.inverse,
    flex: 1,
    fontWeight: '600',
  },
});