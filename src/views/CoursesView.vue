<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { chapters, totalLevelCount } from '@/data/courses'
import { useProgressStore } from '@/stores/progress'

const router = useRouter()
const progressStore = useProgressStore()

function chapterStats(chapterId: string) {
  const levels = chapters.find((c) => c.id === chapterId)?.levels ?? []
  const completed = levels.filter((l) => progressStore.isCompleted(l.id)).length
  return {
    completed,
    total: levels.length,
    percent: levels.length ? Math.round((completed / levels.length) * 100) : 0
  }
}

const overall = computed(() => {
  const completed = progressStore.completedCount
  return { completed, total: totalLevelCount, percent: Math.round((completed / totalLevelCount) * 100) }
})
</script>

<template>
  <div class="cv-page">
    <h2 class="cv-page-title">课程中心</h2>
    <p class="cv-page-sub">六章 60 关，从图像卷积到特征匹配与综合实战，循序渐进掌握 OpenCV 编程。</p>

    <div class="cv-card overall-card">
      <div class="overall-text">
        <h3>课程体系总览</h3>
        <p>已完成 {{ overall.completed }} / {{ overall.total }} 关，完成率 {{ overall.percent }}%</p>
      </div>
      <el-progress
        type="line"
        :percentage="overall.percent"
        :stroke-width="14"
        class="overall-progress"
      />
    </div>

    <div class="chapter-grid">
      <div
        v-for="c in chapters"
        :key="c.id"
        class="cv-card chapter-card"
        @click="router.push(`/courses/${c.id}`)"
      >
        <div class="chapter-top">
          <span class="chapter-index">{{ c.index }}</span>
          <div>
            <h3>{{ c.title }}</h3>
            <p>{{ c.subtitle }}</p>
          </div>
        </div>
        <p class="chapter-intro">{{ c.intro }}</p>
        <div class="chapter-foot">
          <el-progress :percentage="chapterStats(c.id).percent" :stroke-width="8" />
          <span class="foot-text">
            {{ chapterStats(c.id).completed }}/{{ chapterStats(c.id).total }} 关
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overall-card {
  padding: 20px 24px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 30px;
}
.overall-text h3 {
  margin: 0 0 6px;
}
.overall-text p {
  margin: 0;
  font-size: 13px;
  color: var(--cv-text-secondary);
}
.overall-progress {
  flex: 1;
}
.chapter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}
.chapter-card {
  padding: 20px;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.chapter-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--cv-shadow-hover);
}
.chapter-top {
  display: flex;
  gap: 14px;
  align-items: center;
}
.chapter-index {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--cv-primary-soft);
  color: var(--cv-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  flex-shrink: 0;
}
.chapter-top h3 {
  margin: 0 0 4px;
  font-size: 16px;
}
.chapter-top p {
  margin: 0;
  font-size: 12px;
  color: var(--cv-text-secondary);
}
.chapter-intro {
  margin: 12px 0;
  font-size: 13px;
  color: var(--cv-text-regular);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.chapter-foot {
  display: flex;
  align-items: center;
  gap: 12px;
}
.chapter-foot .el-progress {
  flex: 1;
}
.foot-text {
  font-size: 12px;
  color: var(--cv-text-secondary);
  white-space: nowrap;
}
</style>
