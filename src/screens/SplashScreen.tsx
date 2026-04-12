import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { getAppSettings } from '../database/settingsRepository';
import { getDatabase } from '../database/schema';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate logo in
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 100 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    // Initialize DB + navigate
    const init = async () => {
      try {
        await getDatabase(); // triggers schema init
        await new Promise(res => setTimeout(res, 2000)); // 2s splash

        const settings = await getAppSettings();
        if (!settings.onboardingComplete) {
          navigation.replace('Onboarding');
        } else if (settings.appLockEnabled) {
          navigation.replace('AppLock');
        } else {
          navigation.replace('Main');
        }
      } catch (e) {
        console.error('Init error:', e);
        navigation.replace('Onboarding');
      }
    };

    init();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surfaceContainerLowest} />

      {/* Background radial gradient effect */}
      <View style={styles.bgGlow} />

      {/* Logo Card */}
      <Animated.View
        style={[styles.logoCard, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
      >
        <Text style={styles.logoText}>U</Text>
      </Animated.View>

      {/* App name (screen reader only visible) */}
      <Animated.View style={[styles.brandRow, { opacity: opacityAnim }]}>
        <Text style={styles.brandName}>Udharo</Text>
        <Text style={styles.brandTagline}>Smart Ledger</Text>
      </Animated.View>

      {/* Watermark */}
      <View style={styles.watermark}>
        <Text style={styles.watermarkText}>U</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: `${Colors.primary}08`,
    top: '30%',
    alignSelf: 'center',
  },
  logoCard: {
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#191c1e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 10,
    marginBottom: 24,
  },
  logoText: {
    fontSize: 64,
    fontWeight: '900',
    color: Colors.primary,
    lineHeight: 72,
  },
  brandRow: {
    alignItems: 'center',
    gap: 4,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  watermark: {
    position: 'absolute',
    bottom: -40,
    right: -30,
    opacity: 0.03,
    pointerEvents: 'none',
  },
  watermarkText: {
    fontSize: 240,
    fontWeight: '900',
    color: Colors.primary,
  },
});
