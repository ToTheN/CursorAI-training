export function useMovieDetail(_movieId: number) {
  return {
    data: null,
    isLoading: false,
    error: null as Error | null,
  };
}
