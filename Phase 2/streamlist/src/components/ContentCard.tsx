import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { posterFrameHeightFromOuterWidth } from '../utils/contentCardLayout';

/** Portrait poster ratio (width : height). */
const POSTER_ASPECT_RATIO: number = 2 / 3;

const ratingStarSize: number = spacing.sm;

/** Two-line title + two-line subtitle so every card has the same text block height in a row. */
const COPY_BLOCK_MIN_HEIGHT: number =
  typography.textStyle.titleLg.lineHeight * 2 +
  spacing.xxs +
  typography.textStyle.labelSm.lineHeight * 2;

export interface ContentCardProps {
  title: string;
  /** e.g. `2024 • Action` */
  subtitle: string;
  imageUri: string | null;
  /** When set, wraps the card in a `Pressable` */
  onPress?: () => void;
  /** When true, shows the rating overlay on the poster */
  showRating?: boolean;
  /** TMDB-style 0–10 average; shown when `showRating` is true */
  ratingValue?: number;
  /** Sets card width in carousels / grid columns; height follows 2:3 poster + text */
  style?: StyleProp<ViewStyle>;
  /**
   * Card width in px (same as `style.width` when fixed). Poster height is
   * `(width × 3) / 2` for an exact 2:3 frame.
   */
  layoutWidth?: number;
}

function formatRating(value: number): string {
  return value.toFixed(1);
}

export function ContentCard(props: ContentCardProps): React.ReactElement {
  const {
    title,
    subtitle,
    imageUri,
    onPress,
    showRating = false,
    ratingValue,
    style,
    layoutWidth,
  } = props;
  const resolvedRating: number | undefined =
    showRating && ratingValue !== undefined && !Number.isNaN(ratingValue) ? ratingValue : undefined;
  const subtitleTrimmed: string = subtitle.trim();
  const accessibilityLabel: string =
    resolvedRating !== undefined
      ? subtitleTrimmed.length > 0
        ? `${title}. ${subtitleTrimmed}. Rating ${formatRating(resolvedRating)}`
        : `${title}. Rating ${formatRating(resolvedRating)}`
      : subtitleTrimmed.length > 0
        ? `${title}. ${subtitleTrimmed}`
        : title;
  const imageFrameLayoutStyle =
    layoutWidth !== undefined
      ? { height: posterFrameHeightFromOuterWidth(layoutWidth) }
      : { aspectRatio: POSTER_ASPECT_RATIO };
  const body = (
    <>
      <View style={[styles.imageFrame, imageFrameLayoutStyle]}>
        {imageUri === null ? (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText} numberOfLines={3}>
              {title}
            </Text>
          </View>
        ) : (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={title}
          />
        )}
        {resolvedRating !== undefined ? (
          <View style={styles.ratingBadge} accessibilityElementsHidden>
            <MaterialIcons
              name="star"
              size={ratingStarSize}
              color={colors.primary_container}
              accessibilityElementsHidden
            />
            <Text style={styles.ratingText}>{formatRating(resolvedRating)}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.copy}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>
        {subtitleTrimmed.length > 0 ? (
          <Text style={styles.cardSubtitle} numberOfLines={2}>
            {subtitleTrimmed}
          </Text>
        ) : null}
      </View>
    </>
  );
  if (onPress !== undefined) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [styles.outer, pressed && styles.outerPressed, style]}
      >
        {body}
      </Pressable>
    );
  }
  return <View style={[styles.outer, style]}>{body}</View>;
}

const styles = StyleSheet.create({
  outer: {
    gap: spacing.xs,
  },
  outerPressed: {
    opacity: 0.92,
  },
  imageFrame: {
    width: '100%',
    borderRadius: spacing.md,
    overflow: 'hidden',
    backgroundColor: colors.surface_container,
    flexShrink: 0,
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  imagePlaceholderText: {
    ...typography.textStyle.labelSm,
    color: colors.on_surface_variant,
    textAlign: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
    borderRadius: spacing.xs,
    backgroundColor: colors.surface_container_highest,
  },
  ratingText: {
    ...typography.textStyle.labelSm,
    color: colors.on_surface,
  },
  copy: {
    minHeight: COPY_BLOCK_MIN_HEIGHT,
    gap: spacing.xxs,
    justifyContent: 'flex-start',
  },
  cardTitle: {
    ...typography.textStyle.titleLg,
    color: colors.on_surface,
  },
  cardSubtitle: {
    ...typography.textStyle.labelSm,
    color: colors.on_surface_variant,
  },
});
