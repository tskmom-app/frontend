import { authStore } from './auth';
import type { ApiResponse } from '@/types/api';

/**
 * Same-origin API base. In dev, Vite proxies `/api` to the backend; in prod,
 * nginx proxies it. No CORS, no baked-in absolute URL.
 */
const BASE = import.meta.env.VITE_API_URL ?? '';

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Skip attaching the auth header (for public endpoints). */
  anonymous?: boolean;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (!options.anonymous) {
    const token = authStore.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  // 401 anywhere => session is dead; bounce to login. Suspend the promise so a
  // transient error toast doesn't flash while the page navigates away.
  if (res.status === 401 && !options.anonymous) {
    authStore.clear();
    if (!location.pathname.startsWith('/admin/login')) {
      location.href = '/admin/login';
      return new Promise<never>(() => {});
    }
  }

  let payload: ApiResponse<T> | null = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text) as ApiResponse<T>;
    } catch {
      throw new ApiError(res.status, 'PARSE_ERROR', 'Invalid server response');
    }
  }

  if (!res.ok || !payload || payload.success === false) {
    const err = payload && payload.success === false ? payload.error : null;
    throw new ApiError(
      res.status,
      err?.code ?? 'HTTP_ERROR',
      err?.message ?? `Request failed (${res.status})`,
      err?.details,
    );
  }

  return payload.data;
}

function toQuery(params?: Record<string, unknown>): string {
  if (!params) return '';
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export const api = {
  get: <T>(path: string, params?: Record<string, unknown>) =>
    request<T>(`${path}${toQuery(params)}`),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
