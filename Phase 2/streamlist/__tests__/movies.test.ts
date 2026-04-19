import { apiClient } from '../src/api/client';
import {
  buildWithGenresOrParam,
  fetchDiscoverMovies,
  fetchMovieCredits,
  fetchMovieDetails,
  fetchMovieGenres,
  fetchSimilarMovies,
  fetchTopRatedMovies,
  fetchTrendingMoviesWeek,
  searchMovies,
} from '../src/api/movies';

jest.mock('../src/api/client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe('movies api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchTrendingMoviesWeek passes page param', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { page: 2, results: [], total_pages: 0, total_results: 0 },
    });
    await fetchTrendingMoviesWeek(2);
    expect(apiClient.get).toHaveBeenCalledWith('/trending/movie/week', { params: { page: 2 } });
  });

  it('fetchTopRatedMovies passes page param', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { page: 1, results: [], total_pages: 0, total_results: 0 },
    });
    await fetchTopRatedMovies(1);
    expect(apiClient.get).toHaveBeenCalledWith('/movie/top_rated', { params: { page: 1 } });
  });

  it('fetchMovieGenres calls genre list', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: { genres: [] } });
    await fetchMovieGenres();
    expect(apiClient.get).toHaveBeenCalledWith('/genre/movie/list');
  });

  it('fetchDiscoverMovies passes with_genres and page', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { page: 1, results: [], total_pages: 0, total_results: 0 },
    });
    await fetchDiscoverMovies(28, 3);
    expect(apiClient.get).toHaveBeenCalledWith('/discover/movie', {
      params: { with_genres: 28, page: 3 },
    });
  });

  it('fetchDiscoverMovies passes pipe-separated with_genres for OR (all genres)', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { page: 1, results: [], total_pages: 0, total_results: 0 },
    });
    await fetchDiscoverMovies('28|12|16');
    expect(apiClient.get).toHaveBeenCalledWith('/discover/movie', {
      params: { with_genres: '28|12|16', page: 1 },
    });
  });

  it('fetchDiscoverMovies omits with_genres when undefined', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { page: 1, results: [], total_pages: 0, total_results: 0 },
    });
    await fetchDiscoverMovies(undefined);
    expect(apiClient.get).toHaveBeenCalledWith('/discover/movie', {
      params: { page: 1 },
    });
  });

  it('buildWithGenresOrParam joins ids with pipe', () => {
    expect(buildWithGenresOrParam([{ id: 28 }, { id: 12 }])).toBe('28|12');
  });

  it('searchMovies passes query and page', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { page: 1, results: [], total_pages: 0, total_results: 0 },
    });
    await searchMovies('bat', 2);
    expect(apiClient.get).toHaveBeenCalledWith('/search/movie', { params: { query: 'bat', page: 2 } });
  });

  it('searchMovies forwards AbortSignal when provided', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { page: 1, results: [], total_pages: 0, total_results: 0 },
    });
    const controller: AbortController = new AbortController();
    await searchMovies('bat', 1, controller.signal);
    expect(apiClient.get).toHaveBeenCalledWith('/search/movie', {
      params: { query: 'bat', page: 1 },
      signal: controller.signal,
    });
  });

  it('fetchMovieDetails uses movie id path', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: {
        title: 'Test Movie',
        backdrop_path: null,
        poster_path: null,
        vote_average: 8,
        release_date: '2020-01-01',
        genres: [],
        runtime: 120,
        overview: '',
      },
    });
    await fetchMovieDetails(99);
    expect(apiClient.get).toHaveBeenCalledWith('/movie/99');
  });

  it('fetchMovieCredits uses credits path', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: { cast: [] } });
    await fetchMovieCredits(99);
    expect(apiClient.get).toHaveBeenCalledWith('/movie/99/credits');
  });

  it('fetchSimilarMovies passes page', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { page: 1, results: [], total_pages: 0, total_results: 0 },
    });
    await fetchSimilarMovies(42, 2);
    expect(apiClient.get).toHaveBeenCalledWith('/movie/42/similar', { params: { page: 2 } });
  });
});
