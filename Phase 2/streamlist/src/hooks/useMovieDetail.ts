import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchMovieCredits,
  fetchMovieDetails,
  fetchSimilarMovies,
} from '../api/movies';
import type { MovieCredits, MovieDetails, MovieListItem, PaginatedResponse } from '../api/types';
import { queryErrorKindFromUnknown } from '../utils/queryErrorKind';
import { errorMessageFromUnknown } from './errorMessage';
import type { QueryErrorKind } from './types';

export interface MovieDetailSectionState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  errorKind: QueryErrorKind | null;
}

export interface MovieDetailQueryResult {
  details: MovieDetailSectionState<MovieDetails>;
  credits: MovieDetailSectionState<MovieCredits>;
  similar: MovieDetailSectionState<PaginatedResponse<MovieListItem>>;
  refetch: () => void;
}

function initialSection<T>(): MovieDetailSectionState<T> {
  return { data: null, loading: true, error: null, errorKind: null };
}

function fulfilledSection<T>(data: T): MovieDetailSectionState<T> {
  return { data, loading: false, error: null, errorKind: null };
}

function rejectedSection<T>(reason: unknown): MovieDetailSectionState<T> {
  return {
    data: null,
    loading: false,
    error: errorMessageFromUnknown(reason),
    errorKind: queryErrorKindFromUnknown(reason),
  };
}

/**
 * Loads movie detail sections. `useEffect` ensures fetch runs on mount and when `movieId` changes
 * (useFocusEffect alone can miss the first run in some native-stack timings → blank UI).
 * `useFocusEffect` refetches when the screen regains focus after leaving (e.g. See All).
 */
export function useMovieDetail(movieId: number): MovieDetailQueryResult {
  const activeMovieIdRef = useRef<number>(movieId);
  activeMovieIdRef.current = movieId;
  const [details, setDetails] = useState<MovieDetailSectionState<MovieDetails>>(() =>
    initialSection(),
  );
  const [credits, setCredits] = useState<MovieDetailSectionState<MovieCredits>>(() =>
    initialSection(),
  );
  const [similar, setSimilar] = useState<MovieDetailSectionState<PaginatedResponse<MovieListItem>>>(
    () => initialSection(),
  );
  const skipNextFocusLoadRef = useRef<boolean>(true);
  const load = useCallback(async (): Promise<void> => {
    const targetId: number = movieId;
    const isCurrentRequest = (): boolean => activeMovieIdRef.current === targetId;
    setDetails(initialSection());
    setCredits(initialSection());
    setSimilar(initialSection());
    await Promise.allSettled([
      fetchMovieDetails(targetId).then(
        (data: MovieDetails) => {
          if (!isCurrentRequest()) {
            return;
          }
          setDetails(fulfilledSection(data));
        },
        (reason: unknown) => {
          if (!isCurrentRequest()) {
            return;
          }
          setDetails(rejectedSection(reason));
        },
      ),
      fetchMovieCredits(targetId).then(
        (data: MovieCredits) => {
          if (!isCurrentRequest()) {
            return;
          }
          setCredits(fulfilledSection(data));
        },
        (reason: unknown) => {
          if (!isCurrentRequest()) {
            return;
          }
          setCredits(rejectedSection(reason));
        },
      ),
      fetchSimilarMovies(targetId, 1).then(
        (data: PaginatedResponse<MovieListItem>) => {
          if (!isCurrentRequest()) {
            return;
          }
          setSimilar(fulfilledSection(data));
        },
        (reason: unknown) => {
          if (!isCurrentRequest()) {
            return;
          }
          setSimilar(rejectedSection(reason));
        },
      ),
    ]);
  }, [movieId]);
  useEffect(() => {
    skipNextFocusLoadRef.current = true;
    load().catch(() => undefined);
  }, [load]);
  useFocusEffect(
    useCallback(() => {
      if (skipNextFocusLoadRef.current) {
        skipNextFocusLoadRef.current = false;
        return;
      }
      load().catch(() => undefined);
    }, [load]),
  );
  const refetch = useCallback((): void => {
    load().catch(() => undefined);
  }, [load]);
  return { details, credits, similar, refetch };
}
