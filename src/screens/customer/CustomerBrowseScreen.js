import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Screen, Field, EmptyState } from '../../components/ui';
import PropertyCard from '../../components/PropertyCard';
import Footer from '../../components/Footer';
import { fetchProperties, toggleFavorite, fetchFavorites } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

export default function CustomerBrowseScreen({ navigation }) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [properties, setProperties] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [props, favs] = await Promise.all([
        fetchProperties({ query, status: 'active' }),
        user?.id ? fetchFavorites(user.id) : Promise.resolve([]),
      ]);
      setProperties(props);
      setFavoriteIds(new Set(favs.map((f) => f.property_id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [query, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const onToggleFavorite = async (propertyId) => {
    if (!user?.id) return;
    const wasFavorite = favoriteIds.has(propertyId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      wasFavorite ? next.delete(propertyId) : next.add(propertyId);
      return next;
    });
    try {
      await toggleFavorite(user.id, propertyId);
    } catch (err) {
      console.error(err);
      load();
    }
  };

  return (
    <Screen>
      <View style={{ padding: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.espresso900, marginBottom: 12 }}>
          Hi {user?.profile?.full_name?.split(' ')[0] || 'there'} 👋
        </Text>
        <Field placeholder="Search properties" value={query} onChangeText={setQuery} onSubmitEditing={load} returnKeyType="search" />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.espresso700} />
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={<EmptyState title="No properties found" />}
          ListFooterComponent={<Footer />}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              isFavorite={favoriteIds.has(item.id)}
              onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
              onToggleFavorite={() => onToggleFavorite(item.id)}
            />
          )}
        />
      )}
    </Screen>
  );
}