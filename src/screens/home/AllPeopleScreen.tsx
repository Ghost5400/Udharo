import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { usePeopleStore } from '../../store';
import { PersonCard } from '../../components/PersonCard';
import { MaterialIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<HomeStackParamList, 'AllPeople'>;

export function AllPeopleScreen({ navigation }: Props) {
  const { people } = usePeopleStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPeople = searchQuery
    ? people.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.phone && p.phone.includes(searchQuery)))
    : people;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>All People</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
         <View style={styles.searchBox}>
            <MaterialIcons name="search" size={20} color={Colors.onSurfaceVariant} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search people..."
              placeholderTextColor={Colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <MaterialIcons name="close" size={20} color={Colors.onSurfaceVariant} />
              </TouchableOpacity>
            )}
          </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {filteredPeople.length === 0 ? (
          <View style={styles.emptyState}>
             <Text style={styles.emptyEmoji}>{searchQuery ? '🔍' : '👥'}</Text>
             <Text style={styles.emptyTitle}>{searchQuery ? 'No results found' : 'No people yet'}</Text>
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
        style={styles.fab}
        onPress={() => navigation.navigate('AddPerson', {})}
        activeOpacity={0.85}
      >
        <MaterialIcons name="person-add" size={28} color={Colors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
    backgroundColor: Colors.white,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: Colors.onSurface },
  
  searchContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 16,
    ...Shadow.sm,
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius.full, paddingHorizontal: 16, height: 44, gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.onSurface },

  scroll: { padding: 20, paddingBottom: 100 },
  peopleList: { gap: 12 },

  fab: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.primary,
  },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.onSurfaceVariant },
});
