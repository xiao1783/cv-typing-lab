import { describe, expect, it } from 'vitest'
import type { QuizQuestion } from '@/data/types'
import { gradeQuiz, isCorrect } from '../quizGrade'

const single: QuizQuestion = {
  id: 'q1',
  type: 'single',
  levelId: 'ch1-l01',
  topic: 't',
  stem: 's',
  options: [
    { key: 'A', text: 'a' },
    { key: 'B', text: 'b' }
  ],
  answer: ['A'],
  explanation: 'e',
  mistakeReason: 'm',
  reviewLevelId: 'ch1-l01'
}

const multiple: QuizQuestion = {
  id: 'q2',
  type: 'multiple',
  levelId: 'ch1-l01',
  topic: 't',
  stem: 's',
  options: [
    { key: 'A', text: 'a' },
    { key: 'B', text: 'b' },
    { key: 'C', text: 'c' }
  ],
  answer: ['A', 'C'],
  explanation: 'e',
  mistakeReason: 'm',
  reviewLevelId: 'ch1-l01'
}

const blank: QuizQuestion = {
  id: 'q3',
  type: 'codeBlank',
  levelId: 'ch1-l01',
  topic: 't',
  stem: 's',
  answer: ['SIFT_create'],
  explanation: 'e',
  mistakeReason: 'm',
  reviewLevelId: 'ch1-l01'
}

describe('quizGrade', () => {
  it('单选/判断按唯一答案判定', () => {
    expect(isCorrect(single, ['A'])).toBe(true)
    expect(isCorrect(single, ['B'])).toBe(false)
  })

  it('多选按集合比较，顺序无关', () => {
    expect(isCorrect(multiple, ['C', 'A'])).toBe(true)
    expect(isCorrect(multiple, ['A'])).toBe(false)
    expect(isCorrect(multiple, ['A', 'B'])).toBe(false)
  })

  it('代码填空归一化文本比较', () => {
    expect(isCorrect(blank, ['  SIFT_create  '])).toBe(true)
    expect(isCorrect(blank, ['ORB_create'])).toBe(false)
  })

  it('gradeQuiz 计算总分与逐题结果', () => {
    const result = gradeQuiz([single, multiple, blank], {
      q1: ['A'],
      q2: ['A', 'C'],
      q3: ['wrong']
    })
    expect(result.correct).toBe(2)
    expect(result.total).toBe(3)
    expect(result.score).toBe(67)
    expect(result.perQuestion.q3).toBe(false)
  })
})
