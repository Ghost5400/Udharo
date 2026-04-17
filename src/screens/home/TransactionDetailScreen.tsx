import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Image, Dimensions, Platform
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList, Transaction, Attachment } from '../../types';
import { Colors, DarkColors, ThemeColors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { useTransactionsStore, usePeopleStore } from '../../store';
import { getTransactionById } from '../../database/transactionRepository';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
// expo-av Audio — native only (web does not support local file playback)
const AudioModule = Platform.OS !== 'web' ? require('expo-av').Audio : null;

const { width } = Dimensions.get('window');
type Props = NativeStackScreenProps<HomeStackParamList, 'TransactionDetail'>;

export function TransactionDetailScreen({ navigation, route }: Props) {
  const { transactionId } = route.params;
  const { deleteTransaction, getAttachments } = useTransactionsStore();
  const { people } = usePeopleStore();
  const { isDark } = useTheme();
  const C = isDark ? DarkColors : Colors;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  // Voice note playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const soundRef = useRef<any>(null);

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
    } catch {
      // Non-fatal: transaction or attachments failed to load
    } finally {
      setLoading(false);
    }
  };

  // Stop + unload any playing audio when screen unmounts
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.stopAsync().catch(() => {});
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    };
  }, []);

  const handlePlayAudio = async (att: Attachment) => {
    if ((Platform.OS as string) === 'web') {
      Alert.alert('Not supported', 'Audio playback is not available on web.');
      return;
    }
    // If this note is already playing — stop it
    if (playingAudioId === att.id) {
      try {
        await soundRef.current?.stopAsync();
        await soundRef.current?.unloadAsync();
      } catch { /* non-fatal */ }
      soundRef.current = null;
      setPlayingAudioId(null);
      return;
    }
    // Stop any currently playing sound first
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch { /* non-fatal */ }
      soundRef.current = null;
      setPlayingAudioId(null);
    }
    try {
      await AudioModule.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
      });
      const { sound } = await AudioModule.Sound.createAsync(
        { uri: att.fileUri },
        { shouldPlay: true, volume: 1.0 }
      );
      soundRef.current = sound;
      setPlayingAudioId(att.id);
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish || !status.isLoaded) {
          sound.unloadAsync().catch(() => {});
          soundRef.current = null;
          setPlayingAudioId(null);
        }
      });
    } catch (e: any) {
      Alert.alert('Playback Error', e.message ?? 'Could not play audio.');
      setPlayingAudioId(null);
    }
  };

  const handleDelete = () => {
    if (!transaction) return;
    Alert.alert(
      'Delete Transaction',
      "Are you sure? This will update the person's balance.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransaction(transaction.id, transaction.personId);
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
              navigation.goBack();
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'Could not delete transaction.');
            }
          }
        }
      ]
    );
  };

  const styles = makeStyles(C);

  if (loading) return <View style={styles.container} />;

  if (!transaction) {
    return (
      <View style={[styles.notFound, { backgroundColor: C.surface }]}>
        <Text style={[styles.notFoundText, { color: C.onSurfaceVariant }]}>Transaction not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: C.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isGive = transaction.type === 'GIVE';
  const person = people.find(p => p.id === transaction.personId);
  const amountColor = isGive ? C.given : C.received;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={C.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: C.onSurface }]}>Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Main Card */}
        <View style={[styles.card, { backgroundColor: C.surfaceContainerLowest }]}>
          <View style={[styles.typeBadge, { backgroundColor: `${amountColor}15` }]}>
            <MaterialIcons name={isGive ? 'north-east' : 'south-west'} size={18} color={amountColor} />
            <Text style={[styles.typeText, { color: amountColor }]}>
              {isGive ? 'YOU GAVE' : 'YOU RECEIVED'}
            </Text>
          </View>

          <Text style={[styles.amount, { color: amountColor }]}>
            {formatCurrency(transaction.amount)}
          </Text>

          <Text style={[styles.personName, { color: C.onSurfaceVariant }]}>
            with <Text style={{ fontWeight: '800', color: C.onSurface }}>{person?.name ?? 'Unknown'}</Text>
          </Text>

          <View style={[styles.divider, { backgroundColor: C.outlineVariant }]} />

          <View style={styles.infoRow}>
            <MaterialIcons name="event" size={20} color={C.onSurfaceVariant} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: C.onSurfaceVariant }]}>Date</Text>
              <Text style={[styles.infoValue, { color: C.onSurface }]}>{formatDate(transaction.date)}</Text>
            </View>
          </View>

          {transaction.note && (
            <View style={styles.infoRow}>
              <MaterialIcons name="subject" size={20} color={C.onSurfaceVariant} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: C.onSurfaceVariant }]}>Note</Text>
                <Text style={[styles.infoValue, { color: C.onSurface }]}>{transaction.note}</Text>
              </View>
            </View>
          )}

          {transaction.tag && (
            <View style={styles.infoRow}>
              <MaterialIcons name="label" size={20} color={C.onSurfaceVariant} />
              <View style={styles.infoTextContainer}>
                <Text style={[styles.infoLabel, { color: C.onSurfaceVariant }]}>Tag</Text>
                <Text style={[styles.infoValue, { color: C.onSurface }]}>{transaction.tag}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoRow}>
            <MaterialIcons name="info-outline" size={20} color={C.onSurfaceVariant} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoLabel, { color: C.onSurfaceVariant }]}>Status</Text>
              <Text style={[styles.infoValue, { color: C.onSurface }]}>
                {transaction.status === 'PENDING' ? 'Pending' :
                 transaction.status === 'PARTIAL' ? 'Partial' : 'Settled'}
              </Text>
            </View>
          </View>
        </View>

        {/* Attachments Section */}
        {attachments.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: C.onSurface }]}>Attachments</Text>
            <View style={styles.attachmentList}>
              {attachments.map(att => (
                <View key={att.id} style={[styles.attachmentWrapper, { backgroundColor: C.surfaceContainerLowest }]}>
                  {att.type === 'IMAGE' ? (
                    <Image source={{ uri: att.fileUri }} style={styles.attachmentImage} />
                  ) : (
                    // Voice note — tappable play/stop button
                    <TouchableOpacity
                      style={styles.attachmentOther}
                      onPress={() => handlePlayAudio(att)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.playIcon, { backgroundColor: playingAudioId === att.id ? `${C.error}18` : `${C.primary}15` }]}>
                        <MaterialIcons
                          name={playingAudioId === att.id ? 'stop' : 'play-arrow'}
                          size={36}
                          color={playingAudioId === att.id ? C.error : C.primary}
                        />
                      </View>
                      <Text style={[styles.attachmentText, { color: playingAudioId === att.id ? C.error : C.primary }]}>
                        {playingAudioId === att.id ? 'Tap to Stop' : 'Voice Note'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomArea, { backgroundColor: C.surfaceContainerLowest, borderTopColor: `${C.outlineVariant}40` }]}>
        <TouchableOpacity style={[styles.deleteBtn, { borderColor: C.error, backgroundColor: `${C.error}05` }]} onPress={handleDelete} activeOpacity={0.85}>
          <MaterialIcons name="delete" size={20} color={C.error} />
          <Text style={[styles.deleteBtnText, { color: C.error }]}>Delete Transaction</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function makeStyles(C: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: C.surface },
    notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
    notFoundText: { fontSize: 18 },

    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
      backgroundColor: C.surface,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 18, fontWeight: '800' },

    scroll: { padding: 20, paddingBottom: 40, gap: 24 },

    card: {
      borderRadius: BorderRadius['3xl'], padding: 24,
      alignItems: 'center', ...Shadow.md,
    },
    typeBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 12, paddingVertical: 6,
      borderRadius: BorderRadius.full, marginBottom: 16,
    },
    typeText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
    amount: { fontSize: 48, fontWeight: '800', letterSpacing: -1, marginBottom: 8 },
    personName: { fontSize: 16, marginBottom: 24 },

    divider: { width: '100%', height: 1, opacity: 0.3, marginBottom: 20 },

    infoRow: {
      flexDirection: 'row', alignItems: 'center', gap: 16,
      width: '100%', marginBottom: 16,
    },
    infoTextContainer: { flex: 1 },
    infoLabel: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
    infoValue: { fontSize: 16, fontWeight: '700' },

    section: { gap: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
    attachmentList: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
    attachmentWrapper: {
      width: (width - 52) / 2,
      height: (width - 52) / 2,
      borderRadius: BorderRadius.xl,
      overflow: 'hidden', ...Shadow.sm,
    },
    attachmentImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    attachmentOther: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', gap: 8 },
    playIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
    attachmentText: { fontSize: 12, fontWeight: '600' },

    bottomArea: {
      padding: 20, borderTopWidth: 1,
    },
    deleteBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
      paddingVertical: 16, borderRadius: BorderRadius.full,
      borderWidth: 1.5,
    },
    deleteBtnText: { fontSize: 16, fontWeight: '700' },
  });
}
