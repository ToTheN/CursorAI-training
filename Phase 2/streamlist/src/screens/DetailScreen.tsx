import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { SimilarMovieItem } from '../api/types';
import { ScreenErrorBoundary } from '../components/ScreenErrorBoundary';
import { ScreenErrorFallback } from '../components/ScreenErrorFallback';
import { DetailScreenSkeleton } from '../components/skeletons/DetailScreenSkeleton';
import type { UseQueryResult } from '../hooks/types';
import type { MovieDetailScreenData } from '../hooks/useMovieDetail';
import { useMovieDetail } from '../hooks/useMovieDetail';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { buildImageUrl, IMAGE_SIZE_BACKDROP, IMAGE_SIZE_CARD } from '../utils/image';

type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Detail'>;

function DetailScreenContent(props: {
  movieId: number;
  detail: UseQueryResult<MovieDetailScreenData>;
}): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { movieId, detail } = props;
  const { data, loading, error, refetch } = detail;
  if (error !== null) {
    return <ScreenErrorFallback onTryAgain={refetch} />;
  }
  if (loading || data === null) {
    return <DetailScreenSkeleton />;
  }
  const { details, similar } = data;
  const backdropUri: string | null = buildImageUrl(details.backdrop_path, IMAGE_SIZE_BACKDROP);
  const genreLine: string = details.genres.map((g) => g.name).join(', ');
  const year: string =
    details.release_date.length >= 4 ? details.release_date.slice(0, 4) : '—';
  const runtimeLabel: string =
    details.runtime !== null ? `${details.runtime} min` : '—';
  const onOpenSimilar = (item: SimilarMovieItem): void => {
    if (item.id === movieId) {
      refetch();
      return;
    }
    navigation.replace('Detail', { movieId: item.id });
  };
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {backdropUri === null ? (
        <View style={[styles.backdrop, styles.backdropPlaceholder]}>
          <Text style={styles.backdropFallback} numberOfLines={2}>
            Backdrop unavailable
          </Text>
        </View>
      ) : (
        <Image source={{ uri: backdropUri }} style={styles.backdrop} accessibilityLabel="Backdrop" />
      )}
      <Text style={styles.headline}>{details.title}</Text>
      <Text style={styles.subline}>{genreLine.length > 0 ? `${year} · ${genreLine}` : year}</Text>
      <Text style={styles.meta}>
        Rating {details.vote_average.toFixed(1)} · {runtimeLabel}
      </Text>
      <Text style={styles.overview}>{details.overview}</Text>
      <Text style={styles.sectionTitle}>Similar</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.similarRow}
      >
        {similar.results.map((item: SimilarMovieItem) => {
          const posterUri: string | null = buildImageUrl(item.poster_path, IMAGE_SIZE_CARD);
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              style={({ pressed }) => [styles.similarCard, pressed && styles.cardPressed]}
              onPress={(): void => {
                onOpenSimilar(item);
              }}
            >
              {posterUri === null ? (
                <View style={[styles.similarPoster, styles.posterPlaceholder]}>
                  <Text style={styles.posterFallback} numberOfLines={2}>
                    {item.title}
                  </Text>
                </View>
              ) : (
                <Image
                  source={{ uri: posterUri }}
                  style={styles.similarPoster}
                  accessibilityLabel={item.title}
                />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </ScrollView>
  );
}

export function DetailScreen(props: DetailScreenProps): React.ReactElement {
  const { movieId } = props.route.params;
  const detail = useMovieDetail(movieId);
  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScreenErrorBoundary onRetry={detail.refetch}>
        <DetailScreenContent movieId={movieId} detail={detail} />
      </ScreenErrorBoundary>
    </SafeAreaView>
  );
}

const BACKDROP_HEIGHT: number = spacing.xl * 8;
const SIMILAR_W: number = spacing.xl * 2 + spacing.md;
const SIMILAR_H: number = spacing.xl * 4;

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
  backdrop: {
    width: '100%',
    height: BACKDROP_HEIGHT,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface_container,
  },
  backdropPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  backdropFallback: {
    ...typography.textStyle.labelSm,
    color: colors.on_surface_variant,
  },
  headline: {
    ...typography.textStyle.displayMd,
    color: colors.on_surface,
  },
  subline: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface_variant,
  },
  meta: {
    ...typography.textStyle.labelSm,
    color: colors.on_surface_variant,
  },
  overview: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface,
  },
  sectionTitle: {
    ...typography.textStyle.titleLg,
    color: colors.on_surface,
    marginTop: spacing.sm,
  },
  similarRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  similarCard: {
    borderRadius: spacing.xs,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.92,
  },
  similarPoster: {
    width: SIMILAR_W,
    height: SIMILAR_H,
    borderRadius: spacing.xs,
    backgroundColor: colors.surface_container,
  },
  posterPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  posterFallback: {
    ...typography.textStyle.labelSm,
    color: colors.on_surface_variant,
    textAlign: 'center',
  },
});
