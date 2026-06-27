<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useEntriesStore } from '@/stores/entries'
import { exportPeriodMarkdown } from '@/utils/export'
import { contentPreview, formatDate, getQuarterMonths, monthRange, quarterPeriod, quarterRange } from '@/utils/date'

const props = defineProps<{ year: number; q: number }>()
const router = useRouter()
const store = useEntriesStore()
const monthEntries = ref<Record<string, typeof store.entries>>({})

const period = computed(() => quarterPeriod(props.year, props.q))
const months = computed(() => getQuarterMonths(props.year, props.q))

async function loadData() {
  const { from, to } = quarterRange(props.year, props.q)
  await store.fetchRange(from, to)
  const grouped: Record<string, typeof store.entries> = {}
  for (const m of months.value) {
    const range = monthRange(m.year, m.month)
    grouped[m.period] = store.entries.filter(
      (e) => e.date >= range.from && e.date <= range.to
    )
  }
  monthEntries.value = grouped
}

onMounted(loadData)
watch(() => [props.year, props.q], loadData)

function prevQuarter() {
  let year = props.year
  let q = props.q - 1
  if (q < 1) {
    q = 4
    year -= 1
  }
  router.push(`/quarter/${year}/${q}`)
}

function nextQuarter() {
  let year = props.year
  let q = props.q + 1
  if (q > 4) {
    q = 1
    year += 1
  }
  router.push(`/quarter/${year}/${q}`)
}

function goDay(date: string) {
  router.push(`/day/${date}`)
}

function exportSummary() {
  exportPeriodMarkdown(store.entries, period.value, 'quarter')
  ElMessage.success('季度总结已导出')
}
</script>

<template>
  <div class="quarter-view">
    <div class="toolbar">
      <div class="nav">
        <el-button @click="prevQuarter">← 上季度</el-button>
        <h2>{{ year }} 年 Q{{ q }}</h2>
        <el-button @click="nextQuarter">下季度 →</el-button>
      </div>
      <el-button type="primary" @click="exportSummary">导出季度总结</el-button>
    </div>

    <el-row :gutter="20">
      <el-col v-for="m in months" :key="m.period" :span="8">
        <el-card class="month-card">
          <template #header>
            <div class="month-header">
              <span>{{ m.year }} 年 {{ m.month }} 月</span>
              <el-tag size="small">{{ (monthEntries[m.period] ?? []).length }} 条</el-tag>
            </div>
          </template>
          <el-empty v-if="!(monthEntries[m.period] ?? []).length" description="暂无记录" :image-size="60" />
          <div v-else class="entries">
            <div
              v-for="entry in monthEntries[m.period]"
              :key="entry.id"
              class="entry-item"
              @click="goDay(entry.date)"
            >
              <div class="entry-date">{{ formatDate(entry.date, 'M月D日') }}</div>
              <div class="entry-content">{{ contentPreview(entry.content, 60) || '（空）' }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
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

.month-card {
  min-height: 320px;
}

.month-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.entries {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.entry-item {
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.entry-item:hover {
  background: #f5f7fa;
}

.entry-date {
  font-size: 13px;
  color: #409eff;
  margin-bottom: 4px;
}

.entry-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}
</style>
