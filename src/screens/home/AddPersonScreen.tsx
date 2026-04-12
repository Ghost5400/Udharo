import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Image, Alert, StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { usePeopleStore } from '../../store';
import { checkDuplicateName } from '../../database/peopleRepository';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<HomeStackParamList, 'AddPerson'>;

export function AddPersonScreen({ navigation, route }: Props) {
  const { addPerson } = usePeopleStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Name is required');
      return;
    }

    setLoading(true);
    try {
      // Check for duplicate
      const isDuplicate = await checkDuplicateName(trimmed);
      if (isDuplicate) {
        Alert.alert(
          'Person already exists',
          `Someone named "${trimmed}" already exists. Add anyway?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
            { text: 'Add Anyway', onPress: () => doSave(trimmed) },
          ]
        );
        return;
      }
      await doSave(trimmed);
    } catch (e: any) {
      Alert.alert('Error', e.message);
      setLoading(false);
    }
  };

  const doSave = async (trimmedName: string) => {
    const person = await addPerson({
      name: trimmedName,
      phone: phone.trim() || undefined,
      photoUri,
    });
    setLoading(false);
    navigation.replace('PersonDetail', { personId: person.id });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Person</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* ── Avatar Picker ── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickPhoto} activeOpacity={0.8}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={40} color={Colors.onSurfaceVariant} />
              </View>
            )}
            <View style={styles.avatarEdit}>
              <MaterialIcons name="edit" size={14} color={Colors.onPrimary} />
            </View>
          </TouchableOpacity>
          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto}>
              <MaterialIcons name="photo-camera" size={16} color={Colors.primary} />
              <Text style={styles.photoBtnText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={handlePickPhoto}>
              <MaterialIcons name="image" size={16} color={Colors.primary} />
              <Text style={styles.photoBtnText}>Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Form Fields ── */}
        <View style={styles.form}>
          {/* Name Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>FULL NAME *</Text>
            <View style={[styles.fieldBox, nameError ? styles.fieldBoxError : null]}>
              <MaterialIcons name="person" size={22} color={Colors.primary} />
              <TextInput
                style={styles.fieldInput}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor={Colors.onSurfaceVariant}
                value={name}
                onChangeText={t => { setName(t); setNameError(''); }}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>

          {/* Phone Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PHONE (OPTIONAL)</Text>
            <View style={styles.fieldBox}>
              <MaterialIcons name="phone" size={22} color={Colors.primary} />
              <TextInput
                style={styles.fieldInput}
                placeholder="+91 98765 43210"
                placeholderTextColor={Colors.onSurfaceVariant}
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
      <View style={styles.saveArea}>
        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>{loading ? 'Saving…' : 'Add Person'}</Text>
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
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: Colors.onSurface },
  scroll: { padding: 24, gap: 24 },

  avatarSection: { alignItems: 'center', gap: 16 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 96, height: 96, borderRadius: 28 },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 28,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.outlineVariant, borderStyle: 'dashed',
  },
  avatarEdit: {
    position: 'absolute', bottom: -4, right: -4,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  photoActions: { flexDirection: 'row', gap: 12 },
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: `${Colors.primary}12`, borderRadius: BorderRadius.full,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  photoBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  form: { gap: 20 },
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
  fieldBoxError: { borderColor: Colors.error },
  fieldInput: { flex: 1, fontSize: 15, color: Colors.onSurface, fontWeight: '500' },
  errorText: { fontSize: 12, color: Colors.error, marginLeft: 4 },

  saveArea: {
    padding: 20, backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.outlineVariant,
  },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    height: 56, alignItems: 'center', justifyContent: 'center',
    ...Shadow.primary,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 17, fontWeight: '800', color: Colors.onPrimary },
});
