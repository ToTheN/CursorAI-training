import { Platform, type TextStyle } from 'react-native';

/**
 * Manrope + Inter (bundled from @expo-google-fonts via assets/fonts).
 * iOS uses family names from the font files; Android uses linked file names.
 */
const manropeRegular: string = Platform.select({
  ios: 'Manrope-Regular',
  android: 'Manrope_400Regular',
  default: 'Manrope_400Regular',
});

const manropeSemiBold: string = Platform.select({
  ios: 'Manrope-SemiBold',
  android: 'Manrope_600SemiBold',
  default: 'Manrope_600SemiBold',
});

const manropeBold: string = Platform.select({
  ios: 'Manrope-Bold',
  android: 'Manrope_700Bold',
  default: 'Manrope_700Bold',
});

const interRegular: string = Platform.select({
  ios: 'Inter-Regular',
  android: 'Inter_400Regular',
  default: 'Inter_400Regular',
});

const interMedium: string = Platform.select({
  ios: 'Inter-Medium',
  android: 'Inter_500Medium',
  default: 'Inter_500Medium',
});

const interSemiBold: string = Platform.select({
  ios: 'Inter-SemiBold',
  android: 'Inter_600SemiBold',
  default: 'Inter_600SemiBold',
});

export const typography = {
  fontFamily: {
    manropeRegular,
    manropeSemiBold,
    manropeBold,
    interRegular,
    interMedium,
    interSemiBold,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  lineHeight: {
    tight: 20,
    normal: 22,
    relaxed: 26,
  },
  /**
   * Semantic type scale (design tokens). Display weights specify 800; the bundled
   * Manrope Bold file is 700 — the closest available weight in assets/fonts.
   */
  textStyle: {
    /** Hero titles */
    displayLg: {
      fontFamily: manropeBold,
      fontSize: 56,
      lineHeight: 64,
      letterSpacing: -1.12,
    } satisfies TextStyle,
    /** Screen titles (e.g. "My Watchlist") */
    displayMd: {
      fontFamily: manropeBold,
      fontSize: 40,
      lineHeight: 48,
      letterSpacing: -0.8,
    } satisfies TextStyle,
    /** Section headers ("Trending Now") */
    headlineMd: {
      fontFamily: manropeBold,
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.28,
    } satisfies TextStyle,
    /** Card titles */
    titleLg: {
      fontFamily: manropeSemiBold,
      fontSize: 20,
      lineHeight: 26,
      letterSpacing: 0,
    } satisfies TextStyle,
    /** Buttons, labels */
    titleSm: {
      fontFamily: interSemiBold,
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0,
    } satisfies TextStyle,
    /** Synopsis, body copy */
    bodyMd: {
      fontFamily: interRegular,
      fontSize: 14,
      lineHeight: 22,
      letterSpacing: 0,
    } satisfies TextStyle,
    /** Metadata (year, genre, rating) */
    labelSm: {
      fontFamily: interRegular,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0,
    } satisfies TextStyle,
  },
} as const;
