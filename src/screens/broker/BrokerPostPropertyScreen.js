import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { ImagePlus, X } from 'lucide-react-native';
import { Screen, Field, Button, ErrorText } from '../../components/ui';
import { createProperty, uploadPropertyImages, getFriendlyErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { pickImageFromCameraOrLibrary } from '../../utils/imagePicker';
import colors from '../../theme/colors';

const PROPERTY_TYPES = ['Apartment', 'Villa', 'House', 'Plot', 'Commercial'];

export default function BrokerPostPropertyScreen({ navigation }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.espresso900, marginBottom: 8, textAlign: 'center' }}>
            Login to post a property
          </Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: 24 }}>
            You'll need an account so buyers can reach you about your listing.
          </Text>
          <Button
            title="Login as Customer"
            onPress={() => navigation.navigate('CustomerLogin')}
            style={{ width: '100%', marginBottom: 12 }}
          />
          <Button
            title="Login as Broker"
            variant="outline"
            onPress={() => navigation.navigate('BrokerLogin')}
            style={{ width: '100%' }}
          />
        </View>
      </Screen>
    );
  }

  // Only brokers go through admin approval — customers can post immediately.
  // A broker who's still 'pending' (or was 'rejected') can't actually save a
  // listing, so tell them that up front instead of letting them fill out the
  // whole form and hit a wall on submit.
  if (user.profile?.role === 'broker') {
    const approvalStatus = user.profile?.brokerApproval?.status;

    if (approvalStatus === 'pending') {
      return (
        <Screen>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.espresso900, marginBottom: 8, textAlign: 'center' }}>
              Your account is awaiting approval
            </Text>
            <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center' }}>
              An admin needs to approve your broker account before you can post properties. This usually doesn't take long — check back soon.
            </Text>
          </View>
        </Screen>
      );
    }

    if (approvalStatus === 'rejected') {
      return (
        <Screen>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.espresso900, marginBottom: 8, textAlign: 'center' }}>
              Broker application not approved
            </Text>
            <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center' }}>
              Your broker application wasn't approved, so you can't post properties. Please contact support if you think this is a mistake.
            </Text>
          </View>
        </Screen>
      );
    }
  }

  return <PostPropertyForm navigation={navigation} userId={user.id} />;
}

function PostPropertyForm({ navigation, userId }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [area, setArea] = useState('');
  const [propertyType, setPropertyType] = useState(PROPERTY_TYPES[0]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const MAX_IMAGES = 8;

  const pickImages = async () => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setError(`You can add up to ${MAX_IMAGES} photos.`);
      return;
    }
    const result = await pickImageFromCameraOrLibrary({
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.7,
    });
    if (result.canceled) {
      if (result.error) setError(result.error);
      return;
    }
    setError('');
    setImages((prev) => [...prev, ...result.assets].slice(0, MAX_IMAGES));
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const reset = () => {
    setTitle(''); setDescription(''); setPrice(''); setCity(''); setLocation('');
    setBedrooms(''); setBathrooms(''); setArea(''); setImages([]);
  };

  const submit = async () => {
    if (!title || !price || !city) {
      setError('Title, price, and city are required.');
      return;
    }
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      let imageUrls = [];
      if (images.length) {
        imageUrls = await uploadPropertyImages(images, userId);
      }
      await createProperty({
        broker_id: userId,
        title,
        description,
        price,
        city,
        location,
        bedrooms,
        bathrooms,
        area,
        property_type: propertyType,
        images: imageUrls,
        status: 'active',
      });
      setSuccess(true);
      reset();
      // Only jump to the broker's "Listings" tab if it actually exists in
      // this navigator (i.e. we're running inside BrokerTabs). In the
      // customer tab bar or the Home page stack, just stay put and show
      // the success message above.
      const state = navigation.getState?.();
      const hasListingsRoute = state?.routeNames?.includes('Listings');
      if (hasListingsRoute) {
        navigation.navigate('Listings');
      } else if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: colors.espresso900, marginBottom: 16 }}>Post a Property</Text>

        <ErrorText>{error}</ErrorText>
        {success ? <Text style={{ color: colors.success, marginBottom: 12, fontWeight: '600' }}>Property posted!</Text> : null}

        <Field label="Title" value={title} onChangeText={setTitle} placeholder="3 BHK apartment in Anna Nagar" />
        <Field label="Description" value={description} onChangeText={setDescription} multiline numberOfLines={4} style={{ minHeight: 90, textAlignVertical: 'top' }} />
        <Field label="Price (₹)" keyboardType="numeric" value={price} onChangeText={setPrice} />
        <Field label="City" value={city} onChangeText={setCity} />
        <Field label="Location / Locality" value={location} onChangeText={setLocation} />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}><Field label="Bedrooms" keyboardType="numeric" value={bedrooms} onChangeText={setBedrooms} /></View>
          <View style={{ flex: 1 }}><Field label="Bathrooms" keyboardType="numeric" value={bathrooms} onChangeText={setBathrooms} /></View>
        </View>
        <Field label="Area (sq.ft)" keyboardType="numeric" value={area} onChangeText={setArea} />

        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.espresso900, marginBottom: 6 }}>Property type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {PROPERTY_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setPropertyType(type)}
              style={{
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1,
                borderColor: propertyType === type ? colors.espresso700 : colors.border,
                backgroundColor: propertyType === type ? colors.espresso700 : 'transparent',
              }}
            >
              <Text style={{ color: propertyType === type ? colors.white : colors.espresso600, fontWeight: '600', fontSize: 12 }}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.espresso900, marginBottom: 4 }}>Photos</Text>
        <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>{images.length}/{MAX_IMAGES} added · tap a photo to remove it</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {images.map((img, idx) => (
            <TouchableOpacity key={idx} onPress={() => removeImage(idx)} style={{ width: 72, height: 72 }}>
              <Image source={{ uri: img.uri }} style={{ width: 72, height: 72, borderRadius: 10 }} />
              <View style={{ position: 'absolute', top: -6, right: -6, backgroundColor: colors.espresso900, borderRadius: 10, padding: 3 }}>
                <X size={12} color={colors.white} />
              </View>
            </TouchableOpacity>
          ))}
          {images.length < MAX_IMAGES ? (
            <TouchableOpacity
              onPress={pickImages}
              style={{ width: 72, height: 72, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.espresso50 }}
            >
              <ImagePlus size={22} color={colors.espresso600} />
            </TouchableOpacity>
          ) : null}
        </View>

        <Button title="Post Property" onPress={submit} loading={loading} />
      </ScrollView>
    </Screen>
  );
}