import type { QuizQuestion } from '@/data/types'
import { normalizeText } from '@/data/quiz'

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const setB = new Set(b)
  return a.every((v) => setB.has(v))
}

/** 判断单题作答是否正确 */
export function isCorrect(question: QuizQuestion, userAnswer: string[]): boolean {
  switch (question.type) {
    case 'single':
    case 'judge':
    case 'param':
    case 'result':
      return userAnswer.length === 1 && question.answer.includes(userAnswer[0])
    case 'multiple':
      return sameSet(userAnswer, question.answer)
    case 'codeBlank': {
      const value = normalizeText(userAnswer[0] ?? '')
      const acceptable = question.acceptable ?? question.answer
      return acceptable.some((a) => normalizeText(a) === value)
    }
  }
}

export function gradeQuiz(
  questions: QuizQuestion[],
  answers: Record<string, string[]>
): { correct: number; total: number; score: number; perQuestion: Record<string, boolean> } {
  const perQuestion: Record<string, boolean> = {}
  let correct = 0
  for (const qItem of questions) {
    const ok = isCorrect(qItem, answers[qItem.id] ?? [])
    perQuestion[qItem.id] = ok
    if (ok) correct++
  }
  const total = questions.length
  return {
    correct,
    total,
    score: total === 0 ? 0 : Math.round((correct / total) * 100),
    perQuestion
  }
}
