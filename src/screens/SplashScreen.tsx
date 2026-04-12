import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, DarkColors } from '../constants/colors';
import { Shadow } from '../constants/theme';
import { getAppSettings } from '../database/settingsRepository';
import { getDatabase } from '../database/schema';
import { useTheme } from '../context/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const LOGO_WITH_TEXT = require('../../assets/UDHARO LOGO (WITH TEXT).png');

export function SplashScreen({ navigation }: Props) {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const { isDark } = useTheme();
  const C = isDark ? DarkColors : Colors;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 100 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    const init = async () => {
      try {
        await getDatabase();
        await new Promise(res => setTimeout(res, 2200));
        const settings = await getAppSettings();
        if (!settings.onboardingComplete) {
          navigation.replace('Onboarding');
        } else if (settings.appLockEnabled) {
          navigation.replace('AppLock', { mode: 'verify' });
        } else {
          navigation.replace('Main');
        }
      } catch (e) {
        navigation.replace('Onboarding');
      }
    };

    init();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? C.surface : '#ffffff' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={isDark ? C.surface : '#ffffff'} />

      {/* Glow orb */}
      <View style={[styles.bgGlow, { backgroundColor: `${C.primary}0a` }]} />
      <View style={[styles.bgGlow2, { backgroundColor: `${C.primary}06` }]} />

      {/* Logo with text*/}
      <Animated.View style={[styles.logoWrap, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
        <Image
          source={LOGO_WITH_TEXT}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[styles.taglineRow, { opacity: opacityAnim }]}>
        <Text style={[styles.tagline, { color: C.onSurfaceVariant }]}>Smart Money Ledger</Text>
      </Animated.View>

      {/* Made in India */}
      <Animated.View style={[styles.footer, { opacity: opacityAnim }]}>
        <Text style={[styles.footerText, { color: C.onSurfaceVariant }]}>MADE WITH ❤️ IN INDIA</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  bgGlow: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    top: '25%', alignSelf: 'center',
  },
  bgGlow2: {
    position: 'absolute', width: 500, height: 500, borderRadius: 250,
    bottom: '10%', right: -100,
  },
  logoWrap: { alignItems: 'center', marginBottom: 16 },
  logoImage: { width: 220, height: 220 },
  taglineRow: { alignItems: 'center' },
  tagline: {
    fontSize: 13, fontWeight: '600',
    letterSpacing: 2.5, textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute', bottom: 48, alignSelf: 'center',
  },
  footerText: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
  },
});
