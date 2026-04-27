import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Genre, MovieListItem } from '../api/types';
import { ContentCard } from '../components/common/ContentCard';
import { GlobalAppBar } from '../components/common/GlobalAppBar';
import { ScreenErrorBoundary } from '../components/common/ScreenErrorBoundary';
import {
  ScreenErrorFallback,
  type ScreenErrorReason,
} from '../components/common/ScreenErrorFallback';
import { SearchScreenSkeleton } from '../components/skeletons/SearchScreenSkeleton';
import { ShimmerPlaceholder } from '../components/common/ShimmerPlaceholder';
import { useRecentSearches } from '../hooks/useRecentSearches';
import { useSearch, type UseSearchResult } from '../hooks/useSearch';
import {
  useSearchBrowseData,
  type UseSearchBrowseDataResult,
} from '../hooks/useSearchBrowseData';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { HOME_HORIZONTAL_CARD_GAP, homeContentCardOuterWidth } from '../utils/contentCardLayout';
import { buildImageUrl, IMAGE_SIZE_BACKDROP, IMAGE_SIZE_CARD } from '../utils/image';
import { buildMovieCardSubtitle } from '../utils/movieCard';

type SearchScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Search'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const SEARCH_BAR_CORNER_RADIUS: number = 12;
const CLEAR_FILTER_CORNER_RADIUS: number = 10;
const FEATURED_BACKDROP_ASPECT: number = 16 / 9;

const SEARCH_BAR_MIN_HEIGHT: number =
  typography.textStyle.titleSm.lineHeight + spacing.sm * 2 + 5;

const MAGNIFIER_ICON_SIZE: number = 20;
const CLOCK_ICON_SIZE: number = 20;
const ZERO_RESULTS_ICON_SIZE: number = 56;
const RATING_STAR_SIZE: number = spacing.sm;

function formatVoteAverage(value: number): string {
  return value.toFixed(1);
}

function formatRuntimeMinutes(minutes: number | null): string {
  if (minutes === null || minutes <= 0) {
    return '';
  }
  const hours: number = Math.floor(minutes / 60);
  const mins: number = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

function buildFeaturedMetaLine(
  item: MovieListItem,
  allGenres: Genre[],
  runtimeMinutes: number | null,
): string {
  const genreNames: string[] = item.genre_ids
    .map((id: number) => allGenres.find((g: Genre) => g.id === id)?.name)
    .filter((name: string | undefined): name is string => name !== undefined);
  const genrePart: string = genreNames[0] ?? '';
  const year: string = item.release_date.length >= 4 ? item.release_date.slice(0, 4) : '';
  const runtimePart: string = formatRuntimeMinutes(runtimeMinutes);
  const parts: string[] = [];
  if (genrePart.length > 0) {
    parts.push(genrePart);
  }
  if (year.length > 0) {
    parts.push(year);
  }
  if (runtimePart.length > 0) {
    parts.push(runtimePart);
  }
  return parts.join(' • ');
}

function SearchResultCard(props: { item: MovieListItem }): React.ReactElement {
  const { item } = props;
  const uri: string | null = buildImageUrl(item.poster_path, IMAGE_SIZE_CARD);
  const year: string = item.release_date.length >= 4 ? item.release_date.slice(0, 4) : '';
  return (
    <View style={styles.resultCard}>
      <View style={styles.resultPosterFrame}>
        {uri === null ? (
          <View style={[styles.resultPoster, styles.resultPosterPlaceholder]}>
            <Text style={styles.resultPosterFallback} numberOfLines={3}>
              {item.title}
            </Text>
          </View>
        ) : (
          <Image source={{ uri }} style={styles.resultPoster} accessibilityLabel={item.title} />
        )}
        <View style={styles.resultRatingBadge} accessibilityElementsHidden>
          <MaterialIcons
            name="star"
            size={RATING_STAR_SIZE}
            color={colors.primary_container}
            accessibilityElementsHidden
          />
          <Text style={styles.resultRatingText}>{formatVoteAverage(item.vote_average)}</Text>
        </View>
      </View>
      <Text style={styles.resultCardTitle} numberOfLines={2}>
        {item.title}
      </Text>
      {year.length > 0 ? (
        <Text style={styles.resultCardYear} numberOfLines={1}>
          {year}
        </Text>
      ) : null}
    </View>
  );
}

function SearchScreenContent(props: {
  query: string;
  setQuery: (value: string) => void;
  search: UseSearchResult;
  browse: UseSearchBrowseDataResult;
  recentSearches: string[];
  clearAllRecentSearches: () => void;
}): React.ReactElement {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { width: windowWidth } = useWindowDimensions();
  const contentCardWidth: number = useMemo(
    (): number => homeContentCardOuterWidth(windowWidth),
    [windowWidth],
  );
  const { query, setQuery, search, browse, recentSearches, clearAllRecentSearches } = props;
  const { data, loading, error, errorKind, refetch, debouncedQuery, isDebouncing } = search;
  const searchApiErrorReason: ScreenErrorReason =
    errorKind === 'network' ? 'network' : 'generic';
  const browseApiErrorReason: ScreenErrorReason =
    browse.errorKind === 'network' ? 'network' : 'generic';
  const trimmed: string = query.trim();
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const sortedGenres: Genre[] = useMemo((): Genre[] => {
    return [...browse.genres].sort((a: Genre, b: Genre) => a.name.localeCompare(b.name));
  }, [browse.genres]);
  useEffect((): void => {
    if (selectedGenreId === null) {
      return;
    }
    const genre: Genre | undefined = sortedGenres.find((g: Genre) => g.id === selectedGenreId);
    if (genre === undefined || query.trim() !== genre.name) {
      setSelectedGenreId(null);
    }
  }, [query, selectedGenreId, sortedGenres]);
  const onOpenMovie = (item: MovieListItem): void => {
    navigation.navigate('Detail', { movieId: item.id });
  };
  const onClearGenreFilter = useCallback((): void => {
    setSelectedGenreId(null);
    setQuery('');
  }, [setQuery]);
  const onBlurSearch = useCallback((): void => {
    setIsSearchFocused(false);
  }, []);
  const results: MovieListItem[] = data?.results ?? [];
  const debouncedTrimmed: string = debouncedQuery.trim();
  const totalResults: number = data?.total_results ?? 0;
  const showSkeleton: boolean = trimmed.length > 0 && (isDebouncing || loading);
  const showSearchGrid: boolean =
    trimmed.length > 0 &&
    !isDebouncing &&
    !loading &&
    error === null &&
    results.length > 0;
  const showSearchZero: boolean =
    trimmed.length > 0 &&
    !isDebouncing &&
    !loading &&
    error === null &&
    data !== null &&
    totalResults === 0;
  const showResultCount: boolean = showSearchGrid;
  const showRecentBlock: boolean =
    trimmed.length === 0 && recentSearches.length > 0;
  const featured: MovieListItem | undefined = browse.trending[0];
  const trendingRest: MovieListItem[] = browse.trending.slice(1);
  const featuredBackdropUri: string | null =
    featured !== undefined
      ? buildImageUrl(featured.backdrop_path ?? featured.poster_path, IMAGE_SIZE_BACKDROP)
      : null;
  const featuredMeta: string =
    featured !== undefined
      ? buildFeaturedMetaLine(featured, browse.genres, browse.featuredRuntimeMinutes)
      : '';
  const browseBody: React.ReactElement = (
      <>
        {selectedGenreId !== null ? (
          <View style={styles.clearFilterRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Clear genre filter"
              onPress={onClearGenreFilter}
              style={({ pressed }) => [styles.clearFilterButton, pressed && styles.clearFilterPressed]}
            >
              <Text style={styles.clearFilterLabel}>Clear filter</Text>
            </Pressable>
          </View>
        ) : null}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreChipRow}
        >
          {sortedGenres.map((genre: Genre) => {
            const isActive: boolean = selectedGenreId === genre.id;
            return (
              <Pressable
                key={genre.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={genre.name}
                onPress={(): void => {
                  setSelectedGenreId(genre.id);
                  setQuery(genre.name);
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
        {showRecentBlock ? (
          <View style={styles.recentSection}>
            <View style={styles.recentHeaderRow}>
              <Text style={styles.recentSectionTitle} numberOfLines={1}>
                Recent Searches
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear all recent searches"
                onPress={clearAllRecentSearches}
                style={({ pressed }) => [styles.clearAllPressable, pressed && styles.clearAllPressed]}
              >
                <Text style={styles.clearAllText}>CLEAR ALL</Text>
              </Pressable>
            </View>
            {recentSearches.slice(0, 5).map((term: string) => (
              <Pressable
                key={term}
                accessibilityRole="button"
                accessibilityLabel={`Recent search ${term}`}
                onPress={(): void => {
                  setQuery(term);
                }}
                style={({ pressed }) => [styles.recentRow, pressed && styles.recentRowPressed]}
              >
                <MaterialIcons
                  name="schedule"
                  size={CLOCK_ICON_SIZE}
                  color={colors.on_surface_variant}
                  accessibilityElementsHidden
                />
                <Text style={styles.recentTerm} numberOfLines={2}>
                  {term}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {featured !== undefined ? (
          <View style={styles.trendingSection}>
            <Text style={styles.trendingSectionTitle}>Trending Now</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Featured ${featured.title}`}
              onPress={(): void => {
                onOpenMovie(featured);
              }}
              style={({ pressed }) => [styles.featuredCard, pressed && styles.featuredCardPressed]}
            >
              <View style={styles.featuredImageFrame}>
                {featuredBackdropUri === null ? (
                  <View style={[styles.featuredImage, styles.featuredImagePlaceholder]}>
                    <Text style={styles.featuredPlaceholderText} numberOfLines={2}>
                      {featured.title}
                    </Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: featuredBackdropUri }}
                    style={styles.featuredImage}
                    resizeMode="cover"
                    accessibilityLabel={featured.title}
                  />
                )}
                <View style={styles.featuredBadge} accessibilityElementsHidden>
                  <Text style={styles.featuredBadgeText}>FEATURED</Text>
                </View>
              </View>
              <Text style={styles.featuredTitle} numberOfLines={2}>
                {featured.title}
              </Text>
              {featuredMeta.length > 0 ? (
                <Text style={styles.featuredMeta} numberOfLines={2}>
                  {featuredMeta}
                </Text>
              ) : null}
            </Pressable>
            {trendingRest.length > 0 ? (
              <View style={styles.trendingGrid}>
                {trendingRest.map((item: MovieListItem) => (
                  <View key={item.id} style={{ width: contentCardWidth }}>
                    <ContentCard
                      title={item.title}
                      subtitle={buildMovieCardSubtitle(item, browse.genres)}
                      imageUri={buildImageUrl(item.poster_path, IMAGE_SIZE_CARD)}
                      showRating
                      ratingValue={item.vote_average}
                      onPress={(): void => {
                        onOpenMovie(item);
                      }}
                      layoutWidth={contentCardWidth}
                      style={{ width: contentCardWidth }}
                    />
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </>
  );
  const genreFilterHeader: React.ReactElement = (
    <View style={styles.searchResultsHeaderSpacer}>
      {selectedGenreId !== null ? (
        <View style={styles.clearFilterRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear genre filter"
            onPress={onClearGenreFilter}
            style={({ pressed }) => [styles.clearFilterButton, pressed && styles.clearFilterPressed]}
          >
            <Text style={styles.clearFilterLabel}>Clear filter</Text>
          </Pressable>
        </View>
      ) : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.genreChipRow}
      >
        {sortedGenres.map((genre: Genre) => {
          const isActive: boolean = selectedGenreId === genre.id;
          return (
            <Pressable
              key={genre.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={genre.name}
              onPress={(): void => {
                setSelectedGenreId(genre.id);
                setQuery(genre.name);
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
    </View>
  );
  const searchResultsHeader: React.ReactElement = (
    <View style={styles.searchResultsListHeader}>
      {genreFilterHeader}
      {showResultCount ? (
        <Text style={styles.resultCountLabel} numberOfLines={2}>
          {`${totalResults} results for '${debouncedTrimmed}'`}
        </Text>
      ) : null}
    </View>
  );
  const browseFullyEmpty: boolean = browse.genres.length === 0 && browse.trending.length === 0;
  const mainBody: React.ReactElement =
    showSkeleton ? (
      <SearchScreenSkeleton />
    ) : error !== null && trimmed.length > 0 ? (
      <View style={styles.fillBelowSearch}>
        {genreFilterHeader}
        <ScreenErrorFallback reason={searchApiErrorReason} onTryAgain={refetch} />
      </View>
    ) : trimmed.length === 0 && browse.loading ? (
      <View style={styles.browseShimmerBlock}>
        <ShimmerPlaceholder style={styles.browseShimmerFeatured} />
        <View style={styles.browseShimmerGridRow}>
          <ShimmerPlaceholder style={styles.browseShimmerCard} />
          <ShimmerPlaceholder style={styles.browseShimmerCard} />
        </View>
        <View style={styles.browseShimmerGridRow}>
          <ShimmerPlaceholder style={styles.browseShimmerCard} />
          <ShimmerPlaceholder style={styles.browseShimmerCard} />
        </View>
      </View>
    ) : trimmed.length === 0 && browse.error !== null && browseFullyEmpty ? (
      <View style={styles.fillBelowSearch}>
        <ScreenErrorFallback reason={browseApiErrorReason} onTryAgain={browse.refetch} />
      </View>
    ) : trimmed.length === 0 && browse.error === null && browseFullyEmpty ? (
      <View style={styles.fillBelowSearch}>
        <ScreenErrorFallback reason="empty" onTryAgain={browse.refetch} />
      </View>
    ) : trimmed.length === 0 && !browseFullyEmpty ? (
      <ScrollView
        style={styles.browseScroll}
        contentContainerStyle={styles.browseScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {browse.error !== null ? (
          <ScreenErrorFallback
            layout="compact"
            showLogo={false}
            reason={browseApiErrorReason}
            onTryAgain={browse.refetch}
          />
        ) : null}
        {browseBody}
      </ScrollView>
    ) : showSearchZero ? (
      <View style={styles.fillBelowSearch}>
        {searchResultsHeader}
        <View style={styles.zeroResultsWrap}>
          <MaterialIcons
            name="search_off"
            size={ZERO_RESULTS_ICON_SIZE}
            color={colors.on_surface_variant}
            accessibilityElementsHidden
          />
          <Text style={styles.zeroResultsTitle} numberOfLines={2}>
            {`No results for '${debouncedTrimmed}'`}
          </Text>
          <Text style={styles.zeroResultsHint}>
            Try a different title or check your spelling.
          </Text>
        </View>
      </View>
    ) : showSearchGrid ? (
      <FlatList
        data={results}
        keyExtractor={(item: MovieListItem): string => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.columnWrap}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={searchResultsHeader}
        renderItem={({ item }: { item: MovieListItem }): React.ReactElement => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.title}
            style={({ pressed }) => [styles.cardCell, pressed && styles.cardPressed]}
            onPress={(): void => {
              onOpenMovie(item);
            }}
          >
            <SearchResultCard item={item} />
          </Pressable>
        )}
      />
    ) : (
      <View style={styles.fillBelowSearch} />
    );
  return (
    <View style={styles.contentRoot}>
      <View
        style={[
          styles.searchBarWrap,
          isSearchFocused ? styles.searchBarWrapFocused : styles.searchBarWrapUnfocused,
        ]}
      >
        <MaterialIcons
          name="search"
          size={MAGNIFIER_ICON_SIZE}
          color={colors.on_surface}
          accessibilityElementsHidden
        />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search movies, actors, directors..."
          placeholderTextColor={colors.on_surface_variant}
          style={styles.searchInput}
          accessibilityLabel="Search movies, actors, directors"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          onFocus={(): void => {
            setIsSearchFocused(true);
          }}
          onBlur={onBlurSearch}
        />
      </View>
      {mainBody}
    </View>
  );
}

export function SearchScreen(): React.ReactElement {
  const [query, setQuery] = useState<string>('');
  const { recentSearches, addRecentSearch, clearAllRecentSearches } = useRecentSearches();
  const search = useSearch(query, { onSearchCompleted: addRecentSearch });
  const browse = useSearchBrowseData();
  return (
    <View style={styles.screenWrap}>
      <GlobalAppBar />
      <SafeAreaView style={styles.root} edges={['left', 'right']}>
        <ScreenErrorBoundary
          onRetry={(): void => {
            search.refetch();
            browse.refetch();
          }}
        >
          <SearchScreenContent
            query={query}
            setQuery={setQuery}
            search={search}
            browse={browse}
            recentSearches={recentSearches}
            clearAllRecentSearches={clearAllRecentSearches}
          />
        </ScreenErrorBoundary>
      </SafeAreaView>
    </View>
  );
}

const CARD_GAP: number = spacing.md;

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
  contentRoot: {
    flex: 1,
  },
  fillBelowSearch: {
    flex: 1,
  },
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: SEARCH_BAR_MIN_HEIGHT,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface_container_low,
    borderRadius: SEARCH_BAR_CORNER_RADIUS,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  searchBarWrapUnfocused: {
    borderColor: 'transparent',
  },
  searchBarWrapFocused: {
    borderColor: colors.outline_variant,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    ...typography.textStyle.titleSm,
    color: colors.on_surface,
  },
  browseScroll: {
    flex: 1,
  },
  browseScrollContent: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  clearFilterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  clearFilterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: CLEAR_FILTER_CORNER_RADIUS,
    backgroundColor: colors.surface_container_low,
  },
  clearFilterPressed: {
    opacity: 0.9,
  },
  clearFilterLabel: {
    ...typography.textStyle.titleSm,
    color: colors.on_surface,
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
  recentSection: {
    gap: spacing.sm,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  recentSectionTitle: {
    ...typography.textStyle.headlineMd,
    color: colors.on_surface,
    flexShrink: 1,
  },
  clearAllPressable: {
    flexShrink: 0,
  },
  clearAllPressed: {
    opacity: 0.88,
  },
  clearAllText: {
    ...typography.textStyle.titleSm,
    color: colors.primary_container,
    textTransform: 'uppercase',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  recentRowPressed: {
    opacity: 0.9,
  },
  recentTerm: {
    flex: 1,
    ...typography.textStyle.bodyMd,
    color: colors.on_surface,
  },
  trendingSection: {
    gap: spacing.lg,
  },
  trendingSectionTitle: {
    ...typography.textStyle.headlineMd,
    color: colors.on_surface,
  },
  featuredCard: {
    gap: spacing.xs,
  },
  featuredCardPressed: {
    opacity: 0.94,
  },
  featuredImageFrame: {
    borderRadius: spacing.md,
    overflow: 'hidden',
    backgroundColor: colors.surface_container,
  },
  featuredImage: {
    width: '100%',
    aspectRatio: FEATURED_BACKDROP_ASPECT,
  },
  featuredImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    minHeight: spacing.xl * 5,
  },
  featuredPlaceholderText: {
    ...typography.textStyle.titleLg,
    color: colors.on_surface_variant,
    textAlign: 'center',
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.xs,
    backgroundColor: colors.secondary_container,
  },
  featuredBadgeText: {
    ...typography.textStyle.labelSm,
    color: colors.on_surface,
    fontFamily: typography.fontFamily.interSemiBold,
  },
  featuredTitle: {
    ...typography.textStyle.titleLg,
    color: colors.on_surface,
  },
  featuredMeta: {
    ...typography.textStyle.labelSm,
    color: colors.on_surface_variant,
  },
  trendingGrid: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: HOME_HORIZONTAL_CARD_GAP,
    justifyContent: 'space-between',
  },
  browseShimmerBlock: {
    gap: spacing.md,
  },
  browseShimmerFeatured: {
    width: '100%',
    aspectRatio: FEATURED_BACKDROP_ASPECT,
    borderRadius: spacing.md,
  },
  browseShimmerGridRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  browseShimmerCard: {
    flex: 1,
    height: spacing.xl * 5,
    borderRadius: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xl,
    gap: CARD_GAP,
  },
  searchResultsHeaderSpacer: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  columnWrap: {
    gap: CARD_GAP,
  },
  cardCell: {
    flex: 1,
    maxWidth: '50%',
    paddingHorizontal: CARD_GAP / 2,
  },
  cardPressed: {
    opacity: 0.92,
  },
  resultCard: {
    gap: spacing.xs,
  },
  resultPoster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface_container_high,
  },
  resultPosterPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  resultPosterFallback: {
    ...typography.textStyle.labelSm,
    color: colors.on_surface_variant,
    textAlign: 'center',
  },
  resultPosterFrame: {
    width: '100%',
    borderRadius: spacing.sm,
    overflow: 'hidden',
    backgroundColor: colors.surface_container_high,
    position: 'relative',
  },
  resultRatingBadge: {
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
  resultRatingText: {
    ...typography.textStyle.labelSm,
    color: colors.on_surface,
  },
  resultCardTitle: {
    ...typography.textStyle.titleLg,
    color: colors.on_surface,
  },
  resultCardYear: {
    ...typography.textStyle.labelSm,
    color: colors.on_surface_variant,
  },
  searchResultsListHeader: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  resultCountLabel: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface_variant,
  },
  zeroResultsWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  zeroResultsTitle: {
    ...typography.textStyle.headlineMd,
    color: colors.on_surface,
    textAlign: 'center',
  },
  zeroResultsHint: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface_variant,
    textAlign: 'center',
  },
});
