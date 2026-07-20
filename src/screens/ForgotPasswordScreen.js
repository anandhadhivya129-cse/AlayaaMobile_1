import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Screen, Field, Button, ErrorText } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

export default function ForgotPasswordScreen({ navigation }) {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.espresso900, marginBottom: 4 }}>Reset your password</Text>
      <Text style={{ color: colors.textMuted, marginBottom: 24 }}>
        Enter your account email and we'll send you a reset link.
      </Text>

      {sent ? (
        <View>
          <Text style={{ color: colors.success, fontWeight: '600', marginBottom: 16 }}>
            Reset link sent! Check your inbox.
          </Text>
          <Button title="Back to Login" variant="outline" onPress={() => navigation.navigate('CustomerLogin')} />
        </View>
      ) : (
        <>
          <ErrorText>{error}</ErrorText>
          <Field label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
          <Button title="Send Reset Link" onPress={submit} loading={loading} />
        </>
      )}
    </Screen>
  );
}
