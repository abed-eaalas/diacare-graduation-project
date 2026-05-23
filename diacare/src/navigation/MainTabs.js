import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import GlucoseScreen from '../screens/GlucoseScreen';
import MealsScreen from '../screens/MealsScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import AccessibilityScreen from '../screens/AccessibilityScreen';
import { useApp } from '../context/AppContext';
import { colors, getTheme } from '../utils/theme';

const Tab = createBottomTabNavigator();

const defaultIcons = {
  Home: 'home',
  Glucose: 'pulse',
  Meals: 'restaurant',
  Chat: 'chatbubble-ellipses',
  Settings: 'settings',
};

const kidIcons = {
  Home: 'home',
  Glucose: 'heart',
  Meals: 'ice-cream',
  Chat: 'happy',
  Settings: 'color-wand',
};

function KidTabIcon({ routeName, focused, size, theme }) {
  const iconName = kidIcons[routeName];

  const kidBackgrounds = {
    Home: theme.kidColors.tabPink,
    Glucose: theme.kidColors.tabBlue,
    Meals: theme.kidColors.tabYellow,
    Chat: theme.kidColors.tabGreen,
    Settings: theme.kidColors.tabPurple,
  };

  const bg = kidBackgrounds[routeName] || theme.kidColors.tabPink;

  return (
    <View
      style={[
        styles.kidIconWrap,
        { backgroundColor: bg, borderColor: theme.kidColors.border },
        focused && styles.kidIconWrapFocused,
      ]}
    >
      <Ionicons
        name={iconName}
        size={size}
        color={focused ? theme.colors.primary : theme.colors.muted}
      />
    </View>
  );
}

export default function MainTabs() {
  const { user } = useApp();
  const theme = getTheme(user);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
          },
          theme.kidMode && styles.kidTabBar,
        ],
        tabBarLabelStyle: [styles.label, theme.kidMode && styles.kidLabel],
        tabBarIcon: ({ color, size, focused }) =>
          theme.kidMode ? (
            <KidTabIcon routeName={route.name} focused={focused} size={size} theme={theme} />
          ) : (
            <Ionicons name={defaultIcons[route.name]} size={size} color={color} />
          ),
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Glucose" component={GlucoseScreen} />
      <Tab.Screen name="Meals" component={MealsScreen} />
      <Tab.Screen name="Chat" component={ChatbotScreen} />
      <Tab.Screen name="Settings" component={AccessibilityScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 72,
    paddingBottom: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  kidTabBar: {
    height: 86,
    paddingTop: 10,
    paddingBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  kidLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  kidIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    borderWidth: 1,
  },
  kidIconWrapFocused: {
    transform: [{ scale: 1.07 }],
  },
});