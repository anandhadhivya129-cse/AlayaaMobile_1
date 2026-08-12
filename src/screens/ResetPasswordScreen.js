import React, { useState } from 'react';
import { Text } from 'react-native';
import { Screen, Field, Button, ErrorText } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { getFriendlyErrorMessage } from '../services/api';
import colors from '../theme/colors';

export default function ResetPasswordScreen({ navigation }) {
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(password);
      navigation.replace('CustomerLogin');
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={{ padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.espresso900, marginBottom: 4 }}>Set a new password</Text>
      <Text style={{ color: colors.textMuted, marginBottom: 24 }}>Choose a strong password for your account.</Text>

      <ErrorText>{error}</ErrorText>
      <Field label="New password" secureTextEntry value={password} onChangeText={setPassword} />
      <Field label="Confirm password" secureTextEntry value={confirm} onChangeText={setConfirm} />
      <Button title="Update Password" onPress={submit} loading={loading} />
    </Screen>
  );
}