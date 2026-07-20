import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, BedDouble, Bath, Ruler, BadgeCheck, Heart } from 'lucide-react-native';
import colors from '../theme/colors';

export default function PropertyCard({ property, onPress, onToggleFavorite, isFavorite }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        {property.image ? (
          <Image source={{ uri: property.image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={{ color: colors.textMuted }}>No image</Text>
          </View>
        )}
        {onToggleFavorite ? (
          <TouchableOpacity style={styles.favBtn} onPress={onToggleFavorite}>
            <Heart size={18} color={isFavorite ? colors.danger : colors.white} fill={isFavorite ? colors.danger : 'transparent'} />
          </TouchableOpacity>
        ) : null}
        {property.verified ? (
          <View style={styles.verifiedBadge}>
            <BadgeCheck size={12} color={colors.white} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        ) : null}
      </View>

      <View style={{ padding: 12 }}>
        <Text style={styles.price}>{property.priceLabel}</Text>
        <Text numberOfLines={1} style={styles.title}>{property.title}</Text>
        <View style={styles.row}>
          <MapPin size={13} color={colors.textMuted} />
          <Text numberOfLines={1} style={styles.location}>{property.locality || property.location || property.city}</Text>
        </View>

        <View style={[styles.row, { marginTop: 8, gap: 12 }]}>
          {!!property.bedrooms && (
            <View style={styles.stat}>
              <BedDouble size={14} color={colors.espresso600} />
              <Text style={styles.statText}>{property.bedrooms} BHK</Text>
            </View>
          )}
          {!!property.bathrooms && (
            <View style={styles.stat}>
              <Bath size={14} color={colors.espresso600} />
              <Text style={styles.statText}>{property.bathrooms}</Text>
            </View>
          )}
          {!!property.area && (
            <View style={styles.stat}>
              <Ruler size={14} color={colors.espresso600} />
              <Text style={styles.statText}>{property.area}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 14,
  },
  imageWrap: { width: '100%', height: 160, backgroundColor: colors.espresso100 },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  favBtn: {
    position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(62,39,35,0.55)',
    borderRadius: 20, padding: 7,
  },
  verifiedBadge: {
    position: 'absolute', top: 10, left: 10, backgroundColor: colors.success,
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  verifiedText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  price: { fontSize: 17, fontWeight: '800', color: colors.espresso900 },
  title: { fontSize: 14, fontWeight: '600', color: colors.espresso900, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  location: { fontSize: 12, color: colors.textMuted, flexShrink: 1 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: colors.espresso600, fontWeight: '600' },
});
