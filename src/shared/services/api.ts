import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../constants/config';
import { store } from '../store';
import { logout } from '../store/authSlice';
import type { ApiResponse } from '../types';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  request: InternalAxiosRequestConfig;
}> = [];

function endSession(): void {
  clearTokens();
  store.dispatch(logout());
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject, request: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const rt = getRefreshToken();
        if (!rt) throw error;

        const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: rt }
        );

        setTokens(data.data.accessToken, data.data.refreshToken);
        refreshQueue.forEach(({ resolve, request }) => {
          request.headers.Authorization = `Bearer ${data.data.accessToken}`;
          resolve(api(request));
        });
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        refreshQueue.forEach(({ reject }) => reject(refreshError));
        refreshQueue = [];
        endSession();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const code = (error.response?.data as { error?: { code?: string } })?.error?.code;
    if (error.response?.status === 403 && code === 'ONBOARDING_REQUIRED') {
      if (!window.location.pathname.startsWith('/onboarding')) {
        window.location.replace('/onboarding');
      }
    }

    return Promise.reject(error);
  }
);

export async function apiGet<T>(
  url: string,
  params?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await api.get<ApiResponse<T>>(url, { ...config, params });
  return data.data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await api.post<ApiResponse<T>>(url, body, config);
  return data.data;
}

export async function apiPatch<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const { data } = await api.patch<ApiResponse<T>>(url, body, config);
  return data.data;
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.delete<ApiResponse<T>>(url, config);
  return data.data;
}

/** Multipart form upload (e.g. CSV import) — field name must match what the backend expects. */
export async function apiPostFormData<T>(url: string, formData: FormData): Promise<T> {
  const { data } = await api.post<ApiResponse<T>>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

/** Extract a user-facing message from axios / API errors (prefers Zod field message). */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const apiError = (err.response?.data as ApiResponse<unknown> | undefined)?.error;
    const detailMessage = apiError?.details?.find((d) => d?.message)?.message;
    if (apiError?.message && apiError.message !== 'Validation failed') return apiError.message;
    if (detailMessage) return detailMessage;
    if (apiError?.message) return apiError.message;
    if (err.code === 'ECONNABORTED') return 'Request timed out. Check your connection.';
    if (!err.response) return 'Cannot reach the server. Check your connection.';
    return `Request failed (${err.response.status})`;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

/** Thrown by apiPostStream for a non-2xx response — carries the backend's error code the
 *  same way an axios error would, so callers can check `.code` uniformly (e.g. AI_QUOTA_EXCEEDED). */
export class ApiStreamError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'ApiStreamError';
    this.code = code;
  }
}

/**
 * POSTs to an SSE streaming endpoint using the browser's native `fetch` + `ReadableStream`
 * (fully supported, no polyfill needed). Calls `onDelta` per streamed token, then resolves
 * with the final `{done: true, ...}` payload the backend sends as the last SSE event.
 */
export async function apiPostStream<T>(
  url: string,
  body: unknown,
  onDelta: (delta: string) => void
): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok || !response.body) {
    let message = `Request failed (${response.status})`;
    let code: string | undefined;
    try {
      const errBody = (await response.json()) as { error?: { message?: string; code?: string } };
      if (errBody.error?.message) message = errBody.error.message;
      code = errBody.error?.code;
    } catch {
      // non-JSON error body — keep the generic message
    }
    throw new ApiStreamError(message, code);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalPayload: T | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const event of events) {
      const line = event.split('\n').find((l) => l.startsWith('data: '));
      if (!line) continue;
      const payload = JSON.parse(line.slice(6)) as { delta?: string; done?: boolean } & T;
      if (payload.done) {
        finalPayload = payload;
      } else if (typeof payload.delta === 'string') {
        onDelta(payload.delta);
      }
    }
  }

  if (!finalPayload) {
    throw new ApiStreamError('Stream ended without a final response');
  }
  return finalPayload;
}

export async function apiDownloadText(url: string, params?: Record<string, string>): Promise<string> {
  const token = getAccessToken();
  const search = params ? `?${new URLSearchParams(params).toString()}` : '';
  const response = await fetch(`${API_BASE_URL}${url}${search}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Download failed');
  return response.text();
}

export async function apiDownloadBinary(
  url: string,
  params?: Record<string, string>
): Promise<Blob> {
  const token = getAccessToken();
  const search = params ? `?${new URLSearchParams(params).toString()}` : '';
  const response = await fetch(`${API_BASE_URL}${url}${search}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Download failed');
  return response.blob();
}
