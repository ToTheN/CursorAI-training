import { useWatchlistStore } from '../src/store/watchlistStore';

const movie = (id: number) => ({ id, mediaType: 'movie' as const });

function unseenCount(): number {
  const { entries, acknowledgedCount } = useWatchlistStore.getState();
  return Math.max(0, entries.length - acknowledgedCount);
}

describe('watchlistStore badge (acknowledgedCount)', () => {
  beforeEach((): void => {
    useWatchlistStore.getState().clear();
  });

  it('treats new items as unseen until the watchlist is acknowledged', () => {
    const state = useWatchlistStore.getState;
    state().addEntry(movie(1));
    expect(state().acknowledgedCount).toBe(0);
    expect(unseenCount()).toBe(1);
    state().acknowledgeWatchlistViewed();
    expect(state().acknowledgedCount).toBe(1);
    expect(unseenCount()).toBe(0);
  });

  it('shows 1 after viewing then adding a single new item', () => {
    const state = useWatchlistStore.getState;
    state().addEntry(movie(1));
    state().acknowledgeWatchlistViewed();
    state().addEntry(movie(2));
    expect(unseenCount()).toBe(1);
  });

  it('keeps cap when entries shrink below acknowledged', () => {
    const state = useWatchlistStore.getState;
    state().addEntry(movie(1));
    state().addEntry(movie(2));
    state().acknowledgeWatchlistViewed();
    state().removeEntry(movie(1));
    expect(state().acknowledgedCount).toBe(1);
    state().addEntry(movie(3));
    expect(unseenCount()).toBe(1);
  });
});
