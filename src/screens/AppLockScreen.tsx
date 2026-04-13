import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  Animated, Alert, Vibration, Platform,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, SettingsStackParamList } from '../types';
import { Colors, DarkColors, ThemeColors } from '../constants/colors';
import { Shadow } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { setPin, verifyPin, setAppLock } from '../database/settingsRepository';

// AppLockScreen serves double duty:
// 1. Root navigator: mode = 'setup' (after onboarding) | 'verify' (on app launch with PIN)
// 2. Settings navigator: mode = 'setup' | 'change' (via AppLockSetup screen wrapper)
type RootProps = NativeStackScreenProps<RootStackParamList, 'AppLock'>;
type SettingsProps = NativeStackScreenProps<SettingsStackParamList, 'AppLockSetup'>;
type Props = RootProps | SettingsProps;

const PIN_LENGTH = 4;
const DOTS = Array.from({ length: PIN_LENGTH });

export function AppLockScreen({ navigation, route }: Props) {
  const params = route.params as { mode?: 'setup' | 'verify' | 'change' } | undefined;
  const mode = params?.mode ?? 'verify';
  const { isDark, t } = useTheme();
  const C = isDark ? DarkColors : Colors;

  const [pin, setPin_] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [stage, setStage] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const isSetup = mode === 'setup' || mode === 'change';
  const title = isSetup
    ? (stage === 'enter' ? 'Set a PIN' : 'Confirm PIN')
    : 'Enter PIN';
  const subtitle = isSetup
    ? (stage === 'enter'
        ? (mode === 'change' ? 'Enter your new 4-digit PIN' : 'Choose a 4-digit PIN to secure your app')
        : 'Re-enter your PIN to confirm')
    : 'Enter your PIN to continue';

  const currentPin = stage === 'confirm' ? confirmPin : pin;
  const setCurrentPin = stage === 'confirm' ? setConfirmPin : setPin_;

  function shake() {
    Vibration.vibrate(400);
    const useND = Platform.OS !== 'web';
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12,  duration: 60, useNativeDriver: useND }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: useND }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: useND }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 60, useNativeDriver: useND }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: useND }),
    ]).start();
  }

  const handleDigit = (digit: string) => {
    if (currentPin.length >= PIN_LENGTH) return;
    const next = currentPin + digit;
    setCurrentPin(next);
    setError('');

    if (next.length === PIN_LENGTH) {
      setTimeout(() => handleSubmit(next), 100);
    }
  };

  const handleBackspace = () => {
    setCurrentPin(prev => prev.slice(0, -1));
    setError('');
  };

  const handleSubmit = async (submittedPin: string) => {
    if (isSetup) {
      if (stage === 'enter') {
        setStage('confirm');
      } else {
        // Confirm stage: check PINs match
        if (submittedPin !== pin) {
          setError(t.pinMismatch);
          setConfirmPin('');
          shake();
        } else {
          // Save the PIN and enable app lock
          await setPin(pin);
          await setAppLock(true);

          Alert.alert('✅ ' + t.success, t.pinSet, [
            {
              text: t.ok,
              onPress: () => {
                const nav = navigation as any;
                if (nav.canGoBack()) {
                  // Settings context → go back to Settings
                  nav.goBack();
                } else {
                  // Onboarding context → navigate to Main
                  nav.replace('Main');
                }
              },
            },
          ]);
        }
      }
    } else {
      // Verify mode: check PIN
      const ok = await verifyPin(submittedPin);
      if (ok) {
        (navigation as any).replace('Main');
      } else {
        setError(t.wrongPin);
        setPin_('');
        shake();
      }
    }
  };

  const handleForgot = () => {
    Alert.alert('Forgot PIN', t.forgotPin);
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

  const styles = makeStyles(C);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.surfaceContainerLowest} />

      {/* Back button for settings context */}
      {(navigation as any).canGoBack?.() && (
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (navigation as any).goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={C.onSurface} />
        </TouchableOpacity>
      )}

      {/* Logo */}
      <View style={styles.logoWrap}>
        <View style={styles.logoCard}>
          <Text style={styles.logoU}>U</Text>
        </View>
        <Text style={styles.appName}>Udharo</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {/* PIN Dots */}
      <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {DOTS.map((_, i) => {
          const filled = i < (stage === 'confirm' ? confirmPin.length : pin.length);
          return (
            <View
              key={i}
              style={[styles.dot, filled && { backgroundColor: C.primary, borderColor: C.primary }]}
            />
          );
        })}
      </Animated.View>

      {/* Error */}
      {error ? <Text style={styles.error}>{error}</Text> : <View style={{ height: 24 }} />}

      {/* Keypad */}
      <View style={styles.keypad}>
        {keys.map((key, idx) => {
          if (key === '') return <View key={idx} style={styles.keyEmpty} />;
          if (key === '⌫') {
            return (
              <TouchableOpacity key={idx} style={styles.keyBtn} onPress={handleBackspace} activeOpacity={0.6}>
                <MaterialIcons name="backspace" size={22} color={C.onSurface} />
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity key={idx} style={styles.keyBtn} onPress={() => handleDigit(key)} activeOpacity={0.6}>
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Forgot PIN */}
      {!isSetup && (
        <TouchableOpacity onPress={handleForgot} style={styles.forgotBtn}>
          <Text style={styles.forgotText}>{t.forgotPin.split('?')[0]}?</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function makeStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1, backgroundColor: C.surfaceContainerLowest,
      alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
    },
    backBtn: {
      position: 'absolute', top: 52, left: 16,
      width: 40, height: 40, borderRadius: 20,
      alignItems: 'center', justifyContent: 'center',
    },
    logoWrap: { alignItems: 'center', marginBottom: 32 },
    logoCard: {
      width: 72, height: 72, borderRadius: 20, backgroundColor: C.primary,
      alignItems: 'center', justifyContent: 'center', marginBottom: 10,
      ...Shadow.primary,
    },
    logoU: { fontSize: 38, fontWeight: '900', color: C.onPrimary },
    appName: { fontSize: 22, fontWeight: '900', color: C.primary, letterSpacing: 1 },

    title: { fontSize: 26, fontWeight: '800', color: C.onSurface, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 14, color: C.onSurfaceVariant, textAlign: 'center', marginBottom: 32, lineHeight: 20 },

    dotsRow: { flexDirection: 'row', gap: 20, marginBottom: 12 },
    dot: {
      width: 20, height: 20, borderRadius: 10,
      borderWidth: 2, borderColor: C.outlineVariant,
      backgroundColor: C.surfaceContainerHigh,
    },

    error: { fontSize: 13, color: C.error, fontWeight: '600', textAlign: 'center', height: 24 },

    keypad: {
      flexDirection: 'row', flexWrap: 'wrap',
      width: 280, marginTop: 24, gap: 16,
      justifyContent: 'center',
    },
    keyBtn: {
      width: 72, height: 72, borderRadius: 36,
      backgroundColor: C.surfaceContainerLow,
      alignItems: 'center', justifyContent: 'center',
      ...Shadow.sm,
    },
    keyEmpty: { width: 72, height: 72 },
    keyText: { fontSize: 24, fontWeight: '700', color: C.onSurface },

    forgotBtn: { marginTop: 32, padding: 12 },
    forgotText: { fontSize: 14, color: C.primary, fontWeight: '600' },
  });
}
