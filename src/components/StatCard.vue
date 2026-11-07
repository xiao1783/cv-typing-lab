<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: string | number
    suffix?: string
    icon?: string
    tone?: 'blue' | 'cyan' | 'green' | 'orange' | 'purple' | 'red'
  }>(),
  { icon: 'DataLine', suffix: '', tone: 'blue' }
)
</script>

<template>
  <div class="cv-card stat-card">
    <div class="stat-icon" :class="tone">
      <el-icon :size="22"><component :is="icon" /></el-icon>
    </div>
    <div class="stat-body">
      <div class="stat-value">
        {{ value }}<span v-if="suffix" class="stat-suffix">{{ suffix }}</span>
      </div>
      <div class="stat-label">{{ label }}</div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon.blue { background: var(--cv-primary-soft); color: var(--cv-primary); }
.stat-icon.cyan { background: var(--cv-cyan-soft); color: var(--cv-cyan); }
.stat-icon.green { background: var(--cv-success-soft); color: var(--cv-success); }
.stat-icon.orange { background: var(--cv-warning-soft); color: var(--cv-warning); }
.stat-icon.purple { background: #f3e8ff; color: #7c3aed; }
.stat-icon.red { background: var(--cv-danger-soft); color: var(--cv-danger); }
html.dark .stat-icon.purple { background: #3b2560; color: #c4b5fd; }
.stat-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--cv-text);
  line-height: 1.2;
}
.stat-suffix {
  font-size: 13px;
  font-weight: 600;
  color: var(--cv-text-secondary);
  margin-left: 3px;
}
.stat-label {
  font-size: 13px;
  color: var(--cv-text-secondary);
  margin-top: 2px;
}
</style>
