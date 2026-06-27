import cors from 'cors'
import express from 'express'
import path from 'path'
import { createBackupRouter } from './routes/backup.js'
import { createEntriesRouter } from './routes/entries.js'
import { initStorage } from './storage/backend.js'
import { ensureDir } from './storage/jsonStore.js'

export async function createApp(dataDir: string) {
  initStorage(dataDir)
  await ensureDir(path.join(dataDir, 'entries'))

  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '2mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      dataDir,
      storage: process.env.NETLIFY === 'true' ? 'netlify-blobs' : 'filesystem',
    })
  })

  app.use('/api/entries', createEntriesRouter(dataDir))
  app.use('/api/backup', createBackupRouter(dataDir))

  return app
}
