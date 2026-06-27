<script setup lang="ts">
import { useRouter } from 'vue-router'
import EntryContentPreview from '@/components/EntryContentPreview.vue'
import type { WorkEntry } from '@/types'
import { formatDate } from '@/utils/date'

defineProps<{
  entries: WorkEntry[]
  loading?: boolean
}>()

const router = useRouter()

function goDay(date: string) {
  router.push(`/day/${date}`)
}
</script>

<template>
  <div v-loading="loading">
    <el-empty v-if="!loading && entries.length === 0" description="暂无记录" />
    <div v-else class="entry-list">
      <el-card
        v-for="entry in entries"
        :key="entry.id"
        shadow="hover"
        class="entry-card"
        @click="goDay(entry.date)"
      >
        <div class="entry-header">
          <span class="date">{{ formatDate(entry.date) }}</span>
          <span v-if="entry.hours" class="hours">{{ entry.hours }}h</span>
        </div>
        <div class="content">
          <EntryContentPreview :content="entry.content" />
        </div>
        <div v-if="entry.tags.length" class="tags">
          <el-tag v-for="tag in entry.tags" :key="tag" size="small" type="info">{{ tag }}</el-tag>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.entry-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.entry-card {
  cursor: pointer;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.date {
  font-weight: 600;
  color: #303133;
}

.hours {
  color: #909399;
  font-size: 13px;
}

.content {
  margin-bottom: 8px;
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
</style>
