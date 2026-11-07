<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { loadStats, type StudyStats } from '@/services/stats'
import { useProgressStore } from '@/stores/progress'
import { totalLevelCount } from '@/data/courses'
import StatCard from '@/components/StatCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const progressStore = useProgressStore()
const stats = ref<StudyStats | null>(null)
const hasData = ref(false)

const trendEl = ref<HTMLElement | null>(null)
const radarEl = ref<HTMLElement | null>(null)
const errorEl = ref<HTMLElement | null>(null)
const calendarEl = ref<HTMLElement | null>(null)

function renderTrend() {
  const chart = echarts.init(trendEl.value as HTMLElement)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: stats.value?.last7.map((d) => d.label) },
    yAxis: { type: 'value', name: '分钟' },
    series: [
      {
        name: '学习时长',
        type: 'bar',
        data: stats.value?.last7.map((d) => d.minutes),
        itemStyle: { color: '#2563eb', borderRadius: [4, 4, 0, 0] }
      }
    ]
  })
}

function renderRadar() {
  const chart = echarts.init(radarEl.value as HTMLElement)
  chart.setOption({
    tooltip: {},
    radar: {
      indicator: stats.value?.chapterMastery.map((c) => ({ name: `第${c.chapterId.slice(2)}章`, max: 100 }))
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: stats.value?.chapterMastery.map((c) => c.mastery),
            name: '章节掌握度',
            areaStyle: { color: 'rgba(6,182,212,0.25)' },
            lineStyle: { color: '#0891b2' }
          }
        ]
      }
    ]
  })
}

function renderErrors() {
  const chart = echarts.init(errorEl.value as HTMLElement)
  const entries = Object.entries(stats.value?.errorCharFrequency ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: entries.map((e) => e[0].replace(/\n/g, '↵')) },
    yAxis: { type: 'value', name: '次数' },
    series: [
      {
        type: 'bar',
        data: entries.map((e) => e[1]),
        itemStyle: { color: '#e11d48', borderRadius: [4, 4, 0, 0] }
      }
    ]
  })
}

function renderCalendar() {
  const chart = echarts.init(calendarEl.value as HTMLElement)
  const year = new Date().getFullYear()
  chart.setOption({
    tooltip: { formatter: (p: { value: [string, number] }) => `${p.value[0]}：${p.value[1]} 分钟` },
    visualMap: {
      min: 0,
      max: Math.max(30, ...(stats.value?.calendar.map((c) => c.minutes) ?? [])),
      orient: 'horizontal',
      left: 'right',
      inRange: { color: ['#dbeafe', '#60a5fa', '#1d4ed8'] }
    },
    calendar: { top: 50, left: 40, right: 30, cellSize: ['auto', 22], range: String(year) },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: stats.value?.calendar.map((c) => [c.date, c.minutes])
      }
    ]
  })
}

onMounted(async () => {
  stats.value = await loadStats(progressStore.progressMap)
  hasData.value = stats.value.practiceCount > 0 || stats.value.quizCount > 0
  if (hasData.value) {
    renderTrend()
    renderRadar()
    renderErrors()
    renderCalendar()
    window.addEventListener('resize', () => {
      ;[trendEl, radarEl, errorEl, calendarEl].forEach((el) => {
        const inst = el.value ? echarts.getInstanceByDom(el.value) : null
        inst?.resize()
      })
    })
  }
})
</script>

<template>
  <div class="cv-page">
    <h2 class="cv-page-title">学习分析</h2>
    <p class="cv-page-sub">所有图表均由本地 IndexedDB 中的真实练习与测验记录计算，无数据时不生成任何虚假成绩。</p>

    <EmptyState
      v-if="!hasData"
      title="还没有学习数据"
      desc="完成第一次代码练习或测验后，这里会生成趋势、掌握度、易错字符与学习日历"
      icon="DataAnalysis"
    />

    <template v-else>
      <div class="stat-grid">
        <StatCard label="累计练习次数" :value="stats?.practiceCount ?? 0" icon="EditPen" />
        <StatCard label="累计学习时长（分）" :value="stats?.totalMinutes ?? 0" icon="Timer" />
        <StatCard label="课程完成率（%）" :value="Math.round(((stats ? progressStore.completedCount : 0) / totalLevelCount) * 100)" icon="TrendCharts" />
        <StatCard label="平均 WPM" :value="stats?.avgWpm ?? 0" icon="Lightning" />
        <StatCard label="平均 CPM" :value="stats?.avgCpm ?? 0" icon="Keyboard" />
        <StatCard label="平均准确率（%）" :value="stats?.avgAccuracy ?? 0" icon="CircleCheck" />
        <StatCard label="测验正确率（%）" :value="stats?.quizAvgAccuracy ?? 0" icon="Histogram" />
        <StatCard label="连续学习天数" :value="stats?.streak ?? 0" icon="Calendar" />
      </div>

      <div class="cv-card chart-card">
        <h3 class="cv-section-title">最近 7 天学习趋势</h3>
        <div ref="trendEl" class="chart-box"></div>
      </div>

      <div class="cv-card chart-card">
        <h3 class="cv-section-title">各章节知识掌握情况</h3>
        <div ref="radarEl" class="chart-box"></div>
      </div>

      <div class="cv-card chart-card">
        <h3 class="cv-section-title">易错字符分布</h3>
        <div ref="errorEl" class="chart-box"></div>
      </div>

      <div class="cv-card chart-card">
        <h3 class="cv-section-title">学习日历</h3>
        <div ref="calendarEl" class="chart-box calendar-box"></div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}
.chart-card {
  padding: 18px 20px;
  margin-bottom: 16px;
}
.chart-box {
  width: 100%;
  height: 300px;
}
.calendar-box {
  height: 260px;
}
</style>
