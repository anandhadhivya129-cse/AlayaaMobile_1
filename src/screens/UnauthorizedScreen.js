import React from 'react';
import { Text } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';
import { Screen, Button } from '../components/ui';
import colors from '../theme/colors';

export default function UnauthorizedScreen({ navigation }) {
  return (
    <Screen style={{ alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <ShieldAlert size={48} color={colors.danger} />
      <Text style={{ fontSize: 20, fontWeight: '800', color: colors.espresso900, marginTop: 16, marginBottom: 6 }}>
        Access denied
      </Text>
      <Text style={{ color: colors.textMuted, textAlign: 'center', marginBottom: 24 }}>
        You don't have permission to view this page with your current account.
      </Text>
      <Button title="Back to Home" onPress={() => navigation.navigate('Home')} />
    </Screen>
  );
}
