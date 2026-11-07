<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSettingsStore } from '@/stores/settings'
import { useProgressStore } from '@/stores/progress'
import {
  clearLearningData,
  exportBackup,
  importBackup,
  resetSettings,
  validateBackup
} from '@/db/repo'
import type { BackupPayload } from '@/db/types'

const settingsStore = useSettingsStore()
const progressStore = useProgressStore()
const importInput = ref<HTMLInputElement | null>(null)

async function save() {
  await settingsStore.update({ ...settingsStore.settings })
  ElMessage.success('设置已保存')
}

async function doResetSettings() {
  await ElMessageBox.confirm('确定恢复默认设置吗？', '确认', { type: 'warning' })
  await resetSettings()
  await settingsStore.load()
  ElMessage.success('已恢复默认设置')
}

async function doClearData() {
  await ElMessageBox.confirm(
    '将清空全部进度、记录、错题与成就，且无法恢复，确定继续吗？',
    '危险操作',
    { type: 'error', confirmButtonText: '永久清空' }
  )
  await clearLearningData()
  await progressStore.load()
  ElMessage.success('学习数据已清空')
}

async function doExport() {
  const payload = await exportBackup()
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `cv-jianzhi-backup-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

async function onImportFile(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    ElMessage.error('文件不是合法的 JSON，无法导入')
    input.value = ''
    return
  }
  const errors = validateBackup(parsed)
  if (errors.length > 0) {
    ElMessage.error(`备份校验失败：${errors.join('；')}`)
    input.value = ''
    return
  }
  await ElMessageBox.confirm(
    '备份结构校验通过。导入将覆盖当前全部本地数据，确定继续吗？',
    '覆盖确认',
    { type: 'warning', confirmButtonText: '确认覆盖' }
  )
  await importBackup(parsed as BackupPayload)
  await Promise.all([progressStore.load(), settingsStore.load()])
  ElMessage.success('备份导入成功')
  input.value = ''
}
</script>

<template>
  <div class="cv-page">
    <h2 class="cv-page-title">系统设置</h2>
    <p class="cv-page-sub">偏好与学习数据均保存在本地 IndexedDB，可导出备份或在设备间迁移。</p>

    <div class="settings-grid">
      <div class="cv-card block">
        <h3 class="cv-section-title">本地用户资料</h3>
        <el-form label-width="110px" class="form">
          <el-form-item label="用户名称">
            <el-input v-model="settingsStore.settings.userName" maxlength="16" show-word-limit />
          </el-form-item>
          <el-form-item label="头像颜色">
            <el-color-picker v-model="settingsStore.settings.avatarColor" />
          </el-form-item>
        </el-form>
      </div>

      <div class="cv-card block">
        <h3 class="cv-section-title">学习与编辑器偏好</h3>
        <el-form label-width="110px" class="form">
          <el-form-item label="界面主题">
            <el-radio-group v-model="settingsStore.settings.theme">
              <el-radio value="light">浅色</el-radio>
              <el-radio value="dark">深色</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="代码主题">
            <el-select v-model="settingsStore.settings.codeTheme">
              <el-option value="vs" label="浅色 vs" />
              <el-option value="vs-dark" label="深色 vs-dark" />
              <el-option value="hc-black" label="高对比 hc-black" />
            </el-select>
          </el-form-item>
          <el-form-item label="严格模式">
            <el-switch v-model="settingsStore.settings.strictMode" />
            <span class="hint">关闭后仅忽略行尾空白，缩进始终强制</span>
          </el-form-item>
          <el-form-item label="按键音效">
            <el-switch v-model="settingsStore.settings.soundEnabled" />
          </el-form-item>
          <el-form-item label="自动保存">
            <el-switch v-model="settingsStore.settings.autoSave" />
          </el-form-item>
          <el-form-item label="代码字号">
            <el-slider v-model="settingsStore.settings.fontSize" :min="12" :max="22" :step="1" show-input class="slider" />
          </el-form-item>
          <el-form-item label="Tab 缩进">
            <el-radio-group v-model="settingsStore.settings.tabSize">
              <el-radio :value="2">2 空格</el-radio>
              <el-radio :value="4">4 空格</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="save">保存偏好</el-button>
      </div>

      <div class="cv-card block">
        <h3 class="cv-section-title">数据备份与恢复</h3>
        <p class="block-desc">导出包含进度、记录、错题、收藏、成就与设置的完整 JSON；导入前会校验结构并要求覆盖确认。</p>
        <div class="data-actions">
          <el-button type="primary" plain @click="doExport">
            <el-icon><Download /></el-icon>导出备份 JSON
          </el-button>
          <el-button plain @click="importInput?.click()">
            <el-icon><Upload /></el-icon>导入备份 JSON
          </el-button>
          <input ref="importInput" type="file" accept="application/json,.json" hidden @change="onImportFile" />
        </div>
        <el-divider />
        <div class="danger-actions">
          <el-button type="warning" plain @click="doResetSettings">恢复默认设置</el-button>
          <el-button type="danger" plain @click="doClearData">清空学习数据</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 16px;
}
.block {
  padding: 20px 22px;
}
.form {
  margin-bottom: 8px;
}
.hint {
  margin-left: 12px;
  font-size: 12px;
  color: var(--cv-text-secondary);
}
.slider {
  max-width: 260px;
}
.block-desc {
  font-size: 13px;
  color: var(--cv-text-secondary);
  line-height: 1.7;
  margin: 0 0 14px;
}
.data-actions,
.danger-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
