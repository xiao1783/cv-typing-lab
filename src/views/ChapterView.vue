<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { findChapter } from '@/data/courses'
import { useProgressStore } from '@/stores/progress'

const route = useRoute()
const router = useRouter()
const progressStore = useProgressStore()

const chapter = computed(() => findChapter(String(route.params.chapterId)))

const modeLabel: Record<string, string> = {
  follow: '代码跟打',
  blank: '代码填空',
  challenge: '代码实战'
}
const diffType: Record<string, '' | 'success' | 'warning' | 'danger'> = {
  入门: '',
  基础: 'success',
  进阶: 'warning',
  挑战: 'danger'
}
</script>

<template>
  <div class="cv-page">
    <el-button text class="back-btn" @click="router.push('/courses')">
      <el-icon><ArrowLeft /></el-icon>返回课程中心
    </el-button>

    <template v-if="chapter">
      <div class="cv-card chapter-hero">
        <h2>{{ chapter.title }}</h2>
        <p class="subtitle">{{ chapter.subtitle }}</p>
        <p class="intro">{{ chapter.intro }}</p>
        <div class="objectives">
          <h4>学习目标</h4>
          <ul>
            <li v-for="(o, i) in chapter.objectives" :key="i">{{ o }}</li>
          </ul>
        </div>
      </div>

      <h3 class="cv-section-title">关卡列表</h3>
      <div class="level-list">
        <div
          v-for="level in chapter.levels"
          :key="level.id"
          class="cv-card level-item"
          :class="{ done: progressStore.isCompleted(level.id) }"
          @click="router.push(`/level/${level.id}`)"
        >
          <span class="level-no">{{ level.index }}</span>
          <div class="level-main">
            <strong>{{ level.title }}</strong>
            <div class="level-tags">
              <el-tag size="small" effect="plain">{{ modeLabel[level.mode] }}</el-tag>
              <el-tag size="small" :type="diffType[level.difficulty]" effect="plain">
                {{ level.difficulty }}
              </el-tag>
              <span class="time"><el-icon><Clock /></el-icon>约 {{ level.estMinutes }} 分钟</span>
            </div>
          </div>
          <el-icon class="status-icon">
            <CircleCheckFilled v-if="progressStore.isCompleted(level.id)" class="done-icon" />
            <ArrowRight v-else />
          </el-icon>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.back-btn {
  margin-bottom: 10px;
}
.chapter-hero {
  padding: 24px 26px;
  margin-bottom: 20px;
}
.chapter-hero h2 {
  margin: 0 0 6px;
}
.subtitle {
  color: var(--cv-text-secondary);
  font-size: 13px;
  margin: 0 0 14px;
}
.intro {
  font-size: 14px;
  line-height: 1.8;
  color: var(--cv-text-regular);
  margin: 0 0 16px;
}
.objectives h4 {
  margin: 0 0 8px;
  font-size: 14px;
}
.objectives ul {
  margin: 0;
  padding-left: 20px;
}
.objectives li {
  font-size: 13px;
  line-height: 2;
  color: var(--cv-text-regular);
}
.level-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.level-item {
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
}
.level-item:hover {
  box-shadow: var(--cv-shadow-hover);
}
.level-no {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--cv-primary-soft);
  color: var(--cv-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}
.level-item.done .level-no {
  background: var(--cv-success-soft);
  color: var(--cv-success);
}
.level-main {
  flex: 1;
}
.level-main strong {
  font-size: 14px;
}
.level-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
}
.time {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--cv-text-secondary);
}
.status-icon {
  color: var(--cv-text-placeholder);
}
.done-icon {
  color: var(--cv-success);
}
</style>
