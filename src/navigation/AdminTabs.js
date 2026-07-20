import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Users, ShieldCheck, Building2 } from 'lucide-react-native';
import colors from '../theme/colors';

import AdminOverviewScreen from '../screens/admin/AdminOverviewScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminBrokerApprovalsScreen from '../screens/admin/AdminBrokerApprovalsScreen';
import AdminPropertiesScreen from '../screens/admin/AdminPropertiesScreen';

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
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
        name="Overview"
        component={AdminOverviewScreen}
        options={{ tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Users"
        component={AdminUsersScreen}
        options={{ tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Approvals"
        component={AdminBrokerApprovalsScreen}
        options={{ tabBarIcon: ({ color, size }) => <ShieldCheck color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Properties"
        component={AdminPropertiesScreen}
        options={{ tabBarIcon: ({ color, size }) => <Building2 color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}
