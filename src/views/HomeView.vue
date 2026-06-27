<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import BackupPanel from '@/components/BackupPanel.vue'
import EntryContentPreview from '@/components/EntryContentPreview.vue'
import { api } from '@/api/client'
import type { WorkEntry } from '@/types'
import {
  formatDate,
  monthRange,
  recentDays,
  today,
  weekRange,
} from '@/utils/date'

const router = useRouter()

const todayStr = today()
const loading = ref(true)
const calendarDate = ref(new Date())
const displayYear = ref(dayjs().year())
const displayMonth = ref(dayjs().month() + 1)

const weekEntries = ref<WorkEntry[]>([])
const monthEntries = ref<WorkEntry[]>([])
const recentEntries = ref<WorkEntry[]>([])

const greeting = computed(() => {
  const hour = dayjs().hour()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const weekday = computed(() => dayjs().format('dddd'))
const todayEntry = computed(() => monthEntries.value.find((e) => e.date === todayStr))
const recordedDates = computed(() => new Set(monthEntries.value.map((e) => e.date)))

const stats = computed(() => [
  {
    label: '本周记录',
    value: weekEntries.value.length,
    suffix: '天',
    tone: 'blue',
  },
  {
    label: '本月记录',
    value: monthEntries.value.length,
    suffix: '天',
    tone: 'purple',
  },
  {
    label: '本周工时',
    value: weekEntries.value.reduce((sum, e) => sum + (e.hours ?? 0), 0),
    suffix: 'h',
    tone: 'green',
  },
  {
    label: '今日状态',
    value: todayEntry.value ? '已记录' : '未记录',
    suffix: '',
    tone: todayEntry.value ? 'green' : 'amber',
  },
])

async function loadMonthEntries() {
  const { from, to } = monthRange(displayYear.value, displayMonth.value)
  monthEntries.value = await api.getEntries(from, to)
}

async function loadAll() {
  loading.value = true
  try {
    const days = recentDays(7)
    const week = weekRange(todayStr)
    const [weekData, recentData] = await Promise.all([
      api.getEntries(week.from, week.to),
      api.getEntries(days[days.length - 1], days[0]),
      loadMonthEntries(),
    ])
    weekEntries.value = weekData
    recentEntries.value = recentData
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)

watch([displayYear, displayMonth], () => {
  calendarDate.value = new Date(displayYear.value, displayMonth.value - 1, 1)
  loadMonthEntries()
})

function prevMonth() {
  const d = dayjs(`${displayYear.value}-${displayMonth.value}-01`).subtract(1, 'month')
  displayYear.value = d.year()
  displayMonth.value = d.month() + 1
}

function nextMonth() {
  const d = dayjs(`${displayYear.value}-${displayMonth.value}-01`).add(1, 'month')
  displayYear.value = d.year()
  displayMonth.value = d.month() + 1
}

function goTodayMonth() {
  displayYear.value = dayjs().year()
  displayMonth.value = dayjs().month() + 1
}

function onDateClick(date: Date) {
  router.push(`/day/${dayjs(date).format('YYYY-MM-DD')}`)
}

function goDay(date: string) {
  router.push(`/day/${date}`)
}

function isToday(date: string) {
  return date === todayStr
}
</script>

<template>
  <div class="home" v-loading="loading">
    <header class="hero">
      <div class="hero-main">
        <p class="hero-kicker">{{ greeting }}，巧克力爸爸</p>
        <h1>{{ formatDate(todayStr) }} · {{ weekday }}</h1>
        <p class="hero-preview">今天也慢慢来，把重要的事稳稳记下来。</p>
      </div>
      <div class="hero-action">
        <span class="hero-status">{{ todayEntry ? '今日已归档' : '等待记录' }}</span>
        <el-button type="primary" size="large" round @click="goDay(todayStr)">
          {{ todayEntry ? '继续编辑' : '开始记录' }}
        </el-button>
      </div>
    </header>

    <section class="stats-grid">
      <article
        v-for="item in stats"
        :key="item.label"
        class="stat-card"
        :class="`stat-${item.tone}`"
      >
        <span class="stat-mark" />
        <span class="stat-label">{{ item.label }}</span>
        <span class="stat-value">
          {{ item.value }}<small v-if="item.suffix">{{ item.suffix }}</small>
        </span>
      </article>
    </section>

    <div class="main-grid">
      <section class="panel calendar-panel">
        <div class="panel-head">
          <div class="calendar-nav">
            <el-button text @click="prevMonth">←</el-button>
            <h2>{{ displayYear }} 年 {{ displayMonth }} 月</h2>
            <el-button text @click="nextMonth">→</el-button>
          </div>
          <el-button text type="primary" @click="goTodayMonth">回到本月</el-button>
        </div>

        <div class="calendar-wrap">
          <el-calendar v-model="calendarDate">
            <template #date-cell="{ data }">
              <div
                class="calendar-cell"
                :class="{
                  'is-today': data.day === todayStr,
                  'has-entry': recordedDates.has(data.day),
                }"
                @click="onDateClick(data.date)"
              >
                <span class="day-num">{{ data.day.split('-')[2] }}</span>
                <span v-if="recordedDates.has(data.day)" class="dot" />
              </div>
            </template>
          </el-calendar>
        </div>

        <div class="calendar-legend">
          <span><i class="dot-sample" /> 有记录</span>
          <span><i class="dot-sample today" /> 今天</span>
        </div>
      </section>

      <aside class="side-column">
        <section class="panel">
          <div class="panel-head">
            <h2>最近动态</h2>
            <span>近 7 天</span>
          </div>

          <el-empty
            v-if="!loading && recentEntries.length === 0"
            description="还没有记录"
            :image-size="64"
          />

          <div v-else class="timeline">
            <article
              v-for="entry in recentEntries"
              :key="entry.id"
              class="timeline-item"
              @click="goDay(entry.date)"
            >
              <div class="timeline-dot" :class="{ active: isToday(entry.date) }" />
              <div class="timeline-body">
                <div class="timeline-top">
                  <span class="timeline-date">
                    {{ formatDate(entry.date, 'M月D日') }}
                    <el-tag v-if="isToday(entry.date)" size="small" type="primary" effect="light">
                      今天
                    </el-tag>
                  </span>
                  <span v-if="entry.hours" class="timeline-hours">{{ entry.hours }}h</span>
                </div>
                <EntryContentPreview :content="entry.content" :max-height="120" />
                <div v-if="entry.tags.length" class="timeline-tags">
                  <el-tag v-for="tag in entry.tags" :key="tag" size="small" effect="plain">
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section class="panel backup-panel">
          <div class="panel-head">
            <h2>数据备份</h2>
          </div>
          <p class="backup-note">数据保存在本地 <code>data/</code> 目录</p>
          <BackupPanel />
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.home {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 8px;
}

.hero {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 28px;
  min-height: 180px;
  padding: 30px 34px;
  border-radius: 30px;
  background:
    radial-gradient(circle at 88% 18%, rgba(249, 115, 22, 0.38), transparent 24%),
    radial-gradient(circle at 12% 100%, rgba(20, 184, 166, 0.26), transparent 28%),
    linear-gradient(135deg, #111827 0%, #1e1b4b 54%, #312e81 100%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 26px 70px rgba(15, 23, 42, 0.22);
  color: #fff;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 16px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 24px;
  pointer-events: none;
}

.hero::after {
  content: '';
  position: absolute;
  right: 36px;
  bottom: -46px;
  width: 190px;
  height: 190px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
}

.hero-main,
.hero-action {
  position: relative;
  z-index: 1;
}

.hero-kicker {
  display: inline-flex;
  align-items: center;
  margin: 0 0 12px;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: #c7d2fe;
  font-size: 13px;
  letter-spacing: 0.04em;
}

.hero h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #fff;
}

.hero-preview {
  max-width: 660px;
  margin: 16px 0 0;
  font-size: 15px;
  color: #dbeafe;
  line-height: 1.5;
}

.hero-preview.muted {
  color: #a5b4fc;
}

.hero-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.hero-status {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.24);
  color: #e0f2fe;
  font-size: 13px;
}

.hero-action :deep(.el-button) {
  --el-button-bg-color: #f97316;
  --el-button-border-color: #f97316;
  --el-button-hover-bg-color: #fb923c;
  --el-button-hover-border-color: #fb923c;
  --el-button-active-bg-color: #ea580c;
  --el-button-active-border-color: #ea580c;
  min-width: 122px;
  font-weight: 700;
  box-shadow: 0 14px 34px rgba(249, 115, 22, 0.34);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-top: -40px;
  padding: 0 22px;
  position: relative;
  z-index: 2;
}

.stat-card {
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 20px;
  padding: 18px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 18px 46px rgba(15, 23, 42, 0.1);
  backdrop-filter: blur(18px);
}

.stat-card::after {
  content: '';
  position: absolute;
  right: -18px;
  top: -26px;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  opacity: 0.14;
}

.stat-mark {
  width: 34px;
  height: 4px;
  border-radius: 999px;
  margin-bottom: 2px;
}

.stat-blue .stat-mark,
.stat-blue::after { background: #2563eb; }
.stat-purple .stat-mark,
.stat-purple::after { background: #7c3aed; }
.stat-green .stat-mark,
.stat-green::after { background: #0f766e; }
.stat-amber .stat-mark,
.stat-amber::after { background: #f97316; }

.stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #111827;
}

.stat-value small {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin-left: 2px;
}

.main-grid {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  gap: 18px;
  align-items: start;
}

.panel {
  background: #fffaf0;
  border: 1px solid rgba(226, 214, 196, 0.82);
  border-radius: 26px;
  padding: 22px 24px;
  box-shadow: 0 18px 50px rgba(120, 83, 42, 0.08);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.panel-head h2 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
  letter-spacing: -0.02em;
}

.panel-head span {
  font-size: 13px;
  color: #9a8170;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.calendar-nav h2 {
  margin: 0;
  font-size: 18px;
  min-width: 120px;
  text-align: center;
}

.calendar-nav :deep(.el-button),
.panel-head :deep(.el-button) {
  color: #6b4f3f;
  font-weight: 700;
}

.calendar-wrap :deep(.el-calendar__header) {
  display: none;
}

.calendar-wrap :deep(.el-calendar) {
  background: transparent;
}

.calendar-wrap :deep(.el-calendar-table thead th) {
  padding: 12px 0;
  color: #9a8170;
  font-weight: 700;
}

.calendar-wrap :deep(.el-calendar-table .el-calendar-day) {
  height: 76px;
  padding: 5px;
}

.calendar-wrap :deep(.el-calendar-table td) {
  border-color: rgba(226, 214, 196, 0.52);
}

.calendar-wrap :deep(.el-calendar-table td.is-selected) {
  background: transparent;
}

.calendar-cell {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 16px;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.calendar-cell:hover {
  background: #fff4da;
  transform: translateY(-1px);
}

.calendar-cell.is-today {
  background: #111827;
  box-shadow: 0 14px 30px rgba(17, 24, 39, 0.16);
}

.calendar-cell.is-today .day-num {
  color: #fff7ed;
  font-weight: 800;
}

.day-num {
  font-size: 14px;
  color: #514237;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f97316;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.14);
}

.calendar-legend {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  font-size: 12px;
  color: #8b6f5c;
}

.calendar-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.dot-sample {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f97316;
}

.dot-sample.today {
  background: #111827;
  box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.15);
}

.side-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 14px;
  padding: 14px;
  border: 1px solid rgba(226, 214, 196, 0.66);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.48);
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease,
    border-color 0.15s ease;
}

.timeline-item:hover {
  background: #fff;
  border-color: rgba(249, 115, 22, 0.28);
  transform: translateY(-1px);
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c9b8a5;
  margin-top: 5px;
}

.timeline-dot.active {
  background: #f97316;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.16);
}

.timeline-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.timeline-date {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 800;
  font-size: 14px;
  color: #1f2937;
}

.timeline-hours {
  font-size: 12px;
  color: #8b6f5c;
  flex-shrink: 0;
}

.timeline-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.backup-panel .panel-head {
  margin-bottom: 8px;
}

.backup-note {
  margin: 0 0 12px;
  font-size: 13px;
  color: #8b6f5c;
}

.backup-note code {
  background: #fff4da;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

@media (max-width: 960px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .main-grid {
    grid-template-columns: 1fr;
  }

  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-action {
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
    margin-top: -24px;
    padding: 0 12px;
  }

  .calendar-wrap :deep(.el-calendar-table .el-calendar-day) {
    height: 56px;
  }
}
</style>
