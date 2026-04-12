import React from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Onboarding1'>;

export function Onboarding1({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Brand header */}
      <View style={styles.header}>
        <View style={styles.logoChip}>
          <Text style={styles.logoText}>U</Text>
        </View>
        <Text style={styles.brandName}>Udharo</Text>
      </View>

      {/* Illustration */}
      <View style={styles.illustrationArea}>
        <View style={styles.illustrationCard}>
          {/* Center hub */}
          <View style={styles.hub}>
            <MaterialIcons name="sync-alt" size={40} color={Colors.primary} />
          </View>

          {/* Given side */}
          <View style={[styles.sideCard, styles.leftCard]}>
            <View style={[styles.sideIcon, { backgroundColor: Colors.surfaceContainerLow }]}>
              <MaterialIcons name="north-east" size={28} color={Colors.given} />
            </View>
            <Text style={[styles.sideLabel, { color: Colors.given }]}>GIVEN</Text>
          </View>

          {/* Received side */}
          <View style={[styles.sideCard, styles.rightCard]}>
            <View style={[styles.sideIcon, { backgroundColor: Colors.surfaceContainerLow }]}>
              <MaterialIcons name="south-west" size={28} color={Colors.received} />
            </View>
            <Text style={[styles.sideLabel, { color: Colors.received }]}>RECEIVED</Text>
          </View>
        </View>
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        <Text style={styles.headline}>Track money{'\n'}given & received</Text>
        <Text style={styles.body}>
          Keep a simple record of all your lending and borrowing.{'\n'}No more awkward forgotten debts.
        </Text>
      </View>

      {/* Progress + CTA */}
      <View style={styles.bottomArea}>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <TouchableOpacity style={styles.nextBtn} onPress={() => navigation.navigate('Onboarding2')} activeOpacity={0.85}>
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 20, fontWeight: '900', color: Colors.white, lineHeight: 24 },
  brandName: { fontSize: 20, fontWeight: '800', color: Colors.primary },

  illustrationArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  illustrationCard: {
    width: width - 48,
    height: width - 48,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius['3xl'],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  hub: {
    width: 96,
    height: 96,
    backgroundColor: Colors.white,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  sideCard: {
    position: 'absolute',
    alignItems: 'center',
    gap: 8,
  },
  leftCard: { left: 20 },
  rightCard: { right: 20 },
  sideIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  textBlock: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    alignItems: 'center',
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.onSurface,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 14,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },

  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 20,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.outlineVariant,
  },
  dotActive: {
    width: 28,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  nextBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  nextLabel: { fontSize: 17, fontWeight: '800', color: Colors.onPrimary },
});
