import { buildWatchlistSummaryLabel } from '../src/utils/buildWatchlistSummaryLabel';

describe('buildWatchlistSummaryLabel', () => {
  it('returns a consistent label for empty list', () => {
    const actual: string = buildWatchlistSummaryLabel(0);
    const expected: string = 'No titles saved yet';
    expect(actual).toBe(expected);
  });
  it('uses singular for one item', () => {
    const actual: string = buildWatchlistSummaryLabel(1);
    const expected: string = '1 title saved';
    expect(actual).toBe(expected);
  });
  it('uses plural for several items', () => {
    const actual: string = buildWatchlistSummaryLabel(5);
    const expected: string = '5 titles saved';
    expect(actual).toBe(expected);
  });
  it('treats negative input as empty count copy', () => {
    const actual: string = buildWatchlistSummaryLabel(-3);
    const expected: string = '0 titles';
    expect(actual).toBe(expected);
  });
});
