import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchDiscoverMovies,
  fetchMovieGenres,
  fetchTopRatedMovies,
  fetchTrendingMoviesWeek,
} from '../api/movies';
import type { GenreListResponse, MovieListItem, PaginatedResponse } from '../api/types';
import { queryErrorKindFromUnknown } from '../utils/queryErrorKind';
import { errorMessageFromUnknown } from './errorMessage';
import type { QueryErrorKind, UseQueryResult } from './types';

/** `'all'` = one discover rail per genre from `/genre/movie/list` (separate API calls). */
export type HomeGenreSelection = 'all' | number;

export interface DiscoverGenreRail {
  genreId: number;
  genreName: string;
  discover: PaginatedResponse<MovieListItem>;
}

export interface HomeScreenData {
  trending: PaginatedResponse<MovieListItem>;
  topRated: PaginatedResponse<MovieListItem>;
  genres: GenreListResponse;
  /** Set when a single genre is selected (not `"all"`). */
  discoverByGenre: PaginatedResponse<MovieListItem> | null;
  /** Set when `"all"` is selected — one discover response per genre id. */
  discoverRails: DiscoverGenreRail[];
  /** Show the Trending row only when its API succeeded with at least one movie. */
  hasTrendingRail: boolean;
  /** Show the Top rated row only when its API succeeded with at least one movie. */
  hasTopRatedRail: boolean;
}

export interface UseHomeResult extends UseQueryResult<HomeScreenData> {
  loadingMoreDiscover: boolean;
  loadingMoreTrending: boolean;
  loadingMoreTopRated: boolean;
  /** For a single-genre rail, omit `genreId`. For `"all"` mode, pass the rail’s `genreId`. */
  loadMoreDiscover: (genreId?: number) => Promise<void>;
  loadMoreTrending: () => Promise<void>;
  loadMoreTopRated: () => Promise<void>;
}

function mergeMovieResults(existing: MovieListItem[], next: MovieListItem[]): MovieListItem[] {
  const seen: Set<number> = new Set(existing.map((m: MovieListItem) => m.id));
  const appended: MovieListItem[] = next.filter((m: MovieListItem) => !seen.has(m.id));
  return existing.concat(appended);
}

function emptyPaginatedMovies(): PaginatedResponse<MovieListItem> {
  return {
    page: 1,
    results: [],
    total_pages: 0,
    total_results: 0,
  };
}

function emptyGenres(): GenreListResponse {
  return { genres: [] };
}

/**
 * Keeps the last successful Home response so a remount (e.g. after closing a stack screen)
 * can restore data immediately and avoid `setLoading(true)` flashing the skeleton and
 * reloading every poster `Image`.
 */
let persistedHomeFeed: { genreKey: HomeGenreSelection; data: HomeScreenData } | null = null;

function readPersistedHomeFeed(genreKey: HomeGenreSelection): HomeScreenData | null {
  if (persistedHomeFeed !== null && persistedHomeFeed.genreKey === genreKey) {
    return persistedHomeFeed.data;
  }
  return null;
}

function writePersistedHomeFeed(genreKey: HomeGenreSelection, next: HomeScreenData): void {
  persistedHomeFeed = { genreKey, data: next };
}

function hasSuccessfulMovieData(
  settled: PromiseSettledResult<PaginatedResponse<MovieListItem>>,
): boolean {
  return (
    settled.status === 'fulfilled'
    && settled.value.results.length > 0
  );
}

export function useHome(selectedGenreKey: HomeGenreSelection): UseHomeResult {
  const [data, setData] = useState<HomeScreenData | null>(() =>
    readPersistedHomeFeed(selectedGenreKey),
  );
  const [loading, setLoading] = useState<boolean>(
    (): boolean => readPersistedHomeFeed(selectedGenreKey) === null,
  );
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<QueryErrorKind | null>(null);
  const [loadingMoreDiscover, setLoadingMoreDiscover] = useState<boolean>(false);
  const [loadingMoreTrending, setLoadingMoreTrending] = useState<boolean>(false);
  const [loadingMoreTopRated, setLoadingMoreTopRated] = useState<boolean>(false);
  const [discoverWithGenres, setDiscoverWithGenres] = useState<number | string | undefined>(undefined);
  const discoverSingleLoadInFlightRef = useRef<boolean>(false);
  const discoverMultiLoadInFlightRef = useRef<Set<number>>(new Set());
  const trendingLoadInFlightRef = useRef<boolean>(false);
  const topRatedLoadInFlightRef = useRef<boolean>(false);
  const prevGenreKeyRef = useRef<HomeGenreSelection>(selectedGenreKey);
  const load = useCallback(async (): Promise<void> => {
    const hasWarmCacheForGenre: boolean = readPersistedHomeFeed(selectedGenreKey) !== null;
    if (!hasWarmCacheForGenre) {
      setLoading(true);
    }
    setError(null);
    setErrorKind(null);
    try {
      const initialSettled: [
        PromiseSettledResult<PaginatedResponse<MovieListItem>>,
        PromiseSettledResult<PaginatedResponse<MovieListItem>>,
        PromiseSettledResult<GenreListResponse>,
      ] = await Promise.allSettled([
        fetchTrendingMoviesWeek(1),
        fetchTopRatedMovies(1),
        fetchMovieGenres(),
      ]);
      const trending: PaginatedResponse<MovieListItem> =
        initialSettled[0].status === 'fulfilled' ? initialSettled[0].value : emptyPaginatedMovies();
      const topRated: PaginatedResponse<MovieListItem> =
        initialSettled[1].status === 'fulfilled' ? initialSettled[1].value : emptyPaginatedMovies();
      const genresResponse: GenreListResponse =
        initialSettled[2].status === 'fulfilled' ? initialSettled[2].value : emptyGenres();
      const hasTrendingRail: boolean = hasSuccessfulMovieData(initialSettled[0]);
      const hasTopRatedRail: boolean = hasSuccessfulMovieData(initialSettled[1]);
      const anyInitialSuccess: boolean = initialSettled.some(
        (r: PromiseSettledResult<unknown>): boolean => r.status === 'fulfilled',
      );
      if (!anyInitialSuccess) {
        const firstRejected: PromiseRejectedResult | undefined = initialSettled.find(
          (r: PromiseSettledResult<unknown>): r is PromiseRejectedResult => r.status === 'rejected',
        );
        setError(errorMessageFromUnknown(firstRejected?.reason));
        setErrorKind(queryErrorKindFromUnknown(firstRejected?.reason));
        setData(null);
        return;
      }
      if (selectedGenreKey === 'all') {
        setDiscoverWithGenres(undefined);
        const discoverRails: DiscoverGenreRail[] =
          genresResponse.genres.length > 0
            ? (
                await Promise.all(
                  genresResponse.genres.map(
                    async (g: { id: number; name: string }): Promise<DiscoverGenreRail | null> => {
                      try {
                        const discover: PaginatedResponse<MovieListItem> = await fetchDiscoverMovies(g.id);
                        if (discover.results.length === 0) {
                          return null;
                        }
                        return { genreId: g.id, genreName: g.name, discover };
                      } catch {
                        return null;
                      }
                    },
                  ),
                )
              )
                .filter((r: DiscoverGenreRail | null): r is DiscoverGenreRail => r !== null)
                .sort((a: DiscoverGenreRail, b: DiscoverGenreRail) =>
                  a.genreName.localeCompare(b.genreName),
                )
            : [];
        setData({
          trending,
          topRated,
          genres: genresResponse,
          discoverByGenre: null,
          discoverRails,
          hasTrendingRail,
          hasTopRatedRail,
        });
      } else {
        const withGenres: number = selectedGenreKey;
        setDiscoverWithGenres(withGenres);
        let discoverByGenre: PaginatedResponse<MovieListItem> | null = null;
        try {
          const discover: PaginatedResponse<MovieListItem> = await fetchDiscoverMovies(withGenres);
          if (discover.results.length > 0) {
            discoverByGenre = discover;
          }
        } catch {
          discoverByGenre = null;
        }
        setData({
          trending,
          topRated,
          genres: genresResponse,
          discoverByGenre,
          discoverRails: [],
          hasTrendingRail,
          hasTopRatedRail,
        });
      }
    } catch (err: unknown) {
      setError(errorMessageFromUnknown(err));
      setErrorKind(queryErrorKindFromUnknown(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedGenreKey]);
  useEffect(() => {
    if (prevGenreKeyRef.current !== selectedGenreKey) {
      prevGenreKeyRef.current = selectedGenreKey;
      const cached: HomeScreenData | null = readPersistedHomeFeed(selectedGenreKey);
      setData(cached);
      setLoading(cached === null);
    }
  }, [selectedGenreKey]);
  useEffect(() => {
    if (data !== null) {
      writePersistedHomeFeed(selectedGenreKey, data);
    }
    /* Persist only when `data` changes: if `selectedGenreKey` were a dependency, switching
     * genres would write the previous rail under the new key (corrupts posters). */
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectedGenreKey matches the render for this `data`
  }, [data]);
  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);
  const refetch = useCallback((): void => {
    load().catch(() => undefined);
  }, [load]);
  const loadMoreDiscover = useCallback(async (genreId?: number): Promise<void> => {
    if (data === null) {
      return;
    }
    if (data.discoverRails.length > 0) {
      if (genreId === undefined) {
        return;
      }
      if (discoverMultiLoadInFlightRef.current.has(genreId)) {
        return;
      }
      const rail: DiscoverGenreRail | undefined = data.discoverRails.find(
        (r: DiscoverGenreRail) => r.genreId === genreId,
      );
      if (rail === undefined || rail.discover.page >= rail.discover.total_pages) {
        return;
      }
      discoverMultiLoadInFlightRef.current.add(genreId);
      setLoadingMoreDiscover(true);
      try {
        const nextPage: number = rail.discover.page + 1;
        const response: PaginatedResponse<MovieListItem> = await fetchDiscoverMovies(genreId, nextPage);
        setData((prev: HomeScreenData | null): HomeScreenData | null => {
          if (prev === null) {
            return null;
          }
          return {
            ...prev,
            discoverRails: prev.discoverRails.map((r: DiscoverGenreRail) =>
              r.genreId === genreId
                ? {
                    ...r,
                    discover: {
                      page: response.page,
                      total_pages: response.total_pages,
                      total_results: response.total_results,
                      results: mergeMovieResults(r.discover.results, response.results),
                    },
                  }
                : r,
            ),
          };
        });
      } catch (err: unknown) {
        setError(errorMessageFromUnknown(err));
        setErrorKind(queryErrorKindFromUnknown(err));
      } finally {
        discoverMultiLoadInFlightRef.current.delete(genreId);
        setLoadingMoreDiscover(false);
      }
      return;
    }
    if (data.discoverByGenre === null || discoverSingleLoadInFlightRef.current) {
      return;
    }
    const current: PaginatedResponse<MovieListItem> = data.discoverByGenre;
    if (current.page >= current.total_pages) {
      return;
    }
    discoverSingleLoadInFlightRef.current = true;
    setLoadingMoreDiscover(true);
    try {
      const nextPage: number = current.page + 1;
      const response: PaginatedResponse<MovieListItem> = await fetchDiscoverMovies(
        discoverWithGenres,
        nextPage,
      );
      setData((prev: HomeScreenData | null): HomeScreenData | null => {
        if (prev === null || prev.discoverByGenre === null) {
          return prev;
        }
        return {
          ...prev,
          discoverByGenre: {
            page: response.page,
            total_pages: response.total_pages,
            total_results: response.total_results,
            results: mergeMovieResults(prev.discoverByGenre.results, response.results),
          },
        };
      });
    } catch (err: unknown) {
      setError(errorMessageFromUnknown(err));
      setErrorKind(queryErrorKindFromUnknown(err));
    } finally {
      discoverSingleLoadInFlightRef.current = false;
      setLoadingMoreDiscover(false);
    }
  }, [data, discoverWithGenres]);
  const loadMoreTrending = useCallback(async (): Promise<void> => {
    if (data === null || trendingLoadInFlightRef.current) {
      return;
    }
    const current: PaginatedResponse<MovieListItem> = data.trending;
    if (current.page >= current.total_pages) {
      return;
    }
    trendingLoadInFlightRef.current = true;
    setLoadingMoreTrending(true);
    try {
      const nextPage: number = current.page + 1;
      const response: PaginatedResponse<MovieListItem> = await fetchTrendingMoviesWeek(nextPage);
      setData((prev: HomeScreenData | null): HomeScreenData | null => {
        if (prev === null) {
          return null;
        }
        return {
          ...prev,
          trending: {
            page: response.page,
            total_pages: response.total_pages,
            total_results: response.total_results,
            results: mergeMovieResults(prev.trending.results, response.results),
          },
        };
      });
    } catch (err: unknown) {
      setError(errorMessageFromUnknown(err));
      setErrorKind(queryErrorKindFromUnknown(err));
    } finally {
      trendingLoadInFlightRef.current = false;
      setLoadingMoreTrending(false);
    }
  }, [data]);
  const loadMoreTopRated = useCallback(async (): Promise<void> => {
    if (data === null || topRatedLoadInFlightRef.current) {
      return;
    }
    const current: PaginatedResponse<MovieListItem> = data.topRated;
    if (current.page >= current.total_pages) {
      return;
    }
    topRatedLoadInFlightRef.current = true;
    setLoadingMoreTopRated(true);
    try {
      const nextPage: number = current.page + 1;
      const response: PaginatedResponse<MovieListItem> = await fetchTopRatedMovies(nextPage);
      setData((prev: HomeScreenData | null): HomeScreenData | null => {
        if (prev === null) {
          return null;
        }
        return {
          ...prev,
          topRated: {
            page: response.page,
            total_pages: response.total_pages,
            total_results: response.total_results,
            results: mergeMovieResults(prev.topRated.results, response.results),
          },
        };
      });
    } catch (err: unknown) {
      setError(errorMessageFromUnknown(err));
      setErrorKind(queryErrorKindFromUnknown(err));
    } finally {
      topRatedLoadInFlightRef.current = false;
      setLoadingMoreTopRated(false);
    }
  }, [data]);
  return {
    data,
    loading,
    error,
    errorKind,
    refetch,
    loadingMoreDiscover,
    loadingMoreTrending,
    loadingMoreTopRated,
    loadMoreDiscover,
    loadMoreTrending,
    loadMoreTopRated,
  };
}
