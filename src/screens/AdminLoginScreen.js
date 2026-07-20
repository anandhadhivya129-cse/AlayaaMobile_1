import React from 'react';
import LoginForm from '../components/LoginForm';

export default function AdminLoginScreen({ navigation }) {
  return (
    <LoginForm
      navigation={navigation}
      role="admin"
      title="Admin Login"
      subtitle="Sign in to the ALAYAA control panel"
      dashboardRoute="AdminDashboard"
      registerRoute={null}
    />
  );
}
