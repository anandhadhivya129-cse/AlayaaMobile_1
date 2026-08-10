import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Screen, Field, Button, ErrorText } from './ui';
import { useAuth } from '../context/AuthContext';
import { getFriendlyErrorMessage } from '../services/api';
import colors from '../theme/colors';

export default function LoginForm({ role, title, subtitle, dashboardRoute, registerRoute, navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      await login({ email: email.trim(), password, role });
      navigation.replace(dashboardRoute);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.espresso900, marginBottom: 4 }}>{title}</Text>
          <Text style={{ color: colors.textMuted, marginBottom: 24 }}>{subtitle}</Text>

          <ErrorText>{error}</ErrorText>
          <Field label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <Field label="Password" secureTextEntry value={password} onChangeText={setPassword} />

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ alignSelf: 'flex-end', marginBottom: 20 }}>
            <Text style={{ color: colors.espresso700, fontSize: 13, fontWeight: '600' }}>Forgot password?</Text>
          </TouchableOpacity>

          <Button title="Log In" onPress={submit} loading={loading} />

          {registerRoute ? (
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 6 }}>
              <Text style={{ color: colors.textMuted }}>New here?</Text>
              <TouchableOpacity onPress={() => navigation.navigate(registerRoute)}>
                <Text style={{ color: colors.espresso700, fontWeight: '700' }}>Create an account</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}