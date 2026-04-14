import type { NativeScrollEvent } from 'react-native';
import { shouldLoadMoreMoviesRow } from '../src/utils/horizontalScroll';

function buildEvent(
  contentWidth: number,
  layoutWidth: number,
  offsetX: number,
): NativeScrollEvent {
  return {
    contentOffset: { x: offsetX, y: 0 },
    layoutMeasurement: { width: layoutWidth, height: 0 },
    contentSize: { width: contentWidth, height: 0 },
  } as NativeScrollEvent;
}

describe('shouldLoadMoreMoviesRow', () => {
  const itemStride: number = 100;

  it('returns false when itemCount is zero', () => {
    const event: NativeScrollEvent = buildEvent(500, 300, 0);
    expect(shouldLoadMoreMoviesRow(event, itemStride, 0)).toBe(false);
  });

  it('returns false when content fits without horizontal scroll', () => {
    const event: NativeScrollEvent = buildEvent(300, 300, 0);
    expect(shouldLoadMoreMoviesRow(event, itemStride, 10)).toBe(false);
  });

  it('returns false when far from end', () => {
    const contentWidth: number = 2000;
    const layoutWidth: number = 300;
    const offsetX: number = 0;
    const event: NativeScrollEvent = buildEvent(contentWidth, layoutWidth, offsetX);
    expect(shouldLoadMoreMoviesRow(event, itemStride, 20)).toBe(false);
  });

  it('returns true when within three item strides of end', () => {
    const contentWidth: number = 2000;
    const layoutWidth: number = 300;
    const scrollable: number = contentWidth - layoutWidth;
    const offsetX: number = scrollable - 250;
    const event: NativeScrollEvent = buildEvent(contentWidth, layoutWidth, offsetX);
    expect(shouldLoadMoreMoviesRow(event, itemStride, 20)).toBe(true);
  });
});
