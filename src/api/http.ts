import axios from 'axios'
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios'
import { mockAdapter } from './mockAdapter'

/**
 * Normalized error type for the whole app. Every failed request leaves the
 * API layer as an `ApiError` — components and stores never see a raw
 * AxiosError and must not wrap axios calls in their own try/catch.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string | null
  readonly data: unknown

  constructor(message: string, status: number, code: string | null = null, data: unknown = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.data = data
    // Restore prototype chain (TS targeting ES5-ish runtimes).
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

/**
 * Normalize any caught value into a message string. The API layer already
 * guarantees rejections are `ApiError`; this just covers the `unknown` type of
 * a catch clause safely.
 */
export function toErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Unknown error'
}

/** Tagged outcome of an API call — success carries data, failure a message. */
export type Settled<T> = { ok: true; data: T } | { ok: false; error: string }

/**
 * Run an API call and settle it into a tagged result. This keeps the only
 * try/catch in the service layer, so stores/components branch on `ok` and
 * never wrap axios in their own try/catch — they just read the error.
 */
export async function settle<T>(promise: Promise<T>): Promise<Settled<T>> {
  try {
    return { ok: true, data: await promise }
  } catch (error) {
    return { ok: false, error: toErrorMessage(error) }
  }
}

const instance: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  // No real backend: every request is served from localStorage.
  adapter: mockAdapter,
})

/** Pull a human-readable message out of an arbitrary error response body. */
function extractMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

// The ONLY place error handling lives. Any rejected request is converted to
// an ApiError here, so downstream code can rely on a single error shape.
instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status ?? 0
    const data = error.response?.data ?? null
    const message = extractMessage(data, error.message)
    const code = error.code ?? null
    return Promise.reject(new ApiError(message, status, code, data))
  },
)

/**
 * Generic, type-safe wrappers. `T` is the response payload; `B` the request
 * body. They return the unwrapped `data` so callers get a typed promise and
 * never touch AxiosResponse directly.
 */
export const http = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await instance.get<T>(url, config)
    return response.data
  },

  async post<T, B>(url: string, body: B, config?: AxiosRequestConfig): Promise<T> {
    const response = await instance.post<T, AxiosResponse<T>, B>(url, body, config)
    return response.data
  },

  async put<T, B>(url: string, body: B, config?: AxiosRequestConfig): Promise<T> {
    const response = await instance.put<T, AxiosResponse<T>, B>(url, body, config)
    return response.data
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await instance.delete<T>(url, config)
    return response.data
  },
}

export default instance
