import { describe, expect, it } from 'vitest'
import type { BlankSpec } from '@/data/types'
import { checkBlanks, normalizeAnswer, parseBlankTemplate } from '../blankEngine'

const spec: BlankSpec = {
  template: 'img = cv2.{{1}}({{2}})',
  answers: [['imread'], ['"lena.jpg"', "'lena.jpg'"]],
  hints: [],
  analysis: []
}

describe('blankEngine', () => {
  it('正确答案全部通过', () => {
    const result = checkBlanks(spec, ['imread', '"lena.jpg"'])
    expect(result.allCorrect).toBe(true)
    expect(result.correctCount).toBe(2)
  })

  it('支持多答案与引号差异', () => {
    expect(checkBlanks(spec, ['imread', "'lena.jpg'"]).allCorrect).toBe(true)
  })

  it('折叠多余空白并去首尾空白', () => {
    expect(normalizeAnswer('  cv2   imread  ')).toBe('cv2 imread')
    expect(checkBlanks(spec, ['  imread ', ' "lena.jpg" ']).allCorrect).toBe(true)
  })

  it('错误答案标记且不通过', () => {
    const result = checkBlanks(spec, ['imwrite', '"x.png"'])
    expect(result.allCorrect).toBe(false)
    expect(result.passed[0]).toBe(false)
  })

  it('解析模板得到文本与空位', () => {
    const parts = parseBlankTemplate(spec.template)
    const blanks = parts.filter((p) => p.blankIndex !== null)
    expect(blanks).toHaveLength(2)
    expect(blanks[0].blankIndex).toBe(0)
    expect(blanks[1].blankIndex).toBe(1)
  })
})
