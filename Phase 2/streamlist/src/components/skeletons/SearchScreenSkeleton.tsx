import React from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ShimmerPlaceholder } from '../common/ShimmerPlaceholder';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import {
  contentCardCopyBlockMinHeight,
  HOME_HORIZONTAL_CARD_GAP,
  homeContentCardOuterWidth,
  posterFrameHeightFromOuterWidth,
} from '../../utils/contentCardLayout';

const FEATURED_ASPECT_RATIO: number = 16 / 9;
const BADGE_SHIMMER_WIDTH: number = spacing.xl * 2;
const GRID_PLACEHOLDER_COUNT: number = 6;
const GENRE_CHIP_PLACEHOLDER_COUNT: number = 6;

/**
 * Search loading: genre chips (same dimensions as Home), featured landscape + FEATURED badge,
 * then a grid of placeholders matching {@link ContentCard} (poster frame, rating badge slot, copy block).
 */
export function SearchScreenSkeleton() {
  const { width: windowWidth } = useWindowDimensions();
  const contentCardWidth: number = homeContentCardOuterWidth(windowWidth);
  const posterHeight: number = posterFrameHeightFromOuterWidth(contentCardWidth);
  return (
    <View style={styles.root}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.genreChipRow}
      >
        {Array.from({ length: GENRE_CHIP_PLACEHOLDER_COUNT }, (_: unknown, index: number) => (
          <View
            key={index}
            style={[styles.genreChip, styles.genreChipInactive]}
            accessibilityElementsHidden
          >
            <ShimmerPlaceholder style={styles.genreChipTextShimmer} />
          </View>
        ))}
      </ScrollView>
      <View style={styles.featuredBlock}>
        <View style={styles.featuredFrame}>
          <ShimmerPlaceholder style={styles.featuredBackdrop} />
          <View style={styles.featuredBadgeAnchor} accessibilityElementsHidden>
            <ShimmerPlaceholder style={styles.featuredBadge} />
          </View>
        </View>
        <ShimmerPlaceholder style={styles.featuredTitleLine} />
        <ShimmerPlaceholder style={styles.featuredMetaLine} />
      </View>
      <View style={styles.grid}>
        {Array.from({ length: GRID_PLACEHOLDER_COUNT }, (_: unknown, index: number) => (
          <ContentCardSkeletonCell
            key={index}
            contentCardWidth={contentCardWidth}
            posterHeight={posterHeight}
          />
        ))}
      </View>
    </View>
  );
}

function ContentCardSkeletonCell(props: {
  contentCardWidth: number;
  posterHeight: number;
}): React.ReactElement {
  const { contentCardWidth, posterHeight } = props;
  return (
    <View style={[styles.contentCardOuter, { width: contentCardWidth }]}>
      <View style={[styles.imageFrame, { height: posterHeight }]}>
        <ShimmerPlaceholder
          style={[styles.posterShimmer, { width: contentCardWidth, height: posterHeight }]}
        />
        <View style={styles.ratingBadgeAnchor} accessibilityElementsHidden>
          <ShimmerPlaceholder style={styles.ratingBadgeShimmer} />
        </View>
      </View>
      <View style={styles.copy}>
        <ShimmerPlaceholder style={styles.cardTitleLine} />
        <ShimmerPlaceholder style={styles.cardTitleLineShort} />
        <ShimmerPlaceholder style={styles.cardSubtitleLine} />
        <ShimmerPlaceholder style={styles.cardSubtitleLineShort} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: spacing.md,
  },
  genreChipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  genreChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xl,
  },
  genreChipInactive: {
    backgroundColor: colors.surface_container,
  },
  genreChipTextShimmer: {
    width: spacing.xl * 2,
    height: typography.textStyle.titleSm.lineHeight,
    borderRadius: spacing.xs,
  },
  featuredBlock: {
    gap: spacing.xs,
  },
  featuredFrame: {
    borderRadius: spacing.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surface_container,
  },
  featuredBackdrop: {
    width: '100%',
    aspectRatio: FEATURED_ASPECT_RATIO,
    borderRadius: spacing.md,
  },
  featuredBadgeAnchor: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  featuredBadge: {
    width: BADGE_SHIMMER_WIDTH,
    height: spacing.lg,
    borderRadius: spacing.xs,
  },
  featuredTitleLine: {
    height: typography.textStyle.titleLg.lineHeight,
    width: '72%',
    borderRadius: spacing.xs,
  },
  featuredMetaLine: {
    height: typography.textStyle.labelSm.lineHeight,
    width: '48%',
    borderRadius: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HOME_HORIZONTAL_CARD_GAP,
    justifyContent: 'space-between',
  },
  contentCardOuter: {
    gap: spacing.xs,
  },
  imageFrame: {
    width: '100%',
    borderRadius: spacing.md,
    overflow: 'hidden',
    backgroundColor: colors.surface_container,
    position: 'relative',
  },
  posterShimmer: {
    borderRadius: spacing.md,
  },
  ratingBadgeAnchor: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
  ratingBadgeShimmer: {
    width: spacing.xl + spacing.sm,
    height: spacing.lg,
    borderRadius: spacing.xs,
  },
  copy: {
    minHeight: contentCardCopyBlockMinHeight,
    gap: spacing.xxs,
    justifyContent: 'flex-start',
  },
  cardTitleLine: {
    height: typography.textStyle.titleLg.lineHeight,
    width: '100%',
    borderRadius: spacing.xs,
  },
  cardTitleLineShort: {
    height: typography.textStyle.titleLg.lineHeight,
    width: '88%',
    borderRadius: spacing.xs,
  },
  cardSubtitleLine: {
    height: typography.textStyle.labelSm.lineHeight,
    width: '72%',
    borderRadius: spacing.xs,
  },
  cardSubtitleLineShort: {
    height: typography.textStyle.labelSm.lineHeight,
    width: '56%',
    borderRadius: spacing.xs,
  },
});
