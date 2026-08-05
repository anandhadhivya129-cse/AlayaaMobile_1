import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Heart, MessageSquare, User, PlusCircle } from 'lucide-react-native';
import colors from '../theme/colors';

import CustomerBrowseScreen from '../screens/customer/CustomerBrowseScreen';
import BrokerPostPropertyScreen from '../screens/broker/BrokerPostPropertyScreen';
import CustomerFavoritesScreen from '../screens/customer/CustomerFavoritesScreen';
import CustomerEnquiriesScreen from '../screens/customer/CustomerEnquiriesScreen';
import CustomerProfileScreen from '../screens/customer/CustomerProfileScreen';

const Tab = createBottomTabNavigator();

export default function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.espresso700,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { borderTopColor: colors.border },
      }}
    >
      <Tab.Screen
        name="Browse"
        component={CustomerBrowseScreen}
        options={{ tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tab.Screen
        name="PostProperty"
        component={BrokerPostPropertyScreen}
        options={{ title: 'Post', tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Saved"
        component={CustomerFavoritesScreen}
        options={{ tabBarIcon: ({ color, size }) => <Heart color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Enquiries"
        component={CustomerEnquiriesScreen}
        options={{ tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={CustomerProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}