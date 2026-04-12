import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../types';
import { Colors, DarkColors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../context/ThemeContext';
import { shareBackup, importBackup, getBackupStats } from '../../database/backupService';
import { getAppSettings } from '../../database/settingsRepository';
import { formatDate } from '../../utils/helpers';

type Props = NativeStackScreenProps<SettingsStackParamList, 'BackupRestore'>;

export function BackupRestoreScreen({ navigation }: Props) {
  const { isDark, t } = useTheme();
  const C = isDark ? DarkColors : Colors;
  const [lastBackup, setLastBackup] = useState<string | undefined>();
  const [stats, setStats] = useState({ peopleCount: 0, transactionCount: 0 });
  const [backing, setBacking] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    const [settings, s] = await Promise.all([getAppSettings(), getBackupStats()]);
    setLastBackup(settings.lastBackupAt);
    setStats(s);
  };

  const handleBackup = async () => {
    setBacking(true);
    try {
      await shareBackup();
      await loadInfo();
      Alert.alert('✅ Backup Created', t.backupSuccess);
    } catch (e: any) {
      Alert.alert(t.error, e.message ?? t.backupFailed);
    } finally {
      setBacking(false);
    }
  };

  const handleRestore = async () => {
    Alert.alert(
      'Restore Backup',
      'This will REPLACE all your current data with the backup. This cannot be undone.',
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: 'Restore', style: 'destructive',
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json', copyToCacheDirectory: true,
              });
              if (result.canceled || !result.assets?.[0]) return;
              setRestoring(true);
              await importBackup(result.assets[0].uri);
              await loadInfo();
              Alert.alert('✅ Restored', t.restoreSuccess);
            } catch (e: any) {
              Alert.alert(t.error, e.message);
            } finally {
              setRestoring(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: C.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: C.surfaceContainerLowest }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={C.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: C.onSurface }]}>{t.backupTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Stats card */}
        <View style={[styles.statsCard, { backgroundColor: C.surfaceContainerLowest }]}>
          <Text style={[styles.statsTitle, { color: C.onSurface }]}>Your Data</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: C.primary }]}>{stats.peopleCount}</Text>
              <Text style={[styles.statLabel, { color: C.onSurfaceVariant }]}>People</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: C.outlineVariant }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: C.primary }]}>{stats.transactionCount}</Text>
              <Text style={[styles.statLabel, { color: C.onSurfaceVariant }]}>Transactions</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: C.outlineVariant }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: C.onSurfaceVariant }]}>
                {lastBackup ? formatDate(lastBackup).split(' ').slice(0, 2).join(' ') : '—'}
              </Text>
              <Text style={[styles.statLabel, { color: C.onSurfaceVariant }]}>{t.lastBackup}</Text>
            </View>
          </View>
        </View>

        {/* Backup button */}
        <View style={[styles.actionCard, { backgroundColor: C.surfaceContainerLow }]}>
          <View style={[styles.actionIconWrap, { backgroundColor: `${C.primary}15` }]}>
            <MaterialIcons name="cloud-upload" size={28} color={C.primary} />
          </View>
          <View style={styles.actionInfo}>
            <Text style={[styles.actionTitle, { color: C.onSurface }]}>{t.backupNow}</Text>
            <Text style={[styles.actionDesc, { color: C.onSurfaceVariant }]}>
              Export all your data as a JSON file and share it anywhere
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: C.primary }, backing && { opacity: 0.6 }]}
            onPress={handleBackup}
            disabled={backing}
          >
            {backing
              ? <ActivityIndicator color="#fff" size="small" />
              : <MaterialIcons name="download" size={20} color="#fff" />
            }
          </TouchableOpacity>
        </View>

        {/* Restore button */}
        <View style={[styles.actionCard, { backgroundColor: C.surfaceContainerLow }]}>
          <View style={[styles.actionIconWrap, { backgroundColor: `${C.given}15` }]}>
            <MaterialIcons name="cloud-download" size={28} color={C.given} />
          </View>
          <View style={styles.actionInfo}>
            <Text style={[styles.actionTitle, { color: C.onSurface }]}>{t.restoreBackup}</Text>
            <Text style={[styles.actionDesc, { color: C.onSurfaceVariant }]}>
              Pick a backup JSON file to restore your data
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: C.given }, restoring && { opacity: 0.6 }]}
            onPress={handleRestore}
            disabled={restoring}
          >
            {restoring
              ? <ActivityIndicator color="#fff" size="small" />
              : <MaterialIcons name="upload" size={20} color="#fff" />
            }
          </TouchableOpacity>
        </View>

        <View style={[styles.note, { backgroundColor: `${C.warning}12`, borderColor: `${C.warning}30` }]}>
          <MaterialIcons name="info-outline" size={18} color={C.warning} />
          <Text style={[styles.noteText, { color: C.onSurfaceVariant }]}>
            We recommend backing up regularly. Backups are stored locally — keep your file safe.
          </Text>
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
  headerTitle: { fontSize: 18, fontWeight: '800' },

  scroll: { padding: 20, gap: 16, paddingBottom: 60 },

  statsCard: {
    borderRadius: BorderRadius['2xl'], padding: 20, gap: 16, ...Shadow.sm,
  },
  statsTitle: { fontSize: 16, fontWeight: '800' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 40 },

  actionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: BorderRadius['2xl'], padding: 16, ...Shadow.sm,
  },
  actionIconWrap: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionInfo: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  actionDesc: { fontSize: 12, lineHeight: 18 },
  actionBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  note: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    padding: 14, borderRadius: BorderRadius.xl, borderWidth: 1,
  },
  noteText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
