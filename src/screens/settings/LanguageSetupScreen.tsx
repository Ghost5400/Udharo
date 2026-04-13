import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Colors, DarkColors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { LANGUAGE_META, AppLanguage } from '../../i18n/translations';

type Props = NativeStackScreenProps<RootStackParamList, 'LanguageSetup'>;

export function LanguageSetupScreen({ navigation }: Props) {
  const { isDark, language, setLanguage } = useTheme();
  const C = isDark ? DarkColors : Colors;

  const handleSelect = async (code: AppLanguage) => {
    await setLanguage(code);
    navigation.replace('Main');
  };

  const handleSkip = () => {
    navigation.replace('Main');
  };

  return (
    <View style={[styles.container, { backgroundColor: C.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.surfaceContainerLowest }]}>
        <View style={styles.logoRow}>
          <View style={[styles.logoChip, { backgroundColor: C.primary }]}>
            <Text style={[styles.logoLetter, { color: C.onPrimary }]}>U</Text>
          </View>
          <Text style={[styles.brandName, { color: C.primary }]}>Udharo</Text>
        </View>
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={[styles.skipText, { color: C.onSurfaceVariant }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleBlock}>
        <Text style={[styles.headline, { color: C.onSurface }]}>Choose your{'\n'}language</Text>
        <Text style={[styles.subtext, { color: C.onSurfaceVariant }]}>
          You can always change this later in Settings
        </Text>
      </View>

      {/* Language List */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {LANGUAGE_META.map((lang) => {
          const isActive = lang.code === language;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.langItem,
                { backgroundColor: C.surfaceContainerLowest, borderColor: isActive ? C.primary : C.outlineVariant },
                isActive && { backgroundColor: `${C.primary}08` },
              ]}
              onPress={() => handleSelect(lang.code)}
              activeOpacity={0.75}
            >
              <View style={styles.langInfo}>
                <Text style={[styles.langNative, { color: isActive ? C.primary : C.onSurface }]}>
                  {lang.native}
                </Text>
                <Text style={[styles.langSub, { color: C.onSurfaceVariant }]}>{lang.label}</Text>
              </View>
              {isActive ? (
                <View style={[styles.checkCircle, { backgroundColor: C.primary }]}>
                  <MaterialIcons name="check" size={16} color="#fff" />
                </View>
              ) : (
                <View style={[styles.checkCircleEmpty, { borderColor: C.outlineVariant }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { backgroundColor: C.surfaceContainerLowest, borderTopColor: C.outlineVariant }]}>
        <TouchableOpacity
          style={[styles.continueBtn, { backgroundColor: C.primary }]}
          onPress={() => navigation.replace('Main')}
          activeOpacity={0.85}
        >
          <Text style={[styles.continueBtnText, { color: C.onPrimary }]}>Continue</Text>
          <MaterialIcons name="arrow-forward" size={20} color={C.onPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoChip: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  logoLetter: { fontSize: 20, fontWeight: '900', lineHeight: 24 },
  brandName: { fontSize: 20, fontWeight: '800' },
  skipBtn: { padding: 8 },
  skipText: { fontSize: 14, fontWeight: '600' },

  titleBlock: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8, gap: 6 },
  headline: { fontSize: 32, fontWeight: '800', lineHeight: 40 },
  subtext: { fontSize: 14, lineHeight: 20 },

  scroll: { padding: 20, gap: 10, paddingBottom: 24 },
  langItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: BorderRadius['2xl'], padding: 18, borderWidth: 2,
    ...Shadow.sm,
  },
  langInfo: { gap: 3 },
  langNative: { fontSize: 20, fontWeight: '700' },
  langSub: { fontSize: 13 },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  checkCircleEmpty: { width: 28, height: 28, borderRadius: 14, borderWidth: 2 },

  footer: { padding: 20, borderTopWidth: 0.5 },
  continueBtn: {
    borderRadius: BorderRadius.full, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  continueBtnText: { fontSize: 17, fontWeight: '800' },
});
