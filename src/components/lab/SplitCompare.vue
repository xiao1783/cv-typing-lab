<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  source: ImageData | null
  result: ImageData | null
  zoom: number
}>()

const divider = ref(50)
const dragging = ref(false)
const wrapEl = ref<HTMLElement | null>(null)

const viewW = computed(() => (props.source ? props.source.width * props.zoom : 0))
const viewH = computed(() => (props.source ? props.source.height * props.zoom : 0))

function draw(canvas: HTMLCanvasElement, img: ImageData | null) {
  if (!img) return
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.putImageData(img, 0, 0)
}

function onMove(ev: MouseEvent) {
  if (!dragging.value || !wrapEl.value) return
  const rect = wrapEl.value.getBoundingClientRect()
  const pct = ((ev.clientX - rect.left) / rect.width) * 100
  divider.value = Math.min(100, Math.max(0, pct))
}

watch(
  () => [props.source, props.result, props.zoom],
  () => {
    const canvases = wrapEl.value?.querySelectorAll('canvas')
    if (canvases && canvases.length === 2) {
      draw(canvases[0], props.source)
      draw(canvases[1], props.result)
    }
  },
  { flush: 'post' }
)
</script>

<template>
  <div
    v-if="source"
    ref="wrapEl"
    class="split-wrap"
    :style="{ width: viewW + 'px', height: viewH + 'px' }"
    @mousemove="onMove"
    @mouseup="dragging = false"
    @mouseleave="dragging = false"
  >
    <canvas class="layer" :style="{ transform: `scale(${zoom})` }"></canvas>
    <div class="clip" :style="{ width: divider + '%' }">
      <canvas class="layer" :style="{ transform: `scale(${zoom})` }"></canvas>
    </div>
    <div class="handle" :style="{ left: divider + '%' }" @mousedown="dragging = true">
      <span class="handle-line"></span>
      <span class="handle-grip"><el-icon><DArrowLeft /></el-icon></span>
    </div>
    <span class="label left-label">原图</span>
    <span class="label right-label">结果</span>
  </div>
</template>

<style scoped>
.split-wrap {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background: #f1f5f9;
  margin: 0 auto;
  user-select: none;
}
.layer {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
  image-rendering: pixelated;
}
.clip {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  overflow: hidden;
}
.handle {
  position: absolute;
  top: 0;
  height: 100%;
  width: 2px;
  background: var(--cv-primary);
  cursor: ew-resize;
  z-index: 3;
}
.handle-grip {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--cv-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.label {
  position: absolute;
  top: 8px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.85);
  padding: 2px 8px;
  border-radius: 10px;
  z-index: 2;
}
.left-label { left: 8px; }
.right-label { right: 8px; }
</style>
