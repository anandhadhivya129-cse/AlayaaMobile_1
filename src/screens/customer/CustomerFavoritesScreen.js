import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Screen, EmptyState } from '../../components/ui';
import PropertyCard from '../../components/PropertyCard';
import { fetchFavorites, toggleFavorite } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

export default function CustomerFavoritesScreen({ navigation }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await fetchFavorites(user.id);
      setFavorites(data.filter((f) => f.property));
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

  const remove = async (propertyId) => {
    setFavorites((prev) => prev.filter((f) => f.property_id !== propertyId));
    try {
      await toggleFavorite(user.id, propertyId);
    } catch (err) {
      console.error(err);
      load();
    }
  };

  return (
    <Screen>
      <View style={{ padding: 16, paddingBottom: 4 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.espresso900 }}>Saved Properties</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.espresso700} />
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={<EmptyState title="No saved properties yet" subtitle="Tap the heart icon on a listing to save it here." />}
          renderItem={({ item }) => (
            <PropertyCard
              property={item.property}
              isFavorite
              onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.property_id })}
              onToggleFavorite={() => remove(item.property_id)}
            />
          )}
        />
      )}
    </Screen>
  );
}
