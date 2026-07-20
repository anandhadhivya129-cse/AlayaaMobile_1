import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

// Mirrors the web app's <ProtectedRoute allowedRoles={[...]}>.
// Renders `children` only when the signed-in user's role is allowed,
// otherwise redirects to the matching login screen or Unauthorized.
export default function RoleGate({ navigation, allowedRoles, loginRoute, children }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigation.replace(loginRoute);
      return;
    }
    if (!allowedRoles.includes(user.profile?.role)) {
      navigation.replace('Unauthorized');
    }
  }, [loading, user]);

  if (loading || !user || !allowedRoles.includes(user.profile?.role)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }}>
        <ActivityIndicator color={colors.espresso700} />
      </View>
    );
  }

  return children;
}
