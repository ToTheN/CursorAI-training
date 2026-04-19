import { useCallback, useEffect, useRef, useState } from 'react';
import { isNormalizedCancelError } from '../api/client';
import { searchMovies } from '../api/movies';
import type { MovieListItem, PaginatedResponse } from '../api/types';
import { queryErrorKindFromUnknown } from '../utils/queryErrorKind';
import { errorMessageFromUnknown } from './errorMessage';
import type { QueryErrorKind, UseQueryResult } from './types';

const SEARCH_DEBOUNCE_MS: number = 400;

export interface UseSearchOptions {
  /** Invoked once when a debounced search request completes successfully (not per keystroke). */
  onSearchCompleted?: (term: string) => void;
}

export interface UseSearchResult extends UseQueryResult<PaginatedResponse<MovieListItem>> {
  /** Query string used for the last scheduled API request (after debounce). */
  debouncedQuery: string;
  /** True while the input differs from `debouncedQuery` (user still typing or debounce pending). */
  isDebouncing: boolean;
}

export function useSearch(query: string, options?: UseSearchOptions): UseSearchResult {
  const onSearchCompletedRef = useRef<UseSearchOptions['onSearchCompleted']>(options?.onSearchCompleted);
  onSearchCompletedRef.current = options?.onSearchCompleted;
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [data, setData] = useState<PaginatedResponse<MovieListItem> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<QueryErrorKind | null>(null);
  const loadGenerationRef = useRef<number>(0);
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const trimmed: string = query.trim();
    if (trimmed.length === 0) {
      setDebouncedQuery('');
      return;
    }
    debounceTimerRef.current = setTimeout((): void => {
      setDebouncedQuery(trimmed);
      debounceTimerRef.current = null;
    }, SEARCH_DEBOUNCE_MS);
    return (): void => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);
  const trimmedInput: string = query.trim();
  const isDebouncing: boolean = trimmedInput.length > 0 && trimmedInput !== debouncedQuery.trim();
  useEffect((): void => {
    if (!isDebouncing) {
      return;
    }
    setError(null);
    setErrorKind(null);
  }, [isDebouncing]);
  const load = useCallback(async (): Promise<void> => {
    const trimmed: string = debouncedQuery.trim();
    const myGeneration: number = ++loadGenerationRef.current;
    abortRef.current?.abort();
    if (trimmed.length === 0) {
      setData(null);
      setError(null);
      setErrorKind(null);
      setLoading(false);
      abortRef.current = null;
      return;
    }
    const controller: AbortController = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    setErrorKind(null);
    try {
      const results: PaginatedResponse<MovieListItem> = await searchMovies(trimmed, 1, controller.signal);
      if (myGeneration !== loadGenerationRef.current) {
        return;
      }
      setData(results);
      onSearchCompletedRef.current?.(trimmed);
    } catch (err: unknown) {
      if (myGeneration !== loadGenerationRef.current) {
        return;
      }
      if (isNormalizedCancelError(err)) {
        return;
      }
      setError(errorMessageFromUnknown(err));
      setErrorKind(queryErrorKindFromUnknown(err));
      setData(null);
    } finally {
      if (myGeneration === loadGenerationRef.current) {
        setLoading(false);
      }
    }
  }, [debouncedQuery]);
  useEffect((): void => {
    load().catch(() => undefined);
  }, [load]);
  const refetch = useCallback((): void => {
    load().catch(() => undefined);
  }, [load]);
  return {
    data,
    loading,
    error,
    errorKind,
    refetch,
    debouncedQuery,
    isDebouncing,
  };
}
