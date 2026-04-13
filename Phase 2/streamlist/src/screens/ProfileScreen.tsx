import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

/**
 * Placeholder profile surface — extend when account/settings are in scope.
 */
export function ProfileScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <Text style={styles.label}>Profile</Text>
      <Text style={styles.hint}>Placeholder</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  label: {
    color: colors.on_surface,
    fontFamily: typography.fontFamily.manropeSemiBold,
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.relaxed,
  },
  hint: {
    color: colors.on_surface_variant,
    fontFamily: typography.fontFamily.interRegular,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.normal,
    marginTop: spacing.xs,
  },
});
