import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar, Alert, Image,
} from 'react-native';
import { Colors, DarkColors, ThemeColors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { setAppLock as _setAppLock, clearPin, getAppSettings } from '../../database/settingsRepository';

const LOGO_WHITE_BG = require('../../../assets/UDHARO LOGO (WHITE BG).png');
const LOGO_BLACK_BG = require('../../../assets/UDHARO LOGO (BLACK BG).png');

type Props = NativeStackScreenProps<SettingsStackParamList, 'Settings'>;

interface RowProps {
  icon: string; label: string; sublabel?: string;
  onPress?: () => void; right?: React.ReactNode; danger?: boolean;
  C: ThemeColors;
}

function SettingRow({ icon, label, sublabel, onPress, right, danger, C }: RowProps) {
  return (
    <TouchableOpacity
      style={[styles.row]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.rowIcon, { backgroundColor: danger ? `${C.error}15` : `${C.primary}12` }]}>
          <MaterialIcons name={icon as any} size={22} color={danger ? C.error : C.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowLabel, { color: danger ? C.error : C.onSurface }]}>{label}</Text>
          {sublabel && <Text style={[styles.rowSublabel, { color: C.onSurfaceVariant }]}>{sublabel}</Text>}
        </View>
      </View>
      {right ?? (onPress && <MaterialIcons name="chevron-right" size={22} color={C.onSurfaceVariant} />)}
    </TouchableOpacity>
  );
}

export function SettingsScreen({ navigation }: Props) {
  const { isDark, setTheme, t } = useTheme();
  const C = isDark ? DarkColors : Colors;
  const [appLockEnabled, setAppLockEnabled] = React.useState(false);

  React.useEffect(() => {
    getAppSettings().then(s => setAppLockEnabled(s.appLockEnabled));
  }, []);

  const handleDarkModeToggle = async (val: boolean) => {
    await setTheme(val ? 'dark' : 'light');
  };

  const handleAppLockToggle = async (val: boolean) => {
    if (val) {
      navigation.navigate('AppLockSetup' as any);
    } else {
      Alert.alert(
        'Disable App Lock',
        'Are you sure you want to remove your PIN?',
        [
          { text: t.cancel, style: 'cancel' },
          {
            text: 'Remove', style: 'destructive', onPress: async () => {
              await clearPin();
              setAppLockEnabled(false);
            },
          },
        ]
      );
    }
  };

  const styles = makeStyles(C);

  return (
    <View style={[styles.container, { backgroundColor: C.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.surfaceContainerLowest} />

      {/* Header */}
      <View style={[styles.topBar, { backgroundColor: C.surfaceContainerLowest }]}>
        <View style={styles.brand}>
          <Image
            source={isDark ? LOGO_BLACK_BG : LOGO_WHITE_BG}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={[styles.brandName, { color: C.primary }]}>Udharo</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.pageTitle}>
          <Text style={[styles.pageTitleText, { color: C.onSurface }]}>{t.settings}</Text>
          <Text style={[styles.pageTitleSub, { color: C.onSurfaceVariant }]}>{t.manageYourLedger}</Text>
        </View>

        {/* ── Preferences ── */}
        <Text style={[styles.groupLabel, { color: C.onSurfaceVariant }]}>PREFERENCES</Text>
        <View style={[styles.group, { backgroundColor: C.surfaceContainerLow }]}>
          <SettingRow
            C={C} icon="language" label={t.language}
            sublabel={t.languageTitle}
            onPress={() => navigation.navigate('Language')}
          />
          <View style={[styles.separator, { backgroundColor: C.outlineVariant }]} />
          <SettingRow
            C={C} icon="dark-mode" label={t.darkMode}
            sublabel={t.followSystemTheme}
            right={
              <Switch
                value={isDark}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: C.outlineVariant, true: C.primary }}
                thumbColor={C.white}
              />
            }
          />
        </View>

        {/* ── Security & Data ── */}
        <Text style={[styles.groupLabel, { color: C.onSurfaceVariant }]}>SECURITY & DATA</Text>
        <View style={[styles.group, { backgroundColor: C.surfaceContainerLow }]}>
          <SettingRow
            C={C} icon="lock"
            label={t.appLock}
            sublabel={appLockEnabled ? t.biometricActive : t.disabled}
            right={
              <Switch
                value={appLockEnabled}
                onValueChange={handleAppLockToggle}
                trackColor={{ false: C.outlineVariant, true: C.primary }}
                thumbColor={C.white}
              />
            }
          />
          {appLockEnabled && (
            <>
              <View style={[styles.separator, { backgroundColor: C.outlineVariant }]} />
              <SettingRow
                C={C} icon="pin" label={t.changePin}
                sublabel="Update your 4-digit PIN"
                onPress={() => navigation.navigate('AppLockSetup' as any)}
              />
            </>
          )}
          <View style={[styles.separator, { backgroundColor: C.outlineVariant }]} />
          <SettingRow
            C={C} icon="cloud-sync" label={t.backupRestore}
            sublabel={t.exportYourData}
            onPress={() => navigation.navigate('BackupRestore')}
          />
        </View>

        {/* ── About ── */}
        <Text style={[styles.groupLabel, { color: C.onSurfaceVariant }]}>ABOUT</Text>
        <View style={[styles.group, { backgroundColor: C.surfaceContainerLow }]}>
          <SettingRow
            C={C} icon="info" label={t.aboutUdharo}
            sublabel={t.version}
            onPress={() => navigation.navigate('About')}
          />
        </View>

        {/* Watermark */}
        <View style={styles.watermarkArea}>
          <Image
            source={isDark ? LOGO_BLACK_BG : LOGO_WHITE_BG}
            style={styles.watermarkLogo}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    paddingHorizontal: 24, paddingTop: 52, paddingBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 3,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandLogo: { width: 34, height: 34, borderRadius: 10 },
  brandName: { fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },

  scroll: { padding: 20, gap: 8, paddingBottom: 100 },
  pageTitle: { gap: 4, marginBottom: 12 },
  pageTitleText: { fontSize: 36, fontWeight: '800' },
  pageTitleSub: { fontSize: 13 },

  groupLabel: {
    fontSize: 10, fontWeight: '800', letterSpacing: 1.5,
    textTransform: 'uppercase', marginTop: 8, marginBottom: 4, marginLeft: 4,
  },
  group: { borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadow.sm },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, gap: 14,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  rowIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowSublabel: { fontSize: 12, marginTop: 2 },
  separator: { height: 0.5, marginLeft: 74 },

  watermarkArea: { alignItems: 'center', paddingVertical: 32, opacity: 0.06 },
  watermarkLogo: { width: 120, height: 120 },
});

function makeStyles(C: ThemeColors) { return styles; }
