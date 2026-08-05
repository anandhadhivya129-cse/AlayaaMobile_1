import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from './Logo';
import colors from '../theme/colors';

// Branded launch screen: shows the ALAYAA logo + wordmark centered on
// screen for a beat before the real app takes over — mirrors how
// native apps show a splash before landing on the home screen.
export default function AppSplash() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity }]}>
        <Logo size={56} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});