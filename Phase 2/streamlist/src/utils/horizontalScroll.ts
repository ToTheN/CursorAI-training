import type { NativeScrollEvent } from 'react-native';

const ITEMS_FROM_END_THRESHOLD: number = 3;

/**
 * Returns true when horizontal scroll is within `ITEMS_FROM_END_THRESHOLD` item widths of the end.
 */
export function shouldLoadMoreMoviesRow(
  event: NativeScrollEvent,
  itemStride: number,
  itemCount: number,
): boolean {
  if (itemCount === 0 || itemStride <= 0) {
    return false;
  }
  const { contentOffset, layoutMeasurement, contentSize } = event;
  const scrollable: number = contentSize.width - layoutMeasurement.width;
  if (scrollable <= 0) {
    return false;
  }
  const distanceFromEnd: number =
    contentSize.width - layoutMeasurement.width - contentOffset.x;
  const thresholdPx: number = ITEMS_FROM_END_THRESHOLD * itemStride;
  return distanceFromEnd <= thresholdPx;
}
