import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Screen, Card, EmptyState } from '../../components/ui';
import { fetchPendingBrokers, approveBroker, rejectBroker } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

export default function AdminBrokerApprovalsScreen() {
  const { user } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchPendingBrokers();
      setPending(data);
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

  const act = async (brokerId, action) => {
    setPending((prev) => prev.filter((p) => p.broker_id !== brokerId));
    try {
      if (action === 'approve') await approveBroker(brokerId, user?.id);
      else await rejectBroker(brokerId, user?.id);
    } catch (err) {
      console.error(err);
      load();
    }
  };

  return (
    <Screen>
      <View style={{ padding: 16, paddingBottom: 4 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.espresso900 }}>Broker Approvals</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.espresso700} />
        </View>
      ) : (
        <FlatList
          data={pending}
          keyExtractor={(item) => String(item.broker_id)}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={<EmptyState title="No pending broker requests" />}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 12 }}>
              <Text style={{ fontWeight: '700', color: colors.espresso900 }}>{item.profile?.full_name || 'Unnamed broker'}</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 10 }}>{item.profile?.email}</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => act(item.broker_id, 'approve')}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.success, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
                >
                  <Check size={14} color={colors.white} />
                  <Text style={{ color: colors.white, fontWeight: '700', fontSize: 12 }}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => act(item.broker_id, 'reject')}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.danger, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
                >
                  <X size={14} color={colors.white} />
                  <Text style={{ color: colors.white, fontWeight: '700', fontSize: 12 }}>Reject</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}
