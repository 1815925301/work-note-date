import type { WorkEntry } from '@/types'

const BASE = import.meta.env.VITE_API_BASE || ''

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || res.statusText)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  health: () => request<{ ok: boolean; dataDir: string }>('/api/health'),

  getEntries: (from: string, to: string) =>
    request<WorkEntry[]>(`/api/entries?from=${from}&to=${to}`),

  getEntry: async (date: string): Promise<WorkEntry | null> => {
    try {
      return await request<WorkEntry>(`/api/entries/${date}`)
    } catch {
      return null
    }
  },

  saveEntry: (date: string, data: { content: string; tags: string[]; hours?: number }) =>
    request<WorkEntry>(`/api/entries/${date}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteEntry: (date: string) =>
    request<{ ok: boolean }>(`/api/entries/${date}`, { method: 'DELETE' }),

  getTags: () => request<{ tag: string; count: number }[]>('/api/entries/tags'),

  searchByTags: (params: {
    tags: string[]
    from?: string
    to?: string
    match?: 'any' | 'all'
  }) => {
    const query = new URLSearchParams({
      tags: params.tags.join(','),
      match: params.match ?? 'any',
    })
    if (params.from) query.set('from', params.from)
    if (params.to) query.set('to', params.to)
    return request<WorkEntry[]>(`/api/entries/search?${query.toString()}`)
  },

  exportBackup: () => request<unknown>('/api/backup'),

  restoreBackup: (data: unknown) =>
    request<{ ok: boolean }>('/api/backup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}
