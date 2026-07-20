import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet, FlatList, Dimensions } from 'react-native';
import { MapPin, BedDouble, Bath, Ruler, BadgeCheck } from 'lucide-react-native';
import { Screen } from '../components/ui';
import EMICalculator from '../components/EMICalculator';
import ContactCard from '../components/ContactCard';
import { fetchPropertyById, createEnquiry, fetchProfileById } from '../services/api';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen({ route, navigation }) {
  const { propertyId } = route.params;
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [broker, setBroker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPropertyById(propertyId);
        setProperty(data);
        if (data?.broker_id) {
          const brokerProfile = await fetchProfileById(data.broker_id).catch(() => null);
          setBroker(brokerProfile);
        }
      } catch (err) {
        console.error('Failed to load property', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [propertyId]);

  if (loading) {
    return (
      <Screen style={{ alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.espresso700} />
      </Screen>
    );
  }

  if (!property) {
    return (
      <Screen style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Property not found.</Text>
      </Screen>
    );
  }

  const images = property.images?.length ? property.images : property.image ? [property.image] : [];

  const submitEnquiry = async (message) => {
    if (!user) {
      navigation.navigate('CustomerLogin');
      throw new Error('Please log in as a customer to send an enquiry.');
    }
    await createEnquiry({
      customer_id: user.id,
      property_id: property.id,
      broker_id: property.broker_id,
      message,
      broker_email: broker?.email,
      customer_name: user.profile?.full_name,
      customer_email: user.email,
      property_title: property.title,
    });
  };

  return (
    <Screen>
      <ScrollView>
        {images.length ? (
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            keyExtractor={(item, idx) => `${item}-${idx}`}
            renderItem={({ item }) => <Image source={{ uri: item }} style={{ width, height: 240 }} />}
          />
        ) : (
          <View style={{ width, height: 240, backgroundColor: colors.espresso100 }} />
        )}

        <View style={{ padding: 16 }}>
          <View style={styles.rowBetween}>
            <Text style={styles.price}>{property.priceLabel}</Text>
            {property.verified ? (
              <View style={styles.verifiedBadge}>
                <BadgeCheck size={13} color={colors.white} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.title}>{property.title}</Text>
          <View style={styles.row}>
            <MapPin size={14} color={colors.textMuted} />
            <Text style={styles.location}>{[property.locality, property.city].filter(Boolean).join(', ')}</Text>
          </View>

          <View style={styles.statsRow}>
            {!!property.bedrooms && (
              <View style={styles.stat}><BedDouble size={16} color={colors.espresso600} /><Text style={styles.statText}>{property.bedrooms} Beds</Text></View>
            )}
            {!!property.bathrooms && (
              <View style={styles.stat}><Bath size={16} color={colors.espresso600} /><Text style={styles.statText}>{property.bathrooms} Baths</Text></View>
            )}
            {!!property.area && (
              <View style={styles.stat}><Ruler size={16} color={colors.espresso600} /><Text style={styles.statText}>{property.area}</Text></View>
            )}
          </View>

          {property.description ? (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{property.description}</Text>
            </View>
          ) : null}

          {property.amenities?.length ? (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {property.amenities.map((a) => (
                  <View key={a} style={styles.amenityChip}><Text style={styles.amenityText}>{a}</Text></View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={{ marginTop: 20 }}>
            <EMICalculator defaultPrincipal={property.priceValue || 5000000} />
          </View>

          <View style={{ marginTop: 16 }}>
            <ContactCard brokerName={broker?.full_name} onSubmit={submitEnquiry} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  price: { fontSize: 24, fontWeight: '800', color: colors.espresso900 },
  title: { fontSize: 16, fontWeight: '600', color: colors.espresso900, marginTop: 6 },
  location: { fontSize: 13, color: colors.textMuted },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.success, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  verifiedText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 20, marginTop: 14, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 13, fontWeight: '600', color: colors.espresso700 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.espresso900, marginBottom: 6 },
  description: { fontSize: 13, color: colors.espresso600, lineHeight: 19 },
  amenityChip: { backgroundColor: colors.espresso50, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 },
  amenityText: { fontSize: 12, color: colors.espresso700, fontWeight: '600' },
});
