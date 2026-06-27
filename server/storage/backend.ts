import path from 'path'
import { createBlobBackend } from './blobBackend.js'
import { createFsBackend } from './fsBackend.js'

export interface StorageBackend {
  read(key: string): Promise<string | null>
  write(key: string, content: string): Promise<void>
  delete(key: string): Promise<void>
  listKeys(prefix: string): Promise<string[]>
  ensureDir(dir: string): Promise<void>
}

let backend: StorageBackend | null = null

export function initStorage(dataDir: string) {
  backend = isNetlifyRuntime()
    ? createBlobBackend()
    : createFsBackend(dataDir)
}

export function getStorage(): StorageBackend {
  if (!backend) {
    throw new Error('Storage not initialized. Call initStorage() first.')
  }
  return backend
}

export function toStorageKey(dataDir: string, filePath: string): string {
  return path.relative(dataDir, filePath).replace(/\\/g, '/')
}

function isNetlifyRuntime() {
  return process.env.NETLIFY === 'true' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME)
}
