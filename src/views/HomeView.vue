<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { allLevels, chapters, totalLevelCount } from '@/data/courses'
import { useProgressStore } from '@/stores/progress'
import { loadStats, type StudyStats } from '@/services/stats'
import { metaRepo } from '@/db/repo'
import StatCard from '@/components/StatCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const progressStore = useProgressStore()
const stats = ref<StudyStats | null>(null)
const lastLevelId = ref<string | null>(null)
const trendEl = ref<HTMLElement | null>(null)

const lastLevel = computed(() =>
  lastLevelId.value ? allLevels.find((l) => l.id === lastLevelId.value) : undefined
)
const hasData = computed(() => (stats.value?.practiceCount ?? 0) > 0 || (stats.value?.quizCount ?? 0) > 0)

const recommended = computed(() => {
  const firstUncompleted = allLevels.find((l) => !progressStore.isCompleted(l.id))
  return firstUncompleted
})

const reviewPoints = computed(() =>
  chapters
    .map((c) => c.levels.find((l) => !progressStore.isCompleted(l.id)))
    .filter((l): l is NonNullable<typeof l> => Boolean(l))
    .slice(0, 4)
)

onMounted(async () => {
  stats.value = await loadStats(progressStore.progressMap)
  lastLevelId.value = await metaRepo.get<string | null>('lastLevelId', null)
  if (hasData.value && trendEl.value) {
    const chart = echarts.init(trendEl.value)
    chart.setOption({
      grid: { left: 36, right: 16, top: 18, bottom: 24 },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: stats.value.last7.map((d) => d.label), axisLine: { lineStyle: { color: '#94a3b8' } } },
      yAxis: { type: 'value', name: '分' },
      series: [
        {
          type: 'line',
          smooth: true,
          data: stats.value.last7.map((d) => d.minutes),
          areaStyle: { color: 'rgba(37,99,235,0.15)' },
          lineStyle: { color: '#2563eb', width: 2 },
          itemStyle: { color: '#2563eb' }
        }
      ]
    })
  }
})
</script>

<template>
  <div class="cv-page home">
    <div class="cv-card hero">
      <div class="hero-text">
        <h1>键入代码，理解视觉</h1>
        <p class="slogan">CV键知 —— 面向计算机视觉的代码打字与交互式学习平台</p>
        <p class="desc">
          通过真实 Python/NumPy/OpenCV 代码跟打、填空与实战，配合浏览器端实时图像处理与知识解析，
          系统掌握从卷积、滤波、边缘到特征匹配的完整 CV 编程能力。
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="router.push(hasData && lastLevel ? `/level/${lastLevel.id}` : '/courses')">
            {{ hasData ? '继续学习' : '开始学习' }}
          </el-button>
          <el-button size="large" plain @click="router.push('/lab')">进入算法实验室</el-button>
        </div>
      </div>
      <div class="hero-visual">
        <el-icon :size="150"><Cpu /></el-icon>
      </div>
    </div>

    <EmptyState
      v-if="!hasData"
      title="欢迎使用 CV键知"
      desc="你还没有学习记录。进入课程中心完成第一关，即可生成学习时长、准确率、WPM 与连续天数等真实数据。"
      icon="Promotion"
    >
      <el-button type="primary" @click="router.push('/courses')">前往课程中心</el-button>
    </EmptyState>

    <template v-else>
      <div class="stat-grid">
        <StatCard label="累计学习时长（分）" :value="stats?.totalMinutes ?? 0" icon="Timer" />
        <StatCard label="已完成关卡" :value="progressStore.completedCount" icon="CircleCheck" />
        <StatCard label="平均准确率（%）" :value="stats?.avgAccuracy ?? 0" icon="Aim" />
        <StatCard label="平均 WPM" :value="stats?.avgWpm ?? 0" icon="Lightning" />
        <StatCard label="连续学习天数" :value="stats?.streak ?? 0" icon="Calendar" />
      </div>

      <div class="home-row">
        <div class="cv-card continue-card">
          <h3 class="cv-section-title">最近学习</h3>
          <template v-if="lastLevel">
            <p class="continue-title">{{ lastLevel.title }}</p>
            <p class="continue-id">{{ lastLevel.id }}</p>
            <el-button type="primary" class="full" @click="router.push(`/level/${lastLevel.id}`)">
              继续学习
            </el-button>
          </template>
          <p v-else class="muted">暂无最近学习记录</p>
        </div>

        <div class="cv-card trend-card">
          <h3 class="cv-section-title">最近 7 天学习趋势</h3>
          <div ref="trendEl" class="trend-box"></div>
        </div>
      </div>

      <div class="home-row">
        <div class="cv-card recommend-card">
          <h3 class="cv-section-title">推荐课程</h3>
          <div v-if="recommended" class="rec-item" @click="router.push(`/level/${recommended.id}`)">
            <el-icon><Right /></el-icon>
            <div>
              <strong>{{ recommended.title }}</strong>
              <p>{{ recommended.id }} · {{ recommended.difficulty }}</p>
            </div>
          </div>
          <p v-else class="muted">全部关卡已完成，太棒了！</p>
        </div>

        <div class="cv-card review-card">
          <h3 class="cv-section-title">待复习知识点</h3>
          <div
            v-for="l in reviewPoints"
            :key="l.id"
            class="rec-item"
            @click="router.push(`/level/${l.id}`)"
          >
            <el-icon><Reading /></el-icon>
            <div>
              <strong>{{ l.title }}</strong>
              <p>{{ l.id }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="cv-card overview-card">
        <h3 class="cv-section-title">课程体系总览（{{ totalLevelCount }} 关）</h3>
        <div class="overview-grid">
          <div v-for="c in chapters" :key="c.id" class="overview-item" @click="router.push(`/courses/${c.id}`)">
            <strong>{{ c.index }}. {{ c.title }}</strong>
            <p>{{ c.levels.length }} 关</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.hero {
  padding: 34px 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
  background: linear-gradient(120deg, #eff6ff, #ecfeff);
}
.hero-text h1 {
  margin: 0 0 8px;
  font-size: 30px;
  color: var(--cv-primary);
}
.slogan {
  font-size: 14px;
  color: var(--cv-text-secondary);
  margin: 0 0 14px;
}
.desc {
  font-size: 13px;
  line-height: 1.9;
  color: var(--cv-text-regular);
  max-width: 640px;
  margin: 0 0 22px;
}
.hero-actions {
  display: flex;
  gap: 12px;
}
.hero-visual {
  color: var(--cv-primary);
  opacity: 0.85;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}
.home-row {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 16px;
  margin-bottom: 16px;
}
.cv-card h3 {
  margin-top: 0;
}
.full { width: 100%; }
.continue-title { font-weight: 600; margin: 6px 0 2px; }
.continue-id { font-family: var(--cv-mono); font-size: 12px; color: var(--cv-text-placeholder); margin: 0 0 14px; }
.muted { color: var(--cv-text-placeholder); font-size: 13px; }
.trend-box { height: 240px; }
.rec-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 8px;
  border-radius: 8px;
  cursor: pointer;
}
.rec-item:hover { background: var(--cv-primary-soft); }
.rec-item strong { font-size: 13px; }
.rec-item p { margin: 2px 0 0; font-size: 12px; color: var(--cv-text-secondary); }
.overview-card { padding: 20px 22px; }
.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
.overview-item {
  padding: 12px 14px;
  background: var(--cv-bg);
  border-radius: 10px;
  cursor: pointer;
}
.overview-item strong { font-size: 13px; }
.overview-item p { margin: 4px 0 0; font-size: 12px; color: var(--cv-text-secondary); }
@media (max-width: 1000px) {
  .home-row { grid-template-columns: 1fr; }
  .hero-visual { display: none; }
}
</style>
