<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Level } from '@/data/types'
import { checkBlanks } from '@/engine/blankEngine'
import type { PracticeOutcome } from '@/engine/outcome'

const props = defineProps<{ level: Level }>()
const emit = defineEmits<{ (e: 'finish', outcome: PracticeOutcome): void }>()

interface Token {
  t: 'text' | 'blank'
  v: string | number
}

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = []
  const re = /\{\{(\d+)\}\}/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) tokens.push({ t: 'text', v: line.slice(last, m.index) })
    tokens.push({ t: 'blank', v: Number(m[1]) - 1 })
    last = m.index + m[0].length
  }
  if (last < line.length) tokens.push({ t: 'text', v: line.slice(last) })
  return tokens
}

const lines = computed(() => (props.level.blank?.template ?? '').split('\n').map(tokenizeLine))
const blankCount = computed(() => props.level.blank?.answers.length ?? 0)

const inputs = ref<string[]>([])
const statuses = ref<(boolean | null)[]>([])
const hintShown = ref<boolean[]>([])
const completed = ref(false)
const startedAt = ref(0)

onMounted(() => {
  inputs.value = new Array(blankCount.value).fill('')
  statuses.value = new Array(blankCount.value).fill(null)
  hintShown.value = new Array(blankCount.value).fill(false)
  startedAt.value = Date.now()
})

function runCheck() {
  if (!props.level.blank) return
  const result = checkBlanks(props.level.blank, inputs.value)
  statuses.value = result.passed.map((p) => p)
  if (result.allCorrect && !completed.value) {
    completed.value = true
    const durationSec = Math.round((Date.now() - startedAt.value) / 1000)
    const accuracy = Math.round((result.correctCount / result.total) * 100)
    emit('finish', {
      mode: 'blank',
      wpm: 0,
      cpm: 0,
      accuracy,
      score: accuracy,
      errors: result.total - result.correctCount,
      backspaces: 0,
      durationSec,
      charsTyped: inputs.value.filter((v) => v.trim() !== '').length
    })
  }
}

function showHint() {
  const idx = statuses.value.findIndex((s, i) => s !== true && !hintShown.value[i])
  const target = idx >= 0 ? idx : hintShown.value.findIndex((v) => !v)
  if (target >= 0) hintShown.value[target] = true
}

function reset() {
  inputs.value = new Array(blankCount.value).fill('')
  statuses.value = new Array(blankCount.value).fill(null)
  hintShown.value = new Array(blankCount.value).fill(false)
  completed.value = false
  startedAt.value = Date.now()
}

function inputWidth(i: number): number {
  const answers = props.level.blank?.answers[i] ?? []
  const longest = answers.reduce((m, a) => Math.max(m, a.length), 6)
  return Math.min(220, Math.max(70, longest * 9 + 24))
}
</script>

<template>
  <div class="blank-wrap">
    <div class="cv-card code-area">
      <pre v-for="(tokens, li) in lines" :key="li" class="code-line"><template v-for="(tk, ti) in tokens" :key="ti"><span v-if="tk.t === 'text'">{{ tk.v }}</span><span v-else class="blank-input" :class="{ 'is-error': statuses[tk.v as number] === false, 'is-pass': statuses[tk.v as number] === true }"><el-input
              :model-value="inputs[tk.v as number]"
              :style="{ width: inputWidth(tk.v as number) + 'px' }"
              size="small"
              :disabled="completed"
              placeholder="?"
              @update:model-value="(v: string) => (inputs[tk.v as number] = v)"
            /></span></template></pre>
    </div>

    <div v-for="(h, i) in level.blank?.hints ?? []" :key="i">
      <el-alert
        v-if="hintShown[i]"
        :title="`提示 ${i + 1}：${h}`"
        type="info"
        :closable="false"
        show-icon
        class="hint-alert"
      />
    </div>

    <div v-if="completed" class="analysis-panel">
      <div class="cv-section-title">答案解析</div>
      <ul>
        <li v-for="(a, i) in level.blank?.analysis ?? []" :key="i">{{ a }}</li>
      </ul>
    </div>

    <div class="controls">
      <el-button type="primary" :disabled="completed" @click="runCheck">
        <el-icon><Select /></el-icon>检查答案
      </el-button>
      <el-button :disabled="completed" @click="showHint">
        <el-icon><QuestionFilled /></el-icon>提示
      </el-button>
      <el-button @click="reset">
        <el-icon><RefreshLeft /></el-icon>重置
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.blank-wrap {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.code-area {
  padding: 18px;
  overflow-x: auto;
}
.code-line {
  margin: 0;
  font-family: var(--cv-mono);
  font-size: 14px;
  line-height: 2.1;
  color: var(--cv-text);
  white-space: pre;
}
.hint-alert {
  margin-bottom: 8px;
}
.analysis-panel ul {
  margin: 0;
  padding-left: 20px;
}
.analysis-panel li {
  margin-bottom: 6px;
  color: var(--cv-text-regular);
}
.controls {
  display: flex;
  gap: 10px;
}
</style>
