import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import {
  RootStackParamList, OnboardingStackParamList,
  MainTabParamList, HomeStackParamList, SettingsStackParamList,
} from '../types';
import { Colors, DarkColors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

// Screens
import { SplashScreen } from '../screens/SplashScreen';
import { AppLockScreen } from '../screens/AppLockScreen';
import { Onboarding1 } from '../screens/onboarding/Onboarding1';
import { Onboarding2 } from '../screens/onboarding/Onboarding2';
import { Onboarding3 } from '../screens/onboarding/Onboarding3';
import { HomeScreen } from '../screens/home/HomeScreen';
import { AddPersonScreen } from '../screens/home/AddPersonScreen';
import { AddTransactionScreen } from '../screens/home/AddTransactionScreen';
import { PersonDetailScreen } from '../screens/home/PersonDetailScreen';
import { ReminderSetupScreen } from '../screens/home/ReminderSetupScreen';
import { InsightsScreen } from '../screens/insights/InsightsScreen';
import { TransactionDetailScreen } from '../screens/home/TransactionDetailScreen';
import { AllPeopleScreen } from '../screens/home/AllPeopleScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { LanguageScreen } from '../screens/settings/LanguageScreen';
import { AboutScreen } from '../screens/settings/AboutScreen';
import { BackupRestoreScreen } from '../screens/settings/BackupRestoreScreen';

const Root = createNativeStackNavigator<RootStackParamList>();
const Onboarding = createNativeStackNavigator<OnboardingStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();



// ─── Onboarding Navigator ─────────────────────────────────────────────────────
function OnboardingNavigator() {
  return (
    <Onboarding.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Onboarding.Screen name="Onboarding1" component={Onboarding1} />
      <Onboarding.Screen name="Onboarding2" component={Onboarding2} />
      <Onboarding.Screen name="Onboarding3" component={Onboarding3} />
    </Onboarding.Navigator>
  );
}

// ─── Home Stack ───────────────────────────────────────────────────────────────
function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="PersonDetail" component={PersonDetailScreen} />
      <HomeStack.Screen name="AddPerson" component={AddPersonScreen} options={{ animation: 'slide_from_bottom' }} />
      <HomeStack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ animation: 'slide_from_bottom' }} />
      <HomeStack.Screen name="ReminderSetup" component={ReminderSetupScreen} options={{ animation: 'slide_from_bottom' }} />
      <HomeStack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <HomeStack.Screen name="AllPeople" component={AllPeopleScreen} />
    </HomeStack.Navigator>
  );
}

// ─── Settings Stack ───────────────────────────────────────────────────────────
function SettingsNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
      <SettingsStack.Screen name="Language" component={LanguageScreen} />
      <SettingsStack.Screen name="About" component={AboutScreen} />
      <SettingsStack.Screen name="BackupRestore" component={BackupRestoreScreen} />
      <SettingsStack.Screen
        name="AppLockSetup"
        component={AppLockScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </SettingsStack.Navigator>
  );
}

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────
function MainNavigator() {
  const { isDark, t } = useTheme();
  const C = isDark ? DarkColors : Colors;

  const tabBarStyle = {
    ...styles.tabBar,
    backgroundColor: isDark ? 'rgba(23,28,24,0.97)' : 'rgba(247,249,251,0.97)',
    borderTopColor: isDark ? C.surfaceContainerHigh : C.outlineVariant,
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: tabBarStyle,
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.onSurfaceVariant,
        tabBarIcon: ({ focused, color }) => {
          const icons: Record<string, string> = {
            HomeTab: 'home',
            InsightsTab: 'analytics',
            SettingsTab: 'settings',
          };
          return (
            <View style={[styles.tabIcon, focused && { backgroundColor: `${C.primary}18` }]}>
              <MaterialIcons name={icons[route.name] as any} size={22} color={color} />
            </View>
          );
        },
        tabBarLabel: ({ color }) => (
          <Text style={[styles.tabLabel, { color }]}>
            {route.name === 'HomeTab' ? t.home :
             route.name === 'InsightsTab' ? t.insights : t.settings}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeNavigator} />
      <Tab.Screen name="InsightsTab" component={InsightsScreen} />
      <Tab.Screen name="SettingsTab" component={SettingsNavigator} />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────────────────
export function AppNavigator() {
  const { isDark } = useTheme();

  const navTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: DarkColors.surface, card: DarkColors.surfaceContainerLowest } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: Colors.surface, card: Colors.surfaceContainerLowest } };

  return (
    <NavigationContainer theme={navTheme}>
      <Root.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Root.Screen name="Splash" component={SplashScreen} />
        <Root.Screen name="Onboarding" component={OnboardingNavigator} />
        <Root.Screen name="AppLock" component={AppLockScreen} />
        <Root.Screen name="Main" component={MainNavigator} />
      </Root.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0.5,
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 8,
    paddingHorizontal: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 16,
  },
  tabIcon: {
    width: 44, height: 32, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11, fontWeight: '600', marginBottom: 2,
  },
});
