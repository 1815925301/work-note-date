<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import EntryList from '@/components/EntryList.vue'
import { useEntriesStore } from '@/stores/entries'
import { exportPeriodMarkdown } from '@/utils/export'
import { monthPeriod, monthRange } from '@/utils/date'

const props = defineProps<{ year: number; month: number }>()
const router = useRouter()
const store = useEntriesStore()
const calendarDate = ref(new Date(props.year, props.month - 1, 1))

const period = computed(() => monthPeriod(props.year, props.month))
const recordedDates = computed(() => new Set(store.entries.map((e) => e.date)))

const stats = computed(() => ({
  days: store.entries.length,
  hours: store.entries.reduce((sum, e) => sum + (e.hours ?? 0), 0),
  tags: [...new Set(store.entries.flatMap((e) => e.tags))],
}))

async function loadData() {
  const { from, to } = monthRange(props.year, props.month)
  await store.fetchRange(from, to)
}

onMounted(loadData)
watch(() => [props.year, props.month], () => {
  calendarDate.value = new Date(props.year, props.month - 1, 1)
  loadData()
})

function prevMonth() {
  const d = dayjs(`${props.year}-${props.month}-01`).subtract(1, 'month')
  router.push(`/month/${d.year()}/${d.month() + 1}`)
}

function nextMonth() {
  const d = dayjs(`${props.year}-${props.month}-01`).add(1, 'month')
  router.push(`/month/${d.year()}/${d.month() + 1}`)
}

function onDateClick(date: Date) {
  const d = dayjs(date).format('YYYY-MM-DD')
  router.push(`/day/${d}`)
}

function exportSummary() {
  exportPeriodMarkdown(store.entries, period.value, 'month')
  ElMessage.success('本月总结已导出')
}
</script>

<template>
  <div class="month-view">
    <div class="toolbar">
      <div class="nav">
        <el-button @click="prevMonth">← 上月</el-button>
        <h2>{{ year }} 年 {{ month }} 月</h2>
        <el-button @click="nextMonth">下月 →</el-button>
      </div>
      <el-button type="primary" @click="exportSummary">导出本月总结</el-button>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-statistic title="记录天数" :value="stats.days" />
      </el-col>
      <el-col :span="8">
        <el-statistic title="总工时" :value="stats.hours" suffix="h" />
      </el-col>
      <el-col :span="8">
        <div class="tag-stat">
          <div class="tag-stat-title">标签</div>
          <div class="tag-stat-tags">
            <el-tag v-for="tag in stats.tags" :key="tag" size="small">{{ tag }}</el-tag>
            <span v-if="!stats.tags.length" class="empty">无</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card class="calendar-card">
      <el-calendar v-model="calendarDate">
        <template #date-cell="{ data }">
          <div class="calendar-cell" @click="onDateClick(data.date)">
            <span>{{ data.day.split('-')[2] }}</span>
            <span
              v-if="recordedDates.has(data.day)"
              class="dot"
            />
          </div>
        </template>
      </el-calendar>
    </el-card>

    <el-card>
      <template #header>当月记录</template>
      <EntryList :entries="store.entries" :loading="store.loading" />
    </el-card>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav h2 {
  margin: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.tag-stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.tag-stat-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.empty {
  color: #c0c4cc;
  font-size: 13px;
}

.calendar-card {
  margin-bottom: 20px;
}

.calendar-cell {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #409eff;
  margin-top: 4px;
}
</style>
