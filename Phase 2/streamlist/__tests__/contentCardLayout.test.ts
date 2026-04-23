import { spacing } from '../src/theme/spacing';
import {
  HOME_HORIZONTAL_CARD_GAP,
  homeContentCardOuterWidth,
  homeHeroPortraitHeight,
  homeHorizontalContentWidth,
  posterFrameHeightFromOuterWidth,
  seeAllGridRowStride,
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

describe('seeAllGridRowStride', () => {
  it('is greater than poster height alone', () => {
    const outer: number = 100;
    const posterH: number = posterFrameHeightFromOuterWidth(outer);
    expect(seeAllGridRowStride(outer)).toBeGreaterThan(posterH);
  });
});

describe('homeHorizontalContentWidth', () => {
  it('subtracts home horizontal padding from the window', () => {
    expect(homeHorizontalContentWidth(400)).toBe(400 - spacing.md * 2);
  });
});

describe('homeHeroPortraitHeight', () => {
  it('matches 2:3 when within min/max for typical phone size', () => {
    const content: number = 360;
    const h: number = 800;
    const expected: number = Math.round(
      Math.max(
        spacing.xl * 4 + spacing.md,
        Math.min(posterFrameHeightFromOuterWidth(content), h * 0.5, spacing.lg * 20),
      ),
    );
    expect(homeHeroPortraitHeight(content, h)).toBe(expected);
  });
});
