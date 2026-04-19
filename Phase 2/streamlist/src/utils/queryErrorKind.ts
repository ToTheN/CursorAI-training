import { isNormalizedApiError } from '../api/client';
import type { QueryErrorKind } from '../hooks/types';

/**
 * Classifies API failures for {@link ScreenErrorFallback} copy (network vs generic server/other).
 */
export function queryErrorKindFromUnknown(err: unknown): QueryErrorKind {
  if (isNormalizedApiError(err)) {
    if (err.status === 0) {
      return 'network';
    }
    return 'generic';
  }
  if (err instanceof Error) {
    const msg: string = err.message.toLowerCase();
    const code: string | undefined = (err as Error & { code?: string }).code;
    if (
      code === 'ECONNABORTED'
      || code === 'ERR_NETWORK'
      || code === 'ENOTFOUND'
      || code === 'ECONNREFUSED'
      || msg.includes('network error')
      || msg.includes('timeout')
      || msg.includes('network request failed')
    ) {
      return 'network';
    }
  }
  return 'generic';
}
