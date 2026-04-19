import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

/**
 * Matches `ContentCard` `copy` `minHeight` (two title lines + two subtitle lines).
 */
export const contentCardCopyBlockMinHeight: number =
  typography.textStyle.titleLg.lineHeight * 2 +
  spacing.xxs +
  typography.textStyle.labelSm.lineHeight * 2;

/**
 * Horizontal gap between cards in home carousel rows.
 * Must match `HomeScreen` `horizontalRow` `gap` and skeleton `posterRow` `gap`.
 */
export const HOME_HORIZONTAL_CARD_GAP: number = spacing.xxl;

/**
 * Poster area height for a 2:3 (width:height) image; `outerWidth` is the full card width.
 */
export function posterFrameHeightFromOuterWidth(outerWidth: number): number {
  return (outerWidth * 3) / 2;
}

/**
 * Home horizontal row: **two** cards visible across the content width (poster + title + subtitle),
 * with {@link HOME_HORIZONTAL_CARD_GAP} between them. Inset matches `HomeScreen` root horizontal
 * padding (`spacing.md` each side).
 */
export function homeContentCardOuterWidth(windowWidth: number): number {
  const horizontalInset: number = spacing.md * 2;
  const contentWidth: number = Math.max(0, windowWidth - horizontalInset);
  const widthPerCard: number = Math.floor((contentWidth - HOME_HORIZONTAL_CARD_GAP) / 2);
  const minWidth: number = spacing.xl * 2;
  return Math.max(widthPerCard, minWidth);
}

/**
 * Approximate height of one grid row (poster + title block + spacing) for vertical
 * infinite-scroll thresholds on the See All screen (two columns, same card width as home).
 */
export function seeAllGridRowStride(outerCardWidth: number): number {
  return (
    posterFrameHeightFromOuterWidth(outerCardWidth) +
    spacing.xs +
    contentCardCopyBlockMinHeight +
    spacing.md
  );
}
