import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
type Props = NativeStackScreenProps<OnboardingStackParamList, 'Onboarding2'>;

const PROOF_OPTIONS = [
  { icon: 'photo-camera', label: 'Take Photo', color: Colors.primary },
  { icon: 'mic', label: 'Voice Note', color: Colors.tertiary },
  { icon: 'image', label: 'Gallery', color: Colors.secondary },
];

const QUICK_AMOUNTS = ['₹100', '₹500', '₹1,000', '₹5,000'];

export function Onboarding2({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoChip}>
          <Text style={styles.logoText}>U</Text>
        </View>
        <Text style={styles.brandName}>Udharo</Text>
      </View>

      {/* Illustration — Proof & Fast Entry */}
      <View style={styles.illustrationArea}>
        <View style={styles.illustrationCard}>
          {/* Quick amount chips */}
          <View style={styles.amountsRow}>
            {QUICK_AMOUNTS.map((a) => (
              <View key={a} style={styles.amountChip}>
                <Text style={styles.amountChipText}>{a}</Text>
              </View>
            ))}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Proof options */}
          <Text style={styles.proofLabel}>ADD PROOF</Text>
          <View style={styles.proofGrid}>
            {PROOF_OPTIONS.map((opt) => (
              <View key={opt.label} style={styles.proofItem}>
                <View style={[styles.proofIcon, { backgroundColor: `${opt.color}18` }]}>
                  <MaterialIcons name={opt.icon as any} size={26} color={opt.color} />
                </View>
                <Text style={styles.proofItemLabel}>{opt.label}</Text>
              </View>
            ))}
          </View>

          {/* Watermark */}
          <View style={styles.watermark} pointerEvents="none">
            <Text style={styles.watermarkText}>U</Text>
          </View>
        </View>
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        <Text style={styles.headline}>Add proof &{'\n'}record fast</Text>
        <Text style={styles.body}>
          Attach a photo, receipt, or voice note as proof.{'\n'}Quick amount buttons for 1-tap entry.
        </Text>
      </View>

      {/* Progress + CTA */}
      <View style={styles.bottomArea}>
        <View style={styles.dots}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => navigation.navigate('Onboarding3')}
          activeOpacity={0.85}
        >
          <Text style={styles.nextLabel}>Next</Text>
          <MaterialIcons name="arrow-forward" size={22} color={Colors.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 16,
    gap: 10,
  },
  logoChip: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 20, fontWeight: '900', color: Colors.white, lineHeight: 24 },
  brandName: { fontSize: 20, fontWeight: '800', color: Colors.primary },

  illustrationArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  illustrationCard: {
    width: width - 48,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius['3xl'],
    padding: 28,
    alignItems: 'center',
    gap: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  amountsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  amountChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  amountChipText: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  divider: { width: '100%', height: 1, backgroundColor: Colors.outlineVariant, opacity: 0.5 },
  proofLabel: {
    fontSize: 10, fontWeight: '800', color: Colors.onSurfaceVariant,
    letterSpacing: 2, textTransform: 'uppercase',
  },
  proofGrid: { flexDirection: 'row', gap: 20 },
  proofItem: { alignItems: 'center', gap: 8 },
  proofIcon: {
    width: 64, height: 64, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  proofItemLabel: { fontSize: 11, fontWeight: '700', color: Colors.onSurfaceVariant },
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
  nextBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  nextLabel: { fontSize: 17, fontWeight: '800', color: Colors.onPrimary },
});
