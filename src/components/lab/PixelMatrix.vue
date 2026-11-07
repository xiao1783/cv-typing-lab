<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  source: ImageData
  result: ImageData | null
  size?: number
}>()

const n = computed(() => props.size ?? 6)

function grayAt(img: ImageData, x: number, y: number): number {
  const xx = Math.min(img.width - 1, Math.max(0, x))
  const yy = Math.min(img.height - 1, Math.max(0, y))
  const p = (yy * img.width + xx) * 4
  return Math.round(0.299 * img.data[p] + 0.587 * img.data[p + 1] + 0.114 * img.data[p + 2])
}

const startX = computed(() => Math.floor(props.source.width / 2 - n.value / 2))
const startY = computed(() => Math.floor(props.source.height / 2 - n.value / 2))

function matrix(img: ImageData): number[][] {
  const rows: number[][] = []
  for (let y = 0; y < n.value; y++) {
    const row: number[] = []
    for (let x = 0; x < n.value; x++) row.push(grayAt(img, startX.value + x, startY.value + y))
    rows.push(row)
  }
  return rows
}

const sourceMatrix = computed(() => matrix(props.source))
const resultMatrix = computed(() => (props.result ? matrix(props.result) : null))
</script>

<template>
  <div class="pixel-matrix">
    <div class="matrix-block">
      <p class="block-title">原图灰度矩阵（中心 {{ n }}×{{ n }}）</p>
      <table>
        <tbody>
          <tr v-for="(row, i) in sourceMatrix" :key="i">
            <td v-for="(v, j) in row" :key="j">{{ v }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="resultMatrix" class="matrix-block">
      <p class="block-title">结果灰度矩阵</p>
      <table>
        <tbody>
          <tr v-for="(row, i) in resultMatrix" :key="i">
            <td v-for="(v, j) in row" :key="j">{{ v }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="note">卷积即对该窗口按核权重做加权求和，对比两表可观察每个像素的数值变化。</p>
  </div>
</template>

<style scoped>
.pixel-matrix {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;
}
.block-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 8px;
}
table {
  border-collapse: collapse;
}
td {
  border: 1px solid var(--cv-border-light);
  padding: 5px 7px;
  font-family: var(--cv-mono);
  font-size: 11px;
  text-align: center;
  min-width: 34px;
}
.note {
  flex-basis: 100%;
  font-size: 12px;
  color: var(--cv-text-secondary);
  margin: 0;
}
</style>
