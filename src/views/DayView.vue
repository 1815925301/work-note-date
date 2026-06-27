<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import EntryEditor from '@/components/EntryEditor.vue'
import TagSelector from '@/components/TagSelector.vue'
import { useAutoSave } from '@/composables/useAutoSave'
import { useEntriesStore } from '@/stores/entries'
import { formatDate } from '@/utils/date'

const props = defineProps<{ date: string }>()
const router = useRouter()
const store = useEntriesStore()

const content = ref('')
const tags = ref<string[]>([])
const hours = ref<number | undefined>()
const loaded = ref(false)

const form = computed(() => ({ content: content.value, tags: tags.value, hours: hours.value }))

const { saving, saved, error } = useAutoSave(form, async (value) => {
  if (!loaded.value) return
  if (!value.content.trim() && value.tags.length === 0 && !value.hours) return
  await store.saveEntry(props.date, value)
})

onMounted(async () => {
  const entry = await store.fetchEntry(props.date)
  if (entry) {
    content.value = entry.content
    tags.value = [...entry.tags]
    hours.value = entry.hours
  }
  loaded.value = true
})

watch(
  () => props.date,
  async (newDate) => {
    loaded.value = false
    const entry = await store.fetchEntry(newDate)
    content.value = entry?.content ?? ''
    tags.value = entry?.tags ? [...entry.tags] : []
    hours.value = entry?.hours
    loaded.value = true
  }
)

async function onDelete() {
  await ElMessageBox.confirm('确定删除这条记录吗？', '提示', { type: 'warning' })
  await store.removeEntry(props.date)
  content.value = ''
  tags.value = []
  hours.value = undefined
  ElMessage.success('已删除')
}

function prevDay() {
  const d = new Date(props.date)
  d.setDate(d.getDate() - 1)
  router.push(`/day/${d.toISOString().slice(0, 10)}`)
}

function nextDay() {
  const d = new Date(props.date)
  d.setDate(d.getDate() + 1)
  router.push(`/day/${d.toISOString().slice(0, 10)}`)
}
</script>

<template>
  <div class="day-view">
    <div class="toolbar">
      <div class="nav">
        <el-button @click="prevDay">← 前一天</el-button>
        <h2>{{ formatDate(date) }}</h2>
        <el-button @click="nextDay">后一天 →</el-button>
      </div>
      <div class="status">
        <span v-if="saving" class="hint">保存中...</span>
        <span v-else-if="saved" class="hint saved">已保存</span>
        <span v-if="error" class="hint error">{{ error }}</span>
        <el-button type="danger" plain @click="onDelete">删除</el-button>
      </div>
    </div>

    <el-card class="editor-card">
      <EntryEditor v-model="content" />
    </el-card>

    <el-card class="meta-card">
      <el-form label-width="60px">
        <el-form-item label="标签">
          <TagSelector v-model="tags" />
        </el-form-item>
        <el-form-item label="工时">
          <el-input-number v-model="hours" :min="0" :max="24" :step="0.5" placeholder="小时" />
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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
}

.status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hint {
  font-size: 13px;
  color: #909399;
}

.hint.saved {
  color: #67c23a;
}

.hint.error {
  color: #f56c6c;
}

.editor-card,
.meta-card {
  margin-bottom: 16px;
}
</style>
