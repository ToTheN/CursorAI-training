import React from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { ShimmerPlaceholder } from '../common/ShimmerPlaceholder';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import {
  HOME_HORIZONTAL_CARD_GAP,
  homeContentCardOuterWidth,
  homeHeroPortraitHeight,
  homeHorizontalContentWidth,
  posterFrameHeightFromOuterWidth,
} from '../../utils/contentCardLayout';

/**
 * Mirrors home layout: chip row, portrait hero + CTA shimmers, section label, horizontal rows.
 */
export function HomeScreenSkeleton() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const heroContentW: number = homeHorizontalContentWidth(windowWidth);
  const heroH: number = homeHeroPortraitHeight(heroContentW, windowHeight);
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
      <View style={styles.heroBlock} accessibilityElementsHidden>
        <View style={styles.heroImageFrame}>
          <ShimmerPlaceholder style={[styles.heroPortrait, { height: heroH }]} />
          <View style={styles.heroBadgeAnchor}>
            <ShimmerPlaceholder style={styles.heroBadgeShimmer} />
          </View>
          <View style={styles.heroOnImage}>
            <ShimmerPlaceholder style={styles.heroTitleLine} />
            <View style={styles.heroButtonRow}>
              <ShimmerPlaceholder style={styles.heroButtonShimmer} />
              <ShimmerPlaceholder style={styles.heroButtonShimmer} />
            </View>
          </View>
        </View>
      </View>
      <ShimmerPlaceholder style={styles.sectionTitle} />
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
  heroBlock: {
    gap: spacing.xs,
  },
  heroImageFrame: {
    position: 'relative',
    width: '100%',
    borderRadius: spacing.md,
    overflow: 'hidden',
  },
  heroPortrait: {
    width: '100%',
    borderRadius: spacing.md,
  },
  heroOnImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  heroBadgeAnchor: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  heroBadgeShimmer: {
    width: spacing.xl * 2,
    height: spacing.lg,
    borderRadius: spacing.xs,
  },
  heroTitleLine: {
    height: typography.textStyle.displayMd.lineHeight,
    width: '78%',
    borderRadius: spacing.xs,
  },
  heroButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroButtonShimmer: {
    flex: 1,
    height: spacing.lg + spacing.sm,
    borderRadius: spacing.xxs,
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
