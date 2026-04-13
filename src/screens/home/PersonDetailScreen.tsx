import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Alert, Image, SectionList, TextInput, Platform
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { usePeopleStore, useTransactionsStore } from '../../store';
import { TransactionItem } from '../../components/TransactionItem';
import { formatCurrency, getInitials, getAvatarColor, isSettled } from '../../utils/helpers';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors, DarkColors } from '../../constants/colors';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Linking } from 'react-native';

type Props = NativeStackScreenProps<HomeStackParamList, 'PersonDetail'>;

export function PersonDetailScreen({ navigation, route }: Props) {
  const { personId } = route.params;
  const { people, deletePerson, updatePersonNotes } = usePeopleStore();
  const { loadTransactions, transactionsByPerson } = useTransactionsStore();
  const { isDark, t } = useTheme();
  const C = isDark ? DarkColors : Colors;
  const styles = makeStyles(C);

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState('');

  const person = people.find(p => p.id === personId);
  const groups = transactionsByPerson.get(personId) ?? [];

  // Load transactions on mount; also sync notes into temp state
  useEffect(() => {
    loadTransactions(personId);
  }, [personId]);

  // Sync notes field when person.notes changes in store
  useEffect(() => {
    if (person) {
      setTempNotes(person.notes || '');
    }
  }, [person?.notes]);

  const handleDelete = () => {
    Alert.alert(
      `Delete ${person?.name}?`,
      'All their transactions will be removed. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePerson(personId);
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            // Navigate to Home — goBack() would land on the deleted person's screen
            navigation.popToTop();
          },
        },
      ]
    );
  };

  const handleShareLedger = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not supported', 'Sharing ledger is not available on web.');
      return;
    }
    try {
      const allTxns = groups.flatMap(g => g.transactions);
      let text = `Ledger with ${person?.name}\n`;
      // netBalance < 0 means given > received → they owe you
      const direction = (person?.netBalance ?? 0) < 0 ? 'They Owe You' : 'You Owe Them';
      text += `Total Balance: ${formatCurrency(Math.abs(person?.netBalance ?? 0))} (${direction})\n\n`;
      text += `Transactions:\n`;
      for (const txn of allTxns) {
        text += `${txn.date} | ${txn.type} | ${formatCurrency(txn.amount)} | ${txn.note ?? 'No note'}\n`;
      }
      
      const docDir: string = (FileSystem as any).documentDirectory ?? '';
      const fileUri = `${docDir}${person?.name}_ledger.txt`;
      await (FileSystem as any).writeAsStringAsync(fileUri, text);
      
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, { dialogTitle: 'Share Ledger' });
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleWhatsApp = async () => {
    const msg = `Hi ${person?.name}, this is a reminder regarding our pending balance of ${formatCurrency(Math.abs(person?.netBalance ?? 0))}. Please check.`;
    const url = `whatsapp://send?text=${encodeURIComponent(msg)}` + (person?.phone ? `&phone=${person.phone}` : '');
    try {
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
      } else {
        Alert.alert('WhatsApp Error', 'WhatsApp does not appear to be installed');
      }
    } catch {}
  };

  const handleSaveNotes = async () => {
    try {
      await updatePersonNotes(personId, tempNotes);
      setIsEditingNotes(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  if (!person) {
    return (
      <View style={[styles.notFound, { backgroundColor: C.surface }]}>
        <Text style={[styles.notFoundText, { color: C.onSurfaceVariant }]}>Person not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: C.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const avatar = getAvatarColor(person.name);
  const initials = getInitials(person.name);
  const balance = person.netBalance;
  const settled = isSettled(balance);
  const isOweYou = balance < 0;
  const balanceColor = settled ? C.outline : isOweYou ? C.given : C.received;
  const balanceContext = settled ? t.allSettled : isOweYou ? t.theyOweYou : t.youOweThem;

  // Prepare SectionList data
  const sections = groups.map(g => ({
    title: g.date,
    data: g.transactions,
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.surfaceContainerLowest} />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: C.surfaceContainerLowest }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={C.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: C.primary }]} numberOfLines={1}>{person.name}</Text>
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
            <View style={[styles.balanceCard, { backgroundColor: C.surfaceContainerLowest }]}>
              <View style={styles.watermark} pointerEvents="none">
                <MaterialIcons name="account-balance-wallet" size={160} color={C.surfaceContainerHigh} />
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
                  <Text style={[styles.balanceContext, { color: C.onSurfaceVariant }]}>{balanceContext}</Text>
                  <Text style={[styles.personName, { color: C.onSurface }]}>{person.name}</Text>
                  {person.phone && <Text style={[styles.personPhone, { color: C.onSurfaceVariant }]}>{person.phone}</Text>}
                </View>
              </View>

              <Text style={[styles.balanceSmallLabel, { color: C.onSurfaceVariant }]}>{t.totalBalance}</Text>
              <Text style={[styles.balanceAmount, { color: balanceColor }]}>
                {settled ? 'Settled ✓' : formatCurrency(Math.abs(balance))}
              </Text>
            </View>

            {/* ── Action Buttons ── */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: C.given, ...Shadow.sm }]}
                onPress={() => navigation.navigate('AddTransaction', { personId, type: 'GIVE' })}
                activeOpacity={0.85}
              >
                <MaterialIcons name="north-east" size={20} color={'#fff'} />
                <Text style={[styles.actionBtnText, { color: '#fff' }]}>{t.give}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: C.received, ...Shadow.sm }]}
                onPress={() => navigation.navigate('AddTransaction', { personId, type: 'RECEIVE' })}
                activeOpacity={0.85}
              >
                <MaterialIcons name="south-west" size={20} color={'#fff'} />
                <Text style={[styles.actionBtnText, { color: '#fff' }]}>{t.receive}</Text>
              </TouchableOpacity>
            </View>

            {/* ── Secondary Actions ── */}
            <View style={styles.secondaryActions}>
               <TouchableOpacity style={[styles.secBtn, { backgroundColor: `${C.primary}12` }]} onPress={() => navigation.navigate('ReminderSetup', { personId })}>
                 <MaterialIcons name="alarm" size={18} color={C.primary} />
                 <Text style={[styles.secBtnText, { color: C.primary }]}>Remind</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.secBtn, { backgroundColor: `${C.primary}12` }]} onPress={handleWhatsApp}>
                 <MaterialIcons name="chat" size={18} color={C.primary} />
                 <Text style={[styles.secBtnText, { color: C.primary }]}>WhatsApp</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.secBtn, { backgroundColor: `${C.primary}12` }]} onPress={handleShareLedger}>
                 <MaterialIcons name="share" size={18} color={C.primary} />
                 <Text style={[styles.secBtnText, { color: C.primary }]}>Export</Text>
               </TouchableOpacity>
             </View>

             {/* ── Notes Section ── */}
             <View style={[styles.notesContainer, { backgroundColor: C.surfaceContainerLowest }]}>
               <View style={styles.notesHeader}>
                 <MaterialIcons name="sticky-note-2" size={18} color={C.onSurfaceVariant} />
                 <Text style={[styles.notesTitle, { color: C.onSurface }]}>Notes</Text>
                 <View style={{ flex: 1 }} />
                 {isEditingNotes ? (
                   <TouchableOpacity onPress={handleSaveNotes} style={[styles.saveNotesBtn, { backgroundColor: C.primary }]}>
                     <Text style={styles.saveNotesText}>Save</Text>
                   </TouchableOpacity>
                 ) : (
                   <TouchableOpacity onPress={() => setIsEditingNotes(true)}>
                     <MaterialIcons name="edit" size={18} color={C.primary} />
                   </TouchableOpacity>
                 )}
               </View>
               {isEditingNotes ? (
                 <TextInput
                   style={[styles.notesInput, { color: C.onSurface, borderColor: C.outlineVariant }]}
                   placeholder="Add notes..."
                   placeholderTextColor={C.onSurfaceVariant}
                   multiline
                   value={tempNotes}
                   onChangeText={setTempNotes}
                   autoFocus
                 />
               ) : (
                 <Text style={[styles.notesText, { color: person.notes ? C.onSurface : C.onSurfaceVariant }]}>
                   {person.notes || 'No notes added yet.'}
                 </Text>
               )}
             </View>

            {/* ── Section heading ── */}
            {sections.length > 0 && (
              <View style={styles.historyHeader}>
                <Text style={[styles.historyTitle, { color: C.onSurface }]}>{t.recentActivity}</Text>
              </View>
            )}
          </>
        )}
        renderSectionHeader={({ section }) => (
          <View style={[styles.dateGroup, { backgroundColor: C.surfaceContainerLow }]}>
            <Text style={[styles.dateGroupLabel, { color: C.onSurfaceVariant }]}>{section.title}</Text>
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
            <Text style={[styles.emptyTitle, { color: C.onSurface }]}>{t.noTransactionsYet}</Text>
            <Text style={[styles.emptyBody, { color: C.onSurfaceVariant }]}>{t.noTransactionsBody}</Text>
          </View>
        )}
        ListFooterComponent={() => (
          <TouchableOpacity style={styles.deleteZone} onPress={handleDelete}>
            <MaterialIcons name="delete-outline" size={18} color={C.error} />
            <Text style={[styles.deleteText, { color: C.error }]}>{t.deletePerson} {person.name}</Text>
          </TouchableOpacity>
        )}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

function makeStyles(C: ThemeColors) {
return StyleSheet.create({
  container: { flex: 1, backgroundColor: C.surface },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 18, color: C.onSurfaceVariant },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
    ...Shadow.sm,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.primary, flex: 1, textAlign: 'center', marginHorizontal: 8 },
  headerRight: {},
  headerAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { fontSize: 14, fontWeight: '800' },

  scroll: { paddingBottom: 40 },

  balanceCard: {
    margin: 20, marginBottom: 16,
    borderRadius: BorderRadius['3xl'],
    padding: 28, overflow: 'hidden', position: 'relative',
    ...Shadow.lg,
  },
  watermark: { position: 'absolute', right: -20, bottom: -20, opacity: 0.06 },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  personPhoto: { width: 56, height: 56, borderRadius: 16 },
  personPhotoFallback: { alignItems: 'center', justifyContent: 'center' },
  personPhotoInitials: { fontSize: 18, fontWeight: '800' },
  balanceContext: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  personName: { fontSize: 18, fontWeight: '800' },
  personPhone: { fontSize: 12 },
  balanceSmallLabel: {
    fontSize: 11, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6,
  },
  balanceAmount: { fontSize: 52, fontWeight: '800', letterSpacing: -2 },

  actions: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14, borderRadius: BorderRadius.full,
  },
  actionBtnText: { fontSize: 15, fontWeight: '800' },

  secondaryActions: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  secBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: BorderRadius.full },
  secBtnText: { fontSize: 13, fontWeight: '700' },

  notesContainer: {
    marginHorizontal: 20, marginBottom: 24, padding: 16,
    borderRadius: BorderRadius['2xl'], ...Shadow.sm,
  },
  notesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  notesTitle: { fontSize: 14, fontWeight: '700' },
  notesText: { fontSize: 14, lineHeight: 20 },
  notesInput: {
    fontSize: 14, lineHeight: 20, minHeight: 60,
    borderWidth: 1, borderRadius: BorderRadius.lg, padding: 12,
    textAlignVertical: 'top',
  },
  saveNotesBtn: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.full },
  saveNotesText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  historyHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 12,
  },
  historyTitle: { fontSize: 20, fontWeight: '800' },
  viewAll: { fontSize: 14, fontWeight: '700' },

  dateGroup: {
    marginHorizontal: 20, marginBottom: 4,
    borderRadius: BorderRadius['2xl'],
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 6,
  },
  dateGroupLabel: {
    fontSize: 10, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12,
  },

  emptyTxn: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyBody: { fontSize: 13 },

  deleteZone: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 24, marginTop: 16,
  },
  deleteText: { fontSize: 14, fontWeight: '600' },
});
}
