import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Platform,
} from 'react-native';
import { MainTabParamList, HomeStackParamList } from '../../types';
import { Colors, DarkColors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import {
  getTopPendingPeople, getRecentTransactions,
} from '../../database/transactionRepository';
import { getGlobalBalance } from '../../database/peopleRepository';
import {
  formatCurrency, formatAmount, getInitials, getAvatarColor, formatDate,
} from '../../utils/helpers';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Image, Alert } from 'react-native';

const LOGO_WHITE_BG = require('../../../assets/UDHARO LOGO (WHITE BG).png');
const LOGO_BLACK_BG = require('../../../assets/UDHARO LOGO (BLACK BG).png');

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'InsightsTab'>,
  NativeStackScreenProps<HomeStackParamList>
>;

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 68;

export function InsightsScreen({ navigation }: Props) {
  const { isDark, t } = useTheme();
  const C = isDark ? DarkColors : Colors;

  const [data, setData] = useState<any>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [balance, topPending, recent] = await Promise.all([
      getGlobalBalance(),
      getTopPendingPeople(5),
      getRecentTransactions(30),
    ]);

    // Build chart bars from last 6 days
    const dayMap = new Map<string, number>();
    for (const tx of recent) {
      const day = tx.date.substring(0, 10);
      dayMap.set(day, (dayMap.get(day) ?? 0) + tx.amount);
    }
    const sorted = [...dayMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
    const max = Math.max(...sorted.map(s => s[1]), 1);
    const chartBars = sorted.map(s => ({ val: s[1] / max, date: s[0] }));

    // Settlement rate (settled / total transactions from recent)
    const totalTx = recent.length;
    const settledTx = recent.filter(tx => tx.status === 'SETTLED').length;
    const settlementRate = totalTx > 0 ? Math.round((settledTx / totalTx) * 100) : 0;

    // Debt health score (0-100)
    const given = balance.totalGiven;
    const received = balance.totalReceived;
    const total = given + received;
    const healthScore = total > 0
      ? Math.min(100, Math.round((received / total) * 100))
      : 100;

    setData({
      totalGiven: balance.totalGiven,
      totalReceived: balance.totalReceived,
      netBalance: balance.netBalance,
      pending: Math.abs(balance.totalGiven - balance.totalReceived),
      topPending,
      chartBars: chartBars.length > 0 ? chartBars : [0.4, 0.65, 0.3, 0.9, 0.55, 0.45].map((v, i) => ({ val: v, date: '' })),
      settlementRate,
      healthScore,
      recentTxns: recent,
    });
  };

  const handleExportReport = async () => {
    if (!data?.recentTxns) return;
    setExporting(true);
    try {
      const month = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
      let text = `Udharo Monthly Report - ${month}\n`;
      text += `Total Given: ${formatCurrency(data.totalGiven)}\n`;
      text += `Total Received: ${formatCurrency(data.totalReceived)}\n`;
      text += `Pending Balance: ${formatCurrency(data.pending)}\n`;
      text += `Settlement Rate: ${data.settlementRate}%\n\n`;
      text += `Recent Transactions:\n`;
      for (const tx of data.recentTxns) {
        text += `${tx.date} | ${tx.type} | ${formatCurrency(tx.amount)} | ${tx.status}\n`;
      }

      const docDir: string = (FileSystem as any).documentDirectory ?? '';
      const fileUri = `${docDir}udharo_report_${Date.now()}.txt`;
      await (FileSystem as any).writeAsStringAsync(fileUri, text);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { dialogTitle: 'Share Monthly Report' });
      }
    } catch (e: any) {
      Alert.alert('Export failed', e.message);
    } finally {
      setExporting(false);
    }
  };

  const healthLabel = (score: number) => {
    if (score >= 80) return { label: t.excellent, color: C.received };
    if (score >= 60) return { label: t.good, color: '#4caf50' };
    if (score >= 40) return { label: t.fair, color: '#ff9800' };
    return { label: t.needsAttention, color: C.given };
  };

  if (!data) return <View style={{ flex: 1, backgroundColor: C.surface }} />;

  const health = healthLabel(data.healthScore);

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.surfaceContainerLowest} />

      {/* ── Header ── */}
      <View style={[styles.topBar, { backgroundColor: C.surfaceContainerLowest }]}>
        <View style={styles.brand}>
          <Image
            source={isDark ? LOGO_BLACK_BG : LOGO_WHITE_BG}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={[styles.brandName, { color: C.primary }]}>Udharo</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={[styles.refreshBtn, { backgroundColor: C.surfaceContainerLow }]}
            onPress={handleExportReport}
            disabled={exporting}
          >
            <MaterialIcons name="ios-share" size={20} color={C.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.refreshBtn, { backgroundColor: C.surfaceContainerLow }]}
            onPress={loadData}
          >
            <MaterialIcons name="refresh" size={20} color={C.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: TAB_BAR_HEIGHT + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={[styles.heroSub, { color: C.onSurfaceVariant }]}>{t.financialHealth}</Text>
          <Text style={[styles.heroTitle, { color: C.onSurface }]}>{t.insights}</Text>
        </View>

        {/* ── Bento Metrics ── */}
        <View style={styles.bento}>
          <View style={[styles.bentoCard, styles.bentoLarge, { backgroundColor: C.surfaceContainerLowest }]}>
            <View style={[styles.bentoIconBox, { backgroundColor: `${C.received}15` }]}>
              <MaterialIcons name="south-west" size={22} color={C.received} />
            </View>
            <Text style={[styles.bentoLabel, { color: C.onSurfaceVariant }]}>{t.totalReceived}</Text>
            <Text style={[styles.bentoValue, { color: C.received }]}>{formatAmount(data.totalReceived)}</Text>
            <View style={[styles.progressBar, { backgroundColor: C.surfaceContainerHigh }]}>
              <View style={[styles.progressFill, { width: '72%', backgroundColor: C.received }]} />
            </View>
          </View>

          <View style={styles.bentoRight}>
            <View style={[styles.bentoCard, styles.bentoSmall, { backgroundColor: C.surfaceContainerLowest }]}>
              <View style={styles.bentoRow}>
                <MaterialIcons name="north-east" size={16} color={C.given} />
                <Text style={[styles.bentoSmallLabel, { color: C.onSurfaceVariant }]}>{t.totalGiven}</Text>
              </View>
              <Text style={[styles.bentoSmallValue, { color: C.given }]}>{formatAmount(data.totalGiven)}</Text>
            </View>
            <View style={[styles.bentoCard, styles.bentoSmall, { backgroundColor: C.surfaceContainerLowest }]}>
              <View style={styles.bentoRow}>
                <MaterialIcons name="pending" size={16} color={C.onSurfaceVariant} />
                <Text style={[styles.bentoSmallLabel, { color: C.onSurfaceVariant }]}>{t.pending}</Text>
              </View>
              <Text style={[styles.bentoSmallValue, { color: C.onSurface }]}>{formatAmount(data.pending)}</Text>
            </View>
          </View>
        </View>

        {/* ── Debt Health Score ── */}
        <View style={[styles.healthCard, { backgroundColor: C.surfaceContainerLowest }]}>
          <View style={styles.healthHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: C.onSurface }]}>{t.debtHealthScore}</Text>
              <Text style={[styles.sectionSub, { color: C.onSurfaceVariant }]}>Based on your give/receive ratio</Text>
            </View>
            <View style={[styles.healthBadge, { backgroundColor: `${health.color}18` }]}>
              <Text style={[styles.healthBadgeText, { color: health.color }]}>{health.label}</Text>
            </View>
          </View>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreNum, { color: health.color }]}>{data.healthScore}</Text>
            <Text style={[styles.scoreMax, { color: C.onSurfaceVariant }]}>/100</Text>
          </View>
          <View style={[styles.scoreBar, { backgroundColor: C.surfaceContainerHigh }]}>
            <View style={[styles.scoreFill, { width: `${data.healthScore}%`, backgroundColor: health.color }]} />
          </View>
        </View>

        {/* ── Transaction Activity Chart ── */}
        <View style={[styles.pulseCard, { backgroundColor: C.surfaceContainerLow }]}>
          <Text style={[styles.sectionTitle, { color: C.onSurface }]}>{t.transactionActivity}</Text>
          <Text style={[styles.sectionSub, { color: C.onSurfaceVariant }]}>{t.recentActivity2}</Text>
          <View style={styles.chartRow}>
            {data.chartBars.map((b: any, i: number) => (
              <View key={i} style={styles.barWrapper}>
                <View style={[styles.bar, {
                  height: Math.max(b.val * 80, 6),
                  backgroundColor: i === data.chartBars.length - 1 ? C.primary : `${C.primary}60`,
                }]} />
              </View>
            ))}
          </View>
          {/* Settlement Rate */}
          <View style={styles.settlementRow}>
            <Text style={[styles.settlementLabel, { color: C.onSurfaceVariant }]}>{t.settlementRate}</Text>
            <Text style={[styles.settlementVal, { color: C.primary }]}>{data.settlementRate}%</Text>
          </View>
        </View>

        {/* ── Top Pending ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: C.onSurface }]}>{t.topPending}</Text>
              <Text style={[styles.sectionSub, { color: C.onSurfaceVariant }]}>{t.peopleWhoOweYou}</Text>
            </View>
          </View>

          {data.topPending.length === 0 ? (
            <View style={[styles.emptyPending, { backgroundColor: C.surfaceContainerLow }]}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={[styles.emptyText, { color: C.onSurfaceVariant }]}>{t.allSettledBang}</Text>
            </View>
          ) : (
            <View style={styles.pendingList}>
              {data.topPending.map((p: any) => {
                const av = getAvatarColor(p.name);
                return (
                  <TouchableOpacity
                    key={p.personId}
                    style={[styles.pendingRow, { backgroundColor: C.surfaceContainerLowest }]}
                    onPress={() => navigation.navigate('PersonDetail', { personId: p.personId })}
                  >
                    <View style={[styles.pendingAvatar, { backgroundColor: av.bg }]}>
                      <Text style={[styles.pendingInitials, { color: av.text }]}>{getInitials(p.name)}</Text>
                    </View>
                    <View style={styles.pendingInfo}>
                      <Text style={[styles.pendingName, { color: C.onSurface }]}>{p.name}</Text>
                      <Text style={[styles.pendingTime, { color: C.onSurfaceVariant }]}>Pending payment</Text>
                    </View>
                    <View style={styles.pendingRight}>
                      <Text style={[styles.pendingAmount, { color: C.given }]}>{formatCurrency(Math.abs(p.netBalance))}</Text>
                      <View style={[styles.pendingBadge, { backgroundColor: `${C.given}18` }]}>
                        <Text style={[styles.pendingBadgeText, { color: C.given }]}>PENDING</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 3,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandLogo: { width: 34, height: 34, borderRadius: 10 },
  brandName: { fontSize: 20, fontWeight: '900' },
  refreshBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },

  scroll: { padding: 20, gap: 16 },
  hero: { gap: 4 },
  heroSub: { fontSize: 12, fontWeight: '600' },
  heroTitle: { fontSize: 36, fontWeight: '800' },

  bento: { flexDirection: 'row', gap: 12, height: 190 },
  bentoCard: { borderRadius: BorderRadius['2xl'], padding: 18, ...Shadow.sm },
  bentoLarge: { flex: 1.2, justifyContent: 'space-between' },
  bentoRight: { flex: 1, gap: 12 },
  bentoSmall: { flex: 1, justifyContent: 'space-between' },
  bentoIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bentoLabel: { fontSize: 11, fontWeight: '600' },
  bentoValue: { fontSize: 22, fontWeight: '900' },
  progressBar: { width: '100%', height: 4, borderRadius: 2 },
  progressFill: { height: 4, borderRadius: 2 },
  bentoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bentoSmallLabel: { fontSize: 11, fontWeight: '600' },
  bentoSmallValue: { fontSize: 18, fontWeight: '900' },

  healthCard: { borderRadius: BorderRadius['2xl'], padding: 20, gap: 12, ...Shadow.sm },
  healthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  healthBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  healthBadgeText: { fontSize: 12, fontWeight: '800' },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  scoreNum: { fontSize: 48, fontWeight: '900' },
  scoreMax: { fontSize: 18, fontWeight: '600' },
  scoreBar: { height: 8, borderRadius: 4 },
  scoreFill: { height: 8, borderRadius: 4 },

  pulseCard: { borderRadius: BorderRadius['2xl'], padding: 20, gap: 12 },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 88 },
  barWrapper: { flex: 1, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 6, minHeight: 6 },
  settlementRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 },
  settlementLabel: { fontSize: 13, fontWeight: '600' },
  settlementVal: { fontSize: 18, fontWeight: '800' },

  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  sectionSub: { fontSize: 12 },
  pendingList: { gap: 10 },
  pendingRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius['2xl'], padding: 14, ...Shadow.sm,
  },
  pendingAvatar: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  pendingInitials: { fontSize: 15, fontWeight: '800' },
  pendingInfo: { flex: 1 },
  pendingName: { fontSize: 15, fontWeight: '700' },
  pendingTime: { fontSize: 12 },
  pendingRight: { alignItems: 'flex-end', gap: 4 },
  pendingAmount: { fontSize: 16, fontWeight: '800' },
  pendingBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  pendingBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  emptyPending: { alignItems: 'center', paddingVertical: 28, gap: 8, borderRadius: BorderRadius['2xl'] },
  emptyEmoji: { fontSize: 36 },
  emptyText: { fontSize: 14, fontWeight: '600' },
});
