import { apiClient } from '../src/api/client';
import { fetchSeeAllRailPage } from '../src/utils/seeAllRailPage';

jest.mock('../src/api/client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe('fetchSeeAllRailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls trending endpoint for trending rail', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { page: 2, results: [], total_pages: 0, total_results: 0 },
    });
    await fetchSeeAllRailPage('trending', 2, undefined, undefined, undefined);
    expect(apiClient.get).toHaveBeenCalledWith('/trending/movie/week', { params: { page: 2 } });
  });

  it('calls top_rated endpoint for topRated rail', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { page: 1, results: [], total_pages: 0, total_results: 0 },
    });
    await fetchSeeAllRailPage('topRated', 1, undefined, undefined, undefined);
    expect(apiClient.get).toHaveBeenCalledWith('/movie/top_rated', { params: { page: 1 } });
  });

  it('calls discover endpoint with with_genres for discover rail', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { page: 1, results: [], total_pages: 0, total_results: 0 },
    });
    await fetchSeeAllRailPage('discover', 1, 28, undefined, undefined);
    expect(apiClient.get).toHaveBeenCalledWith('/discover/movie', {
      params: { page: 1, with_genres: 28 },
    });
  });

  it('calls similar endpoint when similar rail includes source movie id', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { page: 1, results: [], total_pages: 0, total_results: 0 },
    });
    await fetchSeeAllRailPage('similar', 2, undefined, 55, undefined);
    expect(apiClient.get).toHaveBeenCalledWith('/movie/55/similar', { params: { page: 2 } });
  });

  it('calls TV similar endpoint when similar rail includes source TV id', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { page: 1, results: [], total_pages: 0, total_results: 0 },
    });
    await fetchSeeAllRailPage('similar', 1, undefined, undefined, 99);
    expect(apiClient.get).toHaveBeenCalledWith('/tv/99/similar', { params: { page: 1 } });
  });
});
