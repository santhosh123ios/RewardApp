import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import VendorHomeScreen from './VendorHomeScreen';
import VendorLeadsScreen from './VendorLeadsScreen';
import VendorWalletScreen from './VendorWalletScreen';
import VendorProfileScreen from './VendorProfileScreen';

const Tab = createBottomTabNavigator();

export default function VendorDashboard() {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Leads') iconName = 'people-outline';
          else if (route.name === 'Wallet') iconName = 'wallet-outline';
          else iconName = 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={VendorHomeScreen} />
      <Tab.Screen name="Leads" component={VendorLeadsScreen} />
      <Tab.Screen name="Wallet" component={VendorWalletScreen} />
      <Tab.Screen name="Profile" component={VendorProfileScreen} />
    </Tab.Navigator>
  );
}
