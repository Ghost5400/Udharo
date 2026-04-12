import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types';
import { Colors, DarkColors, ThemeColors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { usePeopleStore } from '../../store';
import { PersonCard } from '../../components/PersonCard';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<HomeStackParamList, 'AllPeople'>;

export function AllPeopleScreen({ navigation }: Props) {
  const { people } = usePeopleStore();
  const [searchQuery, setSearchQuery] = useState('');

  const { isDark, t } = useTheme();
  const C = isDark ? DarkColors : Colors;

  const filteredPeople = searchQuery
    ? people.filter(p => {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || 
               (p.phone?.toLowerCase().includes(q)) ||
               (p.notes?.toLowerCase().includes(q)) ||
               (Math.abs(p.netBalance).toString().includes(q));
      })
    : people;

  const styles = makeStyles(C);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.surface} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.surfaceContainerLowest }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={C.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: C.onSurface }]}>{t.people}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: C.surfaceContainerLowest }]}>
         <View style={[styles.searchBox, { backgroundColor: C.surfaceContainerLow }]}>
            <MaterialIcons name="search" size={20} color={C.onSurfaceVariant} />
            <TextInput
              style={[styles.searchInput, { color: C.onSurface }]}
              placeholder={t.searchPeople}
              placeholderTextColor={C.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={20} color={C.onSurfaceVariant} />
              </TouchableOpacity>
            )}
          </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {filteredPeople.length === 0 ? (
          <View style={styles.emptyState}>
             <Text style={styles.emptyEmoji}>{searchQuery ? '🔍' : '👥'}</Text>
             <Text style={[styles.emptyTitle, { color: C.onSurfaceVariant }]}>
               {searchQuery ? 'No results found' : 'No people yet'}
             </Text>
          </View>
        ) : (
          <View style={styles.peopleList}>
            {filteredPeople.map(person => (
              <PersonCard
                key={person.id}
                person={person}
                onPress={() => navigation.navigate('PersonDetail', { personId: person.id })}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: C.primary, ...Shadow.primary }]}
        onPress={() => navigation.navigate('AddPerson', {})}
        activeOpacity={0.85}
      >
        <MaterialIcons name="person-add" size={28} color={C.onPrimary} />
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.surface },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 18, fontWeight: '800' },
    
    searchContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      ...Shadow.sm,
    },
    searchBox: {
      flexDirection: 'row', alignItems: 'center',
      borderRadius: BorderRadius.full, paddingHorizontal: 16, height: 44, gap: 10,
    },
    searchInput: { flex: 1, fontSize: 15 },
  
    scroll: { padding: 20, paddingBottom: 100 },
    peopleList: { gap: 12 },
  
    fab: {
      position: 'absolute',
      right: 24,
      bottom: 40,
      width: 62,
      height: 62,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
    emptyEmoji: { fontSize: 48 },
    emptyTitle: { fontSize: 18, fontWeight: '700' },
  });
}
