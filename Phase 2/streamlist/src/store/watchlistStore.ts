import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface WatchlistState {
  movieIds: number[];
  addMovie: (id: number) => void;
  removeMovie: (id: number) => void;
  clear: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set) => ({
      movieIds: [],
      addMovie: (id: number) =>
        set((state) => ({
          movieIds: state.movieIds.includes(id) ? state.movieIds : [...state.movieIds, id],
        })),
      removeMovie: (id: number) =>
        set((state) => ({
          movieIds: state.movieIds.filter((existingId) => existingId !== id),
        })),
      clear: () => set({ movieIds: [] }),
    }),
    {
      name: 'streamlist-watchlist',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: WatchlistState) => ({ movieIds: state.movieIds }),
    },
  ),
);
