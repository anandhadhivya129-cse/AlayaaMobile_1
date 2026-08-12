import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Screen, Card, EmptyState } from '../../components/ui';
import { fetchAdminUsers, updateUserRole } from '../../services/api';
import colors from '../../theme/colors';

const ROLES = ['customer', 'broker', 'admin'];

export default function AdminUsersScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const changeRole = async (userId, role) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    try {
      await updateUserRole(userId, role);
    } catch (err) {
      console.error(err);
      load();
    }
  };

  return (
    <Screen>
      <View style={{ padding: 16, paddingBottom: 4 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.espresso900 }}>Users</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.espresso700} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={<EmptyState title="No users found" />}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 12 }}>
              <Text style={{ fontWeight: '700', color: colors.espresso900 }}>{item.full_name || 'Unnamed'}</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 10 }}>{item.email}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {ROLES.map((role) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => changeRole(item.id, role)}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1,
                      borderColor: item.role === role ? colors.espresso700 : colors.border,
                      backgroundColor: item.role === role ? colors.espresso700 : 'transparent',
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: item.role === role ? colors.white : colors.espresso600, textTransform: 'capitalize' }}>
                      {role}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}
