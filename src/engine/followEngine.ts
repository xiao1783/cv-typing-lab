import { accuracyFrom, cpmFrom, scoreFrom, wpmFrom } from './typingStats'

export type CharStatus = 'pending' | 'correct' | 'incorrect'

export interface FollowSnapshot {
  typed: string
  charStatus: CharStatus[]
  currentLine: number
  currentColumn: number
  correctChars: number
  pendingChars: number
  errorChars: number
  errorCount: number
  backspaceCount: number
  totalPresses: number
  correctPresses: number
  elapsedMs: number
  wpm: number
  cpm: number
  accuracy: number
  score: number
  progress: number
  running: boolean
  paused: boolean
  finished: boolean
  errorCharFrequency: Record<string, number>
}

/**
 * 统一换行符为 \n。
 * 宽松模式：仅忽略“行尾空白”这一明确的格式差异；行首缩进（对 Python 有语义作用）始终严格保留。
 */
function normalize(text: string, strict: boolean): string {
  let out = text.replace(/\r\n?/g, '\n')
  if (!strict) {
    out = out
      .split('\n')
      .map((line) => line.replace(/[ \t]+$/g, ''))
      .join('\n')
  }
  return out
}

export interface FollowEngineOptions {
  strict: boolean
}

export function createFollowEngine(target: string, options: FollowEngineOptions) {
  const normalizedTarget = normalize(target, options.strict)
  const charStatus: CharStatus[] = new Array(normalizedTarget.length).fill('pending')
  const errorCharFrequency: Record<string, number> = {}

  let typed = ''
  let errorCount = 0
  let backspaceCount = 0
  let correctPresses = 0
  let errorPresses = 0
  let startAt: number | null = null
  let accumulatedMs = 0
  let paused = true
  let finished = false

  function ensureStarted(now: number) {
    if (paused && !finished) {
      paused = false
      startAt = now
    }
  }

  function elapsedMs(now: number): number {
    return accumulatedMs + (startAt === null ? 0 : Math.max(0, now - startAt))
  }

  /** 基于最长公共前缀/后缀的差异对账，正确处理插入、删除、粘贴与中间修改 */
  function reconcile(prev: string, next: string) {
    let prefix = 0
    const minLen = Math.min(prev.length, next.length)
    while (prefix < minLen && prev[prefix] === next[prefix]) prefix++

    let suffix = 0
    const suffixBound = minLen - prefix
    while (
      suffix < suffixBound &&
      prev[prev.length - 1 - suffix] === next[next.length - 1 - suffix]
    ) {
      suffix++
    }

    const inserted = next.slice(prefix, next.length - suffix)
    for (let k = 0; k < inserted.length; k++) {
      const idx = prefix + k
      const expected = normalizedTarget[idx]
      if (inserted[k] === expected) {
        correctPresses++
      } else {
        errorPresses++
        errorCount++
        const key = expected === '\n' ? '↵换行' : expected === '\t' ? '⇥Tab' : expected
        errorCharFrequency[key] = (errorCharFrequency[key] ?? 0) + 1
      }
    }
  }

  function refreshStatus() {
    for (let i = 0; i < normalizedTarget.length; i++) {
      if (i >= typed.length) charStatus[i] = 'pending'
      else charStatus[i] = typed[i] === normalizedTarget[i] ? 'correct' : 'incorrect'
    }
  }

  function positionOf(text: string): { line: number; column: number } {
    const lines = text.split('\n')
    return { line: lines.length, column: lines[lines.length - 1].length + 1 }
  }

  function apply(rawText: string, now: number = Date.now()) {
    if (finished) return
    let next = normalize(rawText, options.strict)
    if (next.length > normalizedTarget.length) next = next.slice(0, normalizedTarget.length)
    ensureStarted(now)
    reconcile(typed, next)
    typed = next
    refreshStatus()
    if (typed === normalizedTarget) {
      finished = true
      if (startAt !== null) {
        accumulatedMs += now - startAt
        startAt = null
      }
      paused = false
    }
  }

  function noteBackspace() {
    backspaceCount++
  }

  function pause(now: number = Date.now()) {
    if (paused || finished) return
    if (startAt !== null) {
      accumulatedMs += now - startAt
      startAt = null
    }
    paused = true
  }

  function resume(now: number = Date.now()) {
    if (!paused || finished) return
    paused = false
    startAt = now
  }

  function reset() {
    typed = ''
    errorCount = 0
    backspaceCount = 0
    correctPresses = 0
    errorPresses = 0
    startAt = null
    accumulatedMs = 0
    paused = true
    finished = false
    charStatus.fill('pending')
    for (const k of Object.keys(errorCharFrequency)) delete errorCharFrequency[k]
  }

  function snapshot(now: number = Date.now()): FollowSnapshot {
    const ms = elapsedMs(now)
    const correctChars = charStatus.filter((s) => s === 'correct').length
    const errorChars = charStatus.filter((s) => s === 'incorrect').length
    const totalPresses = correctPresses + errorPresses
    const accuracy = accuracyFrom(correctPresses, totalPresses)
    const wpm = wpmFrom(correctChars, ms)
    const pos = positionOf(typed)
    return {
      typed,
      charStatus: [...charStatus],
      currentLine: pos.line,
      currentColumn: pos.column,
      correctChars,
      pendingChars: normalizedTarget.length - typed.length,
      errorChars,
      errorCount,
      backspaceCount,
      totalPresses,
      correctPresses,
      elapsedMs: ms,
      wpm,
      cpm: cpmFrom(correctChars, ms),
      accuracy,
      score: scoreFrom(accuracy, wpm),
      progress: normalizedTarget.length === 0 ? 0 : correctChars / normalizedTarget.length,
      running: !paused,
      paused,
      finished,
      errorCharFrequency: { ...errorCharFrequency }
    }
  }

  return {
    apply,
    noteBackspace,
    pause,
    resume,
    reset,
    snapshot,
    get targetLength() {
      return normalizedTarget.length
    }
  }
}

export type FollowEngine = ReturnType<typeof createFollowEngine>
