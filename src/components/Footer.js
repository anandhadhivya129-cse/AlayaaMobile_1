import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Phone, Mail, MapPin } from 'lucide-react-native';
import Logo from './Logo';
import colors from '../theme/colors';

// Ported from web app's <Footer /> (src/components/Footer.jsx)
const GROUPS = {
  Property: ['Buy', 'Rent', 'Commercial', 'New Projects', 'Plots'],
  Cities: ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Hosur'],
  Company: ['About', 'Careers', 'Partners', 'Privacy', 'Terms'],
};

export default function Footer() {
  return (
    <View style={styles.footer}>
      <View style={{ padding: 20 }}>
        <Logo size={34} />
        <Text style={styles.tagline}>
          A premium real estate platform for verified homes, plots, villas, and commercial spaces across Tamil Nadu.
        </Text>

        <View style={{ marginTop: 16, gap: 10 }}>
          <TouchableOpacity style={styles.row} onPress={() => Linking.openURL('tel:1800-ALAYAA-TN')}>
            <Phone size={15} color={colors.espresso700} />
            <Text style={styles.rowText}>1800-ALAYAA-TN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => Linking.openURL('mailto:support@alayaa.in')}>
            <Mail size={15} color={colors.espresso700} />
            <Text style={styles.rowText}>support@alayaa.in</Text>
          </TouchableOpacity>
          <View style={styles.row}>
            <MapPin size={15} color={colors.espresso700} />
            <Text style={styles.rowText}>Chennai, Tamil Nadu</Text>
          </View>
        </View>

        <View style={{ marginTop: 24, gap: 20 }}>
          {Object.entries(GROUPS).map(([title, links]) => (
            <View key={title}>
              <Text style={styles.groupTitle}>{title}</Text>
              <View style={styles.linkWrap}>
                {links.map((link) => (
                  <TouchableOpacity key={link} style={styles.linkChip}>
                    <Text style={styles.linkText}>{link}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.copyrightBar}>
        <Text style={styles.copyrightText}>Copyright 2026 ALAYAA. All rights reserved.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.white, marginTop: 16 },
  tagline: { marginTop: 14, fontSize: 13, lineHeight: 19, color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowText: { fontSize: 13, color: colors.textMuted },
  groupTitle: { fontSize: 13, fontWeight: '800', color: colors.espresso900, marginBottom: 8 },
  linkWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  linkChip: { paddingVertical: 4 },
  linkText: { fontSize: 13, color: colors.textMuted },
  copyrightBar: { borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: 16, alignItems: 'center' },
  copyrightText: { fontSize: 12, color: colors.textMuted },
});
