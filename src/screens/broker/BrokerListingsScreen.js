import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { Screen, EmptyState } from '../../components/ui';
import PropertyCard from '../../components/PropertyCard';
import { fetchBrokerProperties, deleteProperty } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

export default function BrokerListingsScreen({ navigation }) {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await fetchBrokerProperties(user.id);
      setProperties(data);
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

  const confirmDelete = (id) => {
    Alert.alert('Delete listing', 'This cannot be undone. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setProperties((prev) => prev.filter((p) => p.id !== id));
          try {
            await deleteProperty(id);
          } catch (err) {
            console.error(err);
            load();
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={{ padding: 16, paddingBottom: 4 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.espresso900 }}>My Listings</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.espresso700} />
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={<EmptyState title="No listings yet" subtitle="Post your first property from the Post tab." />}
          renderItem={({ item }) => (
            <View>
              <PropertyCard property={item} onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })} />
              <TouchableOpacity
                onPress={() => confirmDelete(item.id)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -8, marginBottom: 14 }}
              >
                <Trash2 size={14} color={colors.danger} />
                <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '600' }}>Delete listing</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </Screen>
  );
}
