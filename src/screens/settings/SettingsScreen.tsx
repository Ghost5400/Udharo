import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar, Alert,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../types';

interface SettingRowProps {
  icon: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}

function SettingRow({ icon, label, sublabel, onPress, right, danger }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
      <View style={styles.rowLeft}>
        <View style={[styles.rowIcon, { backgroundColor: danger ? `${Colors.error}15` : Colors.surfaceContainerHighest }]}>
          <MaterialIcons name={icon as any} size={22} color={danger ? Colors.error : Colors.primary} />
        </View>
        <View>
          <Text style={[styles.rowLabel, danger && { color: Colors.error }]}>{label}</Text>
          {sublabel && <Text style={styles.rowSublabel}>{sublabel}</Text>}
        </View>
      </View>
      {right ?? (onPress && <MaterialIcons name="chevron-right" size={22} color={Colors.outlineVariant} />)}
    </TouchableOpacity>
  );
}

type Props = NativeStackScreenProps<SettingsStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const [darkMode, setDarkMode] = useState(false);
  const [appLock, setAppLock] = useState(false);

  const handleExportData = () => {
    Alert.alert('Export Data', 'Backup & restore feature coming soon!');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <View style={styles.logoChip}><Text style={styles.logoText}>U</Text></View>
          <Text style={styles.brandName}>Udharo</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Page Title ── */}
        <View style={styles.pageTitle}>
          <Text style={styles.pageTitleText}>Settings</Text>
          <Text style={styles.pageTitleSub}>Manage your personal ledger</Text>
        </View>

        {/* ── Preferences ── */}
        <View style={styles.group}>
          <SettingRow
            icon="language"
            label="Language"
            sublabel="English (EN)"
            onPress={() => navigation.navigate('Language')}
          />
          <View style={styles.separator} />
          <SettingRow
            icon="dark-mode"
            label="Dark Mode"
            sublabel="Follow system theme"
            right={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: Colors.outlineVariant, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            }
          />
        </View>

        {/* ── Security & Data ── */}
        <View style={styles.group}>
          <SettingRow
            icon="cloud-sync"
            label="Backup & Restore"
            sublabel="Export your data"
            onPress={handleExportData}
          />
          <View style={styles.separator} />
          <SettingRow
            icon="lock"
            label="App Lock"
            sublabel={appLock ? 'Biometric active' : 'Disabled'}
            right={
              <Switch
                value={appLock}
                onValueChange={setAppLock}
                trackColor={{ false: Colors.outlineVariant, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            }
          />
        </View>

        {/* ── Info ── */}
        <View style={styles.group}>
          <SettingRow
            icon="info"
            label="About Udharo"
            sublabel="Version 1.0.0"
          />
        </View>

        {/* ── Export Data ── */}
        <TouchableOpacity style={styles.exportBtn} onPress={handleExportData}>
          <MaterialIcons name="download" size={20} color={Colors.primary} />
          <Text style={styles.exportBtnText}>Export Data</Text>
        </TouchableOpacity>

        {/* ── Watermark ── */}
        <View style={styles.watermarkArea}>
          <Text style={styles.watermarkU}>U</Text>
          <Text style={styles.watermarkSub}>Udharo</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  topBar: {
    paddingHorizontal: 24, paddingTop: 52, paddingBottom: 16,
    backgroundColor: Colors.surfaceContainerLowest, ...Shadow.sm,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoChip: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 18, fontWeight: '900', color: Colors.white },
  brandName: { fontSize: 20, fontWeight: '800', color: Colors.primary },

  scroll: { padding: 20, gap: 16, paddingBottom: 100 },
  pageTitle: { gap: 4, marginBottom: 4 },
  pageTitleText: { fontSize: 36, fontWeight: '800', color: Colors.onSurface },
  pageTitleSub: { fontSize: 13, color: Colors.onSurfaceVariant },

  group: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.xl, overflow: 'hidden', ...Shadow.sm,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, gap: 14,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  rowIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { fontSize: 15, fontWeight: '600', color: Colors.onSurface },
  rowSublabel: { fontSize: 12, color: Colors.onSurfaceVariant, marginTop: 2 },
  separator: { height: 1, backgroundColor: Colors.outlineVariant, marginLeft: 74, opacity: 0.5 },

  exportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16, borderRadius: BorderRadius.full,
    borderWidth: 1.5, borderColor: Colors.primary, backgroundColor: `${Colors.primary}08`,
  },
  exportBtnText: { fontSize: 15, fontWeight: '700', color: Colors.primary },

  watermarkArea: { alignItems: 'center', paddingVertical: 32, opacity: 0.08 },
  watermarkU: { fontSize: 96, fontWeight: '900', color: Colors.primary },
  watermarkSub: {
    fontSize: 11, fontWeight: '800', color: Colors.primary,
    letterSpacing: 4, textTransform: 'uppercase', marginTop: -20,
  },
});
