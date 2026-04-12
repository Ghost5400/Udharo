import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Image, Dimensions
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList, Transaction, Attachment } from '../../types';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { useTransactionsStore, usePeopleStore } from '../../store';
import { getTransactionById } from '../../database/transactionRepository';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/helpers';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system';

const { width } = Dimensions.get('window');
type Props = NativeStackScreenProps<HomeStackParamList, 'TransactionDetail'>;

export function TransactionDetailScreen({ navigation, route }: Props) {
  const { transactionId } = route.params;
  const { deleteTransaction, getAttachments, loadTransactions } = useTransactionsStore();
  const { people } = usePeopleStore();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [transactionId]);

  const loadData = async () => {
    try {
      const txn = await getTransactionById(transactionId);
      if (txn) {
        setTransaction(txn);
        const atts = await getAttachments(transactionId);
        setAttachments(atts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!transaction) return;
    
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This will update the person\'s balance.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteTransaction(transaction.id, transaction.personId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            // Optionally: Show an undo toast here in the future
            navigation.goBack();
          }
        }
      ]
    );
  };

  if (loading) return <View style={styles.container} />;
  
  if (!transaction) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Transaction not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: Colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isGive = transaction.type === 'GIVE';
  const person = people.find(p => p.id === transaction.personId);
  const amountColor = isGive ? Colors.given : Colors.received;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Main Card */}
        <View style={styles.card}>
          <View style={[styles.typeBadge, { backgroundColor: `${amountColor}15` }]}>
            <MaterialIcons 
              name={isGive ? 'north-east' : 'south-west'} 
              size={18} 
              color={amountColor} 
            />
            <Text style={[styles.typeText, { color: amountColor }]}>
              {isGive ? 'YOU GAVE' : 'YOU RECEIVED'}
            </Text>
          </View>

          <Text style={[styles.amount, { color: amountColor }]}>
            {formatCurrency(transaction.amount)}
          </Text>
          
          <Text style={styles.personName}>
            with <Text style={{ fontWeight: '800' }}>{person?.name ?? 'Unknown'}</Text>
          </Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <MaterialIcons name="event" size={20} color={Colors.onSurfaceVariant} />
            <View style={styles.infoTextContainer}>
               <Text style={styles.infoLabel}>Date</Text>
               <Text style={styles.infoValue}>{formatDate(transaction.date)}</Text>
            </View>
          </View>

          {transaction.note && (
             <View style={styles.infoRow}>
               <MaterialIcons name="subject" size={20} color={Colors.onSurfaceVariant} />
               <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Note</Text>
                  <Text style={styles.infoValue}>{transaction.note}</Text>
               </View>
             </View>
          )}

          <View style={styles.infoRow}>
            <MaterialIcons name="info-outline" size={20} color={Colors.onSurfaceVariant} />
            <View style={styles.infoTextContainer}>
               <Text style={styles.infoLabel}>Status</Text>
               <Text style={styles.infoValue}>
                 {transaction.status === 'PENDING' ? 'Pending' :
                  transaction.status === 'PARTIAL' ? 'Partial' : 'Settled'}
               </Text>
            </View>
          </View>
        </View>

        {/* Attachments Section */}
        {attachments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attachments</Text>
            <View style={styles.attachmentList}>
              {attachments.map(att => (
                <View key={att.id} style={styles.attachmentWrapper}>
                  {att.type === 'IMAGE' ? (
                    <Image source={{ uri: att.fileUri }} style={styles.attachmentImage} />
                  ) : (
                    <View style={styles.attachmentOther}>
                       <MaterialIcons name="mic" size={32} color={Colors.primary} />
                       <Text style={styles.attachmentText}>Voice Note</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomArea}>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.85}>
           <MaterialIcons name="delete" size={20} color={Colors.error} />
           <Text style={styles.deleteBtnText}>Delete Transaction</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 18, color: Colors.onSurfaceVariant },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
    backgroundColor: Colors.surface,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: Colors.onSurface },
  
  scroll: { padding: 20, paddingBottom: 40, gap: 24 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius['3xl'],
    padding: 24,
    alignItems: 'center',
    ...Shadow.md,
  },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginBottom: 16,
  },
  typeText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  amount: { fontSize: 48, fontWeight: '800', letterSpacing: -1, marginBottom: 8 },
  personName: { fontSize: 16, color: Colors.onSurfaceVariant, marginBottom: 24 },
  
  divider: { width: '100%', height: 1, backgroundColor: Colors.outlineVariant, opacity: 0.3, marginBottom: 20 },

  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    width: '100%', marginBottom: 16,
  },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 12, color: Colors.onSurfaceVariant, fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 16, color: Colors.onSurface, fontWeight: '700' },

  section: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.onSurface, textTransform: 'uppercase', letterSpacing: 1 },
  attachmentList: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  attachmentWrapper: {
    width: (width - 52) / 2, 
    height: (width - 52) / 2, 
    borderRadius: BorderRadius.xl, 
    overflow: 'hidden',
    backgroundColor: Colors.white,
    ...Shadow.sm,
  },
  attachmentImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  attachmentOther: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', gap: 8 },
  attachmentText: { fontSize: 12, fontWeight: '600', color: Colors.primary },

  bottomArea: {
    padding: 20,
    backgroundColor: Colors.surfaceContainerLowest,
    borderTopWidth: 1, borderTopColor: Colors.outlineVariant + '40',
  },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: BorderRadius.full,
    borderWidth: 1.5, borderColor: Colors.error, backgroundColor: `${Colors.error}05`,
  },
  deleteBtnText: { fontSize: 16, fontWeight: '700', color: Colors.error },
});
