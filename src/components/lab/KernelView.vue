<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ kernel: number[][] | null }>()

const maxAbs = computed(() => {
  if (!props.kernel) return 1
  let m = 0
  for (const row of props.kernel) for (const v of row) m = Math.max(m, Math.abs(v))
  return m || 1
})

function cellStyle(v: number): Record<string, string> {
  const intensity = Math.abs(v) / maxAbs.value
  const color = v >= 0
    ? `rgba(29, 78, 216, ${0.12 + intensity * 0.55})`
    : `rgba(225, 29, 72, ${0.12 + intensity * 0.55})`
  return { background: color }
}
</script>

<template>
  <div v-if="kernel && kernel.length" class="kernel-view">
    <table class="kernel-table">
      <tbody>
        <tr v-for="(row, i) in kernel" :key="i">
          <td v-for="(v, j) in row" :key="j" :style="cellStyle(v)" class="kernel-cell">
            {{ v.toFixed(3) }}
          </td>
        </tr>
      </tbody>
    </table>
    <p class="legend">蓝色为正权重，红色为负权重，颜色深浅表示权重大小。</p>
  </div>
  <p v-else class="no-kernel">当前实验没有可展示的卷积核。</p>
</template>

<style scoped>
.kernel-table {
  border-collapse: collapse;
  margin: 4px 0;
}
.kernel-cell {
  border: 1px solid var(--cv-border-light);
  padding: 8px 10px;
  font-family: var(--cv-mono);
  font-size: 12px;
  min-width: 58px;
  text-align: center;
  color: #0f172a;
}
.legend {
  font-size: 12px;
  color: var(--cv-text-secondary);
  margin: 6px 0 0;
}
.no-kernel {
  font-size: 13px;
  color: var(--cv-text-placeholder);
}
</style>
