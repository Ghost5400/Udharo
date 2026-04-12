import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput, RefreshControl, Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow, Spacing } from '../../constants/theme';
import { usePeopleStore } from '../../store';
import { PersonCard } from '../../components/PersonCard';
import { formatCurrency, formatAmount } from '../../utils/helpers';
import { MaterialIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { people, globalBalance, isLoading, loadPeople } = usePeopleStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPeople();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPeople();
    setRefreshing(false);
  }, []);

  const filteredPeople = searchQuery
    ? people.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : people;

  const netBalance = globalBalance?.netBalance ?? 0;
  const isPositive = netBalance >= 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surfaceContainerLowest} />

      {/* ── TopAppBar ── */}
      <View style={styles.topBar}>
        {showSearch ? (
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={20} color={Colors.onSurfaceVariant} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search people..."
              placeholderTextColor={Colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setShowSearch(false); setSearchQuery(''); }}>
              <MaterialIcons name="close" size={20} color={Colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.brand}>
              <View style={styles.logoChip}>
                <Text style={styles.logoText}>U</Text>
              </View>
              <Text style={styles.brandName}>Udharo</Text>
            </View>
            <View style={styles.topActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSearch(true)}>
                <MaterialIcons name="search" size={22} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.avatar} onPress={() => {}}>
                <Text style={styles.avatarText}>U</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Balance Card ── */}
        <View style={styles.balanceCard}>
          {/* Watermark */}
          <View style={styles.watermark} pointerEvents="none">
            <Text style={styles.watermarkText}>U</Text>
          </View>

          <Text style={styles.balanceLabel}>Net Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={[styles.balanceAmount, { color: isPositive ? Colors.received : Colors.given }]}>
              {formatCurrency(Math.abs(netBalance))}
            </Text>
            <Text style={{ fontSize: 22, color: isPositive ? Colors.received : Colors.given }}>
              {isPositive ? '↑' : '↓'}
            </Text>
          </View>

          <View style={styles.balanceSplit}>
            {/* Given */}
            <View style={styles.balanceSplitItem}>
              <Text style={styles.splitLabel}>Total Given</Text>
              <Text style={[styles.splitAmount, { color: Colors.given }]}>
                {formatAmount(globalBalance?.totalGiven ?? 0)}
              </Text>
              <View style={styles.splitMeta}>
                <MaterialIcons name="north-east" size={12} color={Colors.given} />
                <Text style={[styles.splitMetaText, { color: Colors.given }]}>Pending Recovery</Text>
              </View>
            </View>

            {/* Received */}
            <View style={styles.balanceSplitItem}>
              <Text style={styles.splitLabel}>Total Received</Text>
              <Text style={[styles.splitAmount, { color: Colors.received }]}>
                {formatAmount(globalBalance?.totalReceived ?? 0)}
              </Text>
              <View style={styles.splitMeta}>
                <MaterialIcons name="south-west" size={12} color={Colors.received} />
                <Text style={[styles.splitMetaText, { color: Colors.received }]}>Total Inflow</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── People Section ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>People</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllPeople')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>

          {filteredPeople.length === 0 ? (
            <EmptyPeople onAdd={() => navigation.navigate('AddPerson', {})} />
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
        style={styles.fab}
        onPress={() => navigation.navigate('AddPerson', {})}
        activeOpacity={0.85}
      >
        <MaterialIcons name="add" size={32} color={Colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
}

function EmptyPeople({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>👥</Text>
      <Text style={styles.emptyTitle}>No people yet</Text>
      <Text style={styles.emptyBody}>Add your first person to start tracking money</Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onAdd}>
        <MaterialIcons name="person-add" size={18} color={Colors.onPrimary} />
        <Text style={styles.emptyBtnText}>Add Person</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: Colors.surfaceContainerLowest,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoChip: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 18, fontWeight: '900', color: Colors.white },
  brandName: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center', justifyContent: 'center',
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: `${Colors.primary}20`,
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: Colors.onPrimary },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.full, paddingHorizontal: 16, height: 44, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.onSurface },

  scroll: { paddingBottom: 120, paddingTop: 8 },

  balanceCard: {
    margin: 20,
    marginTop: 16,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: BorderRadius['3xl'],
    padding: 28,
    overflow: 'hidden',
    position: 'relative',
    ...Shadow.lg,
  },
  watermark: { position: 'absolute', right: -30, bottom: -30, opacity: 0.03 },
  watermarkText: { fontSize: 200, fontWeight: '900', color: Colors.primary },
  balanceLabel: {
    fontSize: 12, fontWeight: '600', color: Colors.onSurfaceVariant,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8,
  },
  balanceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 28 },
  balanceAmount: { fontSize: 44, fontWeight: '800', letterSpacing: -1 },
  balanceSplit: { flexDirection: 'row', gap: 12 },
  balanceSplitItem: {
    flex: 1, backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.xl, padding: 16, gap: 4,
  },
  splitLabel: {
    fontSize: 10, fontWeight: '700', color: Colors.onSurfaceVariant,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  splitAmount: { fontSize: 20, fontWeight: '800' },
  splitMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  splitMetaText: { fontSize: 10, fontWeight: '500' },

  section: { paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: Colors.onSurface },
  viewAll: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  peopleList: { gap: 12 },

  fab: {
    position: 'absolute',
    right: 24,
    bottom: 96,
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.primary,
  },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.onSurface },
  emptyBody: { fontSize: 14, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22 },
  emptyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 8,
  },
  emptyBtnText: { fontSize: 15, fontWeight: '700', color: Colors.onPrimary },
});
