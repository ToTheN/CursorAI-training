import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { StreamListLogo } from './StreamListLogo';

export interface ScreenErrorFallbackProps {
  onTryAgain: () => void;
}

export function ScreenErrorFallback(props: ScreenErrorFallbackProps) {
  const { onTryAgain } = props;
  return (
    <View style={styles.root}>
      <StreamListLogo />
      <Text style={styles.message}>Something went wrong</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Try Again"
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onTryAgain}
      >
        <Text style={styles.buttonLabel}>Try Again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  message: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface_container_highest,
  },
  buttonPressed: {
    backgroundColor: colors.surface_bright,
  },
  buttonLabel: {
    ...typography.textStyle.titleSm,
    color: colors.primary_container,
  },
});
