import React from 'react';
import LoginForm from '../components/LoginForm';

export default function BrokerLoginScreen({ navigation }) {
  return (
    <LoginForm
      navigation={navigation}
      role="broker"
      title="Broker Login"
      subtitle="Manage your listings and customer enquiries"
      dashboardRoute="BrokerDashboard"
      registerRoute="BrokerRegister"
    />
  );
}
