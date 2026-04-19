import { isNormalizedApiError } from '../src/api/client';
import { queryErrorKindFromUnknown } from '../src/utils/queryErrorKind';

describe('queryErrorKindFromUnknown', () => {
  it('returns network for normalized API error with status 0', () => {
    const err = { message: 'Request failed', status: 0 };
    expect(isNormalizedApiError(err)).toBe(true);
    expect(queryErrorKindFromUnknown(err)).toBe('network');
  });

  it('returns generic for normalized API error with HTTP status', () => {
    const err = { message: 'Bad request', status: 400 };
    expect(queryErrorKindFromUnknown(err)).toBe('generic');
  });

  it('returns network for ERR_NETWORK Error', () => {
    const err = new Error('Network Error');
    expect(queryErrorKindFromUnknown(err)).toBe('network');
  });
});
