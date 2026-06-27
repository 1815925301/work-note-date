import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import 'dayjs/locale/zh-cn'

dayjs.extend(isoWeek)
dayjs.locale('zh-cn')

export function today() {
  return dayjs().format('YYYY-MM-DD')
}

export function formatDate(date: string, format = 'YYYY年M月D日') {
  return dayjs(date).format(format)
}

export function monthPeriod(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function quarterPeriod(year: number, quarter: number) {
  return `${year}-Q${quarter}`
}

export function getQuarterMonths(year: number, quarter: number) {
  const startMonth = (quarter - 1) * 3 + 1
  return [startMonth, startMonth + 1, startMonth + 2].map((m) => ({
    year,
    month: m,
    period: monthPeriod(year, m),
  }))
}

export function monthRange(year: number, month: number) {
  const start = dayjs(`${year}-${String(month).padStart(2, '0')}-01`)
  return {
    from: start.format('YYYY-MM-DD'),
    to: start.endOf('month').format('YYYY-MM-DD'),
  }
}

export function quarterRange(year: number, quarter: number) {
  const startMonth = (quarter - 1) * 3 + 1
  const start = dayjs(`${year}-${String(startMonth).padStart(2, '0')}-01`)
  return {
    from: start.format('YYYY-MM-DD'),
    to: start.add(2, 'month').endOf('month').format('YYYY-MM-DD'),
  }
}

export function currentQuarterRange(date?: string) {
  const d = dayjs(date ?? today())
  const quarter = Math.ceil((d.month() + 1) / 3)
  return quarterRange(d.year(), quarter)
}

export function recentDays(count: number) {
  return Array.from({ length: count }, (_, i) =>
    dayjs().subtract(i, 'day').format('YYYY-MM-DD')
  )
}

export function contentPreview(content: string, max = 100) {
  const text = content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
  if (text.length <= max) return text
  return `${text.slice(0, max)}...`
}

const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export function weekRange(date: string) {
  const d = dayjs(date)
  return {
    from: d.startOf('isoWeek').format('YYYY-MM-DD'),
    to: d.endOf('isoWeek').format('YYYY-MM-DD'),
  }
}

export function getWeekDays(date: string) {
  const start = dayjs(date).startOf('isoWeek')
  return Array.from({ length: 7 }, (_, i) => {
    const day = start.add(i, 'day')
    return {
      date: day.format('YYYY-MM-DD'),
      weekday: WEEKDAY_LABELS[i],
      isToday: day.format('YYYY-MM-DD') === today(),
    }
  })
}

export function formatWeekTitle(date: string) {
  const { from, to } = weekRange(date)
  const fromD = dayjs(from)
  const toD = dayjs(to)
  if (fromD.year() === toD.year()) {
    return `${fromD.format('YYYY年M月D日')} - ${toD.format('M月D日')}`
  }
  return `${fromD.format('YYYY年M月D日')} - ${toD.format('YYYY年M月D日')}`
}

export function weekPath(date?: string) {
  return `/week/${date ?? today()}`
}
