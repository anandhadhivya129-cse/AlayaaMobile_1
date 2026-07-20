import React from 'react';
import RegisterForm from '../components/RegisterForm';

export default function CustomerRegisterScreen({ navigation }) {
  return (
    <RegisterForm
      navigation={navigation}
      role="customer"
      title="Create your account"
      subtitle="Save favourites and message brokers directly"
      loginRoute="CustomerLogin"
    />
  );
}
