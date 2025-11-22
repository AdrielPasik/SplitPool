import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../lib/constants/theme';

interface ProgressBarProps {
  progress: number; // 0-1
  total?: bigint;
  collected?: bigint;
  showLabel?: boolean;
  animated?: boolean;
  height?: number;
  color?: string;
}

export function ProgressBar({
  progress,
  total,
  collected,
  showLabel = true,
  animated = true,
  height = 8,
  color = COLORS.primary[500],
}: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const progressPercent = Math.min(Math.round(progress * 100), 100);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: progress,
        duration: 600,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(progress);
    }
  }, [progress, animated]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthInterpolation,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>

      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {progressPercent}%
          </Text>
          {total && collected && (
            <Text style={styles.sublabel}>
              {formatAmount(collected)} / {formatAmount(total)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function formatAmount(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  return `${eth.toFixed(4).replace(/\.?0+$/, '')} ETH`;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    width: '100%',
    backgroundColor: COLORS.neutral[200],
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: RADIUS.full,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  label: {
    ...TYPOGRAPHY.bodySm,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  sublabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
});