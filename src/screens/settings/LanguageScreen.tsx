import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../types';
import { Colors, DarkColors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { LANGUAGE_META, AppLanguage } from '../../i18n/translations';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Language'>;

export function LanguageScreen({ navigation }: Props) {
  const { isDark, language, setLanguage, t } = useTheme();
  const C = isDark ? DarkColors : Colors;

  const handleSelect = async (code: AppLanguage) => {
    Haptics.selectionAsync();
    await setLanguage(code);
    // Navigate back immediately — the UI updates reactively
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: C.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.surfaceContainerLowest }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={C.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: C.onSurface }]}>{t.languageTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.hint, { color: C.onSurfaceVariant }]}>
          Select your preferred language. The app will switch immediately.
        </Text>
        <View style={styles.list}>
          {LANGUAGE_META.map((lang) => {
            const isActive = lang.code === language;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langItem,
                  { backgroundColor: C.surfaceContainerLowest, borderColor: isActive ? C.primary : 'transparent' },
                  isActive && { backgroundColor: `${C.primary}08` },
                ]}
                onPress={() => handleSelect(lang.code)}
                activeOpacity={0.8}
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800' },

  scroll: { padding: 20, paddingBottom: 40 },
  hint: { fontSize: 13, lineHeight: 20, marginBottom: 16 },
  list: { gap: 10 },
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
  checkCircleEmpty: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 2,
  },
});
