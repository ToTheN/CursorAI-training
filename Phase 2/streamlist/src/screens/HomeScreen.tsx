import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHome } from '../hooks/useHome';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function HomeScreen() {
  useHome();
  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <Text style={styles.title}>Home</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  title: {
    color: colors.on_surface,
    fontFamily: typography.fontFamily.manropeSemiBold,
    fontSize: typography.fontSize.xl,
    lineHeight: typography.lineHeight.relaxed,
  },
});
