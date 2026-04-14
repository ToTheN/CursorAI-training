import { useCallback, useEffect, useState } from 'react';
import {
  fetchMovieCredits,
  fetchMovieDetails,
  fetchSimilarMovies,
} from '../api/movies';
import type {
  MovieCredits,
  MovieDetails,
  PaginatedResponse,
  SimilarMovieItem,
} from '../api/types';
import { errorMessageFromUnknown } from './errorMessage';
import type { UseQueryResult } from './types';

export interface MovieDetailScreenData {
  details: MovieDetails;
  credits: MovieCredits;
  similar: PaginatedResponse<SimilarMovieItem>;
}

export function useMovieDetail(movieId: number): UseQueryResult<MovieDetailScreenData> {
  const [data, setData] = useState<MovieDetailScreenData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [details, credits, similar] = await Promise.all([
        fetchMovieDetails(movieId),
        fetchMovieCredits(movieId),
        fetchSimilarMovies(movieId, 1),
      ]);
      setData({ details, credits, similar });
    } catch (err: unknown) {
      setError(errorMessageFromUnknown(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [movieId]);
  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);
  const refetch = useCallback((): void => {
    load().catch(() => undefined);
  }, [load]);
  return { data, loading, error, refetch };
}
