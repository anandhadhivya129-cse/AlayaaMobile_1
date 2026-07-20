import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Screen, Card, EmptyState } from '../../components/ui';
import { fetchCustomerEnquiries } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

const STATUS_COLORS = { new: colors.warning, replied: colors.success };

export default function CustomerEnquiriesScreen({ navigation }) {
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await fetchCustomerEnquiries(user.id);
      setEnquiries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Screen>
      <View style={{ padding: 16, paddingBottom: 4 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.espresso900 }}>My Enquiries</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.espresso700} />
        </View>
      ) : (
        <FlatList
          data={enquiries}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={<EmptyState title="No enquiries yet" subtitle="Enquire on a property to start a conversation with the broker." />}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => item.property_id && navigation.navigate('PropertyDetail', { propertyId: item.property_id })}>
              <Card style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: '700', color: colors.espresso900, flex: 1 }} numberOfLines={1}>
                    {item.property?.title || 'Property'}
                  </Text>
                  <Text style={{ color: STATUS_COLORS[item.status] || colors.textMuted, fontWeight: '700', fontSize: 11, textTransform: 'uppercase' }}>
                    {item.status}
                  </Text>
                </View>
                <Text style={{ color: colors.espresso600, marginTop: 6, fontSize: 13 }}>You: {item.message}</Text>
                {item.reply_message ? (
                  <View style={{ marginTop: 8, backgroundColor: colors.espresso50, borderRadius: 10, padding: 10 }}>
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 2 }}>Broker reply</Text>
                    <Text style={{ fontSize: 13, color: colors.espresso900 }}>{item.reply_message}</Text>
                  </View>
                ) : null}
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
}
