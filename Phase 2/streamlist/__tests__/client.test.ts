import { isNormalizedApiError } from '../src/api/client';

describe('api client helpers', () => {
  it('isNormalizedApiError recognises normalized errors', () => {
    expect(isNormalizedApiError({ message: 'Not found', status: 404 })).toBe(true);
    expect(isNormalizedApiError({ message: '', status: 0 })).toBe(true);
  });

  it('isNormalizedApiError rejects non-matching values', () => {
    expect(isNormalizedApiError(null)).toBe(false);
    expect(isNormalizedApiError(new Error('x'))).toBe(false);
    expect(isNormalizedApiError({ message: 1, status: 0 })).toBe(false);
  });
});
