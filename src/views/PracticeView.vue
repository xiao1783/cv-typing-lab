<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { allLevels, chapters } from '@/data/courses'
import { useProgressStore } from '@/stores/progress'

const router = useRouter()
const progressStore = useProgressStore()

const keyword = ref('')
const modeFilter = ref<'all' | 'follow' | 'blank' | 'challenge'>('all')

const modeLabel: Record<string, string> = {
  follow: '代码跟打',
  blank: '代码填空',
  challenge: '代码实战'
}

const filtered = computed(() =>
  allLevels.filter((l) => {
    const matchMode = modeFilter.value === 'all' || l.mode === modeFilter.value
    const kw = keyword.value.trim()
    const matchKw =
      !kw ||
      l.title.includes(kw) ||
      l.id.includes(kw) ||
      l.tags.some((t) => t.includes(kw))
    return matchMode && matchKw
  })
)

function chapterTitle(chapterId: string): string {
  return chapters.find((c) => c.id === chapterId)?.title ?? chapterId
}
</script>

<template>
  <div class="cv-page">
    <h2 class="cv-page-title">代码练习</h2>
    <p class="cv-page-sub">选择关卡进入真实 Python/OpenCV 代码输入，支持跟打、填空与实战三种模式。</p>

    <div class="cv-card toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索关卡标题、编号或标签"
        clearable
        class="search"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-radio-group v-model="modeFilter">
        <el-radio-button value="all">全部</el-radio-button>
        <el-radio-button value="follow">跟打</el-radio-button>
        <el-radio-button value="blank">填空</el-radio-button>
        <el-radio-button value="challenge">实战</el-radio-button>
      </el-radio-group>
    </div>

    <div class="practice-table cv-card">
      <div class="table-head">
        <span>关卡</span><span>所属章节</span><span>模式</span><span>难度</span><span>状态</span>
      </div>
      <div
        v-for="level in filtered"
        :key="level.id"
        class="table-row"
        @click="router.push(`/level/${level.id}`)"
      >
        <span class="cell-level">
          <strong>{{ level.title }}</strong>
          <small>{{ level.id }}</small>
        </span>
        <span>{{ chapterTitle(level.chapterId) }}</span>
        <el-tag size="small" effect="plain">{{ modeLabel[level.mode] }}</el-tag>
        <span>{{ level.difficulty }}</span>
        <el-tag v-if="progressStore.isCompleted(level.id)" size="small" type="success">已完成</el-tag>
        <el-tag v-else size="small" type="info" effect="plain">未完成</el-tag>
      </div>
      <p v-if="filtered.length === 0" class="empty">没有符合条件的关卡</p>
    </div>
  </div>
</template>

<style scoped>
.toolbar {
  padding: 16px 20px;
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.search {
  max-width: 320px;
}
.practice-table {
  padding: 6px 0;
}
.table-head,
.table-row {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr 1fr;
  align-items: center;
  gap: 10px;
  padding: 12px 22px;
}
.table-head {
  font-size: 12px;
  color: var(--cv-text-secondary);
  border-bottom: 1px solid var(--cv-border-light);
}
.table-row {
  cursor: pointer;
  font-size: 13px;
  border-bottom: 1px solid var(--cv-border-lighter);
}
.table-row:hover {
  background: var(--cv-primary-soft);
}
.cell-level {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cell-level small {
  color: var(--cv-text-placeholder);
  font-family: var(--cv-mono);
}
.empty {
  text-align: center;
  padding: 30px;
  color: var(--cv-text-placeholder);
  font-size: 13px;
}
</style>
