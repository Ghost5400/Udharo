import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, RefreshControl, Image, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types';
import { Colors, DarkColors, ThemeColors } from '../../constants/colors';
import { BorderRadius, Shadow, Spacing } from '../../constants/theme';
import { usePeopleStore } from '../../store';
import { PersonCard } from '../../components/PersonCard';
import { formatCurrency, formatAmount } from '../../utils/helpers';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const LOGO_WHITE_BG = require('../../../assets/UDHARO LOGO (WHITE BG).png');
const LOGO_BLACK_BG = require('../../../assets/UDHARO LOGO (BLACK BG).png');

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 68;

export function HomeScreen({ navigation }: Props) {
  const { people, globalBalance, isLoading, loadPeople } = usePeopleStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { isDark, t } = useTheme();
  const C = isDark ? DarkColors : Colors;

  useEffect(() => { loadPeople(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPeople();
    setRefreshing(false);
  }, []);

  const filteredPeople = searchQuery
    ? people.filter(p => {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesPhone = p.phone?.toLowerCase().includes(q);
        const matchesNotes = p.notes?.toLowerCase().includes(q);
        const matchesBalance = Math.abs(p.netBalance).toString().includes(q);
        return matchesName || matchesPhone || matchesNotes || matchesBalance;
      })
    : people;

  const netBalance = globalBalance?.netBalance ?? 0;
  const isPositive = netBalance >= 0;

  const styles = makeStyles(C);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.surfaceContainerLowest} />

      {/* ── TopAppBar ── */}
      <View style={styles.topBar}>
        {showSearch ? (
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={20} color={C.onSurfaceVariant} />
            <TextInput
              style={[styles.searchInput, { color: C.onSurface }]}
              placeholder={t.searchPeople}
              placeholderTextColor={C.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); }}>
              <MaterialIcons name="close" size={20} color={C.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.brand}>
              <Image
                source={isDark ? LOGO_BLACK_BG : LOGO_WHITE_BG}
                style={styles.brandLogo}
                resizeMode="contain"
              />
              <Text style={[styles.brandName, { color: C.primary }]}>Udharo</Text>
            </View>
            <View style={styles.topActions}>
              <TouchableOpacity style={[styles.iconBtn, { backgroundColor: C.surfaceContainerLow }]} onPress={() => setShowSearch(true)}>
                <MaterialIcons name="search" size={22} color={C.onSurfaceVariant} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.notifBtn, { backgroundColor: C.surfaceContainerLow }]} onPress={() => {}}>
                <MaterialIcons name="notifications-none" size={22} color={C.onSurfaceVariant} />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: TAB_BAR_HEIGHT + 24 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} colors={[C.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Balance Card ── */}
        <View style={[styles.balanceCard, { backgroundColor: C.surfaceContainerLowest }]}>
          <View style={styles.watermark} pointerEvents="none">
            <Text style={[styles.watermarkText, { color: C.primary }]}>₹</Text>
          </View>

          <Text style={[styles.balanceLabel, { color: C.onSurfaceVariant }]}>{t.netBalance}</Text>
          <View style={styles.balanceRow}>
            <Text style={[styles.balanceAmount, { color: isPositive ? C.received : C.given }]}>
              {formatCurrency(Math.abs(netBalance))}
            </Text>
            <View style={[styles.balanceBadge, { backgroundColor: isPositive ? `${C.received}18` : `${C.given}18` }]}>
              <MaterialIcons name={isPositive ? 'trending-up' : 'trending-down'} size={18} color={isPositive ? C.received : C.given} />
            </View>
          </View>

          <View style={styles.balanceSplit}>
            <View style={[styles.balanceSplitItem, { backgroundColor: `${C.given}10` }]}>
              <View style={styles.splitTopRow}>
                <MaterialIcons name="north-east" size={14} color={C.given} />
                <Text style={[styles.splitLabel, { color: C.given }]}>{t.totalGiven}</Text>
              </View>
              <Text style={[styles.splitAmount, { color: C.given }]}>
                {formatAmount(globalBalance?.totalGiven ?? 0)}
              </Text>
              <Text style={[styles.splitMeta, { color: C.given }]}>{t.pendingRecovery}</Text>
            </View>

            <View style={[styles.balanceSplitItem, { backgroundColor: `${C.received}10` }]}>
              <View style={styles.splitTopRow}>
                <MaterialIcons name="south-west" size={14} color={C.received} />
                <Text style={[styles.splitLabel, { color: C.received }]}>{t.totalReceived}</Text>
              </View>
              <Text style={[styles.splitAmount, { color: C.received }]}>
                {formatAmount(globalBalance?.totalReceived ?? 0)}
              </Text>
              <Text style={[styles.splitMeta, { color: C.received }]}>{t.totalInflow}</Text>
            </View>
          </View>
        </View>

        {/* ── People Section ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.onSurface }]}>{t.people}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllPeople')}>
              <Text style={[styles.viewAll, { color: C.primary }]}>{t.viewAll}</Text>
            </TouchableOpacity>
          </View>

          {filteredPeople.length === 0 ? (
            <EmptyPeople onAdd={() => navigation.navigate('AddPerson', {})} t={t} C={C} />
          ) : (
            <View style={styles.peopleList}>
              {filteredPeople.slice(0, 8).map(person => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onPress={() => navigation.navigate('PersonDetail', { personId: person.id })}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: C.primary, bottom: TAB_BAR_HEIGHT + 16 }]}
        onPress={() => navigation.navigate('AddPerson', {})}
        activeOpacity={0.85}
      >
        <MaterialIcons name="person-add" size={26} color={C.onPrimary} />
      </TouchableOpacity>
    </View>
  );
}

function EmptyPeople({ onAdd, t, C }: { onAdd: () => void; t: any; C: any }) {
  return (
    <View style={emptyStyles.emptyState}>
      <Text style={emptyStyles.emptyEmoji}>👥</Text>
      <Text style={[emptyStyles.emptyTitle, { color: C.onSurface }]}>{t.noPeopleYet}</Text>
      <Text style={[emptyStyles.emptyBody, { color: C.onSurfaceVariant }]}>{t.noPeopleBody}</Text>
      <TouchableOpacity style={[emptyStyles.emptyBtn, { backgroundColor: C.primary }]} onPress={onAdd}>
        <MaterialIcons name="person-add" size={18} color={C.onPrimary} />
        <Text style={[emptyStyles.emptyBtnText, { color: C.onPrimary }]}>{t.addPerson}</Text>
      </TouchableOpacity>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 20, fontWeight: '800' },
  emptyBody: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: BorderRadius.full,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 8,
  },
  emptyBtnText: { fontSize: 15, fontWeight: '700' },
});

function makeStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.surface },
    topBar: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 20, paddingTop: 52, paddingBottom: 14,
      backgroundColor: C.surfaceContainerLowest,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 6, elevation: 3,
    },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    brandLogo: { width: 34, height: 34, borderRadius: 10 },
    brandName: { fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
    topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    iconBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    notifBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    searchBox: {
      flex: 1, flexDirection: 'row', alignItems: 'center',
      backgroundColor: C.surfaceContainerLow,
      borderRadius: BorderRadius.full, paddingHorizontal: 16, height: 44, gap: 10,
    },
    searchInput: { flex: 1, fontSize: 15, fontWeight: '500' },

    scroll: { paddingTop: 8 },

    balanceCard: {
      margin: 20, marginTop: 16,
      borderRadius: BorderRadius['3xl'],
      padding: 24, overflow: 'hidden', position: 'relative',
      shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.07, shadowRadius: 20, elevation: 8,
    },
    watermark: { position: 'absolute', right: -10, top: -10, opacity: 0.04 },
    watermarkText: { fontSize: 160, fontWeight: '900' },
    balanceLabel: {
      fontSize: 11, fontWeight: '700',
      textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6,
    },
    balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    balanceAmount: { fontSize: 42, fontWeight: '900', letterSpacing: -1.5 },
    balanceBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    balanceSplit: { flexDirection: 'row', gap: 12 },
    balanceSplitItem: { flex: 1, borderRadius: BorderRadius.xl, padding: 14, gap: 4 },
    splitTopRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    splitLabel: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
    splitAmount: { fontSize: 20, fontWeight: '900', marginTop: 4 },
    splitMeta: { fontSize: 10, fontWeight: '500', opacity: 0.8 },

    section: { paddingHorizontal: 20 },
    sectionHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
    },
    sectionTitle: { fontSize: 22, fontWeight: '800' },
    viewAll: { fontSize: 14, fontWeight: '700' },
    peopleList: { gap: 12 },

    fab: {
      position: 'absolute', right: 24,
      width: 58, height: 58, borderRadius: 18,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
    },
  });
}
