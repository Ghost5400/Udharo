import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

import { Transaction, Attachment } from '../types';
import { formatCurrency, formatDateShort } from '../utils/helpers';

interface TransactionItemProps {
  transaction: Transaction & { attachments?: Attachment[] };
  onPress?: () => void;
}

function getTransactionIcon(note?: string) {
  const n = (note ?? '').toLowerCase();
  if (n.includes('lunch') || n.includes('food') || n.includes('zomato') || n.includes('swiggy')) return 'restaurant';
  if (n.includes('grocery') || n.includes('groceries') || n.includes('bigbasket')) return 'shopping-cart';
  if (n.includes('rent')) return 'home';
  if (n.includes('petrol') || n.includes('fuel') || n.includes('gas')) return 'local-gas-station';
  if (n.includes('gpay') || n.includes('upi') || n.includes('payment') || n.includes('repay')) return 'account-balance';
  return 'payments';
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const isGive = transaction.type === 'GIVE';
  const amountColor = isGive ? Colors.given : Colors.received;
  const statusColor = transaction.status === 'PENDING' ? Colors.given : Colors.received;
  const iconName = getTransactionIcon(transaction.note);
  const hasAttachment = (transaction.attachments?.length ?? 0) > 0;

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Icon */}
      <View style={[styles.iconBox, { backgroundColor: Colors.surfaceContainerHighest }]}>
        <MaterialIcons name={iconName as any} size={22} color={amountColor} />
      </View>

      {/* Description */}
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>
          {transaction.note || (isGive ? 'Money Given' : 'Money Received')}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.date}>{formatDateShort(transaction.date)}</Text>
          {hasAttachment && (
            <View style={styles.attachBadge}>
              <MaterialIcons name="attach-file" size={10} color={Colors.primary} />
            </View>
          )}
        </View>
      </View>

      {/* Amount + Status */}
      <View style={styles.amountCol}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {isGive ? '− ' : '+ '}
          {formatCurrency(transaction.amount)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {transaction.status === 'PENDING' ? 'Pending' :
             transaction.status === 'PARTIAL' ? 'Partial' : 'Paid'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  attachBadge: {
    backgroundColor: `${Colors.primary}18`,
    borderRadius: 4,
    padding: 2,
  },
  amountCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amount: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
