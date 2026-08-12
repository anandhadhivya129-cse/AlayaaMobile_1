import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Building2, PlusCircle, MessageSquare, User } from 'lucide-react-native';
import colors from '../theme/colors';

import BrokerListingsScreen from '../screens/broker/BrokerListingsScreen';
import BrokerPostPropertyScreen from '../screens/broker/BrokerPostPropertyScreen';
import BrokerEnquiriesScreen from '../screens/broker/BrokerEnquiriesScreen';
import BrokerProfileScreen from '../screens/broker/BrokerProfileScreen';

const Tab = createBottomTabNavigator();

export default function BrokerTabs() {
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
        name="Listings"
        component={BrokerListingsScreen}
        options={{ tabBarIcon: ({ color, size }) => <Building2 color={color} size={size} /> }}
      />
      <Tab.Screen
        name="PostProperty"
        component={BrokerPostPropertyScreen}
        options={{ title: 'Post', tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Enquiries"
        component={BrokerEnquiriesScreen}
        options={{ tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={BrokerProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}
