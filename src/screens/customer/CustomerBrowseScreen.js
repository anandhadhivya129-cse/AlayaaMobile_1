import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Screen, Field, EmptyState } from '../../components/ui';
import PropertyCard from '../../components/PropertyCard';
import Footer from '../../components/Footer';
import { fetchProperties, toggleFavorite, fetchFavorites } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import colors from '../../theme/colors';

const SEARCH_DEBOUNCE_MS = 400;

export default function CustomerBrowseScreen({ navigation }) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [properties, setProperties] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const requestIdRef = useRef(0);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query]);

  const load = useCallback(async ({ isRefresh = false } = {}) => {
    const requestId = ++requestIdRef.current;
    if (isRefresh) setRefreshing(true);
    else setSearching(true);

    try {
      const [props, favs] = await Promise.all([
        fetchProperties({ query: debouncedQuery, status: 'active' }),
        user?.id ? fetchFavorites(user.id) : Promise.resolve([]),
      ]);
      if (requestId !== requestIdRef.current) return;
      setProperties(props);
      setFavoriteIds(new Set(favs.map((f) => f.property_id)));
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error(err);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setSearching(false);
        setRefreshing(false);
      }
    }
  }, [debouncedQuery, user?.id]);

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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Field
            style={{ flex: 1 }}
            placeholder="Search properties"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => setDebouncedQuery(query)}
            returnKeyType="search"
          />
          {searching ? <ActivityIndicator size="small" color={colors.espresso700} /> : null}
        </View>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load({ isRefresh: true })} />}
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