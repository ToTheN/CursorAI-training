import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { TMDB_ACCESS_TOKEN, TMDB_API_BASE_URL } from '@env';

/** Rejected by response interceptor after normalization (and after retry is exhausted). */
export interface NormalizedApiError {
  message: string;
  status: number;
}

const NETWORK_RETRY_KEY = '__networkRetryCount' as const;

type InternalConfigWithRetry = InternalAxiosRequestConfig & {
  [NETWORK_RETRY_KEY]?: number;
};

export function isNormalizedApiError(value: unknown): value is NormalizedApiError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as NormalizedApiError;
  return typeof candidate.message === 'string' && typeof candidate.status === 'number';
}

function extractMessageFromResponseData(data: unknown): string | null {
  if (typeof data === 'string' && data.length > 0) {
    return data;
  }
  if (data !== null && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    if (typeof record.status_message === 'string' && record.status_message.length > 0) {
      return record.status_message;
    }
    if (typeof record.message === 'string' && record.message.length > 0) {
      return record.message;
    }
  }
  return null;
}

function normalizeAxiosError(error: AxiosError): NormalizedApiError {
  const status: number = error.response?.status ?? 0;
  const fromBody: string | null =
    error.response !== undefined ? extractMessageFromResponseData(error.response.data) : null;
  const message: string = fromBody ?? error.message ?? 'Request failed';
  return { message, status };
}

function shouldAttemptNetworkRetry(error: AxiosError): boolean {
  if (error.response !== undefined) {
    return false;
  }
  if (error.code === 'ERR_CANCELED') {
    return false;
  }
  return true;
}

const resolvedBaseUrl: string =
  typeof TMDB_API_BASE_URL === 'string' && TMDB_API_BASE_URL.length > 0
    ? TMDB_API_BASE_URL
    : 'https://api.themoviedb.org/3';

const hasAccessToken: boolean =
  typeof TMDB_ACCESS_TOKEN === 'string' && TMDB_ACCESS_TOKEN.length > 0;

/** Default instance headers carry Bearer auth; hooks do not set Authorization per call. */
export const apiClient = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 20000,
  ...(hasAccessToken
    ? { headers: { Authorization: `Bearer ${TMDB_ACCESS_TOKEN}` } }
    : {}),
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalConfigWithRetry | undefined;
    if (config !== undefined && shouldAttemptNetworkRetry(error)) {
      const prior: number = config[NETWORK_RETRY_KEY] ?? 0;
      if (prior < 1) {
        config[NETWORK_RETRY_KEY] = prior + 1;
        return apiClient.request(config);
      }
    }
    return Promise.reject(normalizeAxiosError(error));
  },
);
