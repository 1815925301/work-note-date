import cors from 'cors'
import express from 'express'
import path from 'path'
import { requireAuth } from './auth.js'
import { createAuthRouter } from './routes/auth.js'
import { createBackupRouter } from './routes/backup.js'
import { createEntriesRouter } from './routes/entries.js'
import { initStorage, getStorageKind, type StorageKind } from './storage/backend.js'
import { ensureDir } from './storage/jsonStore.js'

export async function createApp(dataDir: string, storage: StorageKind = 'filesystem') {
  initStorage(dataDir, storage)
  await ensureDir(path.join(dataDir, 'entries'))

  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '2mb' }))

  app.use('/api/auth', createAuthRouter())

  app.get('/api/health', requireAuth, (_req, res) => {
    res.json({
      ok: true,
      dataDir,
      storage: getStorageKind(),
    })
  })

  app.use('/api/entries', requireAuth, createEntriesRouter(dataDir))
  app.use('/api/backup', requireAuth, createBackupRouter(dataDir))

  return app
}
