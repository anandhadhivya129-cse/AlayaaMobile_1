import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Search, User, LogOut } from 'lucide-react-native';
import { Screen, Field, EmptyState } from '../components/ui';
import PropertyCard from '../components/PropertyCard';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import { fetchProperties, toggleFavorite as apiToggleFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

const LISTING_TYPES = ['Buy', 'Rent', 'PG', 'Commercial'];

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');
  const [listingType, setListingType] = useState('Buy');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchProperties({ query, status: 'active' });
      setProperties(data);
    } catch (err) {
      console.error('Failed to load properties', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const goToDashboard = () => {
    const role = user?.profile?.role;
    if (role === 'customer') navigation.navigate('CustomerDashboard');
    else if (role === 'broker') navigation.navigate('BrokerDashboard');
    else if (role === 'admin') navigation.navigate('AdminDashboard');
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Logo size={32} />
        {user ? (
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <TouchableOpacity onPress={goToDashboard}>
              <User size={22} color={colors.espresso900} />
            </TouchableOpacity>
            <TouchableOpacity onPress={logout}>
              <LogOut size={20} color={colors.espresso900} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('CustomerLogin')}>
            <Text style={styles.loginBtnText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <View style={styles.searchRow}>
          <Search size={18} color={colors.textMuted} />
          <Field
            style={styles.searchInput}
            placeholder="Search by locality, city, or project"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={load}
            returnKeyType="search"
          />
        </View>

        <View style={styles.typeRow}>
          {LISTING_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setListingType(type)}
              style={[styles.typeChip, listingType === type && styles.typeChipActive]}
            >
              <Text style={[styles.typeChipText, listingType === type && styles.typeChipTextActive]}>{type}</Text>
            </TouchableOpacity>
          ))}
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
          contentContainerStyle={{ padding: 16, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={<EmptyState title="No properties found" subtitle="Try a different search or check back later." />}
          ListFooterComponent={<Footer />}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() => navigation.navigate('PropertyDetail', { propertyId: item.id })}
              onToggleFavorite={
                user?.profile?.role === 'customer'
                  ? async () => {
                      try {
                        await apiToggleFavorite(user.id, item.id);
                      } catch (err) {
                        console.error(err);
                      }
                    }
                  : undefined
              }
            />
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14,
  },
  brand: { fontSize: 22, fontWeight: '800', color: colors.espresso900, letterSpacing: 0.5 },
  tagline: { fontSize: 12, color: colors.textMuted },
  loginBtn: { backgroundColor: colors.espresso700, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  loginBtnText: { color: colors.white, fontWeight: '700', fontSize: 13 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.espresso50,
    borderRadius: 12, paddingHorizontal: 12,
  },
  searchInput: { flex: 1, borderWidth: 0, backgroundColor: 'transparent', marginBottom: 0, paddingLeft: 0 },
  typeRow: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 4 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, borderWidth: 1, borderColor: colors.border },
  typeChipActive: { backgroundColor: colors.espresso700, borderColor: colors.espresso700 },
  typeChipText: { fontSize: 12, fontWeight: '600', color: colors.espresso600 },
  typeChipTextActive: { color: colors.white },
});
