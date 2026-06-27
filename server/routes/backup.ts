import { Router } from 'express'
import path from 'path'
import { ensureDir, listJsonFiles, readJsonFile, writeJsonFileAtomic } from '../storage/jsonStore.js'

async function readDirJson(dataDir: string, subdir: string): Promise<Record<string, unknown>> {
  const result: Record<string, unknown> = {}
  const dir = path.join(dataDir, subdir)

  for (const file of await listJsonFiles(dataDir, subdir)) {
    const content = await readJsonFile<unknown>(dataDir, path.join(dir, file), null)
    if (content !== null) {
      result[file] = content
    }
  }

  return result
}

export function createBackupRouter(dataDir: string) {
  const router = Router()

  router.get('/', async (_req, res) => {
    try {
      const backup = {
        exportedAt: new Date().toISOString(),
        entries: await readDirJson(dataDir, 'entries'),
      }
      res.json(backup)
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  router.post('/', async (req, res) => {
    try {
      const { entries = {} } = req.body
      const entriesDir = path.join(dataDir, 'entries')
      await ensureDir(entriesDir)

      for (const [file, data] of Object.entries(entries)) {
        await writeJsonFileAtomic(dataDir, path.join(entriesDir, file), data)
      }
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  return router
}
