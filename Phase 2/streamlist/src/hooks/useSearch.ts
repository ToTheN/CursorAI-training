import { useCallback, useEffect, useState } from 'react';
import { searchMovies } from '../api/movies';
import type { MovieListItem, PaginatedResponse } from '../api/types';
import { errorMessageFromUnknown } from './errorMessage';
import type { UseQueryResult } from './types';

export function useSearch(query: string): UseQueryResult<PaginatedResponse<MovieListItem>> {
  const [data, setData] = useState<PaginatedResponse<MovieListItem> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async (): Promise<void> => {
    const trimmed: string = query.trim();
    if (trimmed.length === 0) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const results: PaginatedResponse<MovieListItem> = await searchMovies(trimmed, 1);
      setData(results);
    } catch (err: unknown) {
      setError(errorMessageFromUnknown(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [query]);
  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);
  const refetch = useCallback((): void => {
    load().catch(() => undefined);
  }, [load]);
  return { data, loading, error, refetch };
}
