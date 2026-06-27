import { Router } from 'express'
import {
  deleteEntry,
  getAllTags,
  getEntriesInRange,
  getEntry,
  searchEntriesByTags,
  upsertEntry,
} from '../storage/entries.js'

export function createEntriesRouter(dataDir: string) {
  const router = Router()

  router.get('/', async (req, res) => {
    try {
      const { from, to } = req.query
      if (typeof from !== 'string' || typeof to !== 'string') {
        res.status(400).json({ error: 'from and to query params required' })
        return
      }
      const entries = await getEntriesInRange(dataDir, from, to)
      res.json(entries)
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  router.get('/tags', async (_req, res) => {
    try {
      const tags = await getAllTags(dataDir)
      res.json(tags)
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  router.get('/search', async (req, res) => {
    try {
      const { tags, from, to, match } = req.query
      if (typeof tags !== 'string' || !tags.trim()) {
        res.status(400).json({ error: 'tags query param required' })
        return
      }
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean)
      const entries = await searchEntriesByTags(dataDir, {
        tags: tagList,
        from: typeof from === 'string' ? from : undefined,
        to: typeof to === 'string' ? to : undefined,
        match: match === 'all' ? 'all' : 'any',
      })
      res.json(entries)
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  router.get('/:date', async (req, res) => {
    try {
      const entry = await getEntry(dataDir, req.params.date)
      if (!entry) {
        res.status(404).json({ error: 'Not found' })
        return
      }
      res.json(entry)
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  router.put('/:date', async (req, res) => {
    try {
      const { content = '', tags = [], hours } = req.body
      const entry = await upsertEntry(dataDir, req.params.date, {
        content,
        tags,
        hours,
      })
      res.json(entry)
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  router.delete('/:date', async (req, res) => {
    try {
      const deleted = await deleteEntry(dataDir, req.params.date)
      if (!deleted) {
        res.status(404).json({ error: 'Not found' })
        return
      }
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ error: String(err) })
    }
  })

  return router
}
