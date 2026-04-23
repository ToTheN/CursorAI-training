import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type WatchlistMediaType = 'movie' | 'tv';

export interface WatchlistEntry {
  id: number;
  mediaType: WatchlistMediaType;
}

interface WatchlistState {
  /** Number of items the user has last seen on the watchlist screen; badge = max(0, entries.length - this). */
  acknowledgedCount: number;
  entries: WatchlistEntry[];
  addEntry: (entry: WatchlistEntry) => void;
  removeEntry: (entry: WatchlistEntry) => void;
  clear: () => void;
  acknowledgeWatchlistViewed: () => void;
}

function entriesContain(entries: WatchlistEntry[], next: WatchlistEntry): boolean {
  return entries.some(
    (existing: WatchlistEntry): boolean =>
      existing.id === next.id && existing.mediaType === next.mediaType,
  );
}

function capAcknowledgedCount(ack: number, entryLength: number): number {
  return Math.min(ack, entryLength);
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set) => ({
      acknowledgedCount: 0,
      entries: [],
      addEntry: (entry: WatchlistEntry) =>
        set((state: WatchlistState) => ({
          entries: entriesContain(state.entries, entry)
            ? state.entries
            : [...state.entries, entry],
        })),
      removeEntry: (entry: WatchlistEntry) =>
        set((state: WatchlistState) => {
          const nextEntries: WatchlistEntry[] = state.entries.filter(
            (existing: WatchlistEntry) =>
              !(existing.id === entry.id && existing.mediaType === entry.mediaType),
          );
          return {
            entries: nextEntries,
            acknowledgedCount: capAcknowledgedCount(state.acknowledgedCount, nextEntries.length),
          };
        }),
      clear: () => set({ entries: [], acknowledgedCount: 0 }),
      acknowledgeWatchlistViewed: () =>
        set((state: WatchlistState) => ({ acknowledgedCount: state.entries.length })),
    }),
    {
      name: 'streamlist-watchlist',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: WatchlistState) => ({
        entries: state.entries,
        acknowledgedCount: state.acknowledgedCount,
      }),
      migrate: (
        persistedState: unknown,
        fromVersion: number,
      ): { entries: WatchlistEntry[]; acknowledgedCount: number } => {
        const parsed = persistedState as
          | {
              movieIds?: number[];
              entries?: WatchlistEntry[];
              acknowledgedCount?: number;
            }
          | null;
        if (parsed === null || parsed === undefined) {
          return { entries: [], acknowledgedCount: 0 };
        }
        let entries: WatchlistEntry[];
        if (parsed.entries !== undefined) {
          entries = parsed.entries;
        } else if (parsed.movieIds !== undefined) {
          entries = parsed.movieIds.map(
            (id: number): WatchlistEntry => ({ id, mediaType: 'movie' }),
          );
        } else {
          entries = [];
        }
        const fromOldStore: boolean = fromVersion < 2;
        const storedAck: number | undefined = parsed.acknowledgedCount;
        const acknowledgedCount: number =
          fromOldStore || storedAck === undefined
            ? entries.length
            : capAcknowledgedCount(storedAck, entries.length);
        return { entries, acknowledgedCount };
      },
    },
  ),
);
