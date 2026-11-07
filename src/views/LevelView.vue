<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import FollowTyping from '@/components/typing/FollowTyping.vue'
import BlankTyping from '@/components/typing/BlankTyping.vue'
import ChallengeTyping from '@/components/typing/ChallengeTyping.vue'
import KnowledgePanel from '@/components/KnowledgePanel.vue'
import EmptyState from '@/components/EmptyState.vue'
import { findLevel, findChapter, nextLevel, allLevels } from '@/data/courses'
import { useProgressStore } from '@/stores/progress'
import { typingRepo, metaRepo } from '@/db/repo'
import { loadStats } from '@/services/stats'
import { evaluateAchievements, ACHIEVEMENTS } from '@/config/achievements'
import type { PracticeOutcome } from '@/engine/outcome'

const route = useRoute()
const router = useRouter()
const progressStore = useProgressStore()

const level = computed(() => findLevel(String(route.params.levelId)))
const chapter = computed(() => (level.value ? findChapter(level.value.chapterId) : undefined))
const isCompleted = computed(() => (level.value ? progressStore.isCompleted(level.value.id) : false))

const outcome = ref<PracticeOutcome | null>(null)
const dialogVisible = ref(false)

const levelIndex = computed(() => (level.value ? allLevels.findIndex((l) => l.id === level.value!.id) : -1))
const prev = computed(() => (levelIndex.value > 0 ? allLevels[levelIndex.value - 1] : undefined))
const next = computed(() => (level.value ? nextLevel(level.value.id) : undefined))

async function handleFinish(result: PracticeOutcome) {
  if (!level.value) return
  outcome.value = result
  await typingRepo.add({
    levelId: level.value.id,
    mode: result.mode,
    wpm: result.wpm,
    cpm: result.cpm,
    accuracy: result.accuracy,
    errors: result.errors,
    backspaces: result.backspaces,
    durationSec: result.durationSec,
    charsTyped: result.charsTyped,
    errorFreq: result.errorFreq,
    createdAt: Date.now()
  })
  await progressStore.recordTyping(
    level.value.id,
    { wpm: result.wpm, accuracy: result.accuracy, score: result.score },
    true
  )
  await metaRepo.set('lastLevelId', level.value.id)

  const stats = await loadStats(progressStore.progressMap)
  const newIds = evaluateAchievements({
    completedCount: progressStore.completedCount,
    totalCount: allLevels.length,
    wpm: result.wpm,
    accuracy: result.accuracy,
    streak: stats.streak,
    quizCount: stats.quizCount,
    quizFull: false,
    existing: progressStore.achievements
  })
  for (const id of newIds) {
    const isNew = await progressStore.unlock(id)
    if (isNew) {
      const def = ACHIEVEMENTS.find((a) => a.id === id)
      ElNotification({
        title: `成就解锁：${def?.title ?? id}`,
        message: def?.desc,
        type: 'success',
        duration: 3200
      })
    }
  }
  dialogVisible.value = true
}

function toggleFav() {
  if (level.value) void progressStore.toggleFavorite(level.value.id)
}

onMounted(() => {
  if (level.value) void metaRepo.set('lastLevelId', level.value.id)
})
</script>

<template>
  <div class="cv-page">
    <EmptyState v-if="!level" title="未找到该关卡" desc="可能链接已失效，请返回课程中心重新选择" icon="WarningFilled">
      <el-button type="primary" @click="router.push('/courses')">返回课程中心</el-button>
    </EmptyState>

    <template v-else>
      <div class="level-head cv-card">
        <div class="head-main">
          <div class="crumbs">
            <RouterLink :to="`/courses/${chapter?.id}`">{{ chapter?.title }}</RouterLink>
            <el-icon><ArrowRight /></el-icon>
            <span>第 {{ level.index }} 关</span>
          </div>
          <h2 class="level-title">{{ level.title }}</h2>
          <div class="meta-row">
            <span class="diff-tag" :class="level.difficulty">{{ level.difficulty }}</span>
            <el-tag size="small" effect="plain">
              {{ level.mode === 'follow' ? '代码跟打' : level.mode === 'blank' ? '代码填空' : '代码实战' }}
            </el-tag>
            <span class="meta-text"><el-icon><Clock /></el-icon>约 {{ level.estMinutes }} 分钟</span>
            <el-tag v-if="isCompleted" size="small" type="success" effect="dark">已完成</el-tag>
          </div>
        </div>
        <div class="head-actions">
          <el-button :type="progressStore.isFavorite(level.id) ? 'warning' : 'default'" @click="toggleFav">
            <el-icon><Star v-if="progressStore.isFavorite(level.id)" /><StarFilled v-else /></el-icon>
            {{ progressStore.isFavorite(level.id) ? '已收藏' : '收藏' }}
          </el-button>
        </div>
      </div>

      <section class="cv-card practice-card">
        <h3 class="cv-section-title">
          {{ level.mode === 'follow' ? '代码跟打练习' : level.mode === 'blank' ? '代码填空练习' : '代码实战练习' }}
        </h3>
        <p class="task-text">{{ level.task }}</p>
        <FollowTyping v-if="level.mode === 'follow'" :level="level" @finish="handleFinish" />
        <BlankTyping v-else-if="level.mode === 'blank'" :level="level" @finish="handleFinish" />
        <ChallengeTyping v-else :level="level" @finish="handleFinish" />
      </section>

      <section v-if="level.labExperiment" class="cv-card lab-entry">
        <div>
          <strong>想立刻看到真实图像效果？</strong>
          <p>本关关联算法实验室「{{ level.labExperiment }}」，可调整参数实时运算。</p>
        </div>
        <el-button type="primary" plain @click="router.push(`/lab/${level.labExperiment}`)">
          <el-icon><MagicStick /></el-icon>进入实验室
        </el-button>
      </section>

      <section v-if="!isCompleted" class="cv-card locked-card">
        <el-icon :size="26" class="lock-icon"><Lock /></el-icon>
        <div>
          <strong>知识解析待解锁</strong>
          <p>完成上方练习后，将解锁详细的功能概述、逐行讲解、API 参数、数学公式与常见错误。</p>
        </div>
      </section>
      <template v-else>
        <KnowledgePanel :level="level" />
      </template>

      <div class="level-nav">
        <el-button :disabled="!prev" @click="prev && router.push(`/level/${prev.id}`)">
          <el-icon><ArrowLeft /></el-icon>上一关
        </el-button>
        <el-button :disabled="!next" type="primary" @click="next && router.push(`/level/${next.id}`)">
          下一关<el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
    </template>

    <el-dialog v-model="dialogVisible" width="460px" :show-close="true" align-center class="result-dialog">
      <div v-if="outcome" class="result-content">
        <div class="result-badge cv-pop">
          <el-icon :size="40"><CircleCheckFilled /></el-icon>
        </div>
        <h3>练习完成！</h3>
        <p class="result-sub">键入代码，理解视觉 —— 知识解析已解锁</p>
        <div class="result-grid">
          <div v-if="outcome.mode === 'follow'">
            <strong>{{ outcome.wpm }}</strong><span>WPM</span>
          </div>
          <div v-if="outcome.mode === 'follow'">
            <strong>{{ outcome.cpm }}</strong><span>CPM</span>
          </div>
          <div>
            <strong>{{ outcome.accuracy }}%</strong><span>准确率</span>
          </div>
          <div>
            <strong>{{ outcome.score }}</strong><span>综合评分</span>
          </div>
        </div>
        <div class="dialog-actions">
          <el-button @click="dialogVisible = false">查看知识解析</el-button>
          <el-button type="primary" @click="router.push(`/quiz/${level?.id}`)">前往巩固测试</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.level-head {
  padding: 20px 22px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.crumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--cv-text-secondary);
}
.level-title {
  margin: 8px 0 10px;
  font-size: 22px;
}
.meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.meta-text {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--cv-text-secondary);
}
.practice-card {
  padding: 20px 22px;
  margin-bottom: 16px;
}
.task-text {
  margin: 0 0 16px;
  color: var(--cv-text-secondary);
  font-size: 13px;
}
.lab-entry {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.lab-entry p {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--cv-text-secondary);
}
.locked-card {
  padding: 18px 20px;
  display: flex;
  gap: 14px;
  align-items: center;
}
.lock-icon {
  color: var(--cv-warning);
}
.locked-card p {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--cv-text-secondary);
}
.level-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 18px;
}
.result-content {
  text-align: center;
}
.result-badge {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: var(--cv-success-soft);
  color: var(--cv-success);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}
.result-content h3 {
  margin: 0 0 4px;
  font-size: 20px;
}
.result-sub {
  font-size: 12px;
  color: var(--cv-text-secondary);
  margin: 0 0 18px;
}
.result-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}
.result-grid div {
  background: var(--cv-bg);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
}
.result-grid strong {
  font-size: 22px;
  font-family: var(--cv-mono);
}
.result-grid span {
  font-size: 12px;
  color: var(--cv-text-secondary);
}
.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>
