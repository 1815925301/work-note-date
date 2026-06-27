<script setup lang="ts">
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

defineProps<{
  modelValue: string
  placeholder?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <MdEditor
    :model-value="modelValue"
    language="zh-CN"
    :placeholder="placeholder ?? '记录今天的工作内容...'"
    preview-theme="github"
    style="height: 480px"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>
