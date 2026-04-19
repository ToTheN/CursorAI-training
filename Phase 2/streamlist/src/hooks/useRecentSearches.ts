import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { mergeRecentSearchList } from '../utils/recentSearchList';

const RECENT_SEARCHES_STORAGE_KEY: string = '@streamlist/recent_searches_v1';
const MAX_RECENT_SEARCHES: number = 5;

function normalizeRecentList(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const strings: string[] = raw.filter(
    (item: unknown): item is string => typeof item === 'string' && item.trim().length > 0,
  );
  return strings.slice(0, MAX_RECENT_SEARCHES);
}

export interface UseRecentSearchesResult {
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  clearAllRecentSearches: () => void;
}

export function useRecentSearches(): UseRecentSearchesResult {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  useEffect((): void => {
    AsyncStorage.getItem(RECENT_SEARCHES_STORAGE_KEY)
      .then((raw: string | null): void => {
        if (raw === null || raw.length === 0) {
          return;
        }
        try {
          const parsed: unknown = JSON.parse(raw) as unknown;
          setRecentSearches(normalizeRecentList(parsed));
        } catch {
          setRecentSearches([]);
        }
      })
      .catch((): void => {
        setRecentSearches([]);
      });
  }, []);
  const persist = useCallback((next: string[]): void => {
    AsyncStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);
  const addRecentSearch = useCallback(
    (term: string): void => {
      if (term.trim().length === 0) {
        return;
      }
      setRecentSearches((prev: string[]): string[] => {
        const next: string[] = mergeRecentSearchList(prev, term, MAX_RECENT_SEARCHES);
        if (next.length === prev.length && next.every((v: string, i: number) => v === prev[i])) {
          return prev;
        }
        persist(next);
        return next;
      });
    },
    [persist],
  );
  const clearAllRecentSearches = useCallback((): void => {
    setRecentSearches([]);
    AsyncStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY).catch(() => undefined);
  }, []);
  return { recentSearches, addRecentSearch, clearAllRecentSearches };
}
