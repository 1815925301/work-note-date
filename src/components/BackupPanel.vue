<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { api } from '@/api/client'
import { downloadJson } from '@/utils/export'

async function exportData() {
  const data = await api.exportBackup()
  downloadJson(`worknote-backup-${Date.now()}.json`, data)
  ElMessage.success('备份已下载')
}

async function importData() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await api.restoreBackup(data)
      ElMessage.success('恢复成功，请刷新页面')
    } catch {
      ElMessage.error('文件格式无效')
    }
  }
  input.click()
}
</script>

<template>
  <div class="backup-panel">
    <button type="button" class="backup-btn primary" @click="exportData">导出 JSON 备份</button>
    <button type="button" class="backup-btn" @click="importData">从 JSON 恢复</button>
  </div>
</template>

<style scoped>
.backup-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.backup-btn {
  appearance: none;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #334155;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.backup-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.backup-btn.primary {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
  font-weight: 600;
}

.backup-btn.primary:hover {
  background: #dbeafe;
}
</style>
