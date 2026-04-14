import { isNormalizedApiError } from '../api/client';

export function errorMessageFromUnknown(err: unknown): string {
  if (isNormalizedApiError(err)) {
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'Something went wrong';
}
