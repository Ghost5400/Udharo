import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
} from 'react-native';
import { MainTabParamList } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { getTopPendingPeople, getRecentTransactions } from '../../database/transactionRepository';
import { getGlobalBalance } from '../../database/peopleRepository';
import { formatCurrency, formatAmount, getInitials, getAvatarColor } from '../../utils/helpers';
import { MaterialIcons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'InsightsTab'>,
  NativeStackScreenProps<HomeStackParamList>
>;

interface InsightsData {
  totalGiven: number;
  totalReceived: number;
  netBalance: number;
  pending: number;
  topPending: { personId: string; name: string; netBalance: number }[];
  chartBars: number[];
}

export function InsightsScreen({ navigation }: Props) {
  const [data, setData] = useState<InsightsData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [balance, topPending, recent] = await Promise.all([
      getGlobalBalance(),
      getTopPendingPeople(5),
      getRecentTransactions(30),
    ]);

    // Build chart bars from last 6 days
    const dayMap = new Map<string, number>();
    for (const t of recent) {
      const day = t.date.substring(0, 10);
      dayMap.set(day, (dayMap.get(day) ?? 0) + t.amount);
    }
    const sorted = [...dayMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
    const max = Math.max(...sorted.map(s => s[1]), 1);
    const chartBars = sorted.map(s => s[1] / max);

    setData({
      totalGiven: balance.totalGiven,
      totalReceived: balance.totalReceived,
      netBalance: balance.netBalance,
      pending: Math.abs(balance.totalGiven - balance.totalReceived),
      topPending,
      chartBars: chartBars.length > 0 ? chartBars : [0.4, 0.65, 0.3, 0.9, 0.55, 0.45],
    });
  };

  if (!data) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surfaceContainerLowest} />

      {/* ── Header ── */}
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <View style={styles.logoChip}><Text style={styles.logoText}>U</Text></View>
          <Text style={styles.brandName}>Udharo</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroSub}>Financial Health</Text>
          <Text style={styles.heroTitle}>Insights</Text>
        </View>

        {/* ── Bento Metrics ── */}
        <View style={styles.bento}>
          {/* Total Received — large */}
          <View style={[styles.bentoCard, styles.bentoLarge]}>
            <View style={styles.bentoIconBox}>
              <MaterialIcons name="south-west" size={22} color={Colors.received} />
            </View>
            <Text style={styles.bentoLabel}>Total Received</Text>
            <Text style={styles.bentoSpacer} />
            <Text style={[styles.bentoValue, { color: Colors.received }]}>
              {formatAmount(data.totalReceived)}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '75%', backgroundColor: Colors.received }]} />
            </View>
          </View>

          {/* Right column */}
          <View style={styles.bentoRight}>
            {/* Total Given */}
            <View style={[styles.bentoCard, styles.bentoSmall]}>
              <View style={styles.bentoRow}>
                <MaterialIcons name="north-east" size={18} color={Colors.given} />
                <Text style={styles.bentoSmallLabel}>Total Given</Text>
              </View>
              <Text style={[styles.bentoSmallValue, { color: Colors.given }]}>
                {formatAmount(data.totalGiven)}
              </Text>
            </View>
            {/* Pending */}
            <View style={[styles.bentoCard, styles.bentoSmall]}>
              <View style={styles.bentoRow}>
                <MaterialIcons name="pending" size={18} color={Colors.onSurfaceVariant} />
                <Text style={styles.bentoSmallLabel}>Pending</Text>
              </View>
              <Text style={styles.bentoSmallValue}>{formatAmount(data.pending)}</Text>
            </View>
          </View>
        </View>

        {/* ── Settlement Pulse Chart ── */}
        <View style={styles.pulseCard}>
          <Text style={styles.pulseTitle}>Payment Speed</Text>
          <Text style={styles.pulseSub}>Recent transaction activity</Text>
          <View style={styles.chartRow}>
            {data.chartBars.map((h, i) => (
              <View key={i} style={styles.barWrapper}>
                <View style={[styles.bar, {
                  height: Math.max(h * 80, 6),
                  backgroundColor: i === 3 ? Colors.primary : `${Colors.primary}${Math.round(h * 100 + 40).toString(16).padStart(2, '0')}`,
                }]} />
              </View>
            ))}
          </View>
          <View style={styles.watermark} pointerEvents="none">
            <Text style={styles.watermarkText}>U</Text>
          </View>
        </View>

        {/* ── Top Pending ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Top Pending</Text>
              <Text style={styles.sectionSub}>People who owe you</Text>
            </View>
            <TouchableOpacity><Text style={styles.viewAll}>View all</Text></TouchableOpacity>
          </View>

          {data.topPending.length === 0 ? (
            <View style={styles.emptyPending}>
              <Text style={styles.emptyEmoji}>🎉</Text>
              <Text style={styles.emptyText}>All accounts settled!</Text>
            </View>
          ) : (
            <View style={styles.pendingList}>
              {data.topPending.map(p => {
                const av = getAvatarColor(p.name);
                const daysAgo = Math.floor(Math.random() * 7);
                return (
                  <TouchableOpacity
                    key={p.personId}
                    style={styles.pendingRow}
                    onPress={() => navigation.navigate('PersonDetail', { personId: p.personId })}
                  >
                    <View style={[styles.pendingAvatar, { backgroundColor: av.bg }]}>
                      <Text style={[styles.pendingInitials, { color: av.text }]}>
                        {getInitials(p.name)}
                      </Text>
                    </View>
                    <View style={styles.pendingInfo}>
                      <Text style={styles.pendingName}>{p.name}</Text>
                      <Text style={styles.pendingTime}>{daysAgo === 0 ? 'Active today' : `${daysAgo}d ago`}</Text>
                    </View>
                    <View style={styles.pendingRight}>
                      <Text style={styles.pendingAmount}>{formatCurrency(Math.abs(p.netBalance))}</Text>
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingBadgeText}>
                          {daysAgo > 5 ? 'OVERDUE' : daysAgo > 2 ? 'DUE SOON' : 'PENDING'}
                        </Text>
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

  scroll: { padding: 20, gap: 20, paddingBottom: 100 },
  hero: { gap: 4 },
  heroSub: { fontSize: 13, fontWeight: '600', color: Colors.onSurfaceVariant },
  heroTitle: { fontSize: 36, fontWeight: '800', color: Colors.onSurface },

  bento: { flexDirection: 'row', gap: 12, height: 200 },
  bentoCard: { backgroundColor: Colors.white, borderRadius: BorderRadius['2xl'], padding: 20, ...Shadow.md },
  bentoLarge: { flex: 1.2, justifyContent: 'space-between' },
  bentoRight: { flex: 1, gap: 12 },
  bentoSmall: { flex: 1, justifyContent: 'space-between' },
  bentoIconBox: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: `${Colors.received}15`,
    alignItems: 'center', justifyContent: 'center',
  },
  bentoLabel: { fontSize: 12, fontWeight: '600', color: Colors.onSurfaceVariant },
  bentoSpacer: { flex: 1 },
  bentoValue: { fontSize: 24, fontWeight: '800' },
  progressBar: { width: '100%', height: 5, backgroundColor: Colors.surfaceContainerLow, borderRadius: 3 },
  progressFill: { height: 5, borderRadius: 3 },
  bentoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bentoSmallLabel: { fontSize: 11, fontWeight: '600', color: Colors.onSurfaceVariant },
  bentoSmallValue: { fontSize: 20, fontWeight: '800', color: Colors.onSurface },

  pulseCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius['3xl'],
    padding: 24, overflow: 'hidden', position: 'relative',
  },
  pulseTitle: { fontSize: 17, fontWeight: '800', color: Colors.onSurface, marginBottom: 4 },
  pulseSub: { fontSize: 12, color: Colors.onSurfaceVariant, marginBottom: 20 },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 88 },
  barWrapper: { flex: 1, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 6, minHeight: 6 },
  watermark: { position: 'absolute', right: -16, bottom: -24, opacity: 0.04 },
  watermarkText: { fontSize: 120, fontWeight: '900', color: Colors.primary },

  section: { gap: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: Colors.onSurface },
  sectionSub: { fontSize: 12, color: Colors.onSurfaceVariant },
  viewAll: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  pendingList: { gap: 10 },
  pendingRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius['2xl'], padding: 16,
    ...Shadow.sm,
  },
  pendingAvatar: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  pendingInitials: { fontSize: 16, fontWeight: '800' },
  pendingInfo: { flex: 1 },
  pendingName: { fontSize: 15, fontWeight: '700', color: Colors.onSurface },
  pendingTime: { fontSize: 12, color: Colors.onSurfaceVariant },
  pendingRight: { alignItems: 'flex-end', gap: 4 },
  pendingAmount: { fontSize: 17, fontWeight: '800', color: Colors.given },
  pendingBadge: {
    backgroundColor: `${Colors.given}18`, paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 20,
  },
  pendingBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.given, letterSpacing: 0.5 },
  emptyPending: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 15, fontWeight: '600', color: Colors.onSurfaceVariant },
});
