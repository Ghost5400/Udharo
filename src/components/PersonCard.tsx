import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, Shadow } from '../constants/theme';
import { Person } from '../types';
import { formatAmount, getInitials, getAvatarColor, formatRelativeTime, isSettled } from '../utils/helpers';

interface PersonCardProps {
  person: Person;
  onPress: () => void;
}

export function PersonCard({ person, onPress }: PersonCardProps) {
  const avatar = getAvatarColor(person.name);
  const initials = getInitials(person.name);
  const balance = person.netBalance;
  const settled = isSettled(balance);

  // negative = they owe you (you gave more) → show in red
  // positive = you owe them (they gave more) → show in green
  const isOweYou = balance < 0;
  const displayAmount = Math.abs(balance);
  const amountColor = settled ? Colors.outline : isOweYou ? Colors.given : Colors.received;
  const directionLabel = settled ? 'Settled' : isOweYou ? 'You Gave' : 'You Got';
  const directionColor = settled ? Colors.outline : isOweYou ? Colors.given : Colors.received;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.left}>
        {/* Avatar */}
        {person.photoUri ? (
          <Image source={{ uri: person.photoUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: avatar.bg }]}>
            <Text style={[styles.initials, { color: avatar.text }]}>{initials}</Text>
          </View>
        )}
        {/* Person Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{person.name}</Text>
          <Text style={styles.time}>
            {formatRelativeTime(person.updatedAt)}
          </Text>
        </View>
      </View>

      {/* Balance */}
      <View style={styles.right}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {settled ? '✓ Clear' : formatAmount(displayAmount)}
        </Text>
        <Text style={[styles.direction, { color: directionColor }]}>
          {directionLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: BorderRadius['3xl'],
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadow.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    marginRight: 12,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 18,
    fontWeight: '800',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 3,
  },
  time: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  direction: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
