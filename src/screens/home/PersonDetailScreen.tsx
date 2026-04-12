import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Image, SectionList,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList, TransactionGroup } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { usePeopleStore, useTransactionsStore } from '../../store';
import { TransactionItem } from '../../components/TransactionItem';
import { formatCurrency, getInitials, getAvatarColor, isSettled } from '../../utils/helpers';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<HomeStackParamList, 'PersonDetail'>;

export function PersonDetailScreen({ navigation, route }: Props) {
  const { personId } = route.params;
  const { people, deletePerson } = usePeopleStore();
  const { loadTransactions, transactionsByPerson } = useTransactionsStore();
  const [refreshing, setRefreshing] = useState(false);

  const person = people.find(p => p.id === personId);
  const groups = transactionsByPerson.get(personId) ?? [];

  useEffect(() => {
    loadTransactions(personId);
  }, [personId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTransactions(personId);
    setRefreshing(false);
  }, [personId]);

  const handleDelete = () => {
    Alert.alert(
      `Delete ${person?.name}?`,
      'All their transactions will be hidden. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePerson(personId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!person) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Person not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: Colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const avatar = getAvatarColor(person.name);
  const initials = getInitials(person.name);
  const balance = person.netBalance;
  const settled = isSettled(balance);
  const isOweYou = balance < 0;
  const balanceColor = settled ? Colors.outline : isOweYou ? Colors.given : Colors.received;
  const balanceContext = settled ? 'All settled' : isOweYou ? 'They owe you' : 'You owe them';

  // Prepare SectionList data
  const sections = groups.map(g => ({
    title: g.date,
    data: g.transactions,
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{person.name}</Text>
        <View style={styles.headerRight}>
          {person.photoUri ? (
            <Image source={{ uri: person.photoUri }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, { backgroundColor: avatar.bg }]}>
              <Text style={[styles.headerAvatarText, { color: avatar.text }]}>{initials}</Text>
            </View>
          )}
        </View>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        ListHeaderComponent={() => (
          <>
            {/* ── Balance Card ── */}
            <View style={styles.balanceCard}>
              <View style={styles.watermark} pointerEvents="none">
                <MaterialIcons name="account-balance-wallet" size={160} color={Colors.surfaceContainerHighest} />
              </View>

              <View style={styles.personRow}>
                {person.photoUri ? (
                  <Image source={{ uri: person.photoUri }} style={styles.personPhoto} />
                ) : (
                  <View style={[styles.personPhoto, styles.personPhotoFallback, { backgroundColor: avatar.bg }]}>
                    <Text style={[styles.personPhotoInitials, { color: avatar.text }]}>{initials}</Text>
                  </View>
                )}
                <View>
                  <Text style={styles.balanceContext}>{balanceContext}</Text>
                  <Text style={styles.personName}>{person.name}</Text>
                  {person.phone && <Text style={styles.personPhone}>{person.phone}</Text>}
                </View>
              </View>

              <Text style={styles.balanceSmallLabel}>Total Balance</Text>
              <Text style={[styles.balanceAmount, { color: balanceColor }]}>
                {settled ? 'Settled ✓' : formatCurrency(Math.abs(balance))}
              </Text>
            </View>

            {/* ── Action Buttons ── */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.giveBtn]}
                onPress={() => navigation.navigate('AddTransaction', { personId, type: 'GIVE' })}
                activeOpacity={0.85}
              >
                <MaterialIcons name="north-east" size={20} color={Colors.white} />
                <Text style={styles.actionBtnText}>Give</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.receiveBtn]}
                onPress={() => navigation.navigate('AddTransaction', { personId, type: 'RECEIVE' })}
                activeOpacity={0.85}
              >
                <MaterialIcons name="south-west" size={20} color={Colors.white} />
                <Text style={styles.actionBtnText}>Receive</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.reminderBtn]}
                onPress={() => navigation.navigate('ReminderSetup', { personId })}
                activeOpacity={0.85}
              >
                <MaterialIcons name="alarm-add" size={20} color={Colors.primary} />
                <Text style={[styles.actionBtnText, { color: Colors.primary }]}>Remind</Text>
              </TouchableOpacity>
            </View>

            {/* ── Section heading ── */}
            {sections.length > 0 && (
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Recent Activity</Text>
                <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
              </View>
            )}
          </>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.dateGroup}>
            <Text style={styles.dateGroupLabel}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onPress={() => navigation.navigate('TransactionDetail', { transactionId: item.id })}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyTxn}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptyBody}>Tap Give or Receive to add one</Text>
          </View>
        )}
        ListFooterComponent={() => (
          <TouchableOpacity style={styles.deleteZone} onPress={handleDelete}>
            <MaterialIcons name="delete-outline" size={18} color={Colors.error} />
            <Text style={styles.deleteText}>Delete {person.name}</Text>
          </TouchableOpacity>
        )}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 18, color: Colors.onSurfaceVariant },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
    backgroundColor: Colors.white, ...Shadow.sm,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.primary, flex: 1, textAlign: 'center', marginHorizontal: 8 },
  headerRight: {},
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  headerAvatarText: { fontSize: 14, fontWeight: '800' },

  scroll: { paddingBottom: 40 },

  balanceCard: {
    margin: 20, marginBottom: 16,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius['3xl'],
    padding: 28, overflow: 'hidden', position: 'relative',
    ...Shadow.lg,
  },
  watermark: { position: 'absolute', right: -20, bottom: -20, opacity: 0.06 },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  personPhoto: { width: 56, height: 56, borderRadius: 16 },
  personPhotoFallback: { alignItems: 'center', justifyContent: 'center' },
  personPhotoInitials: { fontSize: 18, fontWeight: '800' },
  balanceContext: { fontSize: 12, fontWeight: '600', color: Colors.onSurfaceVariant, marginBottom: 2 },
  personName: { fontSize: 18, fontWeight: '800', color: Colors.onSurface },
  personPhone: { fontSize: 12, color: Colors.onSurfaceVariant },
  balanceSmallLabel: {
    fontSize: 11, fontWeight: '800', color: Colors.given,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6,
  },
  balanceAmount: { fontSize: 52, fontWeight: '800', letterSpacing: -2 },

  actions: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14, borderRadius: BorderRadius.full,
  },
  giveBtn: { backgroundColor: Colors.given, ...Shadow.danger },
  receiveBtn: { backgroundColor: Colors.received, ...Shadow.primary },
  reminderBtn: {
    backgroundColor: `${Colors.primary}15`,
    borderWidth: 1.5, borderColor: `${Colors.primary}30`,
  },
  actionBtnText: { fontSize: 15, fontWeight: '800', color: Colors.white },

  historyHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 12,
  },
  historyTitle: { fontSize: 20, fontWeight: '800', color: Colors.onSurface },
  viewAll: { fontSize: 14, fontWeight: '700', color: Colors.primary },

  dateGroup: {
    backgroundColor: Colors.surfaceContainerLow,
    marginHorizontal: 20, marginBottom: 4,
    borderRadius: BorderRadius['2xl'],
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 6,
  },
  dateGroupLabel: {
    fontSize: 10, fontWeight: '800', color: Colors.onSurfaceVariant,
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12,
  },

  emptyTxn: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.onSurface },
  emptyBody: { fontSize: 13, color: Colors.onSurfaceVariant },

  deleteZone: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 24, marginTop: 16,
  },
  deleteText: { fontSize: 14, fontWeight: '600', color: Colors.error },
});
