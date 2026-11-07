import { describe, expect, it } from 'vitest'
import type { ChallengeValidator } from '@/data/types'
import { findCalls, runChallengeChecks } from '../pythonCheck'

const source = `
import cv2
import numpy as np
img = cv2.imread('lena.jpg')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
for i in range(3):
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
`

describe('pythonCheck', () => {
  it('提取函数调用（不执行代码）', () => {
    const calls = findCalls(source)
    const names = calls.map((c) => c.name)
    expect(names).toContain('cv2.imread')
    expect(names).toContain('cv2.cvtColor')
    expect(names).toContain('cv2.GaussianBlur')
    expect(names).toContain('range')
  })

  it('注释中的假调用不被识别', () => {
    const withComment = '# cv2.imwrite("x.png", img)\nimg = cv2.imread("a.png")'
    const names = findCalls(withComment).map((c) => c.name)
    expect(names).not.toContain('cv2.imwrite')
    expect(names).toContain('cv2.imread')
  })

  it('结构化校验导入/调用/参数/循环/赋值', () => {
    const validators: ChallengeValidator[] = [
      { type: 'import', description: '导入 cv2', module: 'cv2' },
      { type: 'function_call', description: '高斯模糊', name: 'cv2.GaussianBlur' },
      { type: 'call_argument', description: '核大小', name: 'cv2.GaussianBlur', argPosition: 1, expect: '(5,5)' },
      { type: 'for_loop', description: '循环' },
      { type: 'assign', description: '赋值 gray', name: 'gray' }
    ]
    const results = runChallengeChecks(source, validators)
    expect(results.every((r) => r.passed)).toBe(true)
  })

  it('缺失结构时校验失败并给出说明', () => {
    const validators: ChallengeValidator[] = [
      { type: 'import', description: '导入 numpy', module: 'numpy' },
      { type: 'function_call', description: '中值滤波', name: 'cv2.medianBlur' }
    ]
    const results = runChallengeChecks('import cv2\n', validators)
    expect(results[0].passed).toBe(false)
    expect(results[1].passed).toBe(false)
    expect(results[1].detail).toContain('cv2.medianBlur')
  })
})
