<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EntryList from '@/components/EntryList.vue'
import { api } from '@/api/client'
import type { WorkEntry } from '@/types'
import { currentQuarterRange } from '@/utils/date'

const route = useRoute()
const router = useRouter()

const loadingTags = ref(true)
const searching = ref(false)
const allTags = ref<string[]>([])
const selectedTags = ref<string[]>([])
const matchMode = ref<'any' | 'all'>('any')
const dateRange = ref<[string, string]>(['', ''])
const results = ref<WorkEntry[]>([])
const keyword = ref('')

const filteredTags = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return allTags.value
  return allTags.value.filter((tag) => tag.toLowerCase().includes(q))
})

const summaryText = computed(() => {
  if (!selectedTags.value.length) return '请选择标签开始搜索'
  const matchLabel = matchMode.value === 'all' ? '同时包含' : '包含任一'
  const tagsLabel = selectedTags.value.map((t) => `「${t}」`).join('、')
  const rangeLabel = dateRange.value[0]
    ? `${dateRange.value[0]} 至 ${dateRange.value[1]}`
    : ''
  return `${matchLabel} ${tagsLabel}${rangeLabel ? `（${rangeLabel}）` : ''}，共 ${results.value.length} 条记录`
})

function defaultRange(): [string, string] {
  const { from, to } = currentQuarterRange()
  return [from, to]
}

function parseQuery() {
  const tags = typeof route.query.tags === 'string'
    ? route.query.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : []
  selectedTags.value = tags
  matchMode.value = route.query.match === 'all' ? 'all' : 'any'
  const from = typeof route.query.from === 'string' ? route.query.from : ''
  const to = typeof route.query.to === 'string' ? route.query.to : ''
  dateRange.value = from && to ? [from, to] : defaultRange()
}

function syncQuery() {
  const query: Record<string, string> = {
    from: dateRange.value[0],
    to: dateRange.value[1],
  }
  if (selectedTags.value.length) query.tags = selectedTags.value.join(',')
  if (matchMode.value === 'all') query.match = 'all'
  router.replace({ path: '/search', query })
}

function toggleTag(tag: string) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx >= 0) {
    selectedTags.value.splice(idx, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

function clearTags() {
  selectedTags.value = []
  results.value = []
  syncQuery()
}

async function loadTags() {
  loadingTags.value = true
  try {
    const [from, to] = dateRange.value
    const entries = await api.getEntries(from, to)
    allTags.value = [...new Set(entries.flatMap((e) => e.tags))].sort((a, b) =>
      a.localeCompare(b, 'zh-CN')
    )
  } finally {
    loadingTags.value = false
  }
}

async function search() {
  if (!selectedTags.value.length) {
    results.value = []
    syncQuery()
    return
  }
  syncQuery()
  searching.value = true
  try {
    results.value = await api.searchByTags({
      tags: selectedTags.value,
      from: dateRange.value[0],
      to: dateRange.value[1],
      match: matchMode.value,
    })
  } finally {
    searching.value = false
  }
}

onMounted(async () => {
  parseQuery()
  syncQuery()
  await loadTags()
  if (selectedTags.value.length) {
    await search()
  }
})

watch(matchMode, () => {
  if (selectedTags.value.length) search()
  else syncQuery()
})

watch(
  dateRange,
  async () => {
    await loadTags()
    selectedTags.value = selectedTags.value.filter((tag) => allTags.value.includes(tag))
    if (selectedTags.value.length) {
      await search()
    } else {
      results.value = []
      syncQuery()
    }
  },
  { deep: true }
)

watch(
  selectedTags,
  () => {
    if (selectedTags.value.length) search()
    else {
      results.value = []
      syncQuery()
    }
  },
  { deep: true }
)
</script>

<template>
  <div class="search-view">
    <section class="panel search-panel">
      <div class="panel-head">
        <div>
          <h1>标签搜索</h1>
          <p>默认在当前季度范围内，按标签筛选工作记录</p>
        </div>
        <el-button v-if="selectedTags.length" text type="primary" @click="clearTags">
          清空选择
        </el-button>
      </div>

      <div class="filters">
        <div class="filter-row">
          <span class="filter-label">匹配方式</span>
          <el-radio-group v-model="matchMode" size="small">
            <el-radio-button label="any">包含任一标签</el-radio-button>
            <el-radio-button label="all">包含全部标签</el-radio-button>
          </el-radio-group>
        </div>

        <div class="filter-row">
          <span class="filter-label">时间范围</span>
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="max-width: 320px"
          />
        </div>

        <div class="filter-row">
          <span class="filter-label">筛选标签</span>
          <el-input
            v-model="keyword"
            placeholder="输入关键字过滤标签"
            clearable
            style="max-width: 240px"
          />
        </div>
      </div>

      <div v-loading="loadingTags" class="tag-cloud">
        <el-empty v-if="!loadingTags && allTags.length === 0" description="该时间范围内还没有标签" />
        <button
          v-for="tag in filteredTags"
          :key="tag"
          type="button"
          class="tag-chip"
          :class="{ active: selectedTags.includes(tag) }"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </button>
      </div>

      <div v-if="selectedTags.length" class="selected-tags">
        <span class="filter-label">已选</span>
        <el-tag
          v-for="tag in selectedTags"
          :key="tag"
          closable
          type="primary"
          effect="dark"
          @close="toggleTag(tag)"
        >
          {{ tag }}
        </el-tag>
      </div>
    </section>

    <section class="panel results-panel">
      <div class="panel-head compact">
        <h2>搜索结果</h2>
        <span>{{ summaryText }}</span>
      </div>
      <EntryList :entries="results" :loading="searching" />
    </section>
  </div>
</template>

<style scoped>
.search-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel {
  background: #fff;
  border: 1px solid #eef2f7;
  border-radius: 18px;
  padding: 22px 24px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.panel-head.compact {
  align-items: baseline;
}

.panel-head h1,
.panel-head h2 {
  margin: 0;
  font-size: 22px;
  color: #0f172a;
}

.panel-head h2 {
  font-size: 18px;
}

.panel-head p {
  margin: 8px 0 0;
  font-size: 14px;
  color: #64748b;
}

.panel-head span {
  font-size: 13px;
  color: #94a3b8;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 18px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.filter-label {
  width: 72px;
  flex-shrink: 0;
  font-size: 13px;
  color: #64748b;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 48px;
}

.tag-chip {
  appearance: none;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.tag-chip:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.tag-chip.active {
  border-color: #2563eb;
  background: #2563eb;
  color: #fff;
}

.selected-tags {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e2e8f0;
}
</style>
