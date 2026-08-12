import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { LogOut, Camera } from 'lucide-react-native';
import { Screen, Field, Button, ErrorText } from './ui';
import { useAuth } from '../context/AuthContext';
import { pickImageFromCameraOrLibrary } from '../utils/imagePicker';
import { getFriendlyErrorMessage } from '../services/api';
import colors from '../theme/colors';

export default function ProfileForm({ navigation, homeRoute = 'Home' }) {
  const { user, updateProfile, uploadProfilePicture, logout } = useAuth();
  const profile = user?.profile || {};
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [city, setCity] = useState(profile.city || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const pickImage = async () => {
    const result = await pickImageFromCameraOrLibrary({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (result.canceled) {
      if (result.error) setError(result.error);
      return;
    }
    setUploading(true);
    setError('');
    try {
      await uploadProfilePicture(result.assets[0]);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setError('');
    setSaved(false);
    setLoading(true);
    try {
      await updateProfile({ full_name: fullName, phone, city, bio });
      setSaved(true);
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const doLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: homeRoute }] });
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={pickImage} disabled={uploading}>
            {profile.profile_picture ? (
              <Image source={{ uri: profile.profile_picture }} style={{ width: 88, height: 88, borderRadius: 44 }} />
            ) : (
              <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.espresso100, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 28, fontWeight: '800', color: colors.espresso700 }}>
                  {(profile.full_name || user?.email || '?').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.espresso700, borderRadius: 14, padding: 5 }}>
              <Camera size={14} color={colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={{ marginTop: 10, fontWeight: '700', color: colors.espresso900 }}>{user?.email}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, textTransform: 'capitalize' }}>{profile.role}</Text>
        </View>

        <ErrorText>{error}</ErrorText>
        {saved ? <Text style={{ color: colors.success, marginBottom: 12, fontWeight: '600' }}>Profile updated.</Text> : null}

        <Field label="Full name" value={fullName} onChangeText={setFullName} />
        <Field label="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <Field label="City" value={city} onChangeText={setCity} />
        <Field label="Bio" value={bio} onChangeText={setBio} multiline numberOfLines={3} style={{ minHeight: 70, textAlignVertical: 'top' }} />

        <Button title="Save Changes" onPress={save} loading={loading} style={{ marginTop: 4 }} />

        <TouchableOpacity onPress={doLogout} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <LogOut size={16} color={colors.danger} />
          <Text style={{ color: colors.danger, fontWeight: '700' }}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}