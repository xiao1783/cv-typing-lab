<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import monaco from '@/monacoSetup'
import type { Level } from '@/data/types'
import { runChallengeChecks, type CheckResult } from '@/engine/pythonCheck'
import { useSettingsStore } from '@/stores/settings'
import type { PracticeOutcome } from '@/engine/outcome'

const props = defineProps<{ level: Level }>()
const emit = defineEmits<{ (e: 'finish', outcome: PracticeOutcome): void }>()

const settingsStore = useSettingsStore()
const container = ref<HTMLDivElement>()
let editor: monaco.editor.IStandaloneCodeEditor

const results = ref<CheckResult[]>([])
const passedAll = ref(false)
const startedAt = ref(Date.now())
const hasRun = ref(false)

const passCount = computed(() => results.value.filter((r) => r.passed).length)

function runChecks() {
  const source = editor.getValue()
  results.value = runChallengeChecks(source, props.level.validators ?? [])
  hasRun.value = true
  if (results.value.length > 0 && results.value.every((r) => r.passed) && !passedAll.value) {
    passedAll.value = true
    const accuracy = 100
    const durationSec = Math.round((Date.now() - startedAt.value) / 1000)
    emit('finish', {
      mode: 'challenge',
      wpm: 0,
      cpm: 0,
      accuracy,
      score: accuracy,
      errors: 0,
      backspaces: 0,
      durationSec,
      charsTyped: source.length
    })
  }
}

function reset() {
  editor.setValue('')
  results.value = []
  passedAll.value = false
  hasRun.value = false
  startedAt.value = Date.now()
  editor.focus()
}

onMounted(() => {
  editor = monaco.editor.create(container.value as HTMLDivElement, {
    value: '',
    language: 'python',
    theme: settingsStore.settings.codeTheme,
    fontSize: settingsStore.settings.fontSize,
    fontFamily: 'JetBrains Mono, Fira Code, Cascadia Code, Consolas, monospace',
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: settingsStore.settings.tabSize,
    insertSpaces: true
  })
})

onBeforeUnmount(() => editor?.dispose())
</script>

<template>
  <div class="challenge-wrap cv-monaco">
    <el-alert type="warning" :closable="false" show-icon>
      <template #title>
        实战模式限制说明：本平台不会在浏览器中执行任意 Python 程序，也不使用 eval。
        系统通过静态分析检查受支持的函数调用、参数与语法结构；无法可靠验证的逻辑不会被判定为正确，请配合“算法实验室”验证真实效果。
      </template>
    </el-alert>

    <div class="cv-card task-card">
      <div class="cv-section-title">任务描述</div>
      <p>{{ level.task }}</p>
      <div class="req-list">
        <div v-for="(v, i) in level.validators" :key="i" class="req-item">
          <el-icon><CircleCheck v-if="results[i]?.passed" class="ok" /><Promotion v-else class="todo" /></el-icon>
          <span>{{ v.description }}</span>
        </div>
      </div>
    </div>

    <div class="editor-label">
      <el-icon><Keyboard /></el-icon>在此独立编写你的代码（初始为空，参考完整代码请在完成后查看知识解析）
    </div>
    <div ref="container" class="editor-container" />

    <div v-if="hasRun" class="result-list">
      <div class="cv-section-title">检查结果（{{ passCount }}/{{ results.length }}）</div>
      <div v-for="(r, i) in results" :key="i" class="result-item" :class="{ fail: !r.passed }">
        <el-icon><CircleCheck v-if="r.passed" class="ok" /><CircleClose v-else class="bad" /></el-icon>
        <div>
          <strong>{{ r.description }}</strong>
          <p>{{ r.detail }}</p>
        </div>
      </div>
    </div>

    <div class="controls">
      <el-button type="primary" @click="runChecks">
        <el-icon><VideoPlay /></el-icon>运行静态检查
      </el-button>
      <el-button @click="reset">
        <el-icon><RefreshLeft /></el-icon>重置
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.challenge-wrap {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.task-card {
  padding: 18px;
}
.task-card p {
  margin: 0 0 14px;
  color: var(--cv-text-regular);
}
.req-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.req-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}
.ok { color: var(--cv-success); }
.todo { color: var(--cv-text-placeholder); }
.editor-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--cv-text-secondary);
  display: flex;
  align-items: center;
  gap: 5px;
}
.editor-container {
  height: 300px;
  width: 100%;
}
.editor-container :deep(.monaco-editor) {
  border: 1px solid var(--cv-border);
  border-radius: 10px;
}
.result-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.result-item {
  display: flex;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: var(--cv-success-soft);
}
.result-item.fail {
  background: var(--cv-danger-soft);
}
.result-item p {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--cv-text-secondary);
}
.bad { color: var(--cv-danger); }
.controls {
  display: flex;
  gap: 10px;
}
</style>
