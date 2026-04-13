import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Person } from '../types';
import { Colors, DarkColors, ThemeColors } from '../constants/colors';
import { BorderRadius } from '../constants/theme';
import { formatCurrency, getInitials, getAvatarColor, isSettled } from '../utils/helpers';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface Props {
  person: Person;
  onPress: () => void;
}

export function PersonCard({ person, onPress }: Props) {
  const { isDark } = useTheme();
  const C = isDark ? DarkColors : Colors;

  const avatar = getAvatarColor(person.name);
  const initials = getInitials(person.name);
  const balance = person.netBalance;
  const settled = isSettled(balance);
  const isOweYou = balance < 0; // they owe you

  const balanceColor = settled ? C.onSurfaceVariant : isOweYou ? C.given : C.received;
  const balanceLabel = settled ? 'Settled' : isOweYou ? 'Owes you' : 'You owe';

  const styles = makeStyles(C);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        {person.photoUri ? (
          <Image source={{ uri: person.photoUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: avatar.bg }]}>
            <Text style={[styles.avatarText, { color: avatar.text }]}>{initials}</Text>
          </View>
        )}
        {!settled && (
          <View style={[styles.statusDot, { backgroundColor: isOweYou ? C.given : C.received }]} />
        )}
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: C.onSurface }]} numberOfLines={1}>{person.name}</Text>
        <Text style={[styles.balanceLabel, { color: balanceColor }]}>{balanceLabel}</Text>
      </View>

      {/* Amount */}
      <View style={styles.right}>
        <Text style={[styles.amount, { color: balanceColor }]}>
          {settled ? '✓' : formatCurrency(Math.abs(balance))}
        </Text>
        <MaterialIcons name="chevron-right" size={18} color={C.outlineVariant} />
      </View>
    </TouchableOpacity>
  );
}

function makeStyles(C: ThemeColors) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row', alignItems: 'center',
      borderRadius: BorderRadius['2xl'], padding: 14, gap: 12,
      backgroundColor: C.surfaceContainerLowest,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    },
    avatarWrap: { position: 'relative' },
    avatar: { width: 52, height: 52, borderRadius: 16 },
    avatarFallback: { alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 18, fontWeight: '800' },
    statusDot: {
      position: 'absolute', bottom: -2, right: -2,
      width: 12, height: 12, borderRadius: 6,
      borderWidth: 2, borderColor: C.surfaceContainerLowest,
    },
    info: { flex: 1, gap: 3 },
    name: { fontSize: 15, fontWeight: '700' },
    balanceLabel: { fontSize: 12, fontWeight: '600' },
    right: { alignItems: 'flex-end', flexDirection: 'row', gap: 4, alignSelf: 'center' },
    amount: { fontSize: 16, fontWeight: '800' },
  });
}
