import { useCallback, useEffect, useState } from 'react';
import { fetchMovieGenres, fetchSimilarMovies, fetchSimilarTvShows } from '../api/movies';
import type { Genre, MovieListItem } from '../api/types';
import type { WatchlistEntry } from '../store/watchlistStore';
import { tvListItemToMovieListItem } from '../utils/tmdbListAdapters';
import { queryErrorKindFromUnknown } from '../utils/queryErrorKind';
import { errorMessageFromUnknown } from './errorMessage';
import type { QueryErrorKind, UseQueryResult } from './types';

export interface WatchlistSimilarData {
  movies: MovieListItem[];
  genres: Genre[];
}

export function useWatchlistSimilar(sourceEntry: WatchlistEntry | null): UseQueryResult<WatchlistSimilarData> {
  const [data, setData] = useState<WatchlistSimilarData | null>(null);
  const [loading, setLoading] = useState<boolean>(sourceEntry !== null);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<QueryErrorKind | null>(null);
  const load = useCallback(async (): Promise<void> => {
    if (sourceEntry === null) {
      setData(null);
      setLoading(false);
      setError(null);
      setErrorKind(null);
      return;
    }
    setLoading(true);
    setError(null);
    setErrorKind(null);
    try {
      const genresResponse = await fetchMovieGenres();
      let movies: MovieListItem[];
      if (sourceEntry.mediaType === 'movie') {
        const similarPage = await fetchSimilarMovies(sourceEntry.id, 1);
        movies = similarPage.results;
      } else {
        const similarPage = await fetchSimilarTvShows(sourceEntry.id, 1);
        movies = similarPage.results.map(tvListItemToMovieListItem);
      }
      setData({ movies, genres: genresResponse.genres });
    } catch (err: unknown) {
      setError(errorMessageFromUnknown(err));
      setErrorKind(queryErrorKindFromUnknown(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [sourceEntry]);
  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);
  const refetch = useCallback((): void => {
    load().catch(() => undefined);
  }, [load]);
  return { data, loading, error, errorKind, refetch };
}
