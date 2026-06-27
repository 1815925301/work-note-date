import type { WorkEntry } from '@/types'

export function downloadText(filename: string, content: string, mime = 'text/markdown;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadJson(filename: string, data: unknown) {
  downloadText(filename, JSON.stringify(data, null, 2), 'application/json;charset=utf-8')
}

export function buildPeriodMarkdown(
  entries: WorkEntry[],
  period: string,
  type: 'month' | 'quarter'
) {
  const label = type === 'quarter' ? '季度总结' : '月度总结'
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  let md = `# ${period} ${label}\n\n`

  if (sorted.length === 0) {
    md += '暂无记录\n'
    return md
  }

  md += `共 ${sorted.length} 条记录。\n\n`

  for (const entry of sorted) {
    const tags = entry.tags.length ? ` · ${entry.tags.join(', ')}` : ''
    const hours = entry.hours ? ` · ${entry.hours}h` : ''
    md += `## ${entry.date}${hours}${tags}\n\n${entry.content.trim() || '（空）'}\n\n`
  }

  return md.trim() + '\n'
}

export function exportPeriodMarkdown(
  entries: WorkEntry[],
  period: string,
  type: 'month' | 'quarter'
) {
  const suffix = type === 'quarter' ? 'quarter-summary' : 'month-summary'
  downloadText(`${period}-${suffix}.md`, buildPeriodMarkdown(entries, period, type))
}
