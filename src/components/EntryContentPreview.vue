<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

defineProps<{
  content: string
  maxHeight?: number
}>()
</script>

<template>
  <div
    v-if="content.trim()"
    class="entry-content-preview"
    :style="maxHeight ? { maxHeight: `${maxHeight}px` } : undefined"
  >
    <MdPreview :model-value="content" preview-theme="github" />
  </div>
  <span v-else class="empty">（空）</span>
</template>

<style scoped>
.entry-content-preview {
  overflow: hidden;
}

.entry-content-preview :deep(.md-editor-preview-wrapper) {
  padding: 0;
}

.entry-content-preview :deep(.md-editor) {
  background: transparent;
}

.entry-content-preview :deep(.md-editor-preview) {
  font-size: 13px;
  line-height: 1.6;
  color: #475569;
}

.entry-content-preview :deep(.md-editor-preview p),
.entry-content-preview :deep(.md-editor-preview ul),
.entry-content-preview :deep(.md-editor-preview ol),
.entry-content-preview :deep(.md-editor-preview blockquote),
.entry-content-preview :deep(.md-editor-preview pre) {
  margin: 0 0 6px;
}

.entry-content-preview :deep(.md-editor-preview > :last-child) {
  margin-bottom: 0;
}

.entry-content-preview :deep(.md-editor-preview h1),
.entry-content-preview :deep(.md-editor-preview h2),
.entry-content-preview :deep(.md-editor-preview h3),
.entry-content-preview :deep(.md-editor-preview h4),
.entry-content-preview :deep(.md-editor-preview h5),
.entry-content-preview :deep(.md-editor-preview h6) {
  margin: 0 0 4px;
  font-size: 14px;
  line-height: 1.4;
  color: #0f172a;
}

.entry-content-preview :deep(.md-editor-preview ul),
.entry-content-preview :deep(.md-editor-preview ol) {
  padding-left: 18px;
}

.empty {
  font-size: 13px;
  color: #94a3b8;
}
</style>
