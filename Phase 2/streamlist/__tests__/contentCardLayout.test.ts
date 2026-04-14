import { spacing } from '../src/theme/spacing';
import {
  HOME_HORIZONTAL_CARD_GAP,
  homeContentCardOuterWidth,
  posterFrameHeightFromOuterWidth,
} from '../src/utils/contentCardLayout';

describe('posterFrameHeightFromOuterWidth', () => {
  it('returns 2:3 poster height for full card width', () => {
    const outer: number = 100;
    expect(posterFrameHeightFromOuterWidth(outer)).toBe(150);
  });
});

describe('homeContentCardOuterWidth', () => {
  it('targets two cards per row (one gap between) using HOME_HORIZONTAL_CARD_GAP', () => {
    const windowWidth: number = 390;
    const contentWidth: number = windowWidth - spacing.md * 2;
    const expected: number = Math.floor((contentWidth - HOME_HORIZONTAL_CARD_GAP) / 2);
    expect(homeContentCardOuterWidth(windowWidth)).toBe(expected);
  });

  it('respects minimum card width on very narrow layouts', () => {
    const w: number = homeContentCardOuterWidth(120);
    expect(w).toBeGreaterThanOrEqual(spacing.xl * 2);
  });
});
