import { getStore } from '@netlify/blobs'
import type { StorageBackend } from './backend.js'

const STORE_NAME = 'work-note-data'

function getBlobStore() {
  const siteID = process.env.NETLIFY_SITE_ID
  const token = process.env.NETLIFY_BLOB_READ_WRITE_TOKEN

  if (siteID && token) {
    return getStore({ name: STORE_NAME, siteID, token })
  }

  return getStore({ name: STORE_NAME })
}

export function createBlobBackend(): StorageBackend {
  return {
    async ensureDir() {
      /* no-op for blob storage */
    },

    async read(key: string) {
      return getBlobStore().get(key, { type: 'text' })
    },

    async write(key: string, content: string) {
      await getBlobStore().set(key, content)
    },

    async delete(key: string) {
      await getBlobStore().delete(key)
    },

    async listKeys(prefix: string) {
      const normalizedPrefix = prefix.replace(/\\/g, '/').replace(/\/$/, '')
      const { blobs } = await getBlobStore().list({ prefix: `${normalizedPrefix}/` })
      return blobs.map((blob) => blob.key)
    },
  }
}
