import React from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ShimmerPlaceholder } from '../common/ShimmerPlaceholder';
import { spacing } from '../../theme/spacing';
import {
  HOME_HORIZONTAL_CARD_GAP,
  homeContentCardOuterWidth,
  posterFrameHeightFromOuterWidth,
} from '../../utils/contentCardLayout';

const GRID_ROWS: number = 4;

/**
 * Two-column grid placeholder matching See All / home card width and poster ratio.
 */
export function SeeAllScreenSkeleton() {
  const { width: windowWidth } = useWindowDimensions();
  const contentCardWidth: number = homeContentCardOuterWidth(windowWidth);
  const posterHeight: number = posterFrameHeightFromOuterWidth(contentCardWidth);
  const posterShimmerStyle = {
    width: contentCardWidth,
    height: posterHeight,
  };
  const rows: React.ReactElement[] = [];
  for (let row: number = 0; row < GRID_ROWS; row += 1) {
    rows.push(
      <View key={row} style={styles.row}>
        <View style={[styles.cell, { width: contentCardWidth }]}>
          <ShimmerPlaceholder style={[styles.poster, posterShimmerStyle]} />
          <ShimmerPlaceholder style={styles.titleLine} />
          <ShimmerPlaceholder style={styles.subtitleLine} />
        </View>
        <View style={[styles.cell, { width: contentCardWidth }]}>
          <ShimmerPlaceholder style={[styles.poster, posterShimmerStyle]} />
          <ShimmerPlaceholder style={styles.titleLine} />
          <ShimmerPlaceholder style={styles.subtitleLine} />
        </View>
      </View>,
    );
  }
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {rows}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: HOME_HORIZONTAL_CARD_GAP,
  },
  cell: {
    gap: spacing.xs,
  },
  poster: {
    borderRadius: spacing.md,
  },
  titleLine: {
    height: spacing.md,
    width: '92%',
    borderRadius: spacing.xs,
  },
  subtitleLine: {
    height: spacing.sm,
    width: '64%',
    borderRadius: spacing.xs,
  },
});
