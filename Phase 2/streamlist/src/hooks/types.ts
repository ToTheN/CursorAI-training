export type QueryErrorKind = 'network' | 'generic';

export interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  /** Present when `error` is set; maps to ScreenErrorFallback reason (network vs generic). */
  errorKind: QueryErrorKind | null;
  refetch: () => void;
}
