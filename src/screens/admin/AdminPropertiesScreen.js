import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Trash2, Check, X } from 'lucide-react-native';
import { Screen, EmptyState } from '../../components/ui';
import PropertyCard from '../../components/PropertyCard';
import { fetchProperties, deleteProperty, updatePropertyStatus } from '../../services/api';
import colors from '../../theme/colors';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AdminPropertiesScreen({ navigation }) {
  const [tab, setTab] = useState('pending');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchProperties({ status: tab });
      setProperties(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const changeStatus = async (id, status) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    try {
      await updatePropertyStatus(id, status);
    } catch (err) {
      console.error(err);
      load();
    }
  };

  const confirmDelete = (id) => {
    Alert.alert('Remove property', 'This cannot be undone. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
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
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.espresso900 }}>Properties</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 }}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: tab === t.key ? colors.espresso700 : colors.espresso50,
            }}
          >
            <Text style={{ color: tab === t.key ? colors.white : colors.espresso600, fontWeight: '700', fontSize: 12 }}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
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
          ListEmptyComponent={<EmptyState title={`No ${tab} properties`} />}
          renderItem={({ item }) => (
            <View>
              <PropertyCard property={item} onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })} />
              <View style={{ flexDirection: 'row', gap: 16, marginTop: -8, marginBottom: 14 }}>
                {tab === 'pending' ? (
                  <>
                    <TouchableOpacity
                      onPress={() => changeStatus(item.id, 'active')}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    >
                      <Check size={14} color={colors.success} />
                      <Text style={{ color: colors.success, fontSize: 12, fontWeight: '700' }}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => changeStatus(item.id, 'rejected')}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    >
                      <X size={14} color={colors.danger} />
                      <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '700' }}>Reject</Text>
                    </TouchableOpacity>
                  </>
                ) : null}
                <TouchableOpacity
                  onPress={() => confirmDelete(item.id)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  <Trash2 size={14} color={colors.danger} />
                  <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '600' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </Screen>
  );
}