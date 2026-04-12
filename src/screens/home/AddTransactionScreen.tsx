import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, StatusBar, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList, TransactionType, AttachmentInput } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { useTransactionsStore, usePeopleStore } from '../../store';
import { todayISO, formatCurrency } from '../../utils/helpers';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<HomeStackParamList, 'AddTransaction'>;

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

export function AddTransactionScreen({ navigation, route }: Props) {
  const { personId: routePersonId, type: routeType } = route.params ?? {};
  const { people } = usePeopleStore();
  const { addTransaction } = useTransactionsStore();

  const [txnType, setTxnType] = useState<TransactionType>(routeType ?? 'GIVE');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayISO());
  const [selectedPersonId, setSelectedPersonId] = useState(routePersonId ?? '');
  const [attachments, setAttachments] = useState<AttachmentInput[]>([]);
  const [loading, setLoading] = useState(false);

  const isGive = txnType === 'GIVE';
  const accentColor = isGive ? Colors.given : Colors.received;
  const selectedPerson = people.find(p => p.id === selectedPersonId);

  const handleAmountChange = (text: string) => {
    const clean = text.replace(/[^0-9.]/g, '');
    setAmount(clean);
  };

  const handleQuickAmount = (val: number) => {
    Haptics.selectionAsync();
    setAmount(String(val));
  };

  const handlePickImage = async (source: 'camera' | 'gallery') => {
    let result: ImagePicker.ImagePickerResult;
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Camera permission needed'); return; }
      result = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Gallery permission needed'); return; }
      result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    }
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAttachments(prev => [...prev, {
        type: 'IMAGE',
        fileUri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
        fileSize: asset.fileSize,
      }]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }
    if (!selectedPersonId) {
      Alert.alert('Select person', 'Please select who this transaction is with.');
      return;
    }

    setLoading(true);
    try {
      await addTransaction({
        personId: selectedPersonId,
        type: txnType,
        amount: parsedAmount,
        note: note.trim() || undefined,
        date,
        attachments,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('PersonDetail', { personId: selectedPersonId });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>New Transaction</Text>
          {selectedPerson && <Text style={styles.headerSub}>with {selectedPerson.name}</Text>}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* ── Type Toggle ── */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeBtn, isGive && styles.typeBtnActiveGive]}
            onPress={() => { setTxnType('GIVE'); Haptics.selectionAsync(); }}
          >
            <MaterialIcons name="north-east" size={18} color={isGive ? Colors.white : Colors.onSurfaceVariant} />
            <Text style={[styles.typeBtnLabel, isGive && styles.typeLabelActive]}>Give</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, !isGive && styles.typeBtnActiveReceive]}
            onPress={() => { setTxnType('RECEIVE'); Haptics.selectionAsync(); }}
          >
            <MaterialIcons name="south-west" size={18} color={!isGive ? Colors.white : Colors.onSurfaceVariant} />
            <Text style={[styles.typeBtnLabel, !isGive && styles.typeLabelActive]}>Receive</Text>
          </TouchableOpacity>
        </View>

        {/* ── Amount Input ── */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>ENTER AMOUNT</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.currencySymbol, { color: accentColor }]}>₹</Text>
            <TextInput
              style={[styles.amountInput, { color: accentColor }]}
              placeholder="0.00"
              placeholderTextColor={`${accentColor}40`}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>

          {/* Quick amounts */}
          <View style={styles.quickAmounts}>
            {QUICK_AMOUNTS.map(q => (
              <TouchableOpacity
                key={q}
                style={[styles.quickBtn, { borderColor: accentColor }]}
                onPress={() => handleQuickAmount(q)}
              >
                <Text style={[styles.quickBtnText, { color: accentColor }]}>₹{q.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Person Selector (if not pre-selected) ── */}
        {!routePersonId && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>SELECT PERSON</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.personScroll}>
              {people.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.personChip, selectedPersonId === p.id && styles.personChipActive]}
                  onPress={() => setSelectedPersonId(p.id)}
                >
                  <Text style={[styles.personChipText, selectedPersonId === p.id && styles.personChipTextActive]}>
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Date ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>DATE</Text>
          <View style={styles.fieldBox}>
            <MaterialIcons name="calendar-today" size={22} color={Colors.primary} />
            <TextInput
              style={styles.fieldInput}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.onSurfaceVariant}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>

        {/* ── Note ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>NOTE (OPTIONAL)</Text>
          <View style={styles.fieldBox}>
            <MaterialIcons name="edit-note" size={22} color={Colors.primary} />
            <TextInput
              style={styles.fieldInput}
              placeholder="Lunch, Rent, Groceries…"
              placeholderTextColor={Colors.onSurfaceVariant}
              value={note}
              onChangeText={setNote}
              returnKeyType="done"
            />
          </View>
        </View>

        {/* ── Proof Attachments ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>ADD PROOF</Text>
          <View style={styles.proofGrid}>
            <TouchableOpacity style={styles.proofBtn} onPress={() => handlePickImage('camera')}>
              <MaterialIcons name="photo-camera" size={26} color={Colors.primaryContainer} />
              <Text style={styles.proofBtnLabel}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.proofBtn} onPress={() => handlePickImage('gallery')}>
              <MaterialIcons name="image" size={26} color={Colors.primaryContainer} />
              <Text style={styles.proofBtnLabel}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.proofBtn} onPress={() => Alert.alert('Voice note', 'Coming soon!')}>
              <MaterialIcons name="mic" size={26} color={Colors.primaryContainer} />
              <Text style={styles.proofBtnLabel}>Voice</Text>
            </TouchableOpacity>
          </View>
          {attachments.length > 0 && (
            <Text style={styles.attachCount}>{attachments.length} attachment(s) added ✓</Text>
          )}
        </View>
      </ScrollView>

      {/* ── Save Button ── */}
      <View style={styles.saveArea}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: isGive ? Colors.given : Colors.received }, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {loading ? 'Saving…' : `Save ${isGive ? 'Given' : 'Received'}`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.onSurface },
  headerSub: { fontSize: 12, fontWeight: '500', color: Colors.onSurfaceVariant },

  scroll: { padding: 20, gap: 24 },

  typeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.full,
    padding: 5,
    gap: 4,
  },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: BorderRadius.full, gap: 8,
  },
  typeBtnActiveGive: { backgroundColor: Colors.given, ...Shadow.danger },
  typeBtnActiveReceive: { backgroundColor: Colors.received, ...Shadow.primary },
  typeBtnLabel: { fontSize: 15, fontWeight: '700', color: Colors.onSurfaceVariant },
  typeLabelActive: { color: Colors.white },

  amountSection: { alignItems: 'center', gap: 16 },
  amountLabel: {
    fontSize: 11, fontWeight: '800', color: Colors.onSurfaceVariant,
    letterSpacing: 2, textTransform: 'uppercase',
  },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  currencySymbol: { fontSize: 32, fontWeight: '800' },
  amountInput: { fontSize: 62, fontWeight: '800', minWidth: 160, textAlign: 'center' },
  quickAmounts: { flexDirection: 'row', gap: 10 },
  quickBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BorderRadius.full, borderWidth: 1.5,
    backgroundColor: Colors.white,
  },
  quickBtnText: { fontSize: 13, fontWeight: '700' },

  personScroll: { marginTop: 4 },
  personChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: BorderRadius.full, borderWidth: 1.5, borderColor: Colors.outlineVariant,
    backgroundColor: Colors.white, marginRight: 10,
  },
  personChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  personChipText: { fontSize: 14, fontWeight: '600', color: Colors.onSurface },
  personChipTextActive: { color: Colors.white },

  fieldGroup: { gap: 8 },
  fieldLabel: {
    fontSize: 10, fontWeight: '800', color: Colors.onSurfaceVariant,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  fieldBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: 16, borderWidth: 1, borderColor: Colors.outlineVariant,
    ...Shadow.sm,
  },
  fieldInput: { flex: 1, fontSize: 15, color: Colors.onSurface, fontWeight: '500' },

  proofGrid: { flexDirection: 'row', gap: 12 },
  proofBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 20, gap: 8,
    backgroundColor: Colors.white, borderRadius: BorderRadius['2xl'],
    borderWidth: 1.5, borderColor: Colors.outlineVariant, borderStyle: 'dashed',
  },
  proofBtnLabel: { fontSize: 11, fontWeight: '700', color: Colors.onSurfaceVariant },
  attachCount: { fontSize: 13, color: Colors.primary, fontWeight: '600', textAlign: 'center' },

  saveArea: {
    padding: 20, backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.outlineVariant,
  },
  saveBtn: {
    borderRadius: BorderRadius.full, height: 56,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.primary,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 17, fontWeight: '800', color: Colors.white },
});
