import fs from 'fs/promises'
import path from 'path'
import type { StorageBackend } from './backend.js'

export function createFsBackend(dataDir: string): StorageBackend {
  function resolveKey(key: string) {
    return path.join(dataDir, key)
  }

  return {
    async ensureDir(dir: string) {
      await fs.mkdir(dir, { recursive: true })
    },

    async read(key: string) {
      try {
        return await fs.readFile(resolveKey(key), 'utf-8')
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
        throw err
      }
    },

    async write(key: string, content: string) {
      const filePath = resolveKey(key)
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      const tmpPath = `${filePath}.tmp`
      await fs.writeFile(tmpPath, content, 'utf-8')
      await fs.rename(tmpPath, filePath)
    },

    async delete(key: string) {
      try {
        await fs.unlink(resolveKey(key))
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
      }
    },

    async listKeys(prefix: string) {
      const dir = resolveKey(prefix)
      try {
        const files = await fs.readdir(dir)
        return files
          .filter((file) => file.endsWith('.json'))
          .map((file) => path.posix.join(prefix.replace(/\\/g, '/'), file))
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') return []
        throw err
      }
    },
  }
}
