import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Building2, Users, MessageSquare, ShieldCheck } from 'lucide-react-native';
import { Screen, Card } from '../../components/ui';
import { fetchAdminStats } from '../../services/api';
import colors from '../../theme/colors';

const STAT_CARDS = [
  { key: 'propertiesCount', label: 'Properties', icon: Building2 },
  { key: 'usersCount', label: 'Users', icon: Users },
  { key: 'enquiriesCount', label: 'Enquiries', icon: MessageSquare },
  { key: 'brokerRequestsCount', label: 'Broker Requests', icon: ShieldCheck },
];

export default function AdminOverviewScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminStats();
      setStats(data);
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

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      >
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.espresso900, marginBottom: 16 }}>Admin Overview</Text>

        {loading ? (
          <ActivityIndicator color={colors.espresso700} />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {STAT_CARDS.map(({ key, label, icon: Icon }) => (
              <Card key={key} style={{ width: '47%' }}>
                <Icon size={20} color={colors.espresso700} />
                <Text style={{ fontSize: 24, fontWeight: '800', color: colors.espresso900, marginTop: 8 }}>
                  {stats?.[key] ?? 0}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>{label}</Text>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
