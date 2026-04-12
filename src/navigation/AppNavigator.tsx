import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import {
  RootStackParamList, OnboardingStackParamList,
  MainTabParamList, HomeStackParamList, SettingsStackParamList,
} from '../types';
import { Colors } from '../constants/colors';
import { BorderRadius } from '../constants/theme';

// Screens
import { SplashScreen } from '../screens/SplashScreen';
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

const Root = createNativeStackNavigator<RootStackParamList>();
const Onboarding = createNativeStackNavigator<OnboardingStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

// ─── Onboarding Navigator ────────────────────────────────────────────────────
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
    </SettingsStack.Navigator>
  );
}

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────
function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIconStyle: { marginTop: 4 },
        tabBarIcon: ({ focused, color }) => {
          const icons: Record<string, string> = {
            HomeTab: focused ? 'home' : 'home',
            InsightsTab: focused ? 'analytics' : 'analytics',
            SettingsTab: focused ? 'settings' : 'settings',
          };
          return (
            <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
              <MaterialIcons name={icons[route.name] as any} size={22} color={color} />
            </View>
          );
        },
        tabBarLabel: ({ focused, color, children }) => (
          <Text style={[styles.tabLabel, { color }]}>
            {route.name === 'HomeTab' ? 'Home' :
             route.name === 'InsightsTab' ? 'Insights' : 'Settings'}
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
  return (
    <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Root.Screen name="Splash" component={SplashScreen} />
        <Root.Screen name="Onboarding" component={OnboardingNavigator} />
        <Root.Screen name="Main" component={MainNavigator} />
      </Root.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: 'rgba(247, 249, 251, 0.95)',
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    paddingHorizontal: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#191c1e',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 16,
  },
  tabIcon: {
    width: 44, height: 32, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: `${Colors.primary}15`,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
});
