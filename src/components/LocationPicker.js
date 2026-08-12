import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { LocateFixed, MapPin } from 'lucide-react-native';
import colors from '../theme/colors';

// Default map center when the broker hasn't picked a spot yet (Chennai —
// change this if most of your listings are elsewhere).
const DEFAULT_REGION = {
  latitude: 13.0827,
  longitude: 80.2707,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

/**
 * Map picker for a property's location. Tap anywhere on the map, or drag
 * the pin, to set latitude/longitude. Optional "use my current location"
 * button fills in the device's GPS position via expo-location.
 *
 * @param {object} props
 * @param {number|null} props.latitude
 * @param {number|null} props.longitude
 * @param {(coords: { latitude: number, longitude: number }) => void} props.onChange
 */
export default function LocationPicker({ latitude, longitude, onChange }) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  const hasPin = latitude != null && longitude != null;

  const region = hasPin
    ? { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : DEFAULT_REGION;

  const useCurrentLocation = async () => {
    setError('');
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setError('Location permission is needed to use your current position.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      onChange({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    } catch (err) {
      setError('Could not get your current location. Try tapping the map instead.');
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.espresso900 }}>
          Location on map
        </Text>
        <TouchableOpacity
          onPress={useCurrentLocation}
          disabled={locating}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          {locating ? (
            <ActivityIndicator size="small" color={colors.espresso700} />
          ) : (
            <LocateFixed size={14} color={colors.espresso700} />
          )}
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.espresso700 }}>
            Use current location
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
        Tap the map or drag the pin to set the exact spot buyers will see.
      </Text>

      <View
        style={{
          height: 200,
          borderRadius: 12,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <MapView
          style={{ flex: 1 }}
          initialRegion={DEFAULT_REGION}
          region={hasPin ? region : undefined}
          onPress={(e) => onChange(e.nativeEvent.coordinate)}
        >
          {hasPin ? (
            <Marker
              coordinate={{ latitude, longitude }}
              draggable
              onDragEnd={(e) => onChange(e.nativeEvent.coordinate)}
            />
          ) : null}
        </MapView>
      </View>

      {hasPin ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
          <MapPin size={12} color={colors.textMuted} />
          <Text style={{ fontSize: 11, color: colors.textMuted }}>
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </Text>
        </View>
      ) : (
        <Text style={{ fontSize: 11, color: colors.warning, marginTop: 6 }}>
          No pin set yet — the listing won't show a map on the detail page until you add one.
        </Text>
      )}

      {error ? <Text style={{ fontSize: 12, color: colors.danger, marginTop: 6 }}>{error}</Text> : null}
    </View>
  );
}