import type { QuizQuestion, QuizSet } from '../types'
import { quizCh1 } from './quizCh1'
import { quizCh2 } from './quizCh2'
import { quizCh3 } from './quizCh3'
import { quizCh4 } from './quizCh4'
import { quizCh5 } from './quizCh5'
import { quizCh6 } from './quizCh6'
import { allLevels } from '../courses'

export const allQuestions: QuizQuestion[] = [
  ...quizCh1,
  ...quizCh2,
  ...quizCh3,
  ...quizCh4,
  ...quizCh5,
  ...quizCh6
]

/** 每个关卡对应一个测验集（无题目的关卡返回空集） */
export const quizSets: QuizSet[] = allLevels.map((level) => {
  const questions = allQuestions.filter((qItem) => qItem.levelId === level.id)
  return {
    id: `q-${level.id}`,
    levelId: level.id,
    title: `${level.title} · 巩固测验`,
    questions
  }
})

export function findQuizSet(levelId: string): QuizSet | undefined {
  return quizSets.find((s) => s.levelId === levelId)
}

/** 代码填空/文本类答案的归一化比较 */
export function normalizeText(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ')
}
