import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildWithGenresOrParam,
  fetchDiscoverMovies,
  fetchMovieGenres,
  fetchTopRatedMovies,
  fetchTrendingMoviesWeek,
} from '../api/movies';
import type { GenreListResponse, MovieListItem, PaginatedResponse } from '../api/types';
import { errorMessageFromUnknown } from './errorMessage';
import type { UseQueryResult } from './types';

/** `'all'` = discover with every genre id from `/genre/movie/list` (OR / pipe). */
export type HomeGenreSelection = 'all' | number;

export interface HomeScreenData {
  trending: PaginatedResponse<MovieListItem>;
  topRated: PaginatedResponse<MovieListItem>;
  genres: GenreListResponse;
  discoverByGenre: PaginatedResponse<MovieListItem>;
}

export interface UseHomeResult extends UseQueryResult<HomeScreenData> {
  loadingMoreDiscover: boolean;
  loadingMoreTrending: boolean;
  loadingMoreTopRated: boolean;
  loadMoreDiscover: () => Promise<void>;
  loadMoreTrending: () => Promise<void>;
  loadMoreTopRated: () => Promise<void>;
}

function mergeMovieResults(existing: MovieListItem[], next: MovieListItem[]): MovieListItem[] {
  const seen: Set<number> = new Set(existing.map((m: MovieListItem) => m.id));
  const appended: MovieListItem[] = next.filter((m: MovieListItem) => !seen.has(m.id));
  return existing.concat(appended);
}

export function useHome(selectedGenreKey: HomeGenreSelection): UseHomeResult {
  const [data, setData] = useState<HomeScreenData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMoreDiscover, setLoadingMoreDiscover] = useState<boolean>(false);
  const [loadingMoreTrending, setLoadingMoreTrending] = useState<boolean>(false);
  const [loadingMoreTopRated, setLoadingMoreTopRated] = useState<boolean>(false);
  const [discoverWithGenres, setDiscoverWithGenres] = useState<number | string | undefined>(undefined);
  const discoverLoadInFlightRef = useRef<boolean>(false);
  const trendingLoadInFlightRef = useRef<boolean>(false);
  const topRatedLoadInFlightRef = useRef<boolean>(false);
  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [trending, topRated, genresResponse] = await Promise.all([
        fetchTrendingMoviesWeek(1),
        fetchTopRatedMovies(1),
        fetchMovieGenres(),
      ]);
      const withGenres: number | string | undefined =
        selectedGenreKey === 'all'
          ? genresResponse.genres.length > 0
            ? buildWithGenresOrParam(genresResponse.genres)
            : undefined
          : selectedGenreKey;
      setDiscoverWithGenres(withGenres);
      const discoverByGenre: PaginatedResponse<MovieListItem> = await fetchDiscoverMovies(withGenres);
      setData({ trending, topRated, genres: genresResponse, discoverByGenre });
    } catch (err: unknown) {
      setError(errorMessageFromUnknown(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedGenreKey]);
  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);
  const refetch = useCallback((): void => {
    load().catch(() => undefined);
  }, [load]);
  const loadMoreDiscover = useCallback(async (): Promise<void> => {
    if (data === null || discoverLoadInFlightRef.current) {
      return;
    }
    const current: PaginatedResponse<MovieListItem> = data.discoverByGenre;
    if (current.page >= current.total_pages) {
      return;
    }
    discoverLoadInFlightRef.current = true;
    setLoadingMoreDiscover(true);
    try {
      const nextPage: number = current.page + 1;
      const response: PaginatedResponse<MovieListItem> = await fetchDiscoverMovies(
        discoverWithGenres,
        nextPage,
      );
      setData((prev: HomeScreenData | null): HomeScreenData | null => {
        if (prev === null) {
          return null;
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
    } finally {
      discoverLoadInFlightRef.current = false;
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
    } finally {
      topRatedLoadInFlightRef.current = false;
      setLoadingMoreTopRated(false);
    }
  }, [data]);
  return {
    data,
    loading,
    error,
    refetch,
    loadingMoreDiscover,
    loadingMoreTrending,
    loadingMoreTopRated,
    loadMoreDiscover,
    loadMoreTrending,
    loadMoreTopRated,
  };
}
