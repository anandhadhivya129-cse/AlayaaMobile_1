import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';

import HomeScreen from '../screens/HomeScreen';
import PropertyDetailScreen from '../screens/PropertyDetailScreen';
import CustomerLoginScreen from '../screens/CustomerLoginScreen';
import CustomerRegisterScreen from '../screens/CustomerRegisterScreen';
import BrokerLoginScreen from '../screens/BrokerLoginScreen';
import BrokerRegisterScreen from '../screens/BrokerRegisterScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import UnauthorizedScreen from '../screens/UnauthorizedScreen';

import RoleGate from './RoleGate';
import CustomerTabs from './CustomerTabs';
import BrokerTabs from './BrokerTabs';
import AdminTabs from './AdminTabs';

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [Linking.createURL('/')],
  config: {
    screens: {
      ResetPassword: 'reset-password',
      CustomerLogin: 'login',
    },
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} options={{ headerShown: true, title: 'Property' }} />

        <Stack.Screen name="CustomerLogin" component={CustomerLoginScreen} />
        <Stack.Screen name="CustomerRegister" component={CustomerRegisterScreen} />
        <Stack.Screen name="BrokerLogin" component={BrokerLoginScreen} />
        <Stack.Screen name="BrokerRegister" component={BrokerRegisterScreen} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Unauthorized" component={UnauthorizedScreen} />

        <Stack.Screen name="CustomerDashboard">
          {(props) => (
            <RoleGate {...props} allowedRoles={['customer']} loginRoute="CustomerLogin">
              <CustomerTabs />
            </RoleGate>
          )}
        </Stack.Screen>

        <Stack.Screen name="BrokerDashboard">
          {(props) => (
            <RoleGate {...props} allowedRoles={['broker']} loginRoute="BrokerLogin">
              <BrokerTabs />
            </RoleGate>
          )}
        </Stack.Screen>

        <Stack.Screen name="AdminDashboard">
          {(props) => (
            <RoleGate {...props} allowedRoles={['admin']} loginRoute="AdminLogin">
              <AdminTabs />
            </RoleGate>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
