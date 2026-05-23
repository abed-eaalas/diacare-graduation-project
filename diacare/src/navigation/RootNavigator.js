import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import MainTabs from './MainTabs';
import FamilyDashboardScreen from '../screens/FamilyDashboardScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import GamificationScreen from '../screens/GamificationScreen';
import KidsModeScreen from '../screens/KidsModeScreen';
import AccessibilityScreen from '../screens/AccessibilityScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user } = useApp();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user.isLoggedIn ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : !user.profileCompleted ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="FamilyDashboard" component={FamilyDashboardScreen} />
          <Stack.Screen name="Emergency" component={EmergencyScreen} />
          <Stack.Screen name="Gamification" component={GamificationScreen} />
          <Stack.Screen name="KidsMode" component={KidsModeScreen} />
          <Stack.Screen name="Accessibility" component={AccessibilityScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}