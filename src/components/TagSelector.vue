<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string[]
  suggestions?: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const input = ref('')
const defaultSuggestions = ['开发', '会议', '文档', '调研', '运维', '沟通']

function addTag(tag: string) {
  const t = tag.trim()
  if (!t || props.modelValue.includes(t)) return
  emit('update:modelValue', [...props.modelValue, t])
}

function removeTag(tag: string) {
  emit('update:modelValue', props.modelValue.filter((t) => t !== tag))
}

function onInputConfirm() {
  if (input.value.trim()) {
    addTag(input.value)
    input.value = ''
  }
}

watch(
  () => props.modelValue,
  () => {
    /* reactive */
  }
)
</script>

<template>
  <div class="tag-selector">
    <div class="tags">
      <el-tag
        v-for="tag in modelValue"
        :key="tag"
        closable
        @close="removeTag(tag)"
      >
        {{ tag }}
      </el-tag>
      <el-input
        v-model="input"
        size="small"
        placeholder="输入标签回车添加"
        style="width: 140px"
        @keyup.enter="onInputConfirm"
      />
    </div>
    <div class="suggestions">
      <span class="label">快捷：</span>
      <el-tag
        v-for="tag in (suggestions ?? defaultSuggestions)"
        :key="tag"
        type="info"
        effect="plain"
        class="suggestion-tag"
        @click="addTag(tag)"
      >
        + {{ tag }}
      </el-tag>
    </div>
  </div>
</template>

<style scoped>
.tag-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.label {
  font-size: 13px;
  color: #909399;
}

.suggestion-tag {
  cursor: pointer;
}
</style>
