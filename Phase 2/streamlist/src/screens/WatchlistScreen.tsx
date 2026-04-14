import React, { useCallback } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenErrorBoundary } from '../components/ScreenErrorBoundary';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

function WatchlistBody(): React.ReactElement {
  return (
    <Text style={styles.placeholder}>Your watchlist will appear here.</Text>
  );
}

export function WatchlistScreen(): React.ReactElement {
  const refetch = useCallback((): void => {}, []);
  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScreenErrorBoundary onRetry={refetch}>
        <WatchlistBody />
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
  placeholder: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface_variant,
  },
});
