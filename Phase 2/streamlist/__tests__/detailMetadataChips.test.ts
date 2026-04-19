import type { MovieDetails } from '../src/api/types';
import { buildDetailMetadataChipLabels } from '../src/utils/detailMetadataChips';

function baseDetails(overrides: Partial<MovieDetails> = {}): MovieDetails {
  return {
    title: 'T',
    backdrop_path: null,
    poster_path: null,
    vote_average: 7,
    release_date: '2021-06-01',
    genres: [{ id: 1, name: 'Action' }],
    runtime: 100,
    overview: '',
    ...overrides,
  };
}

describe('buildDetailMetadataChipLabels', () => {
  it('returns chips in order year, rating, genre, runtime', () => {
    const { labels } = buildDetailMetadataChipLabels(baseDetails());
    expect(labels).toEqual(['2021', '★ 7.0', 'Action', '100 min']);
  });

  it('omits rating when vote_average is 0', () => {
    const { labels } = buildDetailMetadataChipLabels(baseDetails({ vote_average: 0 }));
    expect(labels).toEqual(['2021', 'Action', '100 min']);
  });

  it('omits runtime when null or 0', () => {
    expect(buildDetailMetadataChipLabels(baseDetails({ runtime: null })).labels).toEqual([
      '2021',
      '★ 7.0',
      'Action',
    ]);
    expect(buildDetailMetadataChipLabels(baseDetails({ runtime: 0 })).labels).toEqual([
      '2021',
      '★ 7.0',
      'Action',
    ]);
  });

  it('omits year when release_date is too short', () => {
    const { labels } = buildDetailMetadataChipLabels(baseDetails({ release_date: '20' }));
    expect(labels[0]).toBe('★ 7.0');
  });
});
