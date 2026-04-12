import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList, AppLanguage } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { getAppSettings, setLanguage } from '../../database/settingsRepository';
import * as Haptics from 'expo-haptics';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Language'>;

const LANGUAGES: { code: AppLanguage; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
];

export function LanguageScreen({ navigation }: Props) {
  const [selectedLang, setSelectedLang] = useState<AppLanguage>('en');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const settings = await getAppSettings();
    setSelectedLang(settings.language);
  };

  const handleSelect = async (code: AppLanguage) => {
    Haptics.selectionAsync();
    setSelectedLang(code);
    await setLanguage(code);
    Alert.alert('Language Updated', 'App language will be changed soon (requires translation files implementation).');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Language</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {LANGUAGES.map((lang) => {
            const isActive = lang.code === selectedLang;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langItem, isActive && styles.langItemActive]}
                onPress={() => handleSelect(lang.code)}
                activeOpacity={0.8}
              >
                <View style={styles.langInfo}>
                  <Text style={[styles.langLabel, isActive && styles.langLabelActive]}>{lang.native}</Text>
                  <Text style={styles.langSub}>{lang.label}</Text>
                </View>
                {isActive && (
                  <View style={styles.checkCircle}>
                    <MaterialIcons name="check" size={16} color={Colors.white} />
                  </View>
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
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
    backgroundColor: Colors.white, ...Shadow.sm,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: Colors.onSurface },
  
  scroll: { padding: 20 },
  list: { gap: 12 },
  langItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: BorderRadius['2xl'],
    padding: 20, borderWidth: 1.5, borderColor: 'transparent',
    ...Shadow.sm,
  },
  langItemActive: {
    borderColor: Colors.primary, backgroundColor: `${Colors.primary}05`,
  },
  langInfo: { gap: 4 },
  langLabel: { fontSize: 18, fontWeight: '700', color: Colors.onSurface },
  langLabelActive: { color: Colors.primary },
  langSub: { fontSize: 13, color: Colors.onSurfaceVariant },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.primary,
  },
});
