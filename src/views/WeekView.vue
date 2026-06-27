<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import EntryContentPreview from '@/components/EntryContentPreview.vue'
import { useEntriesStore } from '@/stores/entries'
import { formatWeekTitle, getWeekDays, today, weekRange } from '@/utils/date'

const props = defineProps<{ date: string }>()
const router = useRouter()
const store = useEntriesStore()

const weekDays = computed(() => getWeekDays(props.date))
const title = computed(() => formatWeekTitle(props.date))

const entryMap = computed(() => {
  const map = new Map<string, (typeof store.entries)[0]>()
  for (const entry of store.entries) {
    map.set(entry.date, entry)
  }
  return map
})

const stats = computed(() => ({
  days: store.entries.length,
  hours: store.entries.reduce((sum, e) => sum + (e.hours ?? 0), 0),
}))

async function loadData() {
  const { from, to } = weekRange(props.date)
  await store.fetchRange(from, to)
}

onMounted(loadData)
watch(() => props.date, loadData)

function prevWeek() {
  const d = dayjs(props.date).subtract(1, 'week')
  router.push(`/week/${d.format('YYYY-MM-DD')}`)
}

function nextWeek() {
  const d = dayjs(props.date).add(1, 'week')
  router.push(`/week/${d.format('YYYY-MM-DD')}`)
}

function goTodayWeek() {
  router.push(`/week/${today()}`)
}

function goDay(date: string) {
  router.push(`/day/${date}`)
}
</script>

<template>
  <div class="week-view">
    <div class="toolbar">
      <div class="nav">
        <el-button @click="prevWeek">← 上周</el-button>
        <h2>{{ title }}</h2>
        <el-button @click="nextWeek">下周 →</el-button>
      </div>
      <el-button @click="goTodayWeek">回到本周</el-button>
    </div>

    <div class="stats-row">
      <div class="stat-item">
        <span class="stat-label">本周记录天数</span>
        <span class="stat-value">{{ stats.days }}<small>/ 7</small></span>
      </div>
      <div class="stat-item">
        <span class="stat-label">本周总工时</span>
        <span class="stat-value">{{ stats.hours }}<small>h</small></span>
      </div>
    </div>

    <div class="week-list" v-loading="store.loading">
      <article
        v-for="day in weekDays"
        :key="day.date"
        class="day-row"
        :class="{ today: day.isToday, empty: !entryMap.get(day.date) }"
        @click="goDay(day.date)"
      >
        <div class="day-meta">
          <span class="weekday">{{ day.weekday }}</span>
          <span class="date">{{ day.date.slice(5).replace('-', '/') }}</span>
          <el-tag v-if="day.isToday" size="small" type="primary" effect="light">今天</el-tag>
        </div>

        <div class="day-body">
          <template v-if="entryMap.get(day.date)">
            <EntryContentPreview
              :content="entryMap.get(day.date)!.content"
              :max-height="88"
            />
            <div class="day-footer">
              <div v-if="entryMap.get(day.date)!.tags.length" class="tags">
                <el-tag
                  v-for="tag in entryMap.get(day.date)!.tags"
                  :key="tag"
                  size="small"
                  type="info"
                  effect="plain"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <span v-if="entryMap.get(day.date)!.hours" class="hours">
                {{ entryMap.get(day.date)!.hours }}h
              </span>
            </div>
          </template>
          <div v-else class="empty-tip">暂无记录，点击添加</div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav h2 {
  margin: 0;
  font-size: 18px;
}

.stats-row {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 14px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  color: #64748b;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.stat-value small {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  margin-left: 2px;
}

.week-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.day-row {
  display: grid;
  grid-template-columns: 108px 1fr;
  gap: 20px;
  align-items: start;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 14px;
  cursor: pointer;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.day-row:hover {
  border-color: #bfdbfe;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
}

.day-row.today {
  border-color: #93c5fd;
  background: linear-gradient(90deg, #eff6ff 0%, #fff 28%);
}

.day-row.empty {
  background: #fafbfd;
}

.day-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 2px;
}

.weekday {
  font-weight: 700;
  font-size: 15px;
  color: #0f172a;
}

.date {
  font-size: 13px;
  color: #64748b;
}

.day-body {
  min-width: 0;
}

.day-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hours {
  font-size: 12px;
  color: #64748b;
  flex-shrink: 0;
}

.empty-tip {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.6;
  padding-top: 2px;
}

@media (max-width: 640px) {
  .day-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .day-meta {
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
  }
}
</style>
