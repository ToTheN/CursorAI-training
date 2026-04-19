import { mergeRecentSearchList } from '../src/utils/recentSearchList';

describe('mergeRecentSearchList', () => {
  it('prepends a new term and removes case-insensitive duplicates', () => {
    const actual: string[] = mergeRecentSearchList(['b', 'a'], 'B', 5);
    expect(actual).toEqual(['B', 'a']);
  });

  it('respects max length', () => {
    const actual: string[] = mergeRecentSearchList(['d', 'c', 'b', 'a'], 'new', 3);
    expect(actual).toEqual(['new', 'd', 'c']);
  });

  it('returns a copy when term is empty', () => {
    const previous: string[] = ['only'];
    const actual: string[] = mergeRecentSearchList(previous, '   ', 5);
    expect(actual).toEqual(['only']);
    expect(actual).not.toBe(previous);
  });
});
