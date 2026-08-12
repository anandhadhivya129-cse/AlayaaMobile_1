import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import colors from '../theme/colors';

// Ported 1:1 from web app's <AlayaaLogo /> in Navbar.jsx
export default function Logo({ size = 36 }) {
  return (
    <View style={styles.row}>
      <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <Path
          d="M4 22 L24 4 L44 22"
          stroke={colors.espresso700}
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M8 22 L8 44 L40 44 L40 22"
          stroke={colors.espresso700}
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M18 44 L18 32 L30 32 L30 44"
          stroke={colors.espresso700}
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>

      <View style={{ marginLeft: 6 }}>
        <Text style={styles.eyebrow}>real estate</Text>
        <Text style={styles.wordmark}>ALAYAA</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  eyebrow: { fontSize: 9, fontWeight: '600', letterSpacing: 2, color: colors.textMuted, textTransform: 'uppercase' },
  wordmark: { fontSize: 21, fontWeight: '900', letterSpacing: -0.5, color: colors.espresso700, lineHeight: 24 },
});
