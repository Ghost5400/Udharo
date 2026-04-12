import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, Image, Linking, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../../types';
import { Colors, DarkColors } from '../../constants/colors';
import { BorderRadius, Shadow } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const LOGO_WITH_TEXT = require('../../../assets/UDHARO LOGO (WITH TEXT).png');
const LOGO_BLACK_BG  = require('../../../assets/UDHARO LOGO (BLACK BG).png');
const CREATOR_PHOTO  = require('../../../assets/NORMAL PHOTO RED BACKGROUND.png');

// TODO: Replace with your actual Google Form URL when ready
const FEEDBACK_FORM_URL = 'https://forms.gle/placeholder-feedback-form';
const INSTAGRAM_URL = 'https://instagram.com/aditya.gothe';
const LINKEDIN_URL  = 'https://linkedin.com/in/aditya-gothe';

type Props = NativeStackScreenProps<SettingsStackParamList, 'About'>;

export function AboutScreen({ navigation }: Props) {
  const { isDark, t } = useTheme();
  const C = isDark ? DarkColors : Colors;

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Cannot open link', url);
      }
    } catch {
      Alert.alert('Error', 'Could not open the link.');
    }
  };

  const handleFeedback = () => {
    Alert.alert(
      'Feedback Form',
      'The feedback form will be available soon. Thank you for your patience!',
      [{ text: 'OK' }]
    );
    // Uncomment when form is ready:
    // openLink(FEEDBACK_FORM_URL);
  };

  return (
    <View style={[styles.container, { backgroundColor: C.surface }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: C.surfaceContainerLowest }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={C.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: C.onSurface }]}>{t.aboutTitle}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── App Logo Section ── */}
        <View style={[styles.logoSection, { backgroundColor: C.surfaceContainerLowest }]}>
          <View style={[styles.logoBg, { backgroundColor: isDark ? C.surfaceContainerHigh : '#f0faf3' }]}>
            <Image
              source={LOGO_WITH_TEXT}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.appVersion, { color: C.onSurfaceVariant }]}>Version 1.0.0</Text>
          <Text style={[styles.appTagline, { color: C.onSurfaceVariant }]}>
            Your smart offline money ledger
          </Text>
        </View>

        {/* ── About Description ── */}
        <View style={[styles.card, { backgroundColor: C.surfaceContainerLow }]}>
          <Text style={[styles.cardTitle, { color: C.onSurface }]}>About Udharo</Text>
          <Text style={[styles.cardBody, { color: C.onSurfaceVariant }]}>
            Udharo is a beautifully crafted, privacy-first money tracking app built for India.
            Track who owes you and who you owe — without cloud, without sign-ups, entirely offline.{'\n\n'}
            Built with care for the millions of Indians who manage everyday financial relationships
            with friends, family, and colleagues.
          </Text>
        </View>

        {/* ── Creator Section ── */}
        <View style={[styles.creatorCard, { backgroundColor: C.surfaceContainerLow }]}>
          <Text style={[styles.createdByLabel, { color: C.onSurfaceVariant }]}>
            {t.createdBy}
          </Text>

          <View style={styles.creatorRow}>
            <Image source={CREATOR_PHOTO} style={styles.creatorPhoto} resizeMode="cover" />
            <View style={styles.creatorInfo}>
              <Text style={[styles.creatorName, { color: C.onSurface }]}>Aditya Gothe</Text>
              <Text style={[styles.creatorBio, { color: C.onSurfaceVariant }]}>
                Builder of Udharo — crafted with precision, passion, and a deep respect for simplicity.
              </Text>
              {/* Social Links */}
              <View style={styles.socialRow}>
                <TouchableOpacity
                  style={[styles.socialBtn, { backgroundColor: `${C.primary}15`, borderColor: `${C.primary}30` }]}
                  onPress={() => openLink(INSTAGRAM_URL)}
                >
                  <MaterialIcons name="camera-alt" size={16} color={C.primary} />
                  <Text style={[styles.socialBtnText, { color: C.primary }]}>Instagram</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.socialBtn, { backgroundColor: `${C.primary}15`, borderColor: `${C.primary}30` }]}
                  onPress={() => openLink(LINKEDIN_URL)}
                >
                  <MaterialIcons name="work" size={16} color={C.primary} />
                  <Text style={[styles.socialBtnText, { color: C.primary }]}>LinkedIn</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* ── Features Highlights ── */}
        <View style={[styles.card, { backgroundColor: C.surfaceContainerLow }]}>
          <Text style={[styles.cardTitle, { color: C.onSurface }]}>Why Udharo?</Text>
          {[
            { icon: 'lock', label: '100% Offline & Private' },
            { icon: 'speed', label: 'Lightning Fast Performance' },
            { icon: 'language', label: '13 Indian Languages' },
            { icon: 'notifications', label: 'Smart Payment Reminders' },
            { icon: 'analytics', label: 'Powerful Financial Insights' },
            { icon: 'dark-mode', label: 'Beautiful Dark Mode' },
          ].map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: `${C.primary}15` }]}>
                <MaterialIcons name={f.icon as any} size={18} color={C.primary} />
              </View>
              <Text style={[styles.featureLabel, { color: C.onSurface }]}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Feedback ── */}
        <TouchableOpacity
          style={[styles.feedbackBtn, { backgroundColor: C.primary }]}
          onPress={handleFeedback}
          activeOpacity={0.85}
        >
          <MaterialIcons name="rate-review" size={20} color="#fff" />
          <Text style={styles.feedbackBtnText}>{t.sendFeedback}</Text>
        </TouchableOpacity>

        {/* ── Made with Love ── */}
        <View style={styles.madeInIndia}>
          <Text style={[styles.madeText, { color: C.onSurfaceVariant }]}>{t.madeWithLove}</Text>
        </View>

        {/* ── Logo Watermark ── */}
        <View style={styles.watermark}>
          <Image
            source={isDark ? LOGO_BLACK_BG : LOGO_WITH_TEXT}
            style={styles.watermarkLogo}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },

  scroll: { padding: 20, gap: 16, paddingBottom: 60 },

  logoSection: {
    alignItems: 'center', borderRadius: BorderRadius['3xl'],
    padding: 28, gap: 8, ...Shadow.sm,
  },
  logoBg: {
    width: 160, height: 160, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  logoImage: { width: 140, height: 140 },
  appVersion: { fontSize: 13, fontWeight: '600', letterSpacing: 1 },
  appTagline: { fontSize: 13, textAlign: 'center' },

  card: { borderRadius: BorderRadius['2xl'], padding: 20, gap: 12, ...Shadow.sm },
  cardTitle: { fontSize: 18, fontWeight: '800' },
  cardBody: { fontSize: 14, lineHeight: 22 },

  creatorCard: { borderRadius: BorderRadius['2xl'], padding: 20, gap: 12, ...Shadow.sm },
  createdByLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  creatorRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  creatorPhoto: {
    width: 80, height: 80, borderRadius: 20,
    borderWidth: 2, borderColor: 'rgba(0,107,44,0.2)',
  },
  creatorInfo: { flex: 1, gap: 6 },
  creatorName: { fontSize: 20, fontWeight: '800' },
  creatorBio: { fontSize: 13, lineHeight: 20 },
  socialRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  socialBtnText: { fontSize: 12, fontWeight: '700' },

  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  featureLabel: { fontSize: 14, fontWeight: '600' },

  feedbackBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16, borderRadius: BorderRadius.full,
    ...Shadow.primary,
  },
  feedbackBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  madeInIndia: { alignItems: 'center', paddingVertical: 8 },
  madeText: { fontSize: 13, fontWeight: '700', letterSpacing: 1.5 },

  watermark: { alignItems: 'center', opacity: 0.06, paddingTop: 8 },
  watermarkLogo: { width: 100, height: 100 },
});
