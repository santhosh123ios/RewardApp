import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from './HomeScreen';
import LeadsScreen from './LeadsScreen';
import WalletScreen from './WalletScreen';
import ProfileScreen from './ProfileScreen';



const Tab = createBottomTabNavigator();

export default function Main() {
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
            tabBarActiveTintColor: '#f8d307',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
        })}
        >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Leads" component={LeadsScreen} />
        <Tab.Screen name="Wallet" component={WalletScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        
        </Tab.Navigator>
  );
}