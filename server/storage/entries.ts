import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import type { WorkEntry } from '../types.js'
import { deleteJsonFile, readJsonFile, writeJsonFileAtomic } from './jsonStore.js'

function monthKey(date: string) {
  return date.slice(0, 7)
}

function entriesFile(dataDir: string, date: string) {
  return path.join(dataDir, 'entries', `${monthKey(date)}.json`)
}

export async function getEntry(dataDir: string, date: string): Promise<WorkEntry | null> {
  const entries = await readJsonFile<WorkEntry[]>(dataDir, entriesFile(dataDir, date), [])
  return entries.find((e) => e.date === date) ?? null
}

export async function getEntriesInRange(
  dataDir: string,
  from: string,
  to: string
): Promise<WorkEntry[]> {
  const start = new Date(from)
  const end = new Date(to)
  const months = new Set<string>()

  const cursor = new Date(start.getFullYear(), start.getMonth(), 1)
  while (cursor <= end) {
    months.add(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`)
    cursor.setMonth(cursor.getMonth() + 1)
  }

  const all: WorkEntry[] = []
  for (const month of months) {
    const filePath = path.join(dataDir, 'entries', `${month}.json`)
    const entries = await readJsonFile<WorkEntry[]>(dataDir, filePath, [])
    all.push(...entries)
  }

  return all
    .filter((e) => e.date >= from && e.date <= to)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function upsertEntry(
  dataDir: string,
  date: string,
  data: { content: string; tags: string[]; hours?: number }
): Promise<WorkEntry> {
  const filePath = entriesFile(dataDir, date)
  const entries = await readJsonFile<WorkEntry[]>(dataDir, filePath, [])
  const now = new Date().toISOString()
  const existing = entries.find((e) => e.date === date)

  if (existing) {
    existing.content = data.content
    existing.tags = data.tags
    existing.hours = data.hours
    existing.updatedAt = now
    await writeJsonFileAtomic(dataDir, filePath, entries)
    return existing
  }

  const entry: WorkEntry = {
    id: uuidv4(),
    date,
    content: data.content,
    tags: data.tags,
    hours: data.hours,
    createdAt: now,
    updatedAt: now,
  }
  entries.push(entry)
  entries.sort((a, b) => a.date.localeCompare(b.date))
  await writeJsonFileAtomic(dataDir, filePath, entries)
  return entry
}

export async function getAllEntries(dataDir: string): Promise<WorkEntry[]> {
  const { listJsonFiles } = await import('./jsonStore.js')
  const entriesDir = path.join(dataDir, 'entries')
  const all: WorkEntry[] = []

  for (const file of await listJsonFiles(dataDir, 'entries')) {
    const entries = await readJsonFile<WorkEntry[]>(dataDir, path.join(entriesDir, file), [])
    all.push(...entries)
  }

  return all.sort((a, b) => b.date.localeCompare(a.date))
}

export async function getAllTags(
  dataDir: string
): Promise<{ tag: string; count: number }[]> {
  const tagCounts = new Map<string, number>()

  for (const entry of await getAllEntries(dataDir)) {
    for (const tag of entry.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }

  return [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'zh-CN'))
}

export async function searchEntriesByTags(
  dataDir: string,
  options: {
    tags: string[]
    from?: string
    to?: string
    match?: 'any' | 'all'
  }
): Promise<WorkEntry[]> {
  const { tags, from, to, match = 'any' } = options
  if (tags.length === 0) return []

  const entries =
    from && to ? await getEntriesInRange(dataDir, from, to) : await getAllEntries(dataDir)

  return entries.filter((entry) => {
    if (match === 'all') {
      return tags.every((tag) => entry.tags.includes(tag))
    }
    return tags.some((tag) => entry.tags.includes(tag))
  })
}

export async function deleteEntry(dataDir: string, date: string): Promise<boolean> {
  const filePath = entriesFile(dataDir, date)
  const entries = await readJsonFile<WorkEntry[]>(dataDir, filePath, [])
  const filtered = entries.filter((e) => e.date !== date)
  if (filtered.length === entries.length) return false
  if (filtered.length === 0) {
    await deleteJsonFile(dataDir, filePath)
  } else {
    await writeJsonFileAtomic(dataDir, filePath, filtered)
  }
  return true
}
