import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types';
import { Colors, DarkColors, ThemeColors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { addReminder } from '../../database/reminderRepository';
import { usePeopleStore } from '../../store';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<HomeStackParamList, 'ReminderSetup'>;

const QUICK_TIMES = [
  { label: 'Tomorrow 9am', getDate: () => { const d = new Date(); d.setDate(d.getDate()+1); d.setHours(9,0,0,0); return d.toISOString(); } },
  { label: 'In 3 days',    getDate: () => { const d = new Date(); d.setDate(d.getDate()+3); d.setHours(10,0,0,0); return d.toISOString(); } },
  { label: 'Next week',    getDate: () => { const d = new Date(); d.setDate(d.getDate()+7); d.setHours(10,0,0,0); return d.toISOString(); } },
  { label: 'End of month', getDate: () => { const d = new Date(); d.setMonth(d.getMonth()+1); d.setDate(0); d.setHours(10,0,0,0); return d.toISOString(); } },
];

export function ReminderSetupScreen({ navigation, route }: Props) {
  const { personId } = route.params;
  const { people } = usePeopleStore();
  const person = people.find(p => p.id === personId);

  const { isDark } = useTheme();
  const C = isDark ? DarkColors : Colors;

  // Track the selected label — NOT the date string (which changes every render)
  const [selectedLabel, setSelectedLabel] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuick = (label: string, getDate: () => string) => {
    Haptics.selectionAsync();
    setSelectedLabel(label);
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

  const styles = makeStyles(C);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={C.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: C.onSurface }]}>Set Reminder</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Person info */}
        <View style={[styles.personCard, { backgroundColor: `${C.primary}10` }]}>
          <MaterialIcons name="alarm" size={32} color={C.primary} />
          <View>
            <Text style={[styles.personLabel, { color: C.onSurfaceVariant }]}>Reminder for</Text>
            <Text style={[styles.personName, { color: C.onSurface }]}>{person?.name ?? '—'}</Text>
            {person && Math.abs(person.netBalance) > 0 && (
              <Text style={[styles.personBalance, { color: C.given }]}>
                ₹{Math.abs(person.netBalance).toLocaleString('en-IN')} pending
              </Text>
            )}
          </View>
        </View>

        {/* Quick selections */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant }]}>QUICK SELECT</Text>
          <View style={styles.quickGrid}>
            {QUICK_TIMES.map(q => {
              const isActive = selectedLabel === q.label;
              return (
                <TouchableOpacity
                  key={q.label}
                  style={[
                    styles.quickBtn,
                    { backgroundColor: `${C.primary}12`, borderColor: `${C.primary}30` },
                    isActive && { backgroundColor: C.primary, borderColor: C.primary },
                  ]}
                  onPress={() => handleQuick(q.label, q.getDate)}
                >
                  <MaterialIcons name="schedule" size={16} color={isActive ? C.onPrimary : C.primary} />
                  <Text style={[styles.quickBtnText, { color: isActive ? C.onPrimary : C.primary }]}>
                    {q.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Custom message */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant }]}>CUSTOM MESSAGE (OPTIONAL)</Text>
          <View style={[styles.fieldBox, { backgroundColor: C.surfaceContainerLowest, borderColor: C.outlineVariant }]}>
            <MaterialIcons name="message" size={20} color={C.primary} />
            <TextInput
              style={[styles.fieldInput, { color: C.onSurface }]}
              placeholder={`Please return the ₹${Math.abs(person?.netBalance ?? 0).toLocaleString('en-IN')}`}
              placeholderTextColor={C.onSurfaceVariant}
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </View>
        </View>

        {selectedDate ? (
          <View style={[styles.previewCard, { backgroundColor: `${C.primary}10` }]}>
            <MaterialIcons name="notifications-active" size={20} color={C.primary} />
            <Text style={[styles.previewText, { color: C.primary }]}>
              Reminder set for {new Date(selectedDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.saveArea, { backgroundColor: C.surfaceContainerLowest, borderTopColor: C.outlineVariant }]}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: C.primary }, !selectedDate && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading || !selectedDate}
          activeOpacity={0.85}
        >
          <MaterialIcons name="alarm-add" size={20} color={C.onPrimary} />
          <Text style={[styles.saveBtnText, { color: C.onPrimary }]}>{loading ? 'Setting…' : 'Set Reminder'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function makeStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.surface },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
      backgroundColor: C.surfaceContainerLowest, ...Shadow.sm,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 18, fontWeight: '800' },
    scroll: { padding: 20, gap: 24, paddingBottom: 20 },

    personCard: {
      flexDirection: 'row', alignItems: 'center', gap: 16,
      borderRadius: BorderRadius['2xl'], padding: 20,
    },
    personLabel: { fontSize: 12, fontWeight: '500' },
    personName: { fontSize: 20, fontWeight: '800' },
    personBalance: { fontSize: 13, fontWeight: '600', marginTop: 2 },

    fieldGroup: { gap: 10 },
    fieldLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
    quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    quickBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 16, paddingVertical: 12,
      borderRadius: BorderRadius.full, borderWidth: 1.5,
    },
    quickBtnText: { fontSize: 13, fontWeight: '700' },

    fieldBox: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 12,
      borderRadius: BorderRadius.xl,
      padding: 16, borderWidth: 1, ...Shadow.sm,
    },
    fieldInput: { flex: 1, fontSize: 14, minHeight: 60 },

    previewCard: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      borderRadius: BorderRadius.xl, padding: 16,
    },
    previewText: { fontSize: 13, fontWeight: '600', flex: 1 },

    saveArea: { padding: 20, borderTopWidth: 1 },
    saveBtn: {
      borderRadius: BorderRadius.full, height: 56,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
      ...Shadow.primary,
    },
    saveBtnDisabled: { opacity: 0.4 },
    saveBtnText: { fontSize: 17, fontWeight: '800' },
  });
}
