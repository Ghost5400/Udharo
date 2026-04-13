import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, StatusBar, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList, TransactionType, AttachmentInput, TRANSACTION_TAGS } from '../../types';
import { Colors, DarkColors, ThemeColors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { useTransactionsStore, usePeopleStore } from '../../store';
import { todayISO } from '../../utils/helpers';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Haptics from 'expo-haptics';
// expo-av is not supported on web and is deprecated — only import on native
const AudioModule = Platform.OS !== 'web' ? require('expo-av').Audio : null;
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<HomeStackParamList, 'AddTransaction'>;

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

// ─── Persist media file to permanent app directory ───────────────────────────
async function persistFile(tempUri: string, folder: string, prefix: string): Promise<string> {
  // FileSystem is not available on web — return the original URI unchanged
  if (Platform.OS === 'web') return tempUri;
  const docDir: string = (FileSystem as any).documentDirectory ?? '';
  const dir = `${docDir}${folder}/`;
  const dirInfo = await (FileSystem as any).getInfoAsync(dir);
  if (!dirInfo.exists) {
    await (FileSystem as any).makeDirectoryAsync(dir, { intermediates: true });
  }
  const ext = tempUri.split('.').pop()?.split('?')[0] ?? 'jpg';
  const filename = `${prefix}_${Date.now()}.${ext}`;
  const destUri = `${dir}${filename}`;
  try {
    await (FileSystem as any).copyAsync({ from: tempUri, to: destUri });
    return destUri;
  } catch {
    return tempUri;
  }
}

// ─── Save image/video to device gallery (Android & iOS) ──────────────────────
async function saveToDeviceGallery(uri: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') {
      await MediaLibrary.saveToLibraryAsync(uri);
    }
  } catch {
    // Non-fatal — app still works without gallery save
  }
}

export function AddTransactionScreen({ navigation, route }: Props) {
  const { personId: routePersonId, type: routeType } = route.params ?? {};
  const { people } = usePeopleStore();
  const { addTransaction } = useTransactionsStore();
  const { isDark, t } = useTheme();
  const C = isDark ? DarkColors : Colors;

  const [txnType, setTxnType] = useState<TransactionType>(routeType ?? 'GIVE');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayISO());
  const [selectedPersonId, setSelectedPersonId] = useState(routePersonId ?? '');
  const [attachments, setAttachments] = useState<AttachmentInput[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  // Voice recording state (native only — not supported on web)
  const [recording, setRecording] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);

  const isGive = txnType === 'GIVE';
  const accentColor = isGive ? C.given : C.received;
  const selectedPerson = people.find(p => p.id === selectedPersonId);

  const handleAmountChange = (text: string) => {
    setAmount(text.replace(/[^0-9.]/g, ''));
  };

  const handleQuickAmount = (val: number) => {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
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
      result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    }
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      try {
        // Persist to permanent internal storage (survives app restarts)
        const persistedUri = await persistFile(asset.uri, 'proof_images', 'img');
        // Also save to device gallery for user access outside the app
        await saveToDeviceGallery(persistedUri);
        setAttachments(prev => [...prev, {
          type: 'IMAGE', fileUri: persistedUri,
          mimeType: asset.mimeType ?? 'image/jpeg', fileSize: asset.fileSize,
        }]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e: any) {
        Alert.alert('Error saving image', e.message);
      }
    }
  };

  const handleVoice = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not supported', 'Voice recording is not available on web.');
      return;
    }
    if (isRecording) {
      // Stop recording
      try {
        await recording?.stopAndUnloadAsync();
        const uri = recording?.getURI();
        setRecording(null);
        setIsRecording(false);
        if (uri) {
          // Persist voice note to permanent internal storage
          const persistedUri = await persistFile(uri, 'proof_audio', 'voice');
          // Save audio to device storage — we are already inside the native-only block
          try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === 'granted') {
              await MediaLibrary.saveToLibraryAsync(persistedUri);
            }
          } catch { /* non-fatal */ }
          setAttachments(prev => [...prev, { type: 'AUDIO', fileUri: persistedUri, mimeType: 'audio/m4a' }]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch (e: any) {
        Alert.alert('Error', e.message);
        setIsRecording(false);
      }
    } else {
      // Start recording
      try {
        const { status } = await AudioModule.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Microphone permission needed', 'Please allow microphone access in Settings.');
          return;
        }
        await AudioModule.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording: rec } = await AudioModule.Recording.createAsync(
          AudioModule.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(rec);
        setIsRecording(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch (e: any) {
        Alert.alert('Error', e.message);
      }
    }
  };

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert('Invalid amount', t.invalidAmount);
      return;
    }
    if (!selectedPersonId) {
      Alert.alert('Select person', t.selectPersonAlert);
      return;
    }
    setLoading(true);
    try {
      await addTransaction({
        personId: selectedPersonId, type: txnType, amount: parsedAmount,
        note: note.trim() || undefined, date, tag: selectedTag, attachments,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('PersonDetail', { personId: selectedPersonId });
    } catch (e: any) {
      Alert.alert(t.error, e.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = makeStyles(C);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={C.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: C.onSurface }]}>{t.newTransaction}</Text>
          {selectedPerson && <Text style={[styles.headerSub, { color: C.onSurfaceVariant }]}>{t.with} {selectedPerson.name}</Text>}
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* ── Type Toggle ── */}
        <View style={[styles.typeToggle, { backgroundColor: C.surfaceContainerLow }]}>
          <TouchableOpacity
            style={[styles.typeBtn, isGive && { backgroundColor: C.given }]}
            onPress={() => { setTxnType('GIVE'); Haptics.selectionAsync(); }}
          >
            <MaterialIcons name="north-east" size={18} color={isGive ? '#fff' : C.onSurfaceVariant} />
            <Text style={[styles.typeBtnLabel, { color: isGive ? '#fff' : C.onSurfaceVariant }]}>{t.give}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, !isGive && { backgroundColor: C.received }]}
            onPress={() => { setTxnType('RECEIVE'); Haptics.selectionAsync(); }}
          >
            <MaterialIcons name="south-west" size={18} color={!isGive ? '#fff' : C.onSurfaceVariant} />
            <Text style={[styles.typeBtnLabel, { color: !isGive ? '#fff' : C.onSurfaceVariant }]}>{t.receive}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Amount Input ── */}
        <View style={styles.amountSection}>
          <Text style={[styles.amountLabel, { color: C.onSurfaceVariant }]}>{t.enterAmount}</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.currencySymbol, { color: accentColor }]}>₹</Text>
            <TextInput
              style={[styles.amountInput, { color: accentColor }]}
              placeholder="0"
              placeholderTextColor={`${accentColor}40`}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>
          <View style={styles.quickAmounts}>
            {QUICK_AMOUNTS.map(q => (
              <TouchableOpacity
                key={q}
                style={[styles.quickBtn, { borderColor: accentColor, backgroundColor: C.surfaceContainerLowest }]}
                onPress={() => handleQuickAmount(q)}
              >
                <Text style={[styles.quickBtnText, { color: accentColor }]}>₹{q.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Person Selector ── */}
        {!routePersonId && (
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant }]}>{t.selectPerson}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {people.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.personChip,
                    { borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLowest },
                    selectedPersonId === p.id && { backgroundColor: C.primary, borderColor: C.primary }
                  ]}
                  onPress={() => setSelectedPersonId(p.id)}
                >
                  <Text style={[styles.personChipText, { color: C.onSurface },
                    selectedPersonId === p.id && { color: '#fff' }
                  ]}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Tags ── */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant }]}>TAG (OPTIONAL)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tagRow}>
              {TRANSACTION_TAGS.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagChip,
                    { borderColor: C.outlineVariant, backgroundColor: C.surfaceContainerLow },
                    selectedTag === tag && { backgroundColor: C.primary, borderColor: C.primary }
                  ]}
                  onPress={() => setSelectedTag(selectedTag === tag ? undefined : tag)}
                >
                  <Text style={[styles.tagChipText, { color: C.onSurfaceVariant },
                    selectedTag === tag && { color: '#fff' }
                  ]}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* ── Date ── */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant }]}>{t.date}</Text>
          <View style={[styles.fieldBox, { backgroundColor: C.surfaceContainerLowest, borderColor: C.outlineVariant }]}>
            <MaterialIcons name="calendar-today" size={22} color={C.primary} />
            <TextInput
              style={[styles.fieldInput, { color: C.onSurface }]}
              value={date} onChangeText={setDate}
              placeholder="YYYY-MM-DD" placeholderTextColor={C.onSurfaceVariant}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>

        {/* ── Note ── */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant }]}>{t.noteOptional}</Text>
          <View style={[styles.fieldBox, { backgroundColor: C.surfaceContainerLowest, borderColor: C.outlineVariant }]}>
            <MaterialIcons name="edit-note" size={22} color={C.primary} />
            <TextInput
              style={[styles.fieldInput, { color: C.onSurface }]}
              placeholder={t.notePlaceholder} placeholderTextColor={C.onSurfaceVariant}
              value={note} onChangeText={setNote} returnKeyType="done"
            />
          </View>
        </View>

        {/* ── Proof Attachments ── */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant }]}>{t.addProof}</Text>
          <View style={styles.proofGrid}>
            <TouchableOpacity style={[styles.proofBtn, { backgroundColor: C.surfaceContainerLowest, borderColor: C.outlineVariant }]} onPress={() => handlePickImage('camera')}>
              <MaterialIcons name="photo-camera" size={26} color={C.primary} />
              <Text style={[styles.proofBtnLabel, { color: C.onSurfaceVariant }]}>{t.camera}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.proofBtn, { backgroundColor: C.surfaceContainerLowest, borderColor: C.outlineVariant }]} onPress={() => handlePickImage('gallery')}>
              <MaterialIcons name="image" size={26} color={C.primary} />
              <Text style={[styles.proofBtnLabel, { color: C.onSurfaceVariant }]}>{t.gallery}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.proofBtn,
                { backgroundColor: isRecording ? `${C.error}15` : C.surfaceContainerLowest, borderColor: isRecording ? C.error : C.outlineVariant }
              ]}
              onPress={handleVoice}
            >
              <MaterialIcons name={isRecording ? 'stop' : 'mic'} size={26} color={isRecording ? C.error : C.primary} />
              <Text style={[styles.proofBtnLabel, { color: isRecording ? C.error : C.onSurfaceVariant }]}>
                {isRecording ? 'Stop' : t.voice}
              </Text>
            </TouchableOpacity>
          </View>
          {attachments.length > 0 && (
            <Text style={[styles.attachCount, { color: C.primary }]}>
              {attachments.length} attachment(s) added ✓
            </Text>
          )}
        </View>
      </ScrollView>

      {/* ── Save Button ── */}
      <View style={[styles.saveArea, { backgroundColor: C.surfaceContainerLowest, borderTopColor: C.outlineVariant }]}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: isGive ? C.given : C.received }, loading && styles.saveBtnDisabled]}
          onPress={handleSave} disabled={loading} activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {loading ? t.loading : (isGive ? t.saveGiven : t.saveReceived)}
          </Text>
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
    headerCenter: { alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    headerSub: { fontSize: 12, fontWeight: '500' },

    scroll: { padding: 20, gap: 24, paddingBottom: 20 },

    typeToggle: { flexDirection: 'row', borderRadius: BorderRadius.full, padding: 5, gap: 4 },
    typeBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      paddingVertical: 12, borderRadius: BorderRadius.full, gap: 8,
    },
    typeBtnLabel: { fontSize: 15, fontWeight: '700' },

    amountSection: { alignItems: 'center', gap: 16 },
    amountLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase' },
    amountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
    currencySymbol: { fontSize: 32, fontWeight: '800' },
    amountInput: { fontSize: 62, fontWeight: '900', minWidth: 160, textAlign: 'center' },
    quickAmounts: { flexDirection: 'row', gap: 10 },
    quickBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1.5 },
    quickBtnText: { fontSize: 13, fontWeight: '700' },

    fieldGroup: { gap: 10 },
    fieldLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
    fieldBox: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      borderRadius: BorderRadius.xl, padding: 16, borderWidth: 1.5, ...Shadow.sm,
    },
    fieldInput: { flex: 1, fontSize: 15, fontWeight: '500' },

    tagRow: { flexDirection: 'row', gap: 8 },
    tagChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, borderWidth: 1.5 },
    tagChipText: { fontSize: 13, fontWeight: '600' },

    personChip: {
      paddingHorizontal: 16, paddingVertical: 10,
      borderRadius: BorderRadius.full, borderWidth: 1.5, marginRight: 10,
    },
    personChipText: { fontSize: 14, fontWeight: '600' },

    proofGrid: { flexDirection: 'row', gap: 12 },
    proofBtn: {
      flex: 1, alignItems: 'center', justifyContent: 'center',
      paddingVertical: 20, gap: 8,
      borderRadius: BorderRadius['2xl'], borderWidth: 1.5, borderStyle: 'dashed',
    },
    proofBtnLabel: { fontSize: 11, fontWeight: '700' },
    attachCount: { fontSize: 13, fontWeight: '600', textAlign: 'center' },

    saveArea: { padding: 20, borderTopWidth: 1 },
    saveBtn: {
      borderRadius: BorderRadius.full, height: 56,
      alignItems: 'center', justifyContent: 'center', ...Shadow.primary,
    },
    saveBtnDisabled: { opacity: 0.5 },
    saveBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  });
}
