import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type DimensionValue,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Genre, MovieListItem } from '../api/types';
import { ContentCard } from '../components/common/ContentCard';
import { GlobalAppBar } from '../components/common/GlobalAppBar';
import { ScreenErrorBoundary } from '../components/common/ScreenErrorBoundary';
import { ScreenErrorFallback } from '../components/common/ScreenErrorFallback';
import { HomeScreenSkeleton } from '../components/skeletons/HomeScreenSkeleton';
import type { DiscoverGenreRail, HomeGenreSelection, UseHomeResult } from '../hooks/useHome';
import { useHome } from '../hooks/useHome';
import type { MainTabParamList, RootStackParamList, SeeAllScreenParams } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { buildImageUrl, IMAGE_SIZE_BACKDROP, IMAGE_SIZE_CARD, IMAGE_SIZE_HERO } from '../utils/image';
import { shouldLoadMoreMoviesRow } from '../utils/horizontalScroll';
import {
  HOME_HORIZONTAL_CARD_GAP,
  homeContentCardOuterWidth,
  homeHeroPortraitHeight,
  homeHorizontalContentWidth,
} from '../utils/contentCardLayout';
import { buildMovieCardSubtitle } from '../utils/movieCard';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const HERO_GRADIENT_BOTTOM_RATIO: number = 0.58;
const HERO_GRADIENT_HEIGHT: DimensionValue = `${String(Math.round(HERO_GRADIENT_BOTTOM_RATIO * 100))}%` as DimensionValue;
const HERO_TEXT_GAP: number = spacing.sm;
const HERO_BUTTON_COMPACT_FLOOR: number = spacing.lg + spacing.sm;
/** Favor one-line / shorter title style when content width is phone-sized. */
const HERO_NARROW_MAX_CONTENT_WIDTH: number = spacing.lg * 16;
const HERO_PLAY_MIN: number = spacing.lg;
const HERO_PLAY_MAX: number = spacing.xl + spacing.xs;

function buildHeroDescriptionText(item: MovieListItem, allGenres: Genre[]): string {
  if (item.overview !== undefined && item.overview.trim().length > 0) {
    return item.overview.trim();
  }
  return buildMovieCardSubtitle(item, allGenres);
}

interface HomeScreenContentProps {
  home: UseHomeResult;
  selectedGenreKey: HomeGenreSelection;
  onSelectGenre: (key: HomeGenreSelection) => void;
}

function HomeScreenContent(props: HomeScreenContentProps): React.ReactElement {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const navigateToSeeAll = useCallback(
    (params: SeeAllScreenParams): void => {
      navigation.push('SeeAll', params);
    },
    [navigation],
  );
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const heroContentWidth: number = useMemo((): number => {
    return homeHorizontalContentWidth(windowWidth);
  }, [windowWidth]);
  const heroImageHeight: number = useMemo((): number => {
    return homeHeroPortraitHeight(heroContentWidth, windowHeight);
  }, [heroContentWidth, windowHeight]);
  const isNarrowHomeLayout: boolean = heroContentWidth < HERO_NARROW_MAX_CONTENT_WIDTH;
  const heroPlayIconSize: number = useMemo((): number => {
    const scaled: number = Math.round(heroContentWidth * 0.055);
    return Math.max(HERO_PLAY_MIN, Math.min(HERO_PLAY_MAX, scaled));
  }, [heroContentWidth]);
  const heroActionButtonHeight: number = useMemo((): number => {
    return Math.max(HERO_BUTTON_COMPACT_FLOOR, heroPlayIconSize + spacing.xs);
  }, [heroPlayIconSize]);
  const contentCardWidth: number = useMemo(
    (): number => homeContentCardOuterWidth(windowWidth),
    [windowWidth],
  );
  const movieRowItemStride: number = contentCardWidth + HOME_HORIZONTAL_CARD_GAP;
  const { home, selectedGenreKey, onSelectGenre } = props;
  const {
    data,
    loading,
    error,
    errorKind,
    refetch,
    loadMoreDiscover,
    loadMoreTrending,
    loadMoreTopRated,
  } = home;
  const sortedGenres: Genre[] = useMemo((): Genre[] => {
    if (data === null) {
      return [];
    }
    return [...data.genres.genres].sort((a: Genre, b: Genre) => a.name.localeCompare(b.name));
  }, [data]);
  const discoverResults: MovieListItem[] = data?.discoverByGenre?.results ?? [];
  const visibleDiscoverRails: DiscoverGenreRail[] = useMemo((): DiscoverGenreRail[] => {
    const rails: DiscoverGenreRail[] = data?.discoverRails ?? [];
    return rails.filter(
      (rail: DiscoverGenreRail): boolean => rail.discover.results.length > 0,
    );
  }, [data]);
  const trendingResults: MovieListItem[] = data?.trending?.results ?? [];
  const topRatedResults: MovieListItem[] = data?.topRated?.results ?? [];
  const showTrendingRail: boolean =
    (data?.hasTrendingRail ?? false) && trendingResults.length > 0;
  const showTopRatedRail: boolean =
    (data?.hasTopRatedRail ?? false) && topRatedResults.length > 0;
  const onDiscoverRowScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
      if (
        !shouldLoadMoreMoviesRow(event.nativeEvent, movieRowItemStride, discoverResults.length)
      ) {
        return;
      }
      loadMoreDiscover().catch(() => undefined);
    },
    [discoverResults.length, loadMoreDiscover, movieRowItemStride],
  );
  const onDiscoverRailScroll = useCallback(
    (genreId: number, resultCount: number) =>
      (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
        if (!shouldLoadMoreMoviesRow(event.nativeEvent, movieRowItemStride, resultCount)) {
          return;
        }
        loadMoreDiscover(genreId).catch(() => undefined);
      },
    [loadMoreDiscover, movieRowItemStride],
  );
  const onTrendingRowScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
      if (
        !shouldLoadMoreMoviesRow(event.nativeEvent, movieRowItemStride, trendingResults.length)
      ) {
        return;
      }
      loadMoreTrending().catch(() => undefined);
    },
    [loadMoreTrending, trendingResults.length, movieRowItemStride],
  );
  const onTopRatedRowScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
      if (
        !shouldLoadMoreMoviesRow(event.nativeEvent, movieRowItemStride, topRatedResults.length)
      ) {
        return;
      }
      loadMoreTopRated().catch(() => undefined);
    },
    [loadMoreTopRated, topRatedResults.length, movieRowItemStride],
  );
  const heroMovie: MovieListItem | null = useMemo((): MovieListItem | null => {
    if (data === null) {
      return null;
    }
    const fromTrending: MovieListItem[] = data.trending?.results ?? [];
    if (fromTrending.length > 0) {
      return fromTrending[0];
    }
    const fromTopRated: MovieListItem[] = data.topRated?.results ?? [];
    if (fromTopRated.length > 0) {
      return fromTopRated[0];
    }
    if (data.discoverByGenre !== null && data.discoverByGenre.results.length > 0) {
      return data.discoverByGenre.results[0];
    }
    const rails: DiscoverGenreRail[] = data.discoverRails ?? [];
    for (const rail of rails) {
      if (rail.discover.results.length > 0) {
        return rail.discover.results[0];
      }
    }
    return null;
  }, [data]);
  const heroImageUri: string | null = useMemo((): string | null => {
    if (heroMovie === null) {
      return null;
    }
    if (heroMovie.poster_path !== null && heroMovie.poster_path.length > 0) {
      return buildImageUrl(heroMovie.poster_path, IMAGE_SIZE_HERO);
    }
    return buildImageUrl(heroMovie.backdrop_path, IMAGE_SIZE_BACKDROP);
  }, [heroMovie]);
  const heroDescriptionText: string = useMemo((): string => {
    if (data === null || heroMovie === null) {
      return '';
    }
    return buildHeroDescriptionText(heroMovie, data.genres.genres);
  }, [data, heroMovie]);
  if (error !== null) {
    return (
      <ScreenErrorFallback
        reason={errorKind === 'network' ? 'network' : 'generic'}
        onTryAgain={refetch}
      />
    );
  }
  if (loading || data === null) {
    return <HomeScreenSkeleton />;
  }
  const onOpenMovie = (item: MovieListItem): void => {
    navigation.navigate('Detail', { movieId: item.id });
  };
  const discoverSectionTitle: string =
    selectedGenreKey === 'all'
      ? 'All'
      : data.genres.genres.find((g: Genre) => g.id === selectedGenreKey)?.name ?? '';
  const genreList: Genre[] = data.genres.genres;
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.genreChipRow}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: selectedGenreKey === 'all' }}
          accessibilityLabel="All genres"
          onPress={(): void => {
            onSelectGenre('all');
          }}
          style={({ pressed }) => [
            styles.genreChip,
            selectedGenreKey === 'all' ? styles.genreChipActive : styles.genreChipInactive,
            pressed && styles.genreChipPressed,
          ]}
        >
          <Text
            style={selectedGenreKey === 'all' ? styles.genreChipTextActive : styles.genreChipTextInactive}
          >
            All
          </Text>
        </Pressable>
        {sortedGenres.map((genre: Genre) => {
          const isActive: boolean = selectedGenreKey === genre.id;
          return (
            <Pressable
              key={genre.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={genre.name}
              onPress={(): void => {
                onSelectGenre(genre.id);
              }}
              style={({ pressed }) => [
                styles.genreChip,
                isActive ? styles.genreChipActive : styles.genreChipInactive,
                pressed && styles.genreChipPressed,
              ]}
            >
              <Text style={isActive ? styles.genreChipTextActive : styles.genreChipTextInactive}>
                {genre.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {heroMovie !== null ? (
        <View
          style={styles.heroSection}
          accessibilityLabel={`Spotlight, ${heroMovie.title}`}
          importantForAccessibility="yes"
        >
          <View style={styles.heroImageFrame}>
            {heroImageUri === null ? (
              <View
                style={[styles.heroImage, { height: heroImageHeight }, styles.heroImagePlaceholder]}
              >
                <Text style={styles.heroPlaceholderText} numberOfLines={2}>
                  {heroMovie.title}
                </Text>
              </View>
            ) : (
              <Image
                source={{ uri: heroImageUri }}
                style={[styles.heroImage, { height: heroImageHeight }]}
                resizeMode="cover"
                accessibilityLabel={heroMovie.title}
              />
            )}
            <LinearGradient
              colors={['transparent', colors.surface]}
              locations={[0, 1]}
              style={[styles.heroBottomGradient, { height: HERO_GRADIENT_HEIGHT }]}
              pointerEvents="none"
            />
            <View style={styles.heroOverlay} pointerEvents="box-none">
              <View style={styles.heroBadge} accessibilityElementsHidden>
                <Text style={styles.heroBadgeText}>New release</Text>
              </View>
              <Text
                style={[styles.heroTitle, isNarrowHomeLayout ? styles.heroTitleNarrow : undefined]}
                numberOfLines={2}
              >
                {heroMovie.title.toUpperCase()}
              </Text>
              {heroDescriptionText.length > 0 ? (
                <Text style={styles.heroDescription} numberOfLines={2} ellipsizeMode="tail">
                  {heroDescriptionText}
                </Text>
              ) : null}
              <View style={styles.heroButtonRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Watch now"
                  onPress={(): void => {
                    onOpenMovie(heroMovie);
                  }}
                  style={({ pressed }) => [
                    { minHeight: heroActionButtonHeight },
                    styles.heroButtonPrimary,
                    styles.heroButtonBase,
                    pressed && styles.heroButtonPrimaryPressed,
                  ]}
                >
                  <View style={styles.heroWatchNowInner} accessibilityElementsHidden>
                    <MaterialIcons
                      name="play-arrow"
                      size={heroPlayIconSize}
                      color={colors.secondary_container}
                    />
                    <Text style={styles.heroWatchNowLabel} numberOfLines={1}>
                      Watch now
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Show details"
                  onPress={(): void => {
                    onOpenMovie(heroMovie);
                  }}
                  style={({ pressed }) => [
                    { minHeight: heroActionButtonHeight },
                    styles.heroButtonSecondary,
                    styles.heroButtonBase,
                    pressed && styles.heroButtonSecondaryPressed,
                  ]}
                >
                  <Text style={styles.heroDetailsLabel} numberOfLines={2}>
                    Show Details
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      ) : null}
      {selectedGenreKey === 'all' && visibleDiscoverRails.length > 0
        ? visibleDiscoverRails.map((rail: DiscoverGenreRail) => (
              <React.Fragment key={rail.genreId}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitleInRow} numberOfLines={1}>
                    {rail.genreName}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="See all in this section"
                    onPress={(): void => {
                      navigateToSeeAll({
                        rail: 'discover',
                        screenTitle: rail.genreName,
                        discoverGenreKey: rail.genreId,
                      });
                    }}
                    style={({ pressed }) => [styles.seeAllPressable, pressed && styles.seeAllPressed]}
                  >
                    <Text style={styles.seeAllLink}>See All</Text>
                  </Pressable>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalRow}
                  scrollEventThrottle={16}
                  onScroll={onDiscoverRailScroll(rail.genreId, rail.discover.results.length)}
                >
                  {rail.discover.results.map((item: MovieListItem) => (
                    <ContentCard
                      key={item.id}
                      title={item.title}
                      subtitle={buildMovieCardSubtitle(item, genreList)}
                      imageUri={buildImageUrl(item.poster_path, IMAGE_SIZE_CARD)}
                      showRating
                      ratingValue={item.vote_average}
                      onPress={(): void => {
                        onOpenMovie(item);
                      }}
                      layoutWidth={contentCardWidth}
                      style={{ width: contentCardWidth }}
                    />
                  ))}
                </ScrollView>
              </React.Fragment>
            ))
        : discoverResults.length > 0 && discoverSectionTitle.length > 0 ? (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitleInRow} numberOfLines={1}>
                  {discoverSectionTitle}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="See all in this section"
                  onPress={(): void => {
                    navigateToSeeAll({
                      rail: 'discover',
                      screenTitle: discoverSectionTitle,
                      discoverGenreKey: selectedGenreKey,
                    });
                  }}
                  style={({ pressed }) => [styles.seeAllPressable, pressed && styles.seeAllPressed]}
                >
                  <Text style={styles.seeAllLink}>See All</Text>
                </Pressable>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalRow}
                scrollEventThrottle={16}
                onScroll={onDiscoverRowScroll}
              >
                {discoverResults.map((item: MovieListItem) => (
                  <ContentCard
                    key={item.id}
                    title={item.title}
                    subtitle={buildMovieCardSubtitle(item, genreList)}
                    imageUri={buildImageUrl(item.poster_path, IMAGE_SIZE_CARD)}
                    showRating
                    ratingValue={item.vote_average}
                    onPress={(): void => {
                      onOpenMovie(item);
                    }}
                    layoutWidth={contentCardWidth}
                    style={{ width: contentCardWidth }}
                  />
                ))}
              </ScrollView>
            </>
          ) : null}
      {showTrendingRail ? (
        <>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitleInRow}>Trending</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="See all trending movies"
              onPress={(): void => {
                navigateToSeeAll({
                  rail: 'trending',
                  screenTitle: 'Trending',
                });
              }}
              style={({ pressed }) => [styles.seeAllPressable, pressed && styles.seeAllPressed]}
            >
              <Text style={styles.seeAllLink}>See All</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalRow}
            scrollEventThrottle={16}
            onScroll={onTrendingRowScroll}
          >
            {trendingResults.map((item: MovieListItem) => (
              <ContentCard
                key={item.id}
                title={item.title}
                subtitle={buildMovieCardSubtitle(item, genreList)}
                imageUri={buildImageUrl(item.poster_path, IMAGE_SIZE_CARD)}
                showRating
                ratingValue={item.vote_average}
                onPress={(): void => {
                  onOpenMovie(item);
                }}
                layoutWidth={contentCardWidth}
                style={{ width: contentCardWidth }}
              />
            ))}
          </ScrollView>
        </>
      ) : null}
      {showTopRatedRail ? (
        <>
          <View style={[styles.sectionHeaderRow, styles.sectionSpaced]}>
            <Text style={styles.sectionTitleInRow}>Top rated</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="See all top rated movies"
              onPress={(): void => {
                navigateToSeeAll({
                  rail: 'topRated',
                  screenTitle: 'Top rated',
                });
              }}
              style={({ pressed }) => [styles.seeAllPressable, pressed && styles.seeAllPressed]}
            >
              <Text style={styles.seeAllLink}>See All</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalRow}
            scrollEventThrottle={16}
            onScroll={onTopRatedRowScroll}
          >
            {topRatedResults.map((item: MovieListItem) => (
              <ContentCard
                key={item.id}
                title={item.title}
                subtitle={buildMovieCardSubtitle(item, genreList)}
                imageUri={buildImageUrl(item.poster_path, IMAGE_SIZE_CARD)}
                showRating
                ratingValue={item.vote_average}
                onPress={(): void => {
                  onOpenMovie(item);
                }}
                layoutWidth={contentCardWidth}
                style={{ width: contentCardWidth }}
              />
            ))}
          </ScrollView>
        </>
      ) : null}
    </ScrollView>
  );
}

export function HomeScreen(): React.ReactElement {
  const [selectedGenreKey, setSelectedGenreKey] = useState<HomeGenreSelection>('all');
  const home = useHome(selectedGenreKey);
  const onSelectGenre = (key: HomeGenreSelection): void => {
    setSelectedGenreKey(key);
  };
  return (
    <View style={styles.screenWrap}>
      <GlobalAppBar />
      <SafeAreaView style={styles.root} edges={['left', 'right']}>
        <ScreenErrorBoundary onRetry={home.refetch}>
          <HomeScreenContent
            home={home}
            selectedGenreKey={selectedGenreKey}
            onSelectGenre={onSelectGenre}
          />
        </ScreenErrorBoundary>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrap: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
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
  genreChipActive: {
    backgroundColor: colors.secondary_container,
  },
  genreChipInactive: {
    backgroundColor: colors.surface_container,
  },
  genreChipPressed: {
    opacity: 0.92,
  },
  genreChipTextActive: {
    ...typography.textStyle.titleSm,
    color: colors.on_surface,
  },
  genreChipTextInactive: {
    ...typography.textStyle.titleSm,
    color: colors.on_surface_variant,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  sectionTitleInRow: {
    ...typography.textStyle.headlineMd,
    color: colors.on_surface,
    flexShrink: 1,
  },
  seeAllPressable: {
    flexShrink: 0,
  },
  seeAllPressed: {
    opacity: 0.88,
  },
  seeAllLink: {
    fontFamily: typography.fontFamily.interMedium,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.tight,
    color: colors.on_surface_variant,
  },
  sectionSpaced: {
    marginTop: spacing.sm,
  },
  horizontalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: HOME_HORIZONTAL_CARD_GAP,
    paddingVertical: spacing.xs,
  },
  heroSection: {
    width: '100%',
  },
  heroImageFrame: {
    borderRadius: spacing.md,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    backgroundColor: colors.surface_container,
  },
  heroImage: {
    width: '100%',
    backgroundColor: colors.surface_container,
  },
  heroImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  heroPlaceholderText: {
    ...typography.textStyle.titleLg,
    color: colors.on_surface_variant,
    textAlign: 'center',
  },
  heroBottomGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: HERO_TEXT_GAP,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.xs,
    backgroundColor: colors.primary_container,
    maxWidth: '100%',
  },
  heroBadgeText: {
    ...typography.textStyle.labelSm,
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.on_surface,
    textTransform: 'uppercase',
  },
  heroTitle: {
    ...typography.textStyle.displayMd,
    color: colors.on_surface,
    textTransform: 'uppercase',
  },
  heroTitleNarrow: {
    fontFamily: typography.textStyle.displayMd.fontFamily,
    fontSize: typography.textStyle.headlineMd.fontSize,
    lineHeight: typography.textStyle.headlineMd.lineHeight,
    letterSpacing: typography.textStyle.headlineMd.letterSpacing,
  },
  heroDescription: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface,
  },
  heroButtonRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  heroButtonBase: {
    flex: 1,
    borderRadius: spacing.xxs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroButtonPrimary: {
    backgroundColor: colors.primary,
  },
  heroButtonPrimaryPressed: {
    opacity: 0.9,
  },
  heroButtonSecondary: {
    backgroundColor: colors.hero_button_secondary,
  },
  heroButtonSecondaryPressed: {
    opacity: 0.9,
  },
  heroWatchNowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    width: '100%',
    gap: spacing.xs,
  },
  heroWatchNowLabel: {
    ...typography.textStyle.titleSm,
    textAlign: 'center',
    color: colors.secondary_container,
  },
  heroDetailsLabel: {
    width: '100%',
    textAlign: 'center',
    ...typography.textStyle.titleSm,
    textTransform: 'none',
    fontFamily: typography.fontFamily.interSemiBold,
    color: colors.on_surface,
  },
});
