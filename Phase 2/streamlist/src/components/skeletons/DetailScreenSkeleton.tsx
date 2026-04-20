import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ShimmerPlaceholder } from '../common/ShimmerPlaceholder';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

const CAST_SCROLL_GAP: number = spacing.md;

/**
 * Detail loading: full-bleed hero, title, metadata chips, watchlist, synopsis, cast row, similar row.
 */
export function DetailScreenSkeleton(): React.ReactElement {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <ShimmerPlaceholder style={styles.hero} />
      <View style={styles.padded}>
        <ShimmerPlaceholder style={styles.titleLine} />
        <View style={styles.chipRow}>
          <ShimmerPlaceholder style={styles.chip} />
          <ShimmerPlaceholder style={styles.chip} />
          <ShimmerPlaceholder style={styles.chipShort} />
        </View>
        <ShimmerPlaceholder style={styles.watchlist} />
        <ShimmerPlaceholder style={styles.sectionHeading} />
        <ShimmerPlaceholder style={styles.bodyLine} />
        <ShimmerPlaceholder style={styles.bodyLine} />
        <ShimmerPlaceholder style={styles.bodyLineShort} />
        <ShimmerPlaceholder style={styles.sectionHeading} />
        <View style={styles.castRow}>
          {Array.from({ length: 5 }).map((_, index: number) => (
            <View key={`cast-skel-${String(index)}`} style={styles.castItem}>
              <ShimmerPlaceholder style={styles.castAvatar} />
              <ShimmerPlaceholder style={styles.castLine} />
              <ShimmerPlaceholder style={styles.castLineShort} />
            </View>
          ))}
        </View>
        <View style={styles.moreLikeHeader}>
          <ShimmerPlaceholder style={styles.moreLikeTitle} />
          <ShimmerPlaceholder style={styles.seeAll} />
        </View>
        <View style={styles.similarRow}>
          <ShimmerPlaceholder style={styles.similarPoster} />
          <ShimmerPlaceholder style={styles.similarPoster} />
          <ShimmerPlaceholder style={styles.similarPoster} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
  },
  hero: {
    width: '100%',
    height: spacing.detailHeroBackdrop,
    borderRadius: 0,
  },
  padded: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  titleLine: {
    height: typography.textStyle.displayMd.lineHeight,
    width: '85%',
    borderRadius: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    height: spacing.lg,
    width: spacing.xxl + spacing.md,
    borderRadius: spacing.xl,
  },
  chipShort: {
    height: spacing.lg,
    width: spacing.xl,
    borderRadius: spacing.xl,
  },
  watchlist: {
    height: spacing.xl + spacing.sm,
    width: '100%',
    borderRadius: spacing.md,
  },
  sectionHeading: {
    height: typography.textStyle.headlineMd.lineHeight,
    width: '45%',
    borderRadius: spacing.xs,
  },
  bodyLine: {
    height: typography.textStyle.bodyMd.lineHeight,
    width: '100%',
    borderRadius: spacing.xs,
  },
  bodyLineShort: {
    height: typography.textStyle.bodyMd.lineHeight,
    width: '70%',
    borderRadius: spacing.xs,
  },
  castRow: {
    flexDirection: 'row',
    gap: CAST_SCROLL_GAP,
    paddingVertical: spacing.xs,
  },
  castItem: {
    width: spacing.castAvatar + spacing.lg,
    gap: spacing.xs,
  },
  castAvatar: {
    width: spacing.castAvatar,
    height: spacing.castAvatar,
    borderRadius: spacing.castAvatar / 2,
  },
  castLine: {
    height: spacing.sm,
    borderRadius: spacing.xs,
  },
  castLineShort: {
    height: spacing.sm,
    width: '70%',
    borderRadius: spacing.xs,
  },
  moreLikeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  moreLikeTitle: {
    height: typography.textStyle.headlineMd.lineHeight,
    width: '55%',
    borderRadius: spacing.xs,
  },
  seeAll: {
    height: spacing.md,
    width: spacing.xxl,
    borderRadius: spacing.xs,
  },
  similarRow: {
    flexDirection: 'row',
    gap: spacing.xxl,
    paddingVertical: spacing.xs,
  },
  similarPoster: {
    width: spacing.xl * 4,
    height: spacing.xl * 6,
    borderRadius: spacing.md,
  },
});
