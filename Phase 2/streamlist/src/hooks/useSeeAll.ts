import { useCallback, useEffect, useRef, useState } from 'react';
import { buildWithGenresOrParam, fetchMovieGenres } from '../api/movies';
import type { GenreListResponse, MovieListItem, PaginatedResponse } from '../api/types';
import type { SeeAllRail } from '../navigation/types';
import { fetchSeeAllRailPage } from '../utils/seeAllRailPage';
import { queryErrorKindFromUnknown } from '../utils/queryErrorKind';
import { errorMessageFromUnknown } from './errorMessage';
import type { HomeGenreSelection } from './useHome';
import type { QueryErrorKind, UseQueryResult } from './types';

export interface SeeAllScreenData {
  genres: GenreListResponse;
  movies: PaginatedResponse<MovieListItem>;
}

export interface UseSeeAllResult extends UseQueryResult<SeeAllScreenData> {
  loadingMore: boolean;
  loadMore: () => Promise<void>;
}

function mergeMovieResults(existing: MovieListItem[], next: MovieListItem[]): MovieListItem[] {
  const seen: Set<number> = new Set(existing.map((m: MovieListItem) => m.id));
  const appended: MovieListItem[] = next.filter((m: MovieListItem) => !seen.has(m.id));
  return existing.concat(appended);
}

function emptyGenres(): GenreListResponse {
  return { genres: [] };
}

interface SeeAllQueryState {
  loading: boolean;
  error: string | null;
  errorKind: QueryErrorKind | null;
  data: SeeAllScreenData | null;
}

export function useSeeAll(
  rail: SeeAllRail,
  discoverGenreKey: HomeGenreSelection | undefined,
  similarSourceMovieId: number | undefined,
  similarSourceTvId: number | undefined,
): UseSeeAllResult {
  const [query, setQuery] = useState<SeeAllQueryState>({
    loading: true,
    error: null,
    errorKind: null,
    data: null,
  });
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [discoverWithGenres, setDiscoverWithGenres] = useState<number | string | undefined>(undefined);
  const loadInFlightRef = useRef<boolean>(false);
  const load = useCallback(async (): Promise<void> => {
    setQuery({ loading: true, error: null, errorKind: null, data: null });
    try {
      if (rail === 'discover') {
        if (discoverGenreKey === undefined) {
          setQuery({
            loading: false,
            error: 'Missing genre for discover',
            errorKind: 'generic',
            data: null,
          });
          return;
        }
        if (discoverGenreKey === 'all') {
          const genresResponse: GenreListResponse = await fetchMovieGenres();
          const withGenres: number | string | undefined =
            genresResponse.genres.length > 0
              ? buildWithGenresOrParam(genresResponse.genres)
              : undefined;
          setDiscoverWithGenres(withGenres);
          const firstPage: PaginatedResponse<MovieListItem> = await fetchSeeAllRailPage(
            'discover',
            1,
            withGenres,
            undefined,
            undefined,
          );
          setQuery({
            loading: false,
            error: null,
            errorKind: null,
            data: { genres: genresResponse, movies: firstPage },
          });
          return;
        }
        const genreId: number = discoverGenreKey;
        setDiscoverWithGenres(genreId);
        const [genresSettled, moviesSettled] = await Promise.allSettled([
          fetchMovieGenres(),
          fetchSeeAllRailPage('discover', 1, genreId, undefined, undefined),
        ]);
        const genresResponse: GenreListResponse =
          genresSettled.status === 'fulfilled' ? genresSettled.value : emptyGenres();
        if (moviesSettled.status === 'rejected') {
          setQuery({
            loading: false,
            error: errorMessageFromUnknown(moviesSettled.reason),
            errorKind: queryErrorKindFromUnknown(moviesSettled.reason),
            data: null,
          });
          return;
        }
        setQuery({
          loading: false,
          error: null,
          errorKind: null,
          data: { genres: genresResponse, movies: moviesSettled.value },
        });
        return;
      }
      if (rail === 'similar') {
        if (similarSourceMovieId === undefined && similarSourceTvId === undefined) {
          setQuery({
            loading: false,
            error: 'Missing source title for similar',
            errorKind: 'generic',
            data: null,
          });
          return;
        }
        setDiscoverWithGenres(undefined);
        const [genresSettled, moviesSettled] = await Promise.allSettled([
          fetchMovieGenres(),
          fetchSeeAllRailPage('similar', 1, undefined, similarSourceMovieId, similarSourceTvId),
        ]);
        const genresResponse: GenreListResponse =
          genresSettled.status === 'fulfilled' ? genresSettled.value : emptyGenres();
        if (moviesSettled.status === 'rejected') {
          setQuery({
            loading: false,
            error: errorMessageFromUnknown(moviesSettled.reason),
            errorKind: queryErrorKindFromUnknown(moviesSettled.reason),
            data: null,
          });
          return;
        }
        setQuery({
          loading: false,
          error: null,
          errorKind: null,
          data: { genres: genresResponse, movies: moviesSettled.value },
        });
        return;
      }
      setDiscoverWithGenres(undefined);
      const [genresSettled, moviesSettled] = await Promise.allSettled([
        fetchMovieGenres(),
        fetchSeeAllRailPage(rail, 1, undefined, undefined, undefined),
      ]);
      const genresResponse: GenreListResponse =
        genresSettled.status === 'fulfilled' ? genresSettled.value : emptyGenres();
      if (moviesSettled.status === 'rejected') {
        setQuery({
          loading: false,
          error: errorMessageFromUnknown(moviesSettled.reason),
          errorKind: queryErrorKindFromUnknown(moviesSettled.reason),
          data: null,
        });
        return;
      }
      setQuery({
        loading: false,
        error: null,
        errorKind: null,
        data: { genres: genresResponse, movies: moviesSettled.value },
      });
    } catch (err: unknown) {
      setQuery({
        loading: false,
        error: errorMessageFromUnknown(err),
        errorKind: queryErrorKindFromUnknown(err),
        data: null,
      });
    }
  }, [discoverGenreKey, rail, similarSourceMovieId, similarSourceTvId]);
  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);
  const refetch = useCallback((): void => {
    load().catch(() => undefined);
  }, [load]);
  const loadMore = useCallback(async (): Promise<void> => {
    if (query.data === null || loadInFlightRef.current) {
      return;
    }
    const current: PaginatedResponse<MovieListItem> = query.data.movies;
    if (current.page >= current.total_pages) {
      return;
    }
    loadInFlightRef.current = true;
    setLoadingMore(true);
    try {
      const nextPage: number = current.page + 1;
      const response: PaginatedResponse<MovieListItem> = await fetchSeeAllRailPage(
        rail,
        nextPage,
        discoverWithGenres,
        similarSourceMovieId,
        similarSourceTvId,
      );
      setQuery((prev: SeeAllQueryState): SeeAllQueryState => {
        if (prev.data === null) {
          return prev;
        }
        return {
          ...prev,
          data: {
            ...prev.data,
            movies: {
              page: response.page,
              total_pages: response.total_pages,
              total_results: response.total_results,
              results: mergeMovieResults(prev.data.movies.results, response.results),
            },
          },
        };
      });
    } catch (err: unknown) {
      setQuery((prev: SeeAllQueryState): SeeAllQueryState => ({
        ...prev,
        error: errorMessageFromUnknown(err),
        errorKind: queryErrorKindFromUnknown(err),
      }));
    } finally {
      loadInFlightRef.current = false;
      setLoadingMore(false);
    }
  }, [discoverWithGenres, query.data, rail, similarSourceMovieId, similarSourceTvId]);
  return {
    data: query.data,
    loading: query.loading,
    error: query.error,
    errorKind: query.errorKind,
    refetch,
    loadingMore,
    loadMore,
  };
}
