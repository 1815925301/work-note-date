import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api/client'
import type { WorkEntry } from '@/types'

export const useEntriesStore = defineStore('entries', () => {
  const entries = ref<WorkEntry[]>([])
  const loading = ref(false)

  async function fetchRange(from: string, to: string) {
    loading.value = true
    try {
      entries.value = await api.getEntries(from, to)
    } finally {
      loading.value = false
    }
  }

  async function fetchEntry(date: string) {
    return api.getEntry(date)
  }

  async function saveEntry(date: string, data: { content: string; tags: string[]; hours?: number }) {
    const entry = await api.saveEntry(date, data)
    const idx = entries.value.findIndex((e) => e.date === date)
    if (idx >= 0) {
      entries.value[idx] = entry
    } else {
      entries.value.unshift(entry)
    }
    return entry
  }

  async function removeEntry(date: string) {
    await api.deleteEntry(date)
    entries.value = entries.value.filter((e) => e.date !== date)
  }

  return { entries, loading, fetchRange, fetchEntry, saveEntry, removeEntry }
})
