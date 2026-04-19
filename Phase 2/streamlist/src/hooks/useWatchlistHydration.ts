import { useCallback, useEffect, useState } from 'react';
import { fetchMovieDetails, fetchTvDetails } from '../api/movies';
import type { MovieDetails, TvDetails } from '../api/types';
import type { WatchlistEntry } from '../store/watchlistStore';
import { queryErrorKindFromUnknown } from '../utils/queryErrorKind';
import { errorMessageFromUnknown } from './errorMessage';
import type { QueryErrorKind, UseQueryResult } from './types';

export interface HydratedWatchlistItem {
  entry: WatchlistEntry;
  movie: MovieDetails | null;
  tv: TvDetails | null;
  fetchFailed: boolean;
}

export interface WatchlistHydrationData {
  items: HydratedWatchlistItem[];
}

function sortHydratedByEntryOrder(
  entries: WatchlistEntry[],
  hydrated: Map<string, HydratedWatchlistItem>,
): HydratedWatchlistItem[] {
  const ordered: HydratedWatchlistItem[] = [];
  for (const entry of entries) {
    const key: string = `${entry.mediaType}:${String(entry.id)}`;
    const row: HydratedWatchlistItem | undefined = hydrated.get(key);
    if (row !== undefined) {
      ordered.push(row);
    }
  }
  return ordered;
}

function entryKey(entry: WatchlistEntry): string {
  return `${entry.mediaType}:${String(entry.id)}`;
}

export function useWatchlistHydration(entries: WatchlistEntry[]): UseQueryResult<WatchlistHydrationData> {
  const [data, setData] = useState<WatchlistHydrationData | null>(null);
  const [loading, setLoading] = useState<boolean>(entries.length > 0);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<QueryErrorKind | null>(null);
  const load = useCallback(async (): Promise<void> => {
    if (entries.length === 0) {
      setData({ items: [] });
      setLoading(false);
      setError(null);
      setErrorKind(null);
      return;
    }
    setLoading(true);
    setError(null);
    setErrorKind(null);
    try {
      const settled: PromiseSettledResult<HydratedWatchlistItem | null>[] = await Promise.allSettled(
        entries.map(
          async (entry: WatchlistEntry): Promise<HydratedWatchlistItem | null> => {
            try {
              if (entry.mediaType === 'movie') {
                const movie: MovieDetails = await fetchMovieDetails(entry.id);
                return { entry, movie, tv: null, fetchFailed: false };
              }
              const tv: TvDetails = await fetchTvDetails(entry.id);
              return { entry, movie: null, tv, fetchFailed: false };
            } catch {
              return { entry, movie: null, tv: null, fetchFailed: true };
            }
          },
        ),
      );
      const map: Map<string, HydratedWatchlistItem> = new Map();
      for (let i: number = 0; i < settled.length; i += 1) {
        const result = settled[i];
        const entry: WatchlistEntry = entries[i] as WatchlistEntry;
        if (result.status === 'fulfilled' && result.value !== null) {
          map.set(entryKey(entry), result.value);
        } else {
          map.set(entryKey(entry), { entry, movie: null, tv: null, fetchFailed: true });
        }
      }
      setData({ items: sortHydratedByEntryOrder(entries, map) });
    } catch (err: unknown) {
      setError(errorMessageFromUnknown(err));
      setErrorKind(queryErrorKindFromUnknown(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [entries]);
  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);
  const refetch = useCallback((): void => {
    load().catch(() => undefined);
  }, [load]);
  return { data, loading, error, errorKind, refetch };
}
