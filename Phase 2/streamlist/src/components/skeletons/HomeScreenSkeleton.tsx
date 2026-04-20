import React from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ShimmerPlaceholder } from '../common/ShimmerPlaceholder';
import { spacing } from '../../theme/spacing';
import {
  HOME_HORIZONTAL_CARD_GAP,
  homeContentCardOuterWidth,
  posterFrameHeightFromOuterWidth,
} from '../../utils/contentCardLayout';

const HERO_HEIGHT: number = spacing.xl * 7;

/**
 * Mirrors home layout: section label, hero, horizontal poster row, second section + row.
 */
export function HomeScreenSkeleton() {
  const { width: windowWidth } = useWindowDimensions();
  const contentCardWidth: number = homeContentCardOuterWidth(windowWidth);
  const contentCardPosterHeight: number = posterFrameHeightFromOuterWidth(contentCardWidth);
  const cardPlaceholderStyle = { width: contentCardWidth };
  const posterShimmerStyle = {
    width: contentCardWidth,
    height: contentCardPosterHeight,
  };
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.chipRow}>
        <ShimmerPlaceholder style={styles.chip} />
        <ShimmerPlaceholder style={styles.chip} />
        <ShimmerPlaceholder style={styles.chip} />
        <ShimmerPlaceholder style={styles.chip} />
        <ShimmerPlaceholder style={styles.chip} />
      </View>
      <ShimmerPlaceholder style={styles.sectionTitle} />
      <ShimmerPlaceholder style={styles.hero} />
      <View style={styles.posterRow}>
        <View style={[styles.contentCardPlaceholder, cardPlaceholderStyle]}>
          <ShimmerPlaceholder style={[styles.contentCardPoster, posterShimmerStyle]} />
          <ShimmerPlaceholder style={styles.contentCardTitleLine} />
          <ShimmerPlaceholder style={styles.contentCardSubtitleLine} />
        </View>
        <View style={[styles.contentCardPlaceholder, cardPlaceholderStyle]}>
          <ShimmerPlaceholder style={[styles.contentCardPoster, posterShimmerStyle]} />
          <ShimmerPlaceholder style={styles.contentCardTitleLine} />
          <ShimmerPlaceholder style={styles.contentCardSubtitleLine} />
        </View>
        <View style={[styles.contentCardPlaceholder, cardPlaceholderStyle]}>
          <ShimmerPlaceholder style={[styles.contentCardPoster, posterShimmerStyle]} />
          <ShimmerPlaceholder style={styles.contentCardTitleLine} />
          <ShimmerPlaceholder style={styles.contentCardSubtitleLine} />
        </View>
        <View style={[styles.contentCardPlaceholder, cardPlaceholderStyle]}>
          <ShimmerPlaceholder style={[styles.contentCardPoster, posterShimmerStyle]} />
          <ShimmerPlaceholder style={styles.contentCardTitleLine} />
          <ShimmerPlaceholder style={styles.contentCardSubtitleLine} />
        </View>
      </View>
      <ShimmerPlaceholder style={styles.sectionTitleNarrow} />
      <View style={styles.posterRow}>
        <View style={[styles.contentCardPlaceholder, cardPlaceholderStyle]}>
          <ShimmerPlaceholder style={[styles.contentCardPoster, posterShimmerStyle]} />
          <ShimmerPlaceholder style={styles.contentCardTitleLine} />
          <ShimmerPlaceholder style={styles.contentCardSubtitleLine} />
        </View>
        <View style={[styles.contentCardPlaceholder, cardPlaceholderStyle]}>
          <ShimmerPlaceholder style={[styles.contentCardPoster, posterShimmerStyle]} />
          <ShimmerPlaceholder style={styles.contentCardTitleLine} />
          <ShimmerPlaceholder style={styles.contentCardSubtitleLine} />
        </View>
        <View style={[styles.contentCardPlaceholder, cardPlaceholderStyle]}>
          <ShimmerPlaceholder style={[styles.contentCardPoster, posterShimmerStyle]} />
          <ShimmerPlaceholder style={styles.contentCardTitleLine} />
          <ShimmerPlaceholder style={styles.contentCardSubtitleLine} />
        </View>
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
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    height: spacing.lg,
    width: spacing.xl * 2,
    borderRadius: spacing.sm,
  },
  sectionTitle: {
    height: spacing.lg,
    width: '45%',
    borderRadius: spacing.xs,
  },
  sectionTitleNarrow: {
    height: spacing.lg,
    width: '38%',
    borderRadius: spacing.xs,
    marginTop: spacing.sm,
  },
  hero: {
    width: '100%',
    height: HERO_HEIGHT,
    borderRadius: spacing.sm,
  },
  posterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: HOME_HORIZONTAL_CARD_GAP,
    paddingVertical: spacing.xs,
  },
  contentCardPlaceholder: {
    gap: spacing.xs,
  },
  contentCardPoster: {
    borderRadius: spacing.md,
  },
  contentCardTitleLine: {
    height: spacing.md,
    width: '92%',
    borderRadius: spacing.xs,
  },
  contentCardSubtitleLine: {
    height: spacing.sm,
    width: '64%',
    borderRadius: spacing.xs,
  },
});
