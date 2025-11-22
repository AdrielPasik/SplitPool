import { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../lib/constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: '👥',
    title: 'Create Groups',
    description: 'Start a group with friends and track shared expenses together',
  },
  {
    icon: '💰',
    title: 'Split Bills',
    description: 'Add expenses and split them fairly among participants',
  },
  {
    icon: '🔗',
    title: 'Settle On-Chain',
    description: 'Pay your debts securely on Base blockchain',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const scrollToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: width * (currentIndex + 1),
        animated: true,
      });
    } else {
      router.replace('/(auth)/connect-wallet');
    }
  };

  const skip = () => {
    router.replace('/(auth)/connect-wallet');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={skip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide, index) => (
          <View key={index} style={styles.slide}>
            <View style={styles.slideContent}>
              <Text style={styles.icon}>{slide.icon}</Text>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <Button
          label={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          variant="primary"
          size="lg"
          fullWidth
          onPress={scrollToNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  skipButton: {
    position: 'absolute',
    top: SPACING.xxl + 20,
    right: SPACING.xl,
    zIndex: 10,
    padding: SPACING.sm,
  },
  skipText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary[600],
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  slideContent: {
    alignItems: 'center',
    gap: SPACING.lg,
  },
  icon: {
    fontSize: 120,
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  description: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text.secondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  footer: {
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.neutral[300],
  },
  dotActive: {
    backgroundColor: COLORS.primary[600],
    width: 24,
  },
});