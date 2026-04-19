import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from '@react-native-community/blur';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CastMember, Genre, MovieListItem } from '../api/types';
import { ContentCard } from '../components/ContentCard';
import { ScreenErrorBoundary } from '../components/ScreenErrorBoundary';
import { ScreenErrorFallback } from '../components/ScreenErrorFallback';
import { DetailScreenSkeleton } from '../components/skeletons/DetailScreenSkeleton';
import { useMovieDetail } from '../hooks/useMovieDetail';
import type { RootStackParamList } from '../navigation/types';
import { useWatchlistStore } from '../store/watchlistStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { buildDetailMetadataChipLabels } from '../utils/detailMetadataChips';
import {
  HOME_HORIZONTAL_CARD_GAP,
  homeContentCardOuterWidth,
} from '../utils/contentCardLayout';
import {
  buildImageUrl,
  IMAGE_SIZE_BACKDROP,
  IMAGE_SIZE_CARD,
  IMAGE_SIZE_CAST,
} from '../utils/image';
import { buildMovieCardSubtitle } from '../utils/movieCard';

type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Detail'>;

const EMPTY_GENRES: Genre[] = [];

const HERO_FADE_HEIGHT_RATIO: number = 0.4;
const CAST_SCROLL_GAP: number = spacing.md;
const SYNOPSIS_TOGGLE_MIN_CHARS: number = 120;

const GLASS_BACK_SIZE: number = spacing.xl + spacing.sm;

function DetailGlassBackBar(props: { onBack: () => void }): React.ReactElement {
  return (
    <View style={styles.glassBarOuter} pointerEvents="box-none">
      <View style={styles.glassBarPill}>
        {Platform.OS === 'ios' ? (
          <>
            <BlurView
              blurType="dark"
              blurAmount={spacing.md}
              reducedTransparencyFallbackColor={colors.surface_container}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.glassBarTint} />
          </>
        ) : (
          <View style={styles.glassBarAndroidFrosted} />
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={props.onBack}
          style={({ pressed }) => [styles.glassBackButton, pressed && styles.glassBackButtonPressed]}
        >
          <Ionicons name="arrow-back" size={spacing.lg} color={colors.on_surface} />
        </Pressable>
      </View>
    </View>
  );
}

function CastRowSkeleton(): React.ReactElement {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.castSkeletonRow}
    >
      {Array.from({ length: 5 }).map((_, index: number) => (
        <View key={`cast-sk-${String(index)}`} style={styles.castSkeletonItem}>
          <View style={styles.castSkeletonAvatar} />
          <View style={styles.castSkeletonLine} />
          <View style={styles.castSkeletonLineShort} />
        </View>
      ))}
    </ScrollView>
  );
}

function SimilarRowSkeleton(props: { cardWidth: number }): React.ReactElement {
  const posterH: number = (props.cardWidth * 3) / 2;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.similarRow}
    >
      {Array.from({ length: 4 }).map((_, index: number) => (
        <View
          key={`sim-sk-${String(index)}`}
          style={[styles.similarSkeletonCard, { width: props.cardWidth }]}
        >
          <View style={[styles.similarSkeletonPoster, { height: posterH }]} />
          <View style={styles.similarSkeletonLine} />
          <View style={styles.similarSkeletonLineShort} />
        </View>
      ))}
    </ScrollView>
  );
}

function DetailScreenBody(props: {
  movieId: number;
  detail: ReturnType<typeof useMovieDetail>;
}): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width: windowWidth } = useWindowDimensions();
  const { movieId, detail } = props;
  const { details, credits, similar, refetch } = detail;
  const entries = useWatchlistStore((state) => state.entries);
  const addEntry = useWatchlistStore((state) => state.addEntry);
  const removeEntry = useWatchlistStore((state) => state.removeEntry);
  const isInWatchlist: boolean = entries.some(
    (e): boolean => e.id === movieId && e.mediaType === 'movie',
  );
  const [synopsisExpanded, setSynopsisExpanded] = useState<boolean>(false);
  useEffect(() => {
    setSynopsisExpanded(false);
  }, [movieId]);
  const contentCardWidth: number = useMemo(
    (): number => homeContentCardOuterWidth(windowWidth),
    [windowWidth],
  );
  const onBack = useCallback((): void => {
    navigation.goBack();
  }, [navigation]);
  const onToggleWatchlist = useCallback((): void => {
    if (isInWatchlist) {
      removeEntry({ id: movieId, mediaType: 'movie' });
    } else {
      addEntry({ id: movieId, mediaType: 'movie' });
    }
  }, [addEntry, isInWatchlist, movieId, removeEntry]);
  if (details.error !== null) {
    return (
      <ScreenErrorFallback
        reason={details.errorKind === 'network' ? 'network' : 'generic'}
        onTryAgain={refetch}
      />
    );
  }
  if (details.loading || details.data === null) {
    return (
      <View style={styles.bodyRoot}>
        <DetailScreenSkeleton />
        <DetailGlassBackBar onBack={onBack} />
      </View>
    );
  }
  const movie = details.data;
  const heroPath: string | null = movie.backdrop_path ?? movie.poster_path;
  const heroUri: string | null = buildImageUrl(heroPath, IMAGE_SIZE_BACKDROP);
  const { labels: chipLabels } = buildDetailMetadataChipLabels(movie);
  const overviewTrimmed: string = movie.overview.trim();
  const showSynopsisToggle: boolean = overviewTrimmed.length >= SYNOPSIS_TOGGLE_MIN_CHARS;
  const castMembers: CastMember[] = credits.data?.cast ?? [];
  const hideMoreLikeThis: boolean =
    !similar.loading &&
    similar.error === null &&
    similar.data !== null &&
    similar.data.results.length === 0;
  const onOpenSimilar = (item: MovieListItem): void => {
    if (item.id === movieId) {
      refetch();
      return;
    }
    navigation.replace('Detail', { movieId: item.id });
  };
  const onSeeAllSimilar = (): void => {
    navigation.navigate('SeeAll', {
      rail: 'similar',
      screenTitle: 'More Like This',
      similarSourceMovieId: movieId,
    });
  };
  const similarResults: MovieListItem[] = similar.data?.results ?? [];
  return (
    <View style={styles.bodyRoot}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBlock} collapsable={false}>
          {heroUri === null ? (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <MaterialIcons
                name="movie-filter"
                size={spacing.xl + spacing.sm}
                color={colors.primary_container}
                accessibilityLabel="Streamlist"
              />
            </View>
          ) : (
            <Image
              key={`detail-hero-${String(movieId)}-${heroUri}`}
              source={{ uri: heroUri }}
              style={styles.heroImage}
              resizeMode="cover"
              accessibilityLabel="Backdrop"
            />
          )}
          <LinearGradient
            colors={['transparent', colors.surface]}
            locations={[0, 1]}
            style={styles.heroBottomFade}
            pointerEvents="none"
          />
        </View>
        <View style={styles.padded}>
          <Text style={styles.title}>{movie.title}</Text>
          {chipLabels.length > 0 ? (
            <View style={styles.chipRow}>
              {chipLabels.map((label: string) => (
                <View key={label} style={styles.metaChip}>
                  <Text style={styles.metaChipText}>{label}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {isInWatchlist ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: true }}
              accessibilityLabel="In Watchlist. Remove from watchlist"
              onPress={onToggleWatchlist}
              style={({ pressed }) => [
                styles.watchlistAddedPressable,
                pressed && styles.watchlistPressed,
              ]}
            >
              <View style={styles.watchlistAdded}>
                <MaterialIcons name="bookmark-added" size={spacing.lg} color={colors.primary} />
                <Text style={styles.watchlistAddedLabel}>In Watchlist</Text>
              </View>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add to Watchlist"
              onPress={onToggleWatchlist}
              style={({ pressed }) => [pressed && styles.watchlistPressed]}
            >
              <LinearGradient
                colors={[colors.primary, colors.primary_container]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.watchlistGradient}
              >
                <MaterialIcons name="bookmark-add" size={spacing.lg} color={colors.secondary_container} />
                <Text style={styles.watchlistDefaultLabel}>Add to Watchlist</Text>
              </LinearGradient>
            </Pressable>
          )}
          <Text style={styles.synopsisHeading}>Synopsis</Text>
          {overviewTrimmed.length > 0 ? (
            <View style={styles.synopsisBlock}>
              <Text
                style={styles.synopsisBody}
                numberOfLines={synopsisExpanded ? undefined : 3}
              >
                {overviewTrimmed}
              </Text>
              {showSynopsisToggle ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={synopsisExpanded ? 'Show less' : 'Read more'}
                  onPress={(): void => {
                    setSynopsisExpanded(!synopsisExpanded);
                  }}
                  style={styles.readMorePressable}
                >
                  <Text style={styles.readMoreText}>
                    {synopsisExpanded ? 'Show less' : 'Read more'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          {credits.loading ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Cast</Text>
              <CastRowSkeleton />
            </View>
          ) : null}
          {credits.error !== null && !credits.loading ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Cast</Text>
              <Text style={styles.sectionError}>Unable to load cast.</Text>
            </View>
          ) : null}
          {!credits.loading && credits.error === null && castMembers.length === 0 ? (
            <Text style={styles.castUnavailable}>Cast information unavailable</Text>
          ) : null}
          {!credits.loading && credits.error === null && castMembers.length > 0 ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Cast</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.castRow}
              >
                {castMembers.map((member: CastMember, index: number) => {
                  const avatarUri: string | null = buildImageUrl(
                    member.profile_path,
                    IMAGE_SIZE_CAST,
                  );
                  return (
                    <View
                      key={`${member.name}-${String(index)}`}
                      style={styles.castCard}
                      accessibilityLabel={`${member.name} as ${member.character}`}
                    >
                      {avatarUri === null ? (
                        <View style={styles.castAvatarPlaceholder}>
                          <MaterialIcons
                            name="person"
                            size={spacing.lg}
                            color={colors.on_surface_variant}
                          />
                        </View>
                      ) : (
                        <Image
                          key={`detail-cast-${String(movieId)}-${avatarUri}-${String(index)}`}
                          source={{ uri: avatarUri }}
                          style={styles.castAvatar}
                          accessibilityLabel={member.name}
                        />
                      )}
                      <Text style={styles.castName} numberOfLines={2}>
                        {member.name}
                      </Text>
                      <Text style={styles.castCharacter} numberOfLines={2}>
                        {member.character}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}
          {!hideMoreLikeThis ? (
            <View style={styles.sectionBlock}>
              <View style={styles.moreLikeHeader}>
                <Text style={styles.sectionHeading}>More Like This</Text>
                {similar.data !== null && similar.data.results.length > 0 && !similar.loading ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="See all similar titles"
                    onPress={onSeeAllSimilar}
                    style={({ pressed }) => [styles.seeAllPressable, pressed && styles.seeAllPressed]}
                  >
                    <Text style={styles.seeAllLink}>See All</Text>
                  </Pressable>
                ) : (
                  <View style={styles.seeAllPlaceholder} />
                )}
              </View>
              {similar.loading ? <SimilarRowSkeleton cardWidth={contentCardWidth} /> : null}
              {similar.error !== null && !similar.loading ? (
                <Text style={styles.sectionError}>Unable to load similar titles.</Text>
              ) : null}
              {!similar.loading && similar.error === null && similarResults.length > 0 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.similarRow}
                >
                  {similarResults.map((item: MovieListItem) => (
                    <ContentCard
                      key={item.id}
                      title={item.title}
                      subtitle={buildMovieCardSubtitle(item, EMPTY_GENRES)}
                      imageUri={buildImageUrl(item.poster_path, IMAGE_SIZE_CARD)}
                      showRating
                      ratingValue={item.vote_average}
                      onPress={(): void => {
                        onOpenSimilar(item);
                      }}
                      layoutWidth={contentCardWidth}
                      style={{ width: contentCardWidth }}
                    />
                  ))}
                </ScrollView>
              ) : null}
            </View>
          ) : null}
        </View>
      </ScrollView>
      <DetailGlassBackBar onBack={onBack} />
    </View>
  );
}

export function DetailScreen(props: DetailScreenProps): React.ReactElement {
  const { movieId } = props.route.params;
  const detail = useMovieDetail(movieId);
  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScreenErrorBoundary onRetry={detail.refetch}>
        <View style={styles.screenInner}>
          <DetailScreenBody movieId={movieId} detail={detail} />
        </View>
      </ScreenErrorBoundary>
    </SafeAreaView>
  );
}

const HERO_FADE_HEIGHT: number = spacing.detailHeroBackdrop * HERO_FADE_HEIGHT_RATIO;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  screenInner: {
    flex: 1,
    minHeight: 0,
  },
  bodyRoot: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  glassBarOuter: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.md,
    zIndex: 10,
  },
  glassBarPill: {
    width: GLASS_BACK_SIZE,
    height: GLASS_BACK_SIZE,
    borderRadius: spacing.md,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: Platform.OS === 'android' ? StyleSheet.hairlineWidth : 0,
    borderColor: colors.outline_variant,
  },
  glassBarAndroidFrosted: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.detail_back_button_android_frosted,
  },
  glassBarTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.detail_glass_control_scrim,
  },
  glassBackButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassBackButtonPressed: {
    opacity: 0.88,
  },
  heroBlock: {
    width: '100%',
    height: spacing.detailHeroBackdrop,
    backgroundColor: colors.surface_container_high,
  },
  heroImage: {
    width: '100%',
    height: spacing.detailHeroBackdrop,
    backgroundColor: colors.surface_container_high,
  },
  heroPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HERO_FADE_HEIGHT,
  },
  padded: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  title: {
    ...typography.textStyle.displayMd,
    color: colors.on_surface,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  metaChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xl,
    backgroundColor: colors.surface_container_highest,
  },
  metaChipText: {
    ...typography.textStyle.labelSm,
    color: colors.on_surface_variant,
  },
  watchlistGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xs,
    width: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.secondary_container,
  },
  watchlistDefaultLabel: {
    ...typography.textStyle.titleLg,
    color: colors.secondary_container,
  },
  watchlistAddedPressable: {
    width: '100%',
  },
  watchlistAdded: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xs,
    width: '100%',
    backgroundColor: colors.surface_container_highest,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.primary,
    overflow: 'hidden',
  },
  watchlistAddedLabel: {
    ...typography.textStyle.titleLg,
    color: colors.primary,
  },
  watchlistPressed: {
    opacity: 0.92,
  },
  synopsisHeading: {
    ...typography.textStyle.headlineMd,
    color: colors.on_surface,
  },
  synopsisBody: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface,
  },
  synopsisBlock: {
    gap: spacing.xs,
  },
  readMorePressable: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xxs,
  },
  readMoreText: {
    ...typography.textStyle.bodyMd,
    color: colors.primary_container,
  },
  sectionHeading: {
    ...typography.textStyle.headlineMd,
    color: colors.on_surface,
  },
  sectionBlock: {
    gap: spacing.sm,
  },
  sectionError: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface_variant,
  },
  castUnavailable: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface_variant,
  },
  castRow: {
    flexDirection: 'row',
    gap: CAST_SCROLL_GAP,
    paddingVertical: spacing.xs,
  },
  castCard: {
    width: spacing.castAvatar + spacing.lg,
    gap: spacing.xxs,
  },
  castAvatar: {
    width: spacing.castAvatar,
    height: spacing.castAvatar,
    borderRadius: spacing.castAvatar / 2,
    backgroundColor: colors.surface_container,
  },
  castAvatarPlaceholder: {
    width: spacing.castAvatar,
    height: spacing.castAvatar,
    borderRadius: spacing.castAvatar / 2,
    backgroundColor: colors.surface_container_high,
    alignItems: 'center',
    justifyContent: 'center',
  },
  castName: {
    ...typography.textStyle.labelSm,
    color: colors.on_surface,
  },
  castCharacter: {
    ...typography.textStyle.labelSm,
    color: colors.on_surface_variant,
  },
  moreLikeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
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
  seeAllPlaceholder: {
    width: spacing.xl,
  },
  similarRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: HOME_HORIZONTAL_CARD_GAP,
    paddingVertical: spacing.xs,
  },
  castSkeletonRow: {
    flexDirection: 'row',
    gap: CAST_SCROLL_GAP,
    paddingVertical: spacing.xs,
  },
  castSkeletonItem: {
    width: spacing.castAvatar + spacing.lg,
    gap: spacing.xs,
  },
  castSkeletonAvatar: {
    width: spacing.castAvatar,
    height: spacing.castAvatar,
    borderRadius: spacing.castAvatar / 2,
    backgroundColor: colors.surface_container_highest,
  },
  castSkeletonLine: {
    height: spacing.sm,
    borderRadius: spacing.xs,
    backgroundColor: colors.surface_container_highest,
  },
  castSkeletonLineShort: {
    height: spacing.sm,
    width: '70%',
    borderRadius: spacing.xs,
    backgroundColor: colors.surface_container_highest,
  },
  similarSkeletonCard: {
    gap: spacing.xs,
  },
  similarSkeletonPoster: {
    width: '100%',
    borderRadius: spacing.md,
    backgroundColor: colors.surface_container_highest,
  },
  similarSkeletonLine: {
    height: typography.textStyle.titleLg.lineHeight,
    borderRadius: spacing.xs,
    backgroundColor: colors.surface_container_highest,
  },
  similarSkeletonLineShort: {
    height: typography.textStyle.labelSm.lineHeight,
    width: '80%',
    borderRadius: spacing.xs,
    backgroundColor: colors.surface_container_highest,
  },
});
