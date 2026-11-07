import type { BlankSpec } from '@/data/types'

export interface BlankResult {
  passed: boolean[]
  allCorrect: boolean
  correctCount: number
  total: number
}

/** 答案归一化：去首尾空白，内部连续空白折叠为单个空格（兼容多空格写法） */
export function normalizeAnswer(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ')
}

export function checkBlanks(spec: BlankSpec, inputs: string[]): BlankResult {
  const passed = spec.answers.map((acceptable, i) => {
    const value = normalizeAnswer(inputs[i] ?? '')
    return acceptable.some((ans) => normalizeAnswer(ans) === value)
  })
  const correctCount = passed.filter(Boolean).length
  return {
    passed,
    allCorrect: correctCount === spec.answers.length,
    correctCount,
    total: spec.answers.length
  }
}

/** 将模板拆分为普通文本片段与空位序号，供视图渲染 */
export function parseBlankTemplate(template: string): { text: string; blankIndex: number | null }[] {
  const parts: { text: string; blankIndex: number | null }[] = []
  const regex = /\{\{(\d+)\}\}/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(template)) !== null) {
    if (match.index > last) parts.push({ text: template.slice(last, match.index), blankIndex: null })
    parts.push({ text: '', blankIndex: Number(match[1]) - 1 })
    last = match.index + match[0].length
  }
  if (last < template.length) parts.push({ text: template.slice(last), blankIndex: null })
  return parts
}
