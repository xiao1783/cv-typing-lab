<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { ElMessage } from 'element-plus'
import { EXPERIMENTS, defaultParams, findExperiment } from '@/imaging/experiments'
import { buildSample, SAMPLE_IMAGES } from '@/imaging/sampleImages'
import { useImageLab } from '@/imaging/useImageLab'
import { warpAndStitch } from '@/imaging/features'
import SplitCompare from '@/components/lab/SplitCompare.vue'
import KernelView from '@/components/lab/KernelView.vue'
import PixelMatrix from '@/components/lab/PixelMatrix.vue'

const lab = useImageLab()

const experimentId = ref('gray')
const def = computed(() => findExperiment(experimentId.value) as NonNullable<ReturnType<typeof findExperiment>>)
const params = ref<Record<string, number | string | boolean>>({})

const sourceA = shallowRef<ImageData | null>(null)
const sourceB = shallowRef<ImageData | null>(null)
const sampleAId = ref('shapes')
const sampleBId = ref('noisy')

const zoom = ref(1)
const extCanvas = ref<HTMLCanvasElement | null>(null)
const extInfo = ref('')
const homography = ref<number[] | null>(null)

const isBase = computed(() => def.value.group === '基础实验')
const hasResult = computed(() => lab.result.value != null || !isBase.value)

onMounted(() => {
  sourceA.value = buildSample(sampleAId.value)
  sourceB.value = buildSample(sampleBId.value)
  params.value = defaultParams(def.value)
})

function selectExperiment(id: string) {
  experimentId.value = id
  params.value = defaultParams(findExperiment(id) as NonNullable<ReturnType<typeof findExperiment>>)
  lab.result.value = null
  homography.value = null
  extInfo.value = ''
}

function loadSample(which: 'A' | 'B', sampleId: string) {
  if (which === 'A') {
    sampleAId.value = sampleId
    sourceA.value = buildSample(sampleId)
  } else {
    sampleBId.value = sampleId
    sourceB.value = buildSample(sampleId)
  }
}

function resetParams() {
  params.value = defaultParams(def.value)
  ElMessage.success('参数已恢复默认')
}

function putImage(canvas: HTMLCanvasElement, img: ImageData) {
  canvas.width = img.width
  canvas.height = img.height
  canvas.getContext('2d')?.putImageData(img, 0, 0)
}

function drawKeypoints(img: ImageData, points: { x: number; y: number; scale: number }[]) {
  const canvas = extCanvas.value
  if (!canvas) return
  putImage(canvas, img)
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.strokeStyle = '#f59e0b'
  ctx.lineWidth = 1.5
  for (const p of points) {
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.scale * 4, 0, Math.PI * 2)
    ctx.stroke()
  }
  extInfo.value = `检测到 ${points.length} 个 DoG 关键点（圆圈大小反映尺度）。`
}

function drawMatchCanvas(
  imgA: ImageData,
  imgB: ImageData,
  pairs: { ax: number; ay: number; bx: number; by: number; distance: number }[],
  inlierMask?: boolean[]
) {
  const canvas = extCanvas.value
  if (!canvas) return
  canvas.width = imgA.width + imgB.width
  canvas.height = Math.max(imgA.height, imgB.height)
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.putImageData(imgA, 0, 0)
  ctx.putImageData(imgB, imgA.width, 0)
  pairs.forEach((p, i) => {
    ctx.strokeStyle = inlierMask ? (inlierMask[i] ? '#16a34a' : '#94a3b8') : '#0ea5e9'
    ctx.lineWidth = inlierMask && inlierMask[i] ? 1.6 : 1
    ctx.beginPath()
    ctx.moveTo(p.ax, p.ay)
    ctx.lineTo(p.bx + imgA.width, p.by)
    ctx.stroke()
  })
}

async function run() {
  if (!sourceA.value) {
    ElMessage.warning('请先选择或上传图像')
    return
  }
  homography.value = null
  const id = def.value.id

  if (isBase.value) {
    const resp = await lab.runBase(id, sourceA.value, params.value)
    if (!resp.ok) ElMessage.error(resp.error || '运算失败')
    return
  }

  if (id === 'sift') {
    const resp = await lab.runCustom({
      kind: 'keypoints',
      source: sourceA.value,
      maxCount: Number(params.value.maxCount),
      lowThreshold: Number(params.value.lowThreshold)
    })
    if (resp.ok && resp.keypoints) drawKeypoints(sourceA.value, resp.keypoints.points)
    else ElMessage.error(resp.error)
    return
  }

  if (!sourceB.value) {
    ElMessage.warning('该实验需要两张图像')
    return
  }

  if (id === 'match') {
    const resp = await lab.runCustom({
      kind: 'match',
      sourceA: sourceA.value,
      sourceB: sourceB.value,
      ratio: Number(params.value.ratio)
    })
    if (resp.ok && resp.matches) {
      drawMatchCanvas(sourceA.value, sourceB.value, resp.matches.pairs)
      extInfo.value = `比值检验后保留 ${resp.matches.count} 对好匹配。`
    } else ElMessage.error(resp.error)
    return
  }

  // ransac 与 stitch 都先求匹配
  const matchResp = await lab.runCustom({
    kind: 'match',
    sourceA: sourceA.value,
    sourceB: sourceB.value,
    ratio: 0.75
  })
  if (!matchResp.ok || !matchResp.matches || matchResp.matches.pairs.length < 4) {
    ElMessage.error('有效匹配不足 4 对，无法估计几何关系')
    return
  }
  const pairs = matchResp.matches.pairs
  const src = pairs.map((p): [number, number] => [p.ax, p.ay])
  const dst = pairs.map((p): [number, number] => [p.bx, p.by])

  if (id === 'ransac') {
    const resp = await lab.runCustom({
      kind: 'ransac',
      src,
      dst,
      threshold: Number(params.value.threshold),
      iterations: Number(params.value.iterations)
    })
    if (resp.ok && resp.ransac?.H) {
      drawMatchCanvas(sourceA.value, sourceB.value, pairs, resp.ransac.inlierMask)
      homography.value = resp.ransac.H
      extInfo.value = `内点 ${resp.ransac.inlierCount} / ${pairs.length} 对，单应性矩阵如下。`
    } else ElMessage.error(resp.error)
    return
  }

  if (id === 'stitch') {
    const resp = await lab.runCustom({
      kind: 'ransac',
      src,
      dst,
      threshold: 5,
      iterations: 200
    })
    if (!resp.ok || !resp.ransac?.H) {
      ElMessage.error('单应性估计失败，无法拼接')
      return
    }
    const stitched = warpAndStitch(sourceA.value, sourceB.value, resp.ransac.H)
    putImage(extCanvas.value as HTMLCanvasElement, stitched)
    extInfo.value = `基于内点 ${resp.ransac.inlierCount} 对完成实时拼接与融合。`
  }
}

function saveResult() {
  const canvas = isBase.value ? makeResultCanvas() : extCanvas.value
  if (!canvas) {
    ElMessage.warning('暂无可保存的结果')
    return
  }
  const link = document.createElement('a')
  link.download = `cv-lab-${experimentId.value}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

function makeResultCanvas(): HTMLCanvasElement | null {
  if (!lab.result.value) return null
  const c = document.createElement('canvas')
  putImage(c, lab.result.value)
  return c
}

function onUpload(ev: Event, which: 'A' | 'B') {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    ElMessage.error('仅支持图片文件')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 5MB')
    return
  }
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.onload = () => {
    const scale = Math.min(1, 1200 / Math.max(img.width, img.height))
    const w = Math.round(img.width * scale)
    const h = Math.round(img.height * scale)
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    c.getContext('2d')?.drawImage(img, 0, 0, w, h)
    const data = c.getContext('2d')?.getImageData(0, 0, w, h)
    if (data) {
      if (which === 'A') sourceA.value = data
      else sourceB.value = data
      ElMessage.success('图片已载入，处理在本地完成')
    }
    URL.revokeObjectURL(url)
  }
  img.src = url
  input.value = ''
}
</script>

<template>
  <div class="cv-page lab-page">
    <h2 class="cv-page-title">算法实验室</h2>
    <p class="cv-page-sub">所有图像均在你的浏览器中实时计算，无预加载效果图；运算在 Web Worker 中执行，不阻塞界面。</p>

    <div class="lab-grid">
      <!-- 左：参数控制 -->
      <aside class="cv-card lab-panel">
        <h3 class="panel-title">实验列表</h3>
        <div class="exp-groups">
          <template v-for="g in ['基础实验', '扩展实验']" :key="g">
            <p class="group-label">{{ g }}</p>
            <button
              v-for="e in EXPERIMENTS.filter((x) => x.group === g)"
              :key="e.id"
              class="exp-item"
              :class="{ active: e.id === experimentId }"
              @click="selectExperiment(e.id)"
            >
              {{ e.title }}
              <el-tag v-if="e.simplified" size="small" type="warning" effect="plain" class="simp-tag">简化</el-tag>
            </button>
          </template>
        </div>

        <el-divider />
        <h3 class="panel-title">图像来源</h3>
        <p class="group-label">图像 A</p>
        <el-select :model-value="sampleAId" size="small" class="full" @update:model-value="(v: string) => loadSample('A', v)">
          <el-option v-for="s in SAMPLE_IMAGES" :key="s.id" :value="s.id" :label="s.name" />
        </el-select>
        <label class="upload-btn">
          <el-button size="small" plain class="full"><el-icon><Upload /></el-icon>上传本地图片 A</el-button>
          <input type="file" accept="image/*" hidden @change="onUpload($event, 'A')" />
        </label>

        <template v-if="def.needsTwoImages">
          <p class="group-label">图像 B</p>
          <el-select :model-value="sampleBId" size="small" class="full" @update:model-value="(v: string) => loadSample('B', v)">
            <el-option v-for="s in SAMPLE_IMAGES" :key="s.id" :value="s.id" :label="s.name" />
          </el-select>
          <label class="upload-btn">
            <el-button size="small" plain class="full"><el-icon><Upload /></el-icon>上传本地图片 B</el-button>
            <input type="file" accept="image/*" hidden @change="onUpload($event, 'B')" />
          </label>
        </template>

        <el-divider />
        <h3 class="panel-title">参数调节</h3>
        <div v-for="p in def.params" :key="p.key" class="param-row">
          <label class="param-label">{{ p.label }}</label>
          <el-slider
            v-if="p.widget === 'slider'"
            v-model="params[p.key]"
            :min="p.min"
            :max="p.max"
            :step="p.step"
          />
          <el-select v-else-if="p.widget === 'select'" v-model="params[p.key]" size="small" class="full">
            <el-option
              v-for="o in p.options"
              :key="String(o.value)"
              :value="o.value"
              :label="o.label"
            />
          </el-select>
          <el-input-number v-else v-model="params[p.key]" size="small" class="full" />
        </div>
        <el-button v-if="def.params.length" plain size="small" class="full" @click="resetParams">
          恢复默认参数
        </el-button>

        <el-divider />
        <el-button type="primary" class="full" :loading="lab.running.value" @click="run">
          {{ lab.running.value ? '计算中…' : '运行实验' }}
        </el-button>
      </aside>

      <!-- 中：结果 -->
      <section class="lab-center">
        <div class="cv-card stat-bar">
          <span><el-icon><Timer /></el-icon> 耗时：<strong>{{ lab.elapsedMs.value }} ms</strong></span>
          <span v-if="sourceA">尺寸：<strong>{{ sourceA.width }}×{{ sourceA.height }}</strong></span>
          <span class="zoom-ctl">
            <el-button-group>
              <el-button size="small" @click="zoom = Math.max(0.25, zoom - 0.25)">-</el-button>
              <el-button size="small" disabled>{{ Math.round(zoom * 100) }}%</el-button>
              <el-button size="small" @click="zoom = Math.min(3, zoom + 0.25)">+</el-button>
            </el-button-group>
          </span>
          <el-button size="small" type="primary" plain @click="saveResult">
            <el-icon><Download /></el-icon>保存结果
          </el-button>
        </div>

        <div class="cv-card canvas-card">
          <SplitCompare
            v-if="isBase"
            :source="sourceA"
            :result="lab.result.value"
            :zoom="zoom"
          />
          <canvas v-else ref="extCanvas" class="ext-canvas"></canvas>
          <div v-if="!hasResult" class="empty-tip">点击「运行实验」查看真实处理结果</div>
        </div>

        <p v-if="extInfo" class="cv-card ext-info">{{ extInfo }}</p>

        <div v-if="isBase && lab.kernel.value" class="cv-card detail-card">
          <h3 class="cv-section-title">卷积核可视化</h3>
          <KernelView :kernel="lab.kernel.value" />
        </div>

        <div v-if="isBase && sourceA" class="cv-card detail-card">
          <h3 class="cv-section-title">像素矩阵计算过程</h3>
          <PixelMatrix :source="sourceA" :result="lab.result.value" />
        </div>

        <div v-if="homography" class="cv-card detail-card">
          <h3 class="cv-section-title">单应性矩阵 H（3×3）</h3>
          <table class="h-table">
            <tbody>
              <tr v-for="i in [0, 1, 2]" :key="i">
                <td v-for="col in [0, 1, 2]" :key="col">{{ homography[i * 3 + col].toFixed(4) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 右：原理 -->
      <aside class="cv-card lab-panel principle-panel">
        <h3 class="panel-title">原理解释</h3>
        <el-alert
          v-if="def.simplified"
          type="warning"
          :closable="false"
          title="教学简化实现"
          description="该实验为真实浏览器端实时计算（非预加载），但在亚像素精度、方向归一化或融合策略上做了精简，不等同于完整 OpenCV 实现。"
          class="simp-alert"
        />
        <p class="principle-text">{{ def.principle }}</p>
        <p v-if="lab.explanation.value" class="change-text">{{ lab.explanation.value }}</p>
        <el-divider />
        <h4 class="memory-title">内存与性能注意</h4>
        <ul class="memory-list">
          <li>JS 侧 ImageData 与 TypedArray 在用完后由 GC 回收，避免长期持有大数组。</li>
          <li>大图像请先压缩到 1200px 以内，卷积复杂度随像素与核面积增长。</li>
          <li>Worker 传输采用零拷贝 Transferable，减少主线程内存复制。</li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.lab-grid {
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  gap: 16px;
  align-items: start;
}
.lab-panel {
  padding: 16px;
}
.panel-title {
  font-size: 15px;
  margin: 0 0 10px;
}
.group-label {
  font-size: 12px;
  color: var(--cv-text-secondary);
  margin: 10px 0 6px;
}
.exp-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--cv-text-regular);
}
.exp-item:hover { background: var(--cv-primary-soft); }
.exp-item.active {
  background: var(--cv-primary);
  color: #fff;
}
.simp-tag { margin-left: 6px; }
.full { width: 100%; margin: 4px 0; }
.upload-btn { display: block; }
.param-row { margin-bottom: 12px; }
.param-label { font-size: 12px; color: var(--cv-text-regular); display: block; margin-bottom: 2px; }
.lab-center {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}
.stat-bar {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 13px;
  flex-wrap: wrap;
}
.zoom-ctl { margin-left: auto; }
.canvas-card {
  padding: 18px;
  min-height: 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}
.ext-canvas {
  max-width: 100%;
  border-radius: 8px;
}
.empty-tip {
  color: var(--cv-text-placeholder);
  font-size: 14px;
}
.ext-info {
  padding: 12px 16px;
  font-size: 13px;
  margin: 0;
}
.detail-card { padding: 16px 18px; }
.h-table {
  border-collapse: collapse;
}
.h-table td {
  border: 1px solid var(--cv-border-light);
  padding: 8px 12px;
  font-family: var(--cv-mono);
  font-size: 12px;
}
.principle-text {
  font-size: 13px;
  line-height: 1.8;
  color: var(--cv-text-regular);
}
.change-text {
  font-size: 13px;
  background: var(--cv-primary-soft);
  padding: 10px 12px;
  border-radius: 8px;
  line-height: 1.6;
}
.simp-alert { margin-bottom: 12px; }
.memory-title { font-size: 13px; margin: 0 0 8px; }
.memory-list {
  padding-left: 18px;
  font-size: 12px;
  color: var(--cv-text-secondary);
  line-height: 1.8;
}
@media (max-width: 1280px) {
  .lab-grid { grid-template-columns: 240px 1fr; }
  .principle-panel { grid-column: 1 / -1; }
}
@media (max-width: 900px) {
  .lab-grid { grid-template-columns: 1fr; }
}
</style>
