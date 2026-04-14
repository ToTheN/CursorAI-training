import type { Genre, MovieListItem } from '../src/api/types';
import { buildMovieCardSubtitle } from '../src/utils/movieCard';

const genres: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
];

describe('buildMovieCardSubtitle', () => {
  it('combines year and first resolved genre', () => {
    const item: MovieListItem = {
      id: 1,
      title: 'Test',
      poster_path: null,
      backdrop_path: null,
      vote_average: 7,
      release_date: '2023-06-01',
      genre_ids: [12, 28],
    };
    expect(buildMovieCardSubtitle(item, genres)).toBe('2023 • Adventure');
  });

  it('returns year only when no genre matches', () => {
    const item: MovieListItem = {
      id: 1,
      title: 'Test',
      poster_path: null,
      backdrop_path: null,
      vote_average: 7,
      release_date: '2020-01-01',
      genre_ids: [999],
    };
    expect(buildMovieCardSubtitle(item, genres)).toBe('2020');
  });

  it('returns empty string when no year and no genre', () => {
    const item: MovieListItem = {
      id: 1,
      title: 'Test',
      poster_path: null,
      backdrop_path: null,
      vote_average: 7,
      release_date: '',
      genre_ids: [],
    };
    expect(buildMovieCardSubtitle(item, genres)).toBe('');
  });
});
