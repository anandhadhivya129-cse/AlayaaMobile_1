import React from 'react';
import RegisterForm from '../components/RegisterForm';

export default function BrokerRegisterScreen({ navigation }) {
  return (
    <RegisterForm
      navigation={navigation}
      role="broker"
      title="Become an ALAYAA broker"
      subtitle="List properties and manage enquiries from customers"
      loginRoute="BrokerLogin"
    />
  );
}
