import type { QuizQuestion, QuizType } from '../types'

interface QSeed {
  topic: string
  stem: string
  code?: string
  options?: { key: string; text: string }[]
  answer: string[]
  acceptable?: string[]
  explanation: string
  mistakeReason: string
}

/** 构造测验题目，id 与 reviewLevelId 自动关联关卡 */
export function q(levelId: string, type: QuizType, seed: QSeed): QuizQuestion {
  return {
    id: `${levelId}-${type}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    levelId,
    reviewLevelId: levelId,
    ...seed
  }
}

/** 常用选项构造 */
export function opts(...pairs: [string, string][]): { key: string; text: string }[] {
  return pairs.map(([key, text]) => ({ key, text }))
}
