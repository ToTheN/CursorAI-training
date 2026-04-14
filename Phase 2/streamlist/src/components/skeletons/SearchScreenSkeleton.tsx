import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ShimmerPlaceholder } from '../ShimmerPlaceholder';
import { spacing } from '../../theme/spacing';

const CARD_HEIGHT: number = spacing.xl * 5;
const GAP: number = spacing.md;

/**
 * Search field + two-column grid matching upcoming poster cards.
 */
export function SearchScreenSkeleton() {
  return (
    <View style={styles.root}>
      <ShimmerPlaceholder style={styles.searchBar} />
      <View style={styles.gridRow}>
        <ShimmerPlaceholder style={styles.card} />
        <ShimmerPlaceholder style={styles.card} />
      </View>
      <View style={styles.gridRow}>
        <ShimmerPlaceholder style={styles.card} />
        <ShimmerPlaceholder style={styles.card} />
      </View>
      <View style={styles.gridRow}>
        <ShimmerPlaceholder style={styles.card} />
        <ShimmerPlaceholder style={styles.card} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: GAP,
  },
  searchBar: {
    height: spacing.xl + spacing.sm,
    width: '100%',
    borderRadius: spacing.sm,
  },
  gridRow: {
    flexDirection: 'row',
    gap: GAP,
  },
  card: {
    flex: 1,
    height: CARD_HEIGHT,
    borderRadius: spacing.sm,
  },
});
