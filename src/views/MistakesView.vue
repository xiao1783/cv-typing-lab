<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { mistakeRepo } from '@/db/repo'
import type { MistakeRecord } from '@/db/types'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const records = ref<MistakeRecord[]>([])
const filter = ref<'all' | 'unresolved' | 'resolved'>('all')

onMounted(load)

async function load() {
  records.value = await mistakeRepo.all()
}

const shown = computed(() =>
  records.value.filter((r) =>
    filter.value === 'all' ? true : filter.value === 'resolved' ? r.resolved : !r.resolved
  )
)

async function toggle(r: MistakeRecord) {
  if (r.id == null) return
  await mistakeRepo.toggleResolved(r.id, !r.resolved)
  ElMessage.success(r.resolved ? '已标记为待复习' : '已标记为掌握')
  await load()
}

async function remove(r: MistakeRecord) {
  if (r.id == null) return
  await ElMessageBox.confirm('确定删除该错题记录吗？', '删除确认', { type: 'warning' })
  await mistakeRepo.remove(r.id)
  await load()
}
</script>

<template>
  <div class="cv-page">
    <h2 class="cv-page-title">错题与复习</h2>
    <p class="cv-page-sub">测验答错与练习易错点自动汇总到这里，掌握后可标记，便于针对性复习。</p>

    <div class="filter-bar">
      <el-radio-group v-model="filter">
        <el-radio-button value="all">全部（{{ records.length }}）</el-radio-button>
        <el-radio-button value="unresolved">待复习</el-radio-button>
        <el-radio-button value="resolved">已掌握</el-radio-button>
      </el-radio-group>
    </div>

    <EmptyState
      v-if="shown.length === 0"
      title="暂无错题"
      desc="完成测验后，答错的题目会自动加入这里"
      icon="Collection"
    />

    <div v-else class="mistake-list">
      <div v-for="r in shown" :key="r.id" class="cv-card mistake-card" :class="{ resolved: r.resolved }">
        <div class="card-head">
          <el-tag size="small" :type="r.kind === 'quiz' ? 'warning' : 'danger'" effect="plain">
            {{ r.kind === 'quiz' ? '测验错题' : '打字易错' }}
          </el-tag>
          <el-tag v-if="r.resolved" size="small" type="success">已掌握</el-tag>
          <span class="ref-id">{{ r.refId }}</span>
        </div>
        <p class="question">{{ r.question }}</p>
        <div class="answers">
          <p>你的答案：<span class="bad">{{ r.userAnswer || '未作答' }}</span></p>
          <p>正确答案：<span class="good">{{ r.correctAnswer }}</span></p>
          <p class="reason">错误原因：{{ r.reason }}</p>
        </div>
        <div class="actions">
          <el-button size="small" type="primary" plain @click="router.push(`/level/${r.levelId}`)">
            <el-icon><Reading /></el-icon>复习关卡
          </el-button>
          <el-button size="small" @click="toggle(r)">
            {{ r.resolved ? '标记为待复习' : '标记为掌握' }}
          </el-button>
          <el-button size="small" type="danger" text @click="remove(r)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  margin-bottom: 16px;
}
.mistake-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mistake-card {
  padding: 16px 20px;
}
.mistake-card.resolved {
  opacity: 0.75;
}
.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ref-id {
  font-size: 12px;
  color: var(--cv-text-placeholder);
  font-family: var(--cv-mono);
}
.question {
  margin: 12px 0 10px;
  font-weight: 600;
  font-size: 14px;
}
.answers p {
  margin: 4px 0;
  font-size: 13px;
}
.bad { color: var(--cv-danger); font-weight: 600; }
.good { color: var(--cv-success); font-weight: 600; }
.reason { color: var(--cv-text-secondary); }
.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}
</style>
