import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../theme/colors';

export function Screen({ children, style }) {
  return <SafeAreaView style={[styles.screen, style]}>{children}</SafeAreaView>;
}

export function Field({ label, style, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput placeholderTextColor={colors.textMuted} style={[styles.input, style]} {...props} />
    </View>
  );
}

export function Button({ title, onPress, loading, variant = 'primary', disabled, style }) {
  const isOutline = variant === 'outline';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isOutline ? styles.buttonOutline : styles.buttonPrimary,
        (disabled || loading) && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.espresso700 : colors.white} />
      ) : (
        <Text style={isOutline ? styles.buttonOutlineText : styles.buttonPrimaryText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ErrorText({ children }) {
  if (!children) return null;
  return <Text style={styles.error}>{children}</Text>;
}

export function EmptyState({ title, subtitle }) {
  return (
    <View style={{ padding: 32, alignItems: 'center' }}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.espresso900, marginBottom: 4 }}>{title}</Text>
      {subtitle ? <Text style={{ color: colors.textMuted, textAlign: 'center' }}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  label: { fontSize: 13, fontWeight: '600', color: colors.espresso900, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.espresso900,
    backgroundColor: colors.espresso50,
  },
  button: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  buttonPrimary: { backgroundColor: colors.espresso700 },
  buttonPrimaryText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  buttonOutline: { borderWidth: 1.5, borderColor: colors.espresso700 },
  buttonOutlineText: { color: colors.espresso700, fontWeight: '700', fontSize: 15 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  error: { color: colors.danger, fontSize: 13, marginBottom: 10 },
});
