<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import monaco from '@/monacoSetup'
import type { Level } from '@/data/types'
import { createFollowEngine, type FollowEngine, type FollowSnapshot } from '@/engine/followEngine'
import { useSettingsStore } from '@/stores/settings'
import type { PracticeOutcome } from '@/engine/outcome'

const props = defineProps<{ level: Level }>()
const emit = defineEmits<{ (e: 'finish', outcome: PracticeOutcome): void }>()

const settingsStore = useSettingsStore()
const targetContainer = ref<HTMLDivElement>()
const inputContainer = ref<HTMLDivElement>()

let targetEditor: monaco.editor.IStandaloneCodeEditor
let inputEditor: monaco.editor.IStandaloneCodeEditor
let engine: FollowEngine
let timerHandle: number | undefined
let errorDecorations: string[] = []
let lineDecorations: string[] = []

const snap = ref<FollowSnapshot | null>(null)
const hasFinished = ref(false)

const editorHeight = computed(() => {
  const lines = props.level.targetCode.split('\n').length
  return Math.max(168, Math.min(380, lines * 20 + 32))
})

const commonOptions = computed(() => ({
  language: 'python',
  theme: settingsStore.settings.codeTheme,
  fontSize: settingsStore.settings.fontSize,
  fontFamily: 'JetBrains Mono, Fira Code, Cascadia Code, Consolas, monospace',
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: settingsStore.settings.tabSize,
  insertSpaces: true,
  smoothScrolling: true
}))

function fmtTime(ms: number): string {
  const total = Math.floor(ms / 1000)
  const m = String(Math.floor(total / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

function updateDecorations() {
  const s = engine.snapshot()
  const ranges: monaco.editor.IModelDeltaDecoration[] = []
  let i = 0
  const model = inputEditor.getModel()
  if (!model) return
  while (i < s.charStatus.length) {
    if (s.charStatus[i] === 'incorrect') {
      let j = i
      while (j < s.charStatus.length && s.charStatus[j] === 'incorrect') j++
      const startPos = model.getPositionAt(i)
      const endPos = model.getPositionAt(j)
      ranges.push({
        range: new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
        options: { inlineClassName: 'cv-input-error' }
      })
      i = j
    } else {
      i++
    }
  }
  errorDecorations = inputEditor.deltaDecorations(errorDecorations, ranges)

  const lineRanges: monaco.editor.IModelDeltaDecoration[] = [
    {
      range: new monaco.Range(s.currentLine, 1, s.currentLine, 1),
      options: { isWholeLine: true, className: 'cv-target-line' }
    }
  ]
  lineDecorations = targetEditor.deltaDecorations(lineDecorations, lineRanges)
}

function onContent() {
  engine.apply(inputEditor.getValue())
  snap.value = engine.snapshot()
  updateDecorations()
  if (snap.value.finished && !hasFinished.value) {
    hasFinished.value = true
    stopTimer()
    inputEditor.updateOptions({ readOnly: true })
    const s = engine.snapshot()
    emit('finish', {
      mode: 'follow',
      wpm: s.wpm,
      cpm: s.cpm,
      accuracy: s.accuracy,
      score: s.score,
      errors: s.errorCount,
      backspaces: s.backspaceCount,
      durationSec: Math.round(s.elapsedMs / 1000),
      charsTyped: s.totalPresses,
      errorFreq: s.errorCharFrequency
    })
  }
}

function startTimer() {
  stopTimer()
  timerHandle = window.setInterval(() => {
    snap.value = engine.snapshot()
  }, 250)
}
function stopTimer() {
  if (timerHandle) {
    clearInterval(timerHandle)
    timerHandle = undefined
  }
}

function togglePause() {
  const now = Date.now()
  if (engine.snapshot().paused) {
    engine.resume(now)
    inputEditor.updateOptions({ readOnly: false })
    inputEditor.focus()
  } else {
    engine.pause(now)
    inputEditor.updateOptions({ readOnly: true })
  }
  snap.value = engine.snapshot()
}

function resetPractice() {
  engine.reset()
  inputEditor.setValue('')
  inputEditor.updateOptions({ readOnly: false })
  hasFinished.value = false
  errorDecorations = inputEditor.deltaDecorations(errorDecorations, [])
  snap.value = engine.snapshot()
  updateDecorations()
  inputEditor.focus()
}

onMounted(() => {
  engine = createFollowEngine(props.level.targetCode, { strict: settingsStore.strictMode })
  targetEditor = monaco.editor.create(targetContainer.value as HTMLDivElement, {
    ...commonOptions.value,
    value: props.level.targetCode,
    readOnly: true,
    renderLineHighlight: 'none',
    contextmenu: false
  })
  inputEditor = monaco.editor.create(inputContainer.value as HTMLDivElement, {
    ...commonOptions.value,
    value: '',
    renderLineHighlight: 'line',
    autoClosingBrackets: 'never',
    autoClosingQuotes: 'never',
    autoSurround: 'never'
  })
  inputEditor.onDidChangeModelContent(onContent)
  inputEditor.onKeyDown((e) => {
    if (e.keyCode === monaco.KeyCode.Backspace || e.keyCode === monaco.KeyCode.Delete) {
      engine.noteBackspace()
    }
    if (e.keyCode === monaco.KeyCode.Escape) togglePause()
  })
  inputEditor.onDidScrollChange(() => {
    targetEditor.setScrollTop(inputEditor.getScrollTop())
    targetEditor.setScrollLeft(inputEditor.getScrollLeft())
  })
  snap.value = engine.snapshot()
  updateDecorations()
  startTimer()
})

onBeforeUnmount(() => {
  stopTimer()
  targetEditor?.dispose()
  inputEditor?.dispose()
})
</script>

<template>
  <div class="follow-wrap cv-monaco">
    <div class="live-stats">
      <div class="metric"><span class="metric-label">用时</span><strong>{{ fmtTime(snap?.elapsedMs ?? 0) }}</strong></div>
      <div class="metric"><span class="metric-label">WPM</span><strong>{{ snap?.wpm ?? 0 }}</strong></div>
      <div class="metric"><span class="metric-label">CPM</span><strong>{{ snap?.cpm ?? 0 }}</strong></div>
      <div class="metric">
        <span class="metric-label">准确率</span>
        <strong :class="{ low: (snap?.accuracy ?? 100) < 90 }">{{ snap?.accuracy ?? 100 }}%</strong>
      </div>
      <div class="metric"><span class="metric-label">错误</span><strong>{{ snap?.errorCount ?? 0 }}</strong></div>
      <div class="metric"><span class="metric-label">退格</span><strong>{{ snap?.backspaceCount ?? 0 }}</strong></div>
      <div class="metric-spacer" />
      <el-tag size="small" :type="settingsStore.strictMode ? 'danger' : 'info'" effect="plain">
        {{ settingsStore.strictMode ? '严格模式' : '宽松模式' }}
      </el-tag>
      <el-button size="small" @click="togglePause">
        <el-icon><VideoPause v-if="snap && !snap.paused" /><VideoPlay v-else /></el-icon>
        {{ snap?.paused ? '继续' : '暂停' }}
      </el-button>
      <el-button size="small" @click="resetPractice">
        <el-icon><RefreshRight /></el-icon>重置
      </el-button>
    </div>

    <el-progress :percentage="Math.round((snap?.progress ?? 0) * 100)" :stroke-width="6" :show-text="false" class="prog" />

    <div class="editor-block">
      <div class="editor-label">
        <el-icon><Document /></el-icon>目标代码（只读，当前行高亮）
      </div>
      <div ref="targetContainer" class="editor-container" :style="{ height: editorHeight + 'px' }" />
    </div>

    <div class="editor-block">
      <div class="editor-label">
        <el-icon><Keyboard /></el-icon>在此输入（Esc 暂停，Tab 输入缩进，括号引号需手动完整输入）
      </div>
      <div class="input-shell">
        <div ref="inputContainer" class="editor-container" :style="{ height: editorHeight + 'px' }" />
        <div v-if="snap?.paused" class="pause-overlay" @click="togglePause">
          <el-icon :size="34"><VideoPlay /></el-icon>
          <p>已暂停，点击或按 Esc 继续</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.follow-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.live-stats {
  display: flex;
  align-items: center;
  gap: 22px;
  flex-wrap: wrap;
}
.metric {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}
.metric-label {
  font-size: 11px;
  color: var(--cv-text-secondary);
}
.metric strong {
  font-size: 17px;
  font-family: var(--cv-mono);
  color: var(--cv-text);
}
.metric strong.low {
  color: var(--cv-danger);
}
.metric-spacer {
  flex: 1;
}
.prog {
  margin: 2px 0;
}
.editor-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.editor-label {
  font-size: 12px;
  color: var(--cv-text-secondary);
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
}
.editor-container {
  width: 100%;
}
.input-shell {
  position: relative;
}
.pause-overlay {
  position: absolute;
  inset: 0;
  background: rgba(245, 248, 255, 0.82);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--cv-primary);
  border: 1px solid var(--cv-border);
}
html.dark .pause-overlay {
  background: rgba(15, 23, 42, 0.82);
}
.pause-overlay p {
  margin: 8px 0 0;
  font-size: 13px;
}
</style>
