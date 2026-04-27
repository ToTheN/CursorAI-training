/**
 * Human-readable copy for the number of items on the local watchlist.
 */
export function buildWatchlistSummaryLabel(itemCount: number): string {
  if (itemCount < 0) {
    return '0 titles';
  }
  if (itemCount === 0) {
    return 'No titles saved yet';
  }
  if (itemCount === 1) {
    return '1 title saved';
  }
  return `${itemCount} titles saved`;
}
