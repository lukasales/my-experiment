const normalizeBaseUrl = (url: string): string => url.replace(/\/+$/, '')

const rawApiUrl = import.meta.env.VITE_API_URL?.trim() || ''

if (!rawApiUrl) {
  throw new Error('Missing VITE_API_URL environment variable')
}

export const API_BASE_URL = normalizeBaseUrl(rawApiUrl)

export const buildApiUrl = (path: string): string =>
  `${API_BASE_URL}/${path.replace(/^\/+/, '')}`