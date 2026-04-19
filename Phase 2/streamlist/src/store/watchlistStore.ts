import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type WatchlistMediaType = 'movie' | 'tv';

export interface WatchlistEntry {
  id: number;
  mediaType: WatchlistMediaType;
}

interface WatchlistState {
  entries: WatchlistEntry[];
  addEntry: (entry: WatchlistEntry) => void;
  removeEntry: (entry: WatchlistEntry) => void;
  clear: () => void;
}

function entriesContain(entries: WatchlistEntry[], next: WatchlistEntry): boolean {
  return entries.some(
    (existing: WatchlistEntry): boolean =>
      existing.id === next.id && existing.mediaType === next.mediaType,
  );
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry: WatchlistEntry) =>
        set((state: WatchlistState) => ({
          entries: entriesContain(state.entries, entry)
            ? state.entries
            : [...state.entries, entry],
        })),
      removeEntry: (entry: WatchlistEntry) =>
        set((state: WatchlistState) => ({
          entries: state.entries.filter(
            (existing: WatchlistEntry) =>
              !(existing.id === entry.id && existing.mediaType === entry.mediaType),
          ),
        })),
      clear: () => set({ entries: [] }),
    }),
    {
      name: 'streamlist-watchlist',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: WatchlistState) => ({ entries: state.entries }),
      migrate: (persistedState: unknown): { entries: WatchlistEntry[] } => {
        const parsed = persistedState as { movieIds?: number[]; entries?: WatchlistEntry[] } | null;
        if (parsed === null || parsed === undefined) {
          return { entries: [] };
        }
        if (parsed.entries !== undefined) {
          return { entries: parsed.entries };
        }
        if (parsed.movieIds !== undefined) {
          return {
            entries: parsed.movieIds.map(
              (id: number): WatchlistEntry => ({ id, mediaType: 'movie' }),
            ),
          };
        }
        return { entries: [] };
      },
    },
  ),
);
