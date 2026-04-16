import type { NativeScrollEvent } from 'react-native';
import { shouldLoadMoreMoviesRow, shouldLoadMoreVerticalList } from '../src/utils/horizontalScroll';

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

function buildVerticalEvent(
  contentHeight: number,
  layoutHeight: number,
  offsetY: number,
): NativeScrollEvent {
  return {
    contentOffset: { x: 0, y: offsetY },
    layoutMeasurement: { width: 0, height: layoutHeight },
    contentSize: { width: 0, height: contentHeight },
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

describe('shouldLoadMoreVerticalList', () => {
  const rowStride: number = 100;

  it('returns false when itemCount is zero', () => {
    const event: NativeScrollEvent = buildVerticalEvent(500, 400, 0);
    expect(shouldLoadMoreVerticalList(event, rowStride, 0)).toBe(false);
  });

  it('returns false when content fits without vertical scroll', () => {
    const event: NativeScrollEvent = buildVerticalEvent(300, 300, 0);
    expect(shouldLoadMoreVerticalList(event, rowStride, 10)).toBe(false);
  });

  it('returns false when far from end', () => {
    const event: NativeScrollEvent = buildVerticalEvent(2000, 400, 0);
    expect(shouldLoadMoreVerticalList(event, rowStride, 20)).toBe(false);
  });

  it('returns true when within three row strides of end', () => {
    const contentHeight: number = 2000;
    const layoutHeight: number = 400;
    const scrollable: number = contentHeight - layoutHeight;
    const offsetY: number = scrollable - 250;
    const event: NativeScrollEvent = buildVerticalEvent(contentHeight, layoutHeight, offsetY);
    expect(shouldLoadMoreVerticalList(event, rowStride, 20)).toBe(true);
  });
});
