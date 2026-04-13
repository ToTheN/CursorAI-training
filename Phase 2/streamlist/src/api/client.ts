import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { TMDB_API_BASE_URL, TMDB_API_KEY } from '@env';

export const apiClient = axios.create({
  baseURL: TMDB_API_BASE_URL.length > 0 ? TMDB_API_BASE_URL : 'https://api.themoviedb.org/3',
  timeout: 20000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (TMDB_API_KEY.length > 0) {
    config.params = {
      ...(config.params as Record<string, unknown> | undefined),
      api_key: TMDB_API_KEY,
    };
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error),
);
