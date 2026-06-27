import path from 'path'
import { getStorage, toStorageKey } from './backend.js'

export async function ensureDir(dir: string) {
  await getStorage().ensureDir(dir)
}

export async function readJsonFile<T>(
  dataDir: string,
  filePath: string,
  defaultValue: T
): Promise<T> {
  const content = await getStorage().read(toStorageKey(dataDir, filePath))
  if (content === null) return defaultValue
  return JSON.parse(content) as T
}

export async function writeJsonFileAtomic(dataDir: string, filePath: string, data: unknown) {
  const key = toStorageKey(dataDir, filePath)
  await getStorage().write(key, JSON.stringify(data, null, 2))
}

export async function deleteJsonFile(dataDir: string, filePath: string) {
  await getStorage().delete(toStorageKey(dataDir, filePath))
}

export async function listJsonFiles(_dataDir: string, subdir: string): Promise<string[]> {
  const prefix = path.join(subdir).replace(/\\/g, '/')
  const keys = await getStorage().listKeys(prefix)
  return keys.map((key) => path.basename(key))
}
