import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Image, Alert, StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types';
import { Colors, DarkColors, ThemeColors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { usePeopleStore } from '../../store';
import { checkDuplicateName } from '../../database/peopleRepository';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<HomeStackParamList, 'AddPerson'>;

export function AddPersonScreen({ navigation, route }: Props) {
  const { addPerson } = usePeopleStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const { isDark, t } = useTheme();
  const C = isDark ? DarkColors : Colors;

  // ── Persist photo to app's permanent directory ──────────────────────────────
  const persistPhoto = async (tempUri: string): Promise<string> => {
    const fsDocDir: string = (FileSystem as any).documentDirectory ?? '';
    const photoDir = `${fsDocDir}people_photos/`;
    const dirInfo = await (FileSystem as any).getInfoAsync(photoDir);
    if (!dirInfo.exists) {
      await (FileSystem as any).makeDirectoryAsync(photoDir, { intermediates: true });
    }
    const ext = tempUri.split('.').pop()?.split('?')[0] ?? 'jpg';
    const filename = `person_${Date.now()}.${ext}`;
    const destUri = `${photoDir}${filename}`;
    await (FileSystem as any).copyAsync({ from: tempUri, to: destUri });
    return destUri;
  };

  const handlePickPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to photos in Settings.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, aspect: [1, 1], quality: 0.85,
      });
      if (!result.canceled && result.assets[0]) {
        const persistent = await persistPhoto(result.assets[0].uri);
        setPhotoUri(persistent);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow camera access in Settings.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true, aspect: [1, 1], quality: 0.85,
      });
      if (!result.canceled && result.assets[0]) {
        const persistent = await persistPhoto(result.assets[0].uri);
        setPhotoUri(persistent);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) { setNameError(t.nameRequired); return; }
    setLoading(true);
    try {
      const isDuplicate = await checkDuplicateName(trimmed);
      if (isDuplicate) {
        Alert.alert(
          t.personAlreadyExists,
          `Someone named "${trimmed}" already exists. Add anyway?`,
          [
            { text: t.cancel, style: 'cancel', onPress: () => setLoading(false) },
            { text: t.addAnyway, onPress: () => doSave(trimmed) },
          ]
        );
        return;
      }
      await doSave(trimmed);
    } catch (e: any) {
      Alert.alert(t.error, e.message);
      setLoading(false);
    }
  };

  const doSave = async (trimmedName: string) => {
    const person = await addPerson({ name: trimmedName, phone: phone.trim() || undefined, photoUri });
    setLoading(false);
    navigation.replace('PersonDetail', { personId: person.id });
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
        <Text style={[styles.title, { color: C.onSurface }]}>{t.addPersonTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* ── Avatar Picker ── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickPhoto} activeOpacity={0.8}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: C.surfaceContainerHigh, borderColor: C.outlineVariant }]}>
                <MaterialIcons name="person" size={44} color={C.onSurfaceVariant} />
              </View>
            )}
            <View style={[styles.avatarEdit, { backgroundColor: C.primary, borderColor: C.surfaceContainerLowest }]}>
              <MaterialIcons name="edit" size={14} color={C.onPrimary} />
            </View>
          </TouchableOpacity>

          <View style={styles.photoActions}>
            <TouchableOpacity style={[styles.photoBtn, { backgroundColor: `${C.primary}12` }]} onPress={handleTakePhoto}>
              <MaterialIcons name="photo-camera" size={16} color={C.primary} />
              <Text style={[styles.photoBtnText, { color: C.primary }]}>{t.camera}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.photoBtn, { backgroundColor: `${C.primary}12` }]} onPress={handlePickPhoto}>
              <MaterialIcons name="image" size={16} color={C.primary} />
              <Text style={[styles.photoBtnText, { color: C.primary }]}>{t.gallery}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Form Fields ── */}
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant }]}>{t.fullName}</Text>
            <View style={[styles.fieldBox, { backgroundColor: C.surfaceContainerLowest, borderColor: nameError ? C.error : C.outlineVariant }]}>
              <MaterialIcons name="person" size={22} color={C.primary} />
              <TextInput
                style={[styles.fieldInput, { color: C.onSurface }]}
                placeholder={t.fullNamePlaceholder}
                placeholderTextColor={C.onSurfaceVariant}
                value={name}
                onChangeText={t_ => { setName(t_); setNameError(''); }}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
            {nameError ? <Text style={[styles.errorText, { color: C.error }]}>{nameError}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: C.onSurfaceVariant }]}>{t.phoneOptional}</Text>
            <View style={[styles.fieldBox, { backgroundColor: C.surfaceContainerLowest, borderColor: C.outlineVariant }]}>
              <MaterialIcons name="phone" size={22} color={C.primary} />
              <TextInput
                style={[styles.fieldInput, { color: C.onSurface }]}
                placeholder={t.phonePlaceholder}
                placeholderTextColor={C.onSurfaceVariant}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                returnKeyType="done"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Save Button ── */}
      <View style={[styles.saveArea, { backgroundColor: C.surfaceContainerLowest, borderTopColor: C.outlineVariant }]}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: C.primary }, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          <MaterialIcons name="person-add" size={20} color={C.onPrimary} />
          <Text style={[styles.saveBtnText, { color: C.onPrimary }]}>
            {loading ? t.loading : t.addPerson}
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
      backgroundColor: C.surfaceContainerLowest,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 18, fontWeight: '800' },
    scroll: { padding: 24, gap: 24, paddingBottom: 20 },

    avatarSection: { alignItems: 'center', gap: 16 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 100, height: 100, borderRadius: 32 },
    avatarPlaceholder: {
      width: 100, height: 100, borderRadius: 32,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderStyle: 'dashed',
    },
    avatarEdit: {
      position: 'absolute', bottom: -6, right: -6,
      width: 30, height: 30, borderRadius: 15,
      alignItems: 'center', justifyContent: 'center', borderWidth: 2,
    },
    photoActions: { flexDirection: 'row', gap: 12 },
    photoBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      borderRadius: BorderRadius.full, paddingHorizontal: 16, paddingVertical: 9,
    },
    photoBtnText: { fontSize: 13, fontWeight: '700' },

    form: { gap: 20 },
    fieldGroup: { gap: 8 },
    fieldLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
    fieldBox: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      borderRadius: BorderRadius.xl, padding: 16,
      borderWidth: 1.5, ...Shadow.sm,
    },
    fieldInput: { flex: 1, fontSize: 15, fontWeight: '500' },
    errorText: { fontSize: 12, marginLeft: 4 },

    saveArea: { padding: 20, borderTopWidth: 1 },
    saveBtn: {
      borderRadius: BorderRadius.full, height: 56,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      ...Shadow.primary,
    },
    saveBtnDisabled: { opacity: 0.5 },
    saveBtnText: { fontSize: 17, fontWeight: '800' },
  });
}
