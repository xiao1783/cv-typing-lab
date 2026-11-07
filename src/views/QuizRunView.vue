<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElNotification } from 'element-plus'
import { findQuizSet } from '@/data/quiz'
import type { QuizQuestion } from '@/data/types'
import { gradeQuiz } from '@/engine/quizGrade'
import { quizRepo, mistakeRepo } from '@/db/repo'
import { useProgressStore } from '@/stores/progress'
import { evaluateAchievements, ACHIEVEMENTS } from '@/config/achievements'
import { loadStats } from '@/services/stats'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const progressStore = useProgressStore()

const quizSet = computed(() => findQuizSet(String(route.params.levelId)))
const answers = ref<Record<string, string[]>>({})
const submitted = ref(false)
const result = ref<{ correct: number; total: number; score: number; perQuestion: Record<string, boolean> }>()
const startedAt = ref(Date.now())

onMounted(() => {
  if (quizSet.value) {
    const init: Record<string, string[]> = {}
    for (const qItem of quizSet.value.questions) init[qItem.id] = []
    answers.value = init
  }
})

function setSingle(qId: string, value: string) {
  answers.value[qId] = [value]
}
function setMultiple(qId: string, values: string[]) {
  answers.value[qId] = values
}
function setBlank(qId: string, value: string) {
  answers.value[qId] = [value]
}

function answerText(q: QuizQuestion): string {
  const user = answers.value[q.id] ?? []
  if (q.options) {
    return user
      .map((key) => q.options?.find((o) => o.key === key)?.text ?? key)
      .join('；')
  }
  return user.join('；')
}

function correctText(q: QuizQuestion): string {
  if (q.options) {
    return q.answer.map((key) => q.options?.find((o) => o.key === key)?.text ?? key).join('；')
  }
  return q.answer.join('；')
}

async function submit() {
  if (!quizSet.value) return
  const unanswered = quizSet.value.questions.filter((q) => (answers.value[q.id] ?? []).length === 0)
  if (unanswered.length > 0) {
    ElMessage.warning(`还有 ${unanswered.length} 题未作答`)
    return
  }
  const durationSec = Math.round((Date.now() - startedAt.value) / 1000)
  const grade = gradeQuiz(quizSet.value.questions, answers.value)
  result.value = grade
  submitted.value = true

  await quizRepo.add({
    levelId: quizSet.value.levelId,
    score: grade.score,
    total: grade.total,
    correct: grade.correct,
    durationSec,
    createdAt: Date.now()
  })

  for (const qItem of quizSet.value.questions) {
    if (!grade.perQuestion[qItem.id]) {
      await mistakeRepo.add({
        kind: 'quiz',
        refId: qItem.id,
        levelId: qItem.levelId,
        question: qItem.stem,
        userAnswer: answerText(qItem),
        correctAnswer: correctText(qItem),
        reason: qItem.mistakeReason,
        createdAt: Date.now(),
        resolved: false
      })
    }
  }

  const stats = await loadStats(progressStore.progressMap)
  const newIds = evaluateAchievements({
    completedCount: progressStore.completedCount,
    totalCount: quizSet.value.questions.length,
    wpm: 0,
    accuracy: grade.score,
    streak: stats.streak,
    quizCount: stats.quizCount + 1,
    quizFull: grade.score === 100,
    existing: progressStore.achievements
  })
  for (const id of newIds) {
    const isNew = await progressStore.unlock(id)
    if (isNew) {
      const def = ACHIEVEMENTS.find((a) => a.id === id)
      ElNotification({
        title: `成就解锁：${def?.title ?? id}`,
        message: def?.desc,
        type: 'success'
      })
    }
  }
}

function retake() {
  submitted.value = false
  result.value = undefined
  startedAt.value = Date.now()
  if (quizSet.value) {
    for (const qItem of quizSet.value.questions) answers.value[qItem.id] = []
  }
}
</script>

<template>
  <div class="cv-page">
    <EmptyState
      v-if="!quizSet || quizSet.questions.length === 0"
      title="该关卡暂无测验题目"
      desc="完成对应课程后会自动关联测验"
      icon="EditPen"
    >
      <el-button type="primary" @click="router.push('/quiz')">返回测验中心</el-button>
    </EmptyState>

    <template v-else>
      <h2 class="cv-page-title">{{ quizSet.title }}</h2>
      <p class="cv-page-sub">共 {{ quizSet.questions.length }} 题，提交后显示解析并自动记录错题。</p>

      <div v-if="!submitted" class="question-list">
        <div v-for="(q, i) in quizSet.questions" :key="q.id" class="cv-card q-card">
          <div class="q-stem">
            <span class="q-no">{{ i + 1 }}</span>
            <div>
              <p>{{ q.stem }}</p>
              <el-tag size="small" effect="plain" class="type-tag">
                {{
                  { single: '单选', multiple: '多选', judge: '判断', codeBlank: '代码填空', param: '参数选择', result: '结果判断' }[q.type]
                }}
              </el-tag>
            </div>
          </div>
          <pre v-if="q.code" class="cv-codeblock q-code">{{ q.code }}</pre>

          <div class="q-answer">
            <el-radio-group
              v-if="q.type === 'judge'"
              :model-value="answers[q.id]?.[0]"
              @update:model-value="(v: string) => setSingle(q.id, v)"
            >
              <el-radio value="T">正确</el-radio>
              <el-radio value="F">错误</el-radio>
            </el-radio-group>

            <el-radio-group
              v-else-if="['single', 'param', 'result'].includes(q.type)"
              :model-value="answers[q.id]?.[0]"
              @update:model-value="(v: string) => setSingle(q.id, v)"
            >
              <el-radio v-for="o in q.options" :key="o.key" :value="o.key" class="block-radio">
                <strong>{{ o.key }}.</strong> {{ o.text }}
              </el-radio>
            </el-radio-group>

            <el-checkbox-group
              v-else-if="q.type === 'multiple'"
              :model-value="answers[q.id]"
              @update:model-value="(v: string[]) => setMultiple(q.id, v)"
            >
              <el-checkbox v-for="o in q.options" :key="o.key" :value="o.key" class="block-radio">
                <strong>{{ o.key }}.</strong> {{ o.text }}
              </el-checkbox>
            </el-checkbox-group>

            <el-input
              v-else
              :model-value="answers[q.id]?.[0]"
              placeholder="输入代码答案"
              class="blank-answer"
              @update:model-value="(v: string) => setBlank(q.id, v)"
            />
          </div>
        </div>

        <div class="submit-bar">
          <el-button size="large" @click="router.back()">返回</el-button>
          <el-button type="primary" size="large" @click="submit">提交答卷</el-button>
        </div>
      </div>

      <div v-else class="review">
        <div class="cv-card score-banner" :class="{ pass: (result?.score ?? 0) >= 60 }">
          <div class="score-num cv-pop">{{ result?.score }}<span>分</span></div>
          <div class="score-detail">
            <p>答对 <strong>{{ result?.correct }}</strong> / {{ result?.total }} 题</p>
            <el-progress
              :percentage="result?.score ?? 0"
              :status="(result?.score ?? 0) >= 60 ? 'success' : 'exception'"
            />
          </div>
        </div>

        <div v-for="(q, i) in quizSet.questions" :key="q.id" class="cv-card review-card" :class="{ wrong: !result?.perQuestion[q.id] }">
          <div class="review-head">
            <el-icon :size="20">
              <CircleCheckFilled v-if="result?.perQuestion[q.id]" class="ok" />
              <CircleCloseFilled v-else class="bad" />
            </el-icon>
            <strong>{{ i + 1 }}. {{ q.stem }}</strong>
          </div>
          <div class="review-rows">
            <p>你的答案：<span :class="result?.perQuestion[q.id] ? 'ok-text' : 'bad-text'">{{ answerText(q) || '未作答' }}</span></p>
            <p>正确答案：<span class="ok-text">{{ correctText(q) }}</span></p>
            <p class="explain">解析：{{ q.explanation }}</p>
            <p v-if="!result?.perQuestion[q.id]" class="reason">错误原因：{{ q.mistakeReason }}</p>
          </div>
          <el-button size="small" text @click="router.push(`/level/${q.reviewLevelId}`)">
            <el-icon><Reading /></el-icon>复习对应关卡
          </el-button>
        </div>

        <div class="submit-bar">
          <el-button size="large" @click="router.push('/quiz')">返回测验中心</el-button>
          <el-button type="primary" size="large" @click="retake">再测一次</el-button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.question-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.q-card {
  padding: 18px 20px;
}
.q-stem {
  display: flex;
  gap: 12px;
}
.q-no {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--cv-primary-soft);
  color: var(--cv-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}
.q-stem p {
  margin: 0 0 6px;
  font-weight: 600;
}
.type-tag {
  margin-bottom: 4px;
}
.q-code {
  margin: 12px 0;
}
.q-answer {
  margin-top: 12px;
}
.block-radio {
  display: flex;
  align-items: flex-start;
  margin: 8px 0;
  white-space: normal;
}
.blank-answer {
  max-width: 420px;
}
.submit-bar {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 8px 0 20px;
}
.score-banner {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 28px;
  margin-bottom: 16px;
}
.score-num {
  font-size: 46px;
  font-weight: 800;
  font-family: var(--cv-mono);
  color: var(--cv-primary);
}
.score-num span {
  font-size: 18px;
}
.score-detail {
  flex: 1;
  max-width: 420px;
}
.score-detail p {
  margin: 0 0 10px;
}
.review-card {
  padding: 16px 20px;
  margin-bottom: 12px;
}
.review-card.wrong {
  border-left: 4px solid var(--cv-danger);
}
.review-head {
  display: flex;
  gap: 10px;
  align-items: center;
}
.ok { color: var(--cv-success); }
.bad { color: var(--cv-danger); }
.review-rows {
  margin: 10px 0 6px;
  padding-left: 30px;
}
.review-rows p {
  margin: 4px 0;
  font-size: 13px;
}
.ok-text { color: var(--cv-success); font-weight: 600; }
.bad-text { color: var(--cv-danger); font-weight: 600; }
.explain { color: var(--cv-text-regular); }
.reason { color: var(--cv-danger); }
</style>
