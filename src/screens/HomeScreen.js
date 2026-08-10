import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Search, User, LogOut, PlusCircle } from 'lucide-react-native';
import { Screen, Field, EmptyState } from '../components/ui';
import PropertyCard from '../components/PropertyCard';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import PostPropertyRoleModal from '../components/PostPropertyRoleModal';
import { fetchProperties, toggleFavorite as apiToggleFavorite } from '../services/api';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

const LISTING_TYPES = ['Buy', 'Rent', 'PG', 'Commercial'];
const SEARCH_DEBOUNCE_MS = 400;

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [showPostRoleModal, setShowPostRoleModal] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [listingType, setListingType] = useState('Buy');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Tracks which fetch is the most recent one, so a slow response for an
  // earlier keystroke can't land after (and overwrite) a faster response
  // for a later keystroke.
  const requestIdRef = useRef(0);

  // Debounce: wait until the person pauses typing before actually searching,
  // instead of firing a request on every keystroke.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query]);

  const load = useCallback(async ({ isRefresh = false } = {}) => {
    const requestId = ++requestIdRef.current;
    if (isRefresh) setRefreshing(true);
    else setSearching(true);

    try {
      const data = await fetchProperties({ query: debouncedQuery, status: 'active' });
      // Ignore this result if a newer search has since been kicked off.
      if (requestId !== requestIdRef.current) return;
      setProperties(data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error('Failed to load properties', err);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setSearching(false);
        setRefreshing(false);
      }
    }
  }, [debouncedQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const goToDashboard = () => {
    const role = user?.profile?.role;
    if (role === 'customer') navigation.navigate('CustomerDashboard');
    else if (role === 'broker') navigation.navigate('BrokerDashboard');
    else if (role === 'admin') navigation.navigate('AdminDashboard');
  };

  const handleSelectPostRole = (role) => {
    setShowPostRoleModal(false);
    // The role picker itself needs no login — it just captures intent.
    // The actual form (PostPropertyShared) still checks for a logged-in
    // user and prompts to log in there if needed.
    navigation.navigate('PostPropertyShared', { intendedRole: role });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Logo size={32} />
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setShowPostRoleModal(true)} style={styles.postBtn}>
            <PlusCircle size={16} color={colors.white} />
            <Text style={styles.postBtnText}>Post</Text>
          </TouchableOpacity>
          {user ? (
            <>
              <TouchableOpacity onPress={goToDashboard}>
                <User size={22} color={colors.espresso900} />
              </TouchableOpacity>
              <TouchableOpacity onPress={logout}>
                <LogOut size={20} color={colors.espresso900} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('CustomerLogin')}>
              <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        <View style={styles.searchRow}>
          <Search size={18} color={colors.textMuted} />
          <Field
            style={styles.searchInput}
            placeholder="Search by locality, city, or project"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => { setDebouncedQuery(query); }}
            returnKeyType="search"
          />
          {searching ? <ActivityIndicator size="small" color={colors.espresso700} /> : null}
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load({ isRefresh: true })} />}
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

      <PostPropertyRoleModal
        visible={showPostRoleModal}
        onClose={() => setShowPostRoleModal(false)}
        onSelectRole={handleSelectPostRole}
      />
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
  postBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.espresso700,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18,
  },
  postBtnText: { color: colors.white, fontWeight: '700', fontSize: 12 },
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