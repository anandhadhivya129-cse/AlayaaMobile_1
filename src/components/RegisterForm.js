import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Screen, Field, Button, ErrorText } from './ui';
import { useAuth } from '../context/AuthContext';
import { getFriendlyErrorMessage } from '../services/api';
import colors from '../theme/colors';

export default function RegisterForm({ role, title, subtitle, loginRoute, navigation }) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    if (!fullName || !email || !password) {
      setError('Please fill in your name, email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register({ fullName, email: email.trim(), phone, city, password, role });
      setSuccess(true);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Screen style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.espresso900, marginBottom: 8, textAlign: 'center' }}>
          Check your email
        </Text>
        <Text style={{ color: colors.textMuted, textAlign: 'center', marginBottom: 20 }}>
          We've sent a verification link to {email}. Confirm it, then log in.
        </Text>
        <Button title="Go to Login" onPress={() => navigation.replace(loginRoute)} />
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.espresso900, marginBottom: 4 }}>{title}</Text>
          <Text style={{ color: colors.textMuted, marginBottom: 24 }}>{subtitle}</Text>

          <ErrorText>{error}</ErrorText>
          <Field label="Full name" value={fullName} onChangeText={setFullName} />
          <Field label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <Field label="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          <Field label="City" value={city} onChangeText={setCity} />
          <Field label="Password" secureTextEntry value={password} onChangeText={setPassword} />

          <Button title="Create Account" onPress={submit} loading={loading} style={{ marginTop: 8 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 6 }}>
            <Text style={{ color: colors.textMuted }}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate(loginRoute)}>
              <Text style={{ color: colors.espresso700, fontWeight: '700' }}>Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}