const DEFAULT_MAX_RECENT: number = 5;

/**
 * Inserts a trimmed term at the front, removes case-insensitive duplicates, caps length.
 */
export function mergeRecentSearchList(
  previous: readonly string[],
  term: string,
  maxItems: number = DEFAULT_MAX_RECENT,
): string[] {
  const trimmed: string = term.trim();
  if (trimmed.length === 0) {
    return [...previous];
  }
  const withoutDup: string[] = previous.filter(
    (entry: string): boolean => entry.toLowerCase() !== trimmed.toLowerCase(),
  );
  return [trimmed, ...withoutDup].slice(0, maxItems);
}
