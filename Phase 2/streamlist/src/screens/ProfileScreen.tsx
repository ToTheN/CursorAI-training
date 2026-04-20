import React, { useCallback } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenErrorBoundary } from '../components/common/ScreenErrorBoundary';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

function ProfileBody(): React.ReactElement {
  return <Text style={styles.label}>Profile</Text>;
}

export function ProfileScreen(): React.ReactElement {
  const refetch = useCallback((): void => {}, []);
  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScreenErrorBoundary onRetry={refetch}>
        <ProfileBody />
      </ScreenErrorBoundary>
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
});
