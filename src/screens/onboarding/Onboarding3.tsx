import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { setOnboardingComplete } from '../../database/settingsRepository';

const { width } = Dimensions.get('window');
type Props = NativeStackScreenProps<OnboardingStackParamList, 'Onboarding3'>;

export function Onboarding3({ navigation }: Props) {
  const handleGetStarted = async () => {
    try {
      await setOnboardingComplete();
    } catch (e) {
      console.warn('Failed to set onboarding status', e);
    }
    // Navigate to Root navigator and go to AppLock for PIN setup.
    // Using reset prevents back-swipe returning to onboarding.
    const rootNav = navigation.getParent();
    if (rootNav) {
      rootNav.reset({
        index: 0,
        routes: [{ name: 'AppLock' as never, params: { mode: 'setup' } as never }],
      });
    } else {
      // Fallback: if parent navigator is unavailable, go directly to LanguageSetup
      (navigation as any).replace('LanguageSetup');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoChip}>
          <Text style={styles.logoText}>U</Text>
        </View>
        <Text style={styles.brandName}>Udharo</Text>
      </View>

      {/* Illustration */}
      <View style={styles.illustrationArea}>
        <View style={styles.illustrationCard}>
          {/* Success visual */}
          <View style={styles.successCircle}>
            <MaterialIcons name="check-circle" size={80} color={Colors.primary} />
          </View>

          {/* Floating coin elements */}
          <View style={[styles.coinBubble, { top: 24, left: 24 }]}>
            <Text style={styles.coinEmoji}>💰</Text>
          </View>
          <View style={[styles.coinBubble, { top: 24, right: 24 }]}>
            <Text style={styles.coinEmoji}>🔔</Text>
          </View>
          <View style={[styles.coinBubble, { bottom: 32, left: 40 }]}>
            <Text style={styles.coinEmoji}>📋</Text>
          </View>

          {/* Reminder chip */}
          <View style={styles.successChip}>
            <MaterialIcons name="alarm" size={14} color={Colors.onPrimary} />
            <Text style={styles.successChipText}>REMINDER SET</Text>
          </View>

          {/* Watermark */}
          <View style={styles.watermark} pointerEvents="none">
            <Text style={styles.watermarkText}>U</Text>
          </View>
        </View>
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        <Text style={styles.headline}>Never forget{'\n'}payments</Text>
        <Text style={styles.body}>
          Get timely reminders for your pending dues.{'\n'}Your money, always on track.
        </Text>
      </View>

      {/* Progress + CTA */}
      <View style={styles.bottomArea}>
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>
        <TouchableOpacity style={styles.getStartedBtn} onPress={handleGetStarted} activeOpacity={0.85}>
          <Text style={styles.getStartedLabel}>Get Started</Text>
          <MaterialIcons name="arrow-forward" size={22} color={Colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16, gap: 10,
  },
  logoChip: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 20, fontWeight: '900', color: Colors.white, lineHeight: 24 },
  brandName: { fontSize: 20, fontWeight: '800', color: Colors.primary },

  illustrationArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  illustrationCard: {
    width: width - 48, aspectRatio: 1,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative',
  },
  successCircle: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: `${Colors.primary}12`,
    alignItems: 'center', justifyContent: 'center',
  },
  coinBubble: {
    position: 'absolute',
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  coinEmoji: { fontSize: 22 },
  successChip: {
    position: 'absolute', top: 24, right: 24,
    backgroundColor: Colors.onPrimaryFixedVariant,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  successChipText: { fontSize: 10, fontWeight: '800', color: Colors.onPrimary, letterSpacing: 1 },
  watermark: { position: 'absolute', bottom: -30, right: -20, opacity: 0.04 },
  watermarkText: { fontSize: 140, fontWeight: '900', color: Colors.primary },

  textBlock: { paddingHorizontal: 24, paddingBottom: 8, alignItems: 'center' },
  headline: {
    fontSize: 32, fontWeight: '800', color: Colors.onSurface,
    textAlign: 'center', lineHeight: 40, marginBottom: 14,
  },
  body: { fontSize: 15, lineHeight: 24, color: Colors.onSurfaceVariant, textAlign: 'center' },

  bottomArea: { paddingHorizontal: 24, paddingBottom: 40, gap: 20 },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.outlineVariant },
  dotActive: { width: 28, borderRadius: 3, backgroundColor: Colors.primary },
  getStartedBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  getStartedLabel: { fontSize: 17, fontWeight: '800', color: Colors.onPrimary },
});
