import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ShimmerPlaceholder } from '../ShimmerPlaceholder';
import { spacing } from '../../theme/spacing';

const BACKDROP_HEIGHT: number = spacing.xl * 8;
const POSTER_WIDTH: number = spacing.xl * 4;
const POSTER_HEIGHT: number = spacing.xl * 6;
const SIMILAR_POSTER_WIDTH: number = spacing.xl * 2 + spacing.md;
const SIMILAR_POSTER_HEIGHT: number = spacing.xl * 4;

/**
 * Backdrop, poster + text column, synopsis block, similar-movies row.
 */
export function DetailScreenSkeleton() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <ShimmerPlaceholder style={styles.backdrop} />
      <View style={styles.mainRow}>
        <ShimmerPlaceholder style={styles.poster} />
        <View style={styles.textColumn}>
          <ShimmerPlaceholder style={styles.titleLine} />
          <ShimmerPlaceholder style={styles.metaLine} />
          <ShimmerPlaceholder style={styles.metaLineShort} />
        </View>
      </View>
      <ShimmerPlaceholder style={styles.bodyLine} />
      <ShimmerPlaceholder style={styles.bodyLine} />
      <ShimmerPlaceholder style={styles.bodyLineShort} />
      <ShimmerPlaceholder style={styles.sectionLabel} />
      <View style={styles.similarRow}>
        <ShimmerPlaceholder style={styles.similarPoster} />
        <ShimmerPlaceholder style={styles.similarPoster} />
        <ShimmerPlaceholder style={styles.similarPoster} />
        <ShimmerPlaceholder style={styles.similarPoster} />
      </View>
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
  backdrop: {
    width: '100%',
    height: BACKDROP_HEIGHT,
    borderRadius: spacing.sm,
  },
  mainRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  poster: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: spacing.xs,
  },
  textColumn: {
    flex: 1,
    gap: spacing.sm,
    justifyContent: 'flex-start',
    paddingTop: spacing.xs,
  },
  titleLine: {
    height: spacing.lg + spacing.xs,
    width: '100%',
    borderRadius: spacing.xs,
  },
  metaLine: {
    height: spacing.md,
    width: '70%',
    borderRadius: spacing.xs,
  },
  metaLineShort: {
    height: spacing.md,
    width: '50%',
    borderRadius: spacing.xs,
  },
  bodyLine: {
    height: spacing.sm + spacing.xs,
    width: '100%',
    borderRadius: spacing.xs,
  },
  bodyLineShort: {
    height: spacing.sm + spacing.xs,
    width: '65%',
    borderRadius: spacing.xs,
  },
  sectionLabel: {
    height: spacing.lg,
    width: '40%',
    borderRadius: spacing.xs,
    marginTop: spacing.sm,
  },
  similarRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  similarPoster: {
    width: SIMILAR_POSTER_WIDTH,
    height: SIMILAR_POSTER_HEIGHT,
    borderRadius: spacing.xs,
  },
});
