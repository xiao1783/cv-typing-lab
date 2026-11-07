<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { quizSets } from '@/data/quiz'
import { chapters } from '@/data/courses'
import { quizRepo } from '@/db/repo'
import type { QuizRecord } from '@/db/types'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const records = ref<QuizRecord[]>([])

onMounted(async () => {
  records.value = await quizRepo.all()
})

const bestScoreMap = computed(() => {
  const map: Record<string, number> = {}
  for (const r of records.value) {
    map[r.levelId] = Math.max(map[r.levelId] ?? 0, r.score)
  }
  return map
})

const grouped = computed(() =>
  chapters.map((c) => ({
    chapter: c,
    sets: quizSets.filter((s) => s.levelId.startsWith(c.id))
  }))
)
</script>

<template>
  <div class="cv-page">
    <h2 class="cv-page-title">知识测验</h2>
    <p class="cv-page-sub">六类题型检验掌握程度，错题自动加入错题本，所有成绩保存在本地。</p>

    <div v-for="group in grouped" :key="group.chapter.id" class="chapter-group">
      <h3 class="cv-section-title">{{ group.chapter.title }}</h3>
      <div class="set-grid">
        <div v-for="set in group.sets" :key="set.id" class="cv-card set-card">
          <div class="set-head">
            <span class="set-title">{{ set.title }}</span>
            <el-tag size="small" effect="plain">{{ set.questions.length }} 题</el-tag>
          </div>
          <div class="set-meta">
            <el-icon><Histogram /></el-icon>
            <span v-if="bestScoreMap[set.levelId] != null">
              历史最佳：<strong>{{ bestScoreMap[set.levelId] }} 分</strong>
            </span>
            <span v-else class="muted">尚未测验</span>
          </div>
          <el-button
            type="primary"
            plain
            class="start-btn"
            :disabled="set.questions.length === 0"
            @click="router.push(`/quiz/${set.levelId}`)"
          >
            开始测验
          </el-button>
        </div>
      </div>
    </div>

    <EmptyState
      v-if="quizSets.every((s) => s.questions.length === 0)"
      title="暂无测验题目"
      desc="请先完成课程内容建设"
      icon="EditPen"
    />
  </div>
</template>

<style scoped>
.chapter-group {
  margin-bottom: 26px;
}
.set-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}
.set-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.set-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
.set-title {
  font-weight: 700;
  font-size: 14px;
}
.set-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--cv-text-secondary);
}
.muted {
  color: var(--cv-text-placeholder);
}
.start-btn {
  width: 100%;
}
</style>
