import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MovieListItem, PaginatedResponse } from '../api/types';
import { ScreenErrorBoundary } from '../components/ScreenErrorBoundary';
import { ScreenErrorFallback } from '../components/ScreenErrorFallback';
import { SearchScreenSkeleton } from '../components/skeletons/SearchScreenSkeleton';
import type { UseQueryResult } from '../hooks/types';
import { useSearch } from '../hooks/useSearch';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { buildImageUrl, IMAGE_SIZE_CARD } from '../utils/image';

type SearchScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Search'>,
  NativeStackNavigationProp<RootStackParamList>
>;

function SearchScreenContent(props: {
  query: string;
  setQuery: (value: string) => void;
  search: UseQueryResult<PaginatedResponse<MovieListItem>>;
}): React.ReactElement {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { query, setQuery, search } = props;
  const { data, loading, error, refetch } = search;
  const trimmed: string = query.trim();
  const showSkeleton: boolean = trimmed.length > 0 && loading;
  if (error !== null && trimmed.length > 0) {
    return <ScreenErrorFallback onTryAgain={refetch} />;
  }
  if (showSkeleton) {
    return <SearchScreenSkeleton />;
  }
  const onOpenMovie = (item: MovieListItem): void => {
    navigation.navigate('Detail', { movieId: item.id });
  };
  const results: MovieListItem[] = data?.results ?? [];
  return (
    <View style={styles.contentRoot}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search movies"
        placeholderTextColor={colors.on_surface_variant}
        style={styles.input}
        accessibilityLabel="Search movies"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {trimmed.length === 0 ? (
        <Text style={styles.hint}>Type a title to search</Text>
      ) : results.length === 0 && !loading ? (
        <Text style={styles.hint}>No results</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item: MovieListItem): string => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.columnWrap}
          contentContainerStyle={styles.listContent}
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
      )}
    </View>
  );
}

function SearchResultCard(props: { item: MovieListItem }): React.ReactElement {
  const { item } = props;
  const uri: string | null = buildImageUrl(item.poster_path, IMAGE_SIZE_CARD);
  return (
    <View style={styles.card}>
      {uri === null ? (
        <View style={[styles.poster, styles.posterPlaceholder]}>
          <Text style={styles.posterFallback} numberOfLines={3}>
            {item.title}
          </Text>
        </View>
      ) : (
        <Image source={{ uri }} style={styles.poster} accessibilityLabel={item.title} />
      )}
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>
    </View>
  );
}

export function SearchScreen(): React.ReactElement {
  const [query, setQuery] = useState<string>('');
  const search = useSearch(query);
  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <ScreenErrorBoundary onRetry={search.refetch}>
        <SearchScreenContent query={query} setQuery={setQuery} search={search} />
      </ScreenErrorBoundary>
    </SafeAreaView>
  );
}

const CARD_GAP: number = spacing.md;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  contentRoot: {
    flex: 1,
  },
  input: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface,
    backgroundColor: colors.surface_container,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  hint: {
    ...typography.textStyle.bodyMd,
    color: colors.on_surface_variant,
    marginTop: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xl,
    gap: CARD_GAP,
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
  card: {
    gap: spacing.xs,
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface_container_high,
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
  cardTitle: {
    ...typography.textStyle.titleSm,
    color: colors.on_surface,
  },
});
