import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, StatusBar, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { addReminder } from '../../database/reminderRepository';
import { usePeopleStore } from '../../store';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type Props = NativeStackScreenProps<HomeStackParamList, 'ReminderSetup'>;

const QUICK_TIMES = [
  { label: 'Tomorrow 9am', getDate: () => { const d = new Date(); d.setDate(d.getDate()+1); d.setHours(9,0,0,0); return d.toISOString(); } },
  { label: 'In 3 days', getDate: () => { const d = new Date(); d.setDate(d.getDate()+3); d.setHours(10,0,0,0); return d.toISOString(); } },
  { label: 'Next week', getDate: () => { const d = new Date(); d.setDate(d.getDate()+7); d.setHours(10,0,0,0); return d.toISOString(); } },
  { label: 'End of month', getDate: () => { const d = new Date(); d.setMonth(d.getMonth()+1); d.setDate(0); d.setHours(10,0,0,0); return d.toISOString(); } },
];

export function ReminderSetupScreen({ navigation, route }: Props) {
  const { personId } = route.params;
  const { people } = usePeopleStore();
  const person = people.find(p => p.id === personId);

  const [selectedDate, setSelectedDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuick = (getDate: () => string) => {
    Haptics.selectionAsync();
    setSelectedDate(getDate());
  };

  const handleSave = async () => {
    if (!selectedDate) {
      Alert.alert('Select time', 'Please select when to send the reminder.');
      return;
    }
    setLoading(true);
    try {
      await addReminder(
        { personId, remindAt: selectedDate, message: message.trim() || undefined },
        person?.name ?? 'this person',
        person ? Math.abs(person.netBalance) : undefined
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Reminder Set! 🔔', 'You will be notified at the scheduled time.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Set Reminder</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Person info */}
        <View style={styles.personCard}>
          <MaterialIcons name="alarm" size={32} color={Colors.primary} />
          <View>
            <Text style={styles.personLabel}>Reminder for</Text>
            <Text style={styles.personName}>{person?.name ?? '—'}</Text>
            {person && Math.abs(person.netBalance) > 0 && (
              <Text style={styles.personBalance}>
                ₹{Math.abs(person.netBalance).toLocaleString('en-IN')} pending
              </Text>
            )}
          </View>
        </View>

        {/* Quick selections */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>QUICK SELECT</Text>
          <View style={styles.quickGrid}>
            {QUICK_TIMES.map(q => (
              <TouchableOpacity
                key={q.label}
                style={[styles.quickBtn, selectedDate === q.getDate() && styles.quickBtnActive]}
                onPress={() => handleQuick(q.getDate)}
              >
                <MaterialIcons
                  name="schedule"
                  size={16}
                  color={selectedDate === q.getDate() ? Colors.white : Colors.primary}
                />
                <Text style={[styles.quickBtnText, selectedDate === q.getDate() && styles.quickBtnTextActive]}>
                  {q.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom message */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>CUSTOM MESSAGE (OPTIONAL)</Text>
          <View style={styles.fieldBox}>
            <MaterialIcons name="message" size={20} color={Colors.primary} />
            <TextInput
              style={styles.fieldInput}
              placeholder={`Please return the ₹${Math.abs(person?.netBalance ?? 0).toLocaleString('en-IN')}`}
              placeholderTextColor={Colors.onSurfaceVariant}
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>
        </View>

        {selectedDate && (
          <View style={styles.previewCard}>
            <MaterialIcons name="notifications-active" size={20} color={Colors.primary} />
            <Text style={styles.previewText}>
              Reminder set for {new Date(selectedDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.saveArea}>
        <TouchableOpacity
          style={[styles.saveBtn, !selectedDate && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading || !selectedDate}
          activeOpacity={0.85}
        >
          <MaterialIcons name="alarm-add" size={20} color={Colors.white} />
          <Text style={styles.saveBtnText}>{loading ? 'Setting…' : 'Set Reminder'}</Text>
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
    backgroundColor: Colors.white, ...Shadow.sm,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: Colors.onSurface },
  scroll: { padding: 20, gap: 24 },

  personCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: BorderRadius['2xl'], padding: 20,
  },
  personLabel: { fontSize: 12, fontWeight: '500', color: Colors.onSurfaceVariant },
  personName: { fontSize: 20, fontWeight: '800', color: Colors.onSurface },
  personBalance: { fontSize: 13, fontWeight: '600', color: Colors.given, marginTop: 2 },

  fieldGroup: { gap: 10 },
  fieldLabel: {
    fontSize: 10, fontWeight: '800', color: Colors.onSurfaceVariant,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Colors.primary}12`,
    borderWidth: 1.5, borderColor: `${Colors.primary}30`,
  },
  quickBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  quickBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  quickBtnTextActive: { color: Colors.white },

  fieldBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.white, borderRadius: BorderRadius.xl,
    padding: 16, borderWidth: 1, borderColor: Colors.outlineVariant, ...Shadow.sm,
  },
  fieldInput: { flex: 1, fontSize: 14, color: Colors.onSurface, minHeight: 60 },

  previewCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: `${Colors.primary}10`, borderRadius: BorderRadius.xl,
    padding: 16,
  },
  previewText: { fontSize: 13, fontWeight: '600', color: Colors.primary, flex: 1 },

  saveArea: {
    padding: 20, backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.outlineVariant,
  },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    ...Shadow.primary,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: 17, fontWeight: '800', color: Colors.white },
});
