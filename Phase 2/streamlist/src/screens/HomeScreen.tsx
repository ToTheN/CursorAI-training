import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Genre, MovieListItem } from '../api/types';
import { ContentCard } from '../components/ContentCard';
import { ScreenErrorBoundary } from '../components/ScreenErrorBoundary';
import { ScreenErrorFallback } from '../components/ScreenErrorFallback';
import { HomeScreenSkeleton } from '../components/skeletons/HomeScreenSkeleton';
import type { HomeGenreSelection, UseHomeResult } from '../hooks/useHome';
import { useHome } from '../hooks/useHome';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { buildImageUrl, IMAGE_SIZE_CARD } from '../utils/image';
import { shouldLoadMoreMoviesRow } from '../utils/horizontalScroll';
import { HOME_HORIZONTAL_CARD_GAP, homeContentCardOuterWidth } from '../utils/contentCardLayout';
import { buildMovieCardSubtitle } from '../utils/movieCard';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface HomeScreenContentProps {
  home: UseHomeResult;
  selectedGenreKey: HomeGenreSelection;
  onSelectGenre: (key: HomeGenreSelection) => void;
}

function HomeScreenContent(props: HomeScreenContentProps): React.ReactElement {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { width: windowWidth } = useWindowDimensions();
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
  const trendingResults: MovieListItem[] = data?.trending?.results ?? [];
  const topRatedResults: MovieListItem[] = data?.topRated?.results ?? [];
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
  if (error !== null) {
    return <ScreenErrorFallback onTryAgain={refetch} />;
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
      {discoverResults.length > 0 && discoverSectionTitle.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>{discoverSectionTitle}</Text>
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
      <Text style={styles.sectionTitle}>Trending</Text>
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
      <Text style={[styles.sectionTitle, styles.sectionSpaced]}>Top rated</Text>
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
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScreenErrorBoundary onRetry={home.refetch}>
        <HomeScreenContent
          home={home}
          selectedGenreKey={selectedGenreKey}
          onSelectGenre={onSelectGenre}
        />
      </ScreenErrorBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  sectionTitle: {
    ...typography.textStyle.headlineMd,
    color: colors.on_surface,
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
});
