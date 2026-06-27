import { getStore } from '@netlify/blobs'
import type { StorageBackend } from './backend.js'

const STORE_NAME = 'work-note-data'

export function createBlobBackend(): StorageBackend {
  const store = getStore({ name: STORE_NAME, consistency: 'strong' })

  return {
    async ensureDir() {
      /* no-op for blob storage */
    },

    async read(key: string) {
      return store.get(key, { type: 'text' })
    },

    async write(key: string, content: string) {
      await store.set(key, content)
    },

    async delete(key: string) {
      await store.delete(key)
    },

    async listKeys(prefix: string) {
      const normalizedPrefix = prefix.replace(/\\/g, '/').replace(/\/$/, '')
      const { blobs } = await store.list({ prefix: `${normalizedPrefix}/` })
      return blobs.map((blob) => blob.key)
    },
  }
}
