import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SeeAllScreenSkeleton } from '../components/skeletons/SeeAllScreenSkeleton';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { Genre, MovieListItem } from '../api/types';
import { ContentCard } from '../components/common/ContentCard';
import { ScreenErrorBoundary } from '../components/common/ScreenErrorBoundary';
import { ScreenErrorFallback } from '../components/common/ScreenErrorFallback';
import { useSeeAll } from '../hooks/useSeeAll';
import type { HomeGenreSelection } from '../hooks/useHome';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { buildImageUrl, IMAGE_SIZE_CARD } from '../utils/image';
import { shouldLoadMoreVerticalList } from '../utils/horizontalScroll';
import {
  HOME_HORIZONTAL_CARD_GAP,
  homeContentCardOuterWidth,
  seeAllGridRowStride,
} from '../utils/contentCardLayout';
import { buildMovieCardSubtitle } from '../utils/movieCard';

type SeeAllScreenProps = NativeStackScreenProps<RootStackParamList, 'SeeAll'>;

function resolveDiscoverKey(params: SeeAllScreenProps['route']['params']): HomeGenreSelection | undefined {
  if (params.rail === 'discover') {
    return params.discoverGenreKey;
  }
  return undefined;
}

function SeeAllScreenBody(props: {
  contentCardWidth: number;
  gridRowStride: number;
  onOpenMovie: (item: MovieListItem) => void;
  seeAll: ReturnType<typeof useSeeAll>;
}): React.ReactElement {
  const { contentCardWidth, gridRowStride, onOpenMovie, seeAll } = props;
  const { data, loading, error, errorKind, refetch, loadMore, loadingMore } = seeAll;
  const results: MovieListItem[] = data?.movies.results ?? [];
  const genreList = useMemo(
    (): Genre[] => data?.genres.genres ?? [],
    [data],
  );
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
      if (
        !shouldLoadMoreVerticalList(event.nativeEvent, gridRowStride, results.length)
      ) {
        return;
      }
      loadMore().catch(() => undefined);
    },
    [gridRowStride, loadMore, results.length],
  );
  const renderItem: ListRenderItem<MovieListItem> = useCallback(
    ({ item }: { item: MovieListItem }): React.ReactElement => (
      <View style={[styles.gridCell, { width: contentCardWidth }]}>
        <ContentCard
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
      </View>
    ),
    [contentCardWidth, genreList, onOpenMovie],
  );
  if (error !== null) {
    return (
      <ScreenErrorFallback
        reason={errorKind === 'network' ? 'network' : 'generic'}
        onTryAgain={refetch}
      />
    );
  }
  if (loading || data === null) {
    return (
      <View style={styles.loadingBlock} accessibilityLabel="Loading">
        <SeeAllScreenSkeleton />
      </View>
    );
  }
  return (
    <FlatList
      style={styles.list}
      data={results}
      removeClippedSubviews={false}
      keyExtractor={(item: MovieListItem): string => String(item.id)}
      numColumns={2}
      columnWrapperStyle={styles.columnWrap}
      contentContainerStyle={styles.listContent}
      scrollEventThrottle={16}
      onScroll={onScroll}
      overScrollMode={Platform.OS === 'android' ? 'never' : undefined}
      renderItem={renderItem}
      ListEmptyComponent={
        <Text style={styles.emptyHint}>No movies</Text>
      }
      ListFooterComponent={
        loadingMore ? (
          <View style={styles.footerLoading}>
            <ActivityIndicator color={colors.primary_container} />
          </View>
        ) : null
      }
    />
  );
}

export function SeeAllScreen(props: SeeAllScreenProps): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { screenTitle, rail } = props.route.params;
  const discoverGenreKey: HomeGenreSelection | undefined = resolveDiscoverKey(props.route.params);
  const similarSourceMovieId: number | undefined =
    props.route.params.rail === 'similar' ? props.route.params.similarSourceMovieId : undefined;
  const similarSourceTvId: number | undefined =
    props.route.params.rail === 'similar' ? props.route.params.similarSourceTvId : undefined;
  const seeAll = useSeeAll(rail, discoverGenreKey, similarSourceMovieId, similarSourceTvId);
  const { refetch } = seeAll;
  const { width: windowWidth } = useWindowDimensions();
  const contentCardWidth: number = useMemo(
    (): number => homeContentCardOuterWidth(windowWidth),
    [windowWidth],
  );
  const gridRowStride: number = useMemo(
    (): number => seeAllGridRowStride(contentCardWidth),
    [contentCardWidth],
  );
  const onOpenMovie = useCallback(
    (item: MovieListItem): void => {
      navigation.navigate('Detail', { movieId: item.id });
    },
    [navigation],
  );
  return (
    <SafeAreaView
      style={[styles.root, { paddingTop: insets.top }]}
      edges={['left', 'right', 'bottom']}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          activeOpacity={1}
          onPress={(): void => {
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={spacing.lg} color={colors.on_surface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {screenTitle}
        </Text>
      </View>
      <ScreenErrorBoundary onRetry={refetch}>
        <View style={styles.body}>
          <SeeAllScreenBody
            contentCardWidth={contentCardWidth}
            gridRowStride={gridRowStride}
            onOpenMovie={onOpenMovie}
            seeAll={seeAll}
          />
        </View>
      </ScreenErrorBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
    marginLeft: spacing.xxs,
  },
  headerTitle: {
    fontFamily: typography.fontFamily.manropeBold,
    fontSize: typography.fontSize.xl,
    lineHeight: typography.lineHeight.relaxed,
    color: colors.on_surface,
    flex: 1,
  },
  body: {
    flex: 1,
  },
  loadingBlock: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  columnWrap: {
    gap: HOME_HORIZONTAL_CARD_GAP,
  },
  gridCell: {
    flexGrow: 0,
  },
  emptyHint: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface_variant,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  footerLoading: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
});
