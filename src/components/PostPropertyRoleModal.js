import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Home, Briefcase, Building2, ChevronRight, X } from 'lucide-react-native';
import colors from '../theme/colors';

// Matches the web app's "Post Your Property" role picker: Owner / Agent
// or Broker / Builder or Developer. Shown with no login requirement —
// only once a role is picked and the user reaches the actual form does
// the existing login gate kick in.
const ROLES = [
  {
    key: 'owner',
    title: 'Owner',
    subtitle: 'I own the property and want to list it',
    icon: Home,
    tint: '#EFF6FF',
    iconColor: '#2563EB',
    borderColor: '#BFDBFE',
  },
  {
    key: 'broker',
    title: 'Agent / Broker',
    subtitle: 'I am a registered broker or agent',
    icon: Briefcase,
    tint: '#F5F3FF',
    iconColor: '#7C3AED',
    borderColor: '#DDD6FE',
  },
  {
    key: 'builder',
    title: 'Builder / Developer',
    subtitle: 'I represent a construction firm',
    icon: Building2,
    tint: '#FFFBEB',
    iconColor: '#D97706',
    borderColor: '#FDE68A',
  },
];

export default function PostPropertyRoleModal({ visible, onClose, onSelectRole }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Post Your Property</Text>
              <Text style={styles.subtitle}>Free listing · No brokerage charged</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <X size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <TouchableOpacity
                key={role.key}
                style={[styles.option, { backgroundColor: role.tint, borderColor: role.borderColor }]}
                onPress={() => onSelectRole(role.key)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconWrap, { backgroundColor: colors.white }]}>
                  <Icon size={20} color={role.iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>{role.title}</Text>
                  <Text style={styles.optionSubtitle}>{role.subtitle}</Text>
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.espresso900, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textMuted },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: { fontSize: 15, fontWeight: '700', color: colors.espresso900, marginBottom: 2 },
  optionSubtitle: { fontSize: 12, color: colors.textMuted },
});