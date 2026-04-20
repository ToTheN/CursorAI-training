import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ListRenderItem,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Genre, MovieDetails, MovieListItem, TvDetails } from '../api/types';
import { ContentCard } from '../components/ContentCard';
import { GlobalAppBar } from '../components/GlobalAppBar';
import { ScreenErrorBoundary } from '../components/ScreenErrorBoundary';
import { ScreenErrorFallback } from '../components/ScreenErrorFallback';
import { ShimmerPlaceholder } from '../components/ShimmerPlaceholder';
import type { UseQueryResult } from '../hooks/types';
import {
  useWatchlistPopularRecommendations,
  type WatchlistPopularRecommendationsData,
} from '../hooks/useWatchlistPopularRecommendations';
import {
  useWatchlistHydration,
  type HydratedWatchlistItem,
} from '../hooks/useWatchlistHydration';
import { useWatchlistSimilar } from '../hooks/useWatchlistSimilar';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useWatchlistStore, type WatchlistEntry } from '../store/watchlistStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  HOME_HORIZONTAL_CARD_GAP,
  homeContentCardOuterWidth,
  posterFrameHeightFromOuterWidth,
} from '../utils/contentCardLayout';
import { buildImageUrl, IMAGE_SIZE_CARD } from '../utils/image';
import { buildMovieCardSubtitle } from '../utils/movieCard';
import {
  buildWatchlistSubtitleFromMovieDetails,
  buildWatchlistSubtitleFromTvDetails,
} from '../utils/watchlistSubtitle';

type WatchlistScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Watchlist'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const BOOKMARK_ICON_SIZE: number = spacing.xl * 2;
const ICON_BACKDROP_SIZE: number = spacing.xxl + spacing.xxl + spacing.md;
const CARD_GAP: number = spacing.md;

type WatchlistFilter = 'all' | 'movies' | 'series';

const FILTER_SEQUENCE: readonly WatchlistFilter[] = ['all', 'movies', 'series'] as const;

function BrowseTrendingCtaButton(props: { label: string; onPress: () => void }): React.ReactElement {
  const { label, onPress } = props;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
    >
      <Text style={styles.ctaLabel}>{label}</Text>
    </Pressable>
  );
}

function PopularRecommendationsSkeleton(props: { cardWidth: number }): React.ReactElement {
  const { cardWidth } = props;
  const posterHeight: number = posterFrameHeightFromOuterWidth(cardWidth);
  const posterShimmerStyle = { width: cardWidth, height: posterHeight };
  const cardPlaceholderStyle = { width: cardWidth };
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalRow}
    >
      {[0, 1, 2, 3].map((index: number) => (
        <View key={index} style={[styles.skeletonCard, cardPlaceholderStyle]}>
          <ShimmerPlaceholder style={[styles.skeletonPoster, posterShimmerStyle]} />
          <ShimmerPlaceholder style={styles.skeletonTitleLine} />
          <ShimmerPlaceholder style={styles.skeletonSubtitleLine} />
        </View>
      ))}
    </ScrollView>
  );
}

interface WatchlistEmptyStateProps {
  popular: UseQueryResult<WatchlistPopularRecommendationsData>;
}

function WatchlistEmptyState(props: WatchlistEmptyStateProps): React.ReactElement {
  const { popular } = props;
  const navigation = useNavigation<WatchlistScreenNavigationProp>();
  const { width: windowWidth } = useWindowDimensions();
  const contentCardWidth: number = useMemo(
    (): number => homeContentCardOuterWidth(windowWidth),
    [windowWidth],
  );
  const onBrowseTrending = useCallback((): void => {
    navigation.navigate('Home');
  }, [navigation]);
  const onOpenMovie = useCallback(
    (item: MovieListItem): void => {
      navigation.navigate('Detail', { movieId: item.id });
    },
    [navigation],
  );
  const genreList: Genre[] = popular.data?.genres ?? [];
  const movies: MovieListItem[] = popular.data?.movies ?? [];
  const shouldShowPopularRailUnavailable: boolean =
    !popular.loading && (popular.error !== null || movies.length === 0);
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.titleBlock}>
        <Text style={styles.collectionLabel}>YOUR COLLECTION</Text>
        <Text style={styles.screenTitle}>My Watchlist</Text>
      </View>
      <View style={styles.emptyCluster}>
        <View style={styles.iconBackdrop}>
          <MaterialIcons
            name="bookmark"
            size={BOOKMARK_ICON_SIZE}
            color={colors.secondary_container}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        </View>
        <Text style={styles.emptyHeading}>Your watchlist is empty</Text>
        <Text style={styles.emptySubtext}>
          Save movies and shows you want to watch later and they&apos;ll appear here
        </Text>
        <BrowseTrendingCtaButton label="Browse Trending Now" onPress={onBrowseTrending} />
      </View>
      <View style={styles.recommendationsSection}>
        <Text style={styles.recommendationsHeading}>Popular Recommendations</Text>
        {popular.loading ? (
          <PopularRecommendationsSkeleton cardWidth={contentCardWidth} />
        ) : shouldShowPopularRailUnavailable ? (
          <View style={styles.popularRailFallback}>
            <Text style={styles.popularRailFallbackText}>
              We will back soon with some recommendation.
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalRow}
          >
            {movies.map((item: MovieListItem) => (
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
        )}
      </View>
    </ScrollView>
  );
}

function watchlistEntryKey(entry: WatchlistEntry): string {
  return `${entry.mediaType}:${String(entry.id)}`;
}

function filterLabelForEmptyMessage(filter: WatchlistFilter): string {
  if (filter === 'movies') {
    return 'Movies';
  }
  if (filter === 'series') {
    return 'Series';
  }
  return '';
}

function filterHydratedItems(
  items: HydratedWatchlistItem[],
  filter: WatchlistFilter,
): HydratedWatchlistItem[] {
  if (filter === 'all') {
    return items;
  }
  if (filter === 'movies') {
    return items.filter((row: HydratedWatchlistItem): boolean => row.entry.mediaType === 'movie');
  }
  return items.filter((row: HydratedWatchlistItem): boolean => row.entry.mediaType === 'tv');
}

interface WatchlistGridCardProps {
  row: HydratedWatchlistItem;
  contentCardWidth: number;
  onOpenDetail: (() => void) | undefined;
  onRemove: () => void;
}

function WatchlistGridCard(props: WatchlistGridCardProps): React.ReactElement {
  const { row, contentCardWidth, onOpenDetail, onRemove } = props;
  const movie: MovieDetails | null = row.movie;
  const tv: TvDetails | null = row.tv;
  const title: string =
    movie !== null ? movie.title : tv !== null ? tv.name : `Content ${String(row.entry.id)}`;
  const subtitle: string = ((): string => {
    if (row.fetchFailed) {
      return '';
    }
    if (movie !== null) {
      return buildWatchlistSubtitleFromMovieDetails(movie);
    }
    if (tv !== null) {
      return buildWatchlistSubtitleFromTvDetails(tv);
    }
    return '';
  })();
  const imageUri: string | null = buildImageUrl(
    movie !== null ? movie.poster_path : tv !== null ? tv.poster_path : null,
    IMAGE_SIZE_CARD,
  );
  const ratingValue: number | undefined = ((): number | undefined => {
    if (row.fetchFailed) {
      return undefined;
    }
    if (movie !== null) {
      return movie.vote_average;
    }
    if (tv !== null) {
      return tv.vote_average;
    }
    return undefined;
  })();
  return (
    <View style={[styles.gridCell, { width: contentCardWidth }]}>
      <View style={styles.cardWithRemove}>
        <ContentCard
          title={title}
          subtitle={subtitle}
          imageUri={imageUri}
          showRating={ratingValue !== undefined && !Number.isNaN(ratingValue)}
          ratingValue={ratingValue}
          onPress={onOpenDetail}
          layoutWidth={contentCardWidth}
          style={{ width: contentCardWidth }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${title} from watchlist`}
          onPress={onRemove}
          style={({ pressed }) => [styles.removeFromListButton, pressed && styles.removeFromListPressed]}
          hitSlop={spacing.xs}
        >
          <Text style={styles.removeFromListIcon} accessibilityElementsHidden>
            ×
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function WatchlistGridSkeleton(props: { cardWidth: number }): React.ReactElement {
  const { cardWidth } = props;
  const posterHeight: number = posterFrameHeightFromOuterWidth(cardWidth);
  const posterShimmerStyle = { width: cardWidth, height: posterHeight };
  return (
    <View style={styles.gridSkeletonWrap}>
      <View style={[styles.gridCell, { width: cardWidth }]}>
        <ShimmerPlaceholder style={[styles.skeletonPoster, posterShimmerStyle]} />
        <ShimmerPlaceholder style={styles.skeletonTitleLine} />
        <ShimmerPlaceholder style={styles.skeletonSubtitleLine} />
      </View>
      <View style={[styles.gridCell, { width: cardWidth }]}>
        <ShimmerPlaceholder style={[styles.skeletonPoster, posterShimmerStyle]} />
        <ShimmerPlaceholder style={styles.skeletonTitleLine} />
        <ShimmerPlaceholder style={styles.skeletonSubtitleLine} />
      </View>
    </View>
  );
}

interface WatchlistWithDataProps {
  hydration: ReturnType<typeof useWatchlistHydration>;
  similar: ReturnType<typeof useWatchlistSimilar>;
  lastEntry: WatchlistEntry | null;
}

function WatchlistWithData(props: WatchlistWithDataProps): React.ReactElement {
  const { hydration, similar, lastEntry } = props;
  const navigation = useNavigation<WatchlistScreenNavigationProp>();
  const { width: windowWidth } = useWindowDimensions();
  const contentCardWidth: number = useMemo(
    (): number => homeContentCardOuterWidth(windowWidth),
    [windowWidth],
  );
  const removeEntry = useWatchlistStore((state) => state.removeEntry);
  const [filter, setFilter] = useState<WatchlistFilter>('all');
  const hydratedItems: HydratedWatchlistItem[] = hydration.data?.items ?? [];
  const filteredItems: HydratedWatchlistItem[] = useMemo(
    (): HydratedWatchlistItem[] => filterHydratedItems(hydratedItems, filter),
    [hydratedItems, filter],
  );
  const savedDisplayTitle: string = useMemo((): string => {
    if (lastEntry === null || hydration.data === null) {
      return '';
    }
    const row: HydratedWatchlistItem | undefined = hydration.data.items.find(
      (item: HydratedWatchlistItem): boolean => watchlistEntryKey(item.entry) === watchlistEntryKey(lastEntry),
    );
    if (row === undefined || row.fetchFailed) {
      return '';
    }
    if (row.movie !== null) {
      return row.movie.title;
    }
    if (row.tv !== null) {
      return row.tv.name;
    }
    return '';
  }, [lastEntry, hydration.data]);
  const onOpenMovieDetail = useCallback(
    (movieId: number): void => {
      navigation.navigate('Detail', { movieId });
    },
    [navigation],
  );
  const onRemoveRow = useCallback(
    (entry: WatchlistEntry): void => {
      removeEntry(entry);
    },
    [removeEntry],
  );
  const renderItem: ListRenderItem<HydratedWatchlistItem> = useCallback(
    ({ item }: { item: HydratedWatchlistItem }): React.ReactElement => (
      <WatchlistGridCard
        row={item}
        contentCardWidth={contentCardWidth}
        onRemove={(): void => {
          onRemoveRow(item.entry);
        }}
        onOpenDetail={
          item.entry.mediaType === 'movie'
            ? (): void => {
                onOpenMovieDetail(item.entry.id);
              }
            : undefined
        }
      />
    ),
    [contentCardWidth, onOpenMovieDetail, onRemoveRow],
  );
  const filterHeader: React.ReactElement = (
    <View style={styles.withDataHeader}>
      <View style={styles.titleBlock}>
        <Text style={styles.collectionLabel}>YOUR COLLECTION</Text>
        <Text style={styles.screenTitle}>My Watchlist</Text>
      </View>
      <View style={styles.filterRow}>
        {FILTER_SEQUENCE.map((value: WatchlistFilter, index: number) => {
          const isActive: boolean = filter === value;
          const label: string =
            value === 'all' ? 'All' : value === 'movies' ? 'Movies' : 'Series';
          return (
            <React.Fragment key={value}>
              {index > 0 ? (
                <Text style={styles.filterSeparator} accessibilityElementsHidden>
                  |
                </Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Filter ${label}`}
                onPress={(): void => {
                  setFilter(value);
                }}
                style={({ pressed }) => [
                  styles.filterChip,
                  isActive ? styles.filterChipActive : styles.filterChipInactive,
                  pressed && styles.filterChipPressed,
                ]}
              >
                <Text style={isActive ? styles.filterChipLabelActive : styles.filterChipLabelInactive}>
                  {label}
                </Text>
              </Pressable>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
  const showFilterEmpty: boolean =
    !hydration.loading &&
    filteredItems.length === 0 &&
    hydratedItems.length > 0 &&
    filter !== 'all';
  const listEmptyForFilter: React.ReactElement | null = showFilterEmpty ? (
    <View style={styles.filterEmptyWrap}>
      <Text style={styles.filterEmptyText}>
        {`No ${filterLabelForEmptyMessage(filter)} in your watchlist yet`}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Browse all watchlist items"
        onPress={(): void => {
          setFilter('all');
        }}
        style={({ pressed }) => [styles.browseAllChip, pressed && styles.browseAllChipPressed]}
      >
        <Text style={styles.browseAllChipLabel}>Browse All</Text>
      </Pressable>
    </View>
  ) : null;
  const similarMovies: MovieListItem[] = similar.data?.movies ?? [];
  const similarGenres: Genre[] = similar.data?.genres ?? [];
  const showBecauseSection: boolean =
    lastEntry !== null &&
    !similar.loading &&
    similar.error === null &&
    similarMovies.length > 0;
  const becauseTitle: string =
    savedDisplayTitle.length > 0 ? savedDisplayTitle : 'this title';
  const listFooter: React.ReactElement | null = showBecauseSection ? (
    <View style={styles.becauseSection}>
      <View style={styles.becauseHeaderRow}>
        <Text style={styles.becauseHeading} numberOfLines={2}>
          {`Because you saved ${becauseTitle}`}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="See all similar titles"
          onPress={(): void => {
            if (lastEntry === null) {
              return;
            }
            navigation.navigate('SeeAll', {
              rail: 'similar',
              screenTitle: `Because you saved ${becauseTitle}`,
              similarSourceMovieId: lastEntry.mediaType === 'movie' ? lastEntry.id : undefined,
              similarSourceTvId: lastEntry.mediaType === 'tv' ? lastEntry.id : undefined,
            });
          }}
          style={({ pressed }) => [styles.seeAllLink, pressed && styles.seeAllLinkPressed]}
        >
          <Text style={styles.seeAllLinkLabel}>See All</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalRow}
      >
        {similarMovies.map((item: MovieListItem) => (
          <ContentCard
            key={`sim-${String(item.id)}`}
            title={item.title}
            subtitle={buildMovieCardSubtitle(item, similarGenres)}
            imageUri={buildImageUrl(item.poster_path, IMAGE_SIZE_CARD)}
            showRating
            ratingValue={item.vote_average}
            onPress={
              lastEntry !== null && lastEntry.mediaType === 'tv'
                ? undefined
                : (): void => {
                    onOpenMovieDetail(item.id);
                  }
            }
            layoutWidth={contentCardWidth}
            style={{ width: contentCardWidth }}
          />
        ))}
      </ScrollView>
    </View>
  ) : null;
  if (hydration.error !== null) {
    return (
      <View style={styles.withDataRoot}>
        {filterHeader}
        <ScreenErrorFallback
          reason={hydration.errorKind === 'network' ? 'network' : 'generic'}
          onTryAgain={hydration.refetch}
        />
      </View>
    );
  }
  if (hydration.loading && hydratedItems.length === 0) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filterHeader}
        <WatchlistGridSkeleton cardWidth={contentCardWidth} />
      </ScrollView>
    );
  }
  return (
    <FlatList
      style={styles.scroll}
      contentContainerStyle={styles.watchlistListContent}
      data={filteredItems}
      keyExtractor={(item: HydratedWatchlistItem): string => watchlistEntryKey(item.entry)}
      numColumns={2}
      columnWrapperStyle={styles.columnWrap}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          {filterHeader}
          {listEmptyForFilter}
        </>
      }
      ListFooterComponent={listFooter}
      renderItem={renderItem}
    />
  );
}

export function WatchlistScreen(): React.ReactElement {
  const entries = useWatchlistStore((state) => state.entries);
  const isEmpty: boolean = entries.length === 0;
  const popular = useWatchlistPopularRecommendations(isEmpty);
  const hydration = useWatchlistHydration(entries);
  const lastEntry: WatchlistEntry | null = useMemo((): WatchlistEntry | null => {
    if (entries.length === 0) {
      return null;
    }
    return entries[entries.length - 1] as WatchlistEntry;
  }, [entries]);
  const similar = useWatchlistSimilar(lastEntry);
  const popularRefetch = popular.refetch;
  const refetch = useCallback((): void => {
    popularRefetch();
    hydration.refetch();
    similar.refetch();
  }, [popularRefetch, hydration.refetch, similar.refetch]);
  return (
    <View style={styles.screenWrap}>
      <GlobalAppBar />
      <SafeAreaView style={styles.root} edges={['left', 'right']}>
        <ScreenErrorBoundary onRetry={refetch}>
          {isEmpty ? (
            <WatchlistEmptyState popular={popular} />
          ) : (
            <WatchlistWithData hydration={hydration} similar={similar} lastEntry={lastEntry} />
          )}
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
    gap: spacing.lg,
  },
  watchlistListContent: {
    paddingBottom: spacing.xl,
    gap: CARD_GAP,
  },
  withDataRoot: {
    flex: 1,
    gap: spacing.md,
  },
  withDataHeader: {
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  titleBlock: {
    gap: spacing.xxs,
    alignSelf: 'stretch',
  },
  collectionLabel: {
    ...typography.textStyle.labelSm,
    color: colors.on_surface_variant,
    textTransform: 'uppercase',
  },
  screenTitle: {
    ...typography.textStyle.displayMd,
    color: colors.on_surface_variant,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterSeparator: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface_variant,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xs,
    minWidth: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: colors.secondary_container,
  },
  filterChipInactive: {
    backgroundColor: colors.surface_container_low,
  },
  filterChipPressed: {
    opacity: 0.92,
  },
  filterChipLabelActive: {
    ...typography.textStyle.titleSm,
    color: colors.on_surface,
  },
  filterChipLabelInactive: {
    ...typography.textStyle.titleSm,
    color: colors.on_surface_variant,
  },
  filterEmptyWrap: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  filterEmptyText: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface_variant,
    textAlign: 'center',
  },
  browseAllChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xl,
    backgroundColor: colors.secondary_container,
  },
  browseAllChipPressed: {
    opacity: 0.92,
  },
  browseAllChipLabel: {
    ...typography.textStyle.titleSm,
    color: colors.on_surface,
  },
  columnWrap: {
    gap: CARD_GAP,
  },
  gridCell: {
    flexGrow: 0,
  },
  cardWithRemove: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  removeFromListButton: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    zIndex: 2,
    minWidth: spacing.lg,
    minHeight: spacing.lg,
    borderRadius: spacing.xs,
    backgroundColor: colors.surface_container_highest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeFromListPressed: {
    opacity: 0.88,
  },
  removeFromListIcon: {
    ...typography.textStyle.titleLg,
    color: colors.on_surface_variant,
    lineHeight: typography.textStyle.titleLg.lineHeight,
  },
  gridSkeletonWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    justifyContent: 'space-between',
  },
  becauseSection: {
    marginTop: spacing.lg,
    gap: spacing.sm,
    alignSelf: 'stretch',
  },
  becauseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  becauseHeading: {
    ...typography.textStyle.titleLg,
    fontFamily: typography.fontFamily.manropeBold,
    color: colors.on_surface,
    flex: 1,
  },
  seeAllLink: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
  },
  seeAllLinkPressed: {
    opacity: 0.88,
  },
  seeAllLinkLabel: {
    ...typography.textStyle.titleSm,
    color: colors.primary_container,
  },
  emptyCluster: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  iconBackdrop: {
    width: ICON_BACKDROP_SIZE,
    height: ICON_BACKDROP_SIZE,
    borderRadius: ICON_BACKDROP_SIZE / 2,
    backgroundColor: colors.surface_container_lowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyHeading: {
    ...typography.textStyle.headlineMd,
    color: colors.on_surface,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface_variant,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  cta: {
    alignSelf: 'stretch',
    borderRadius: spacing.md,
    minHeight: spacing.xl + spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.secondary_container,
  },
  ctaPressed: {
    opacity: 0.92,
  },
  ctaLabel: {
    ...typography.textStyle.titleSm,
    color: colors.on_surface,
  },
  recommendationsSection: {
    alignSelf: 'stretch',
    gap: spacing.sm,
  },
  recommendationsHeading: {
    ...typography.textStyle.bodyMd,
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.relaxed,
    color: colors.on_surface_variant,
  },
  horizontalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: HOME_HORIZONTAL_CARD_GAP,
    paddingVertical: spacing.xs,
  },
  skeletonCard: {
    gap: spacing.xs,
  },
  skeletonPoster: {
    borderRadius: spacing.md,
  },
  skeletonTitleLine: {
    height: spacing.md,
    width: '92%',
    borderRadius: spacing.xs,
  },
  skeletonSubtitleLine: {
    height: spacing.sm,
    width: '64%',
    borderRadius: spacing.xs,
  },
  popularRailFallback: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
    alignItems: 'flex-start',
  },
  popularRailFallbackText: {
    ...typography.textStyle.bodyMd,
    fontSize: typography.fontSize.xl,
    lineHeight: spacing.xl,
    color: colors.outline_secondaryvariant,
    textAlign: 'left',
    alignSelf: 'stretch',
  },
});
