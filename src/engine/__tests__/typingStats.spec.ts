import { describe, expect, it } from 'vitest'
import {
  accuracyFrom,
  cpmFrom,
  scoreFrom,
  wpmFrom
} from '../typingStats'

describe('typingStats', () => {
  it('WPM 按 5 字符/词计算', () => {
    expect(wpmFrom(100, 60000)).toBe(20)
    expect(wpmFrom(50, 30000)).toBe(20)
  })

  it('零时长返回 0，避免除零', () => {
    expect(wpmFrom(100, 0)).toBe(0)
    expect(cpmFrom(100, 0)).toBe(0)
  })

  it('CPM 为每分钟正确字符数', () => {
    expect(cpmFrom(120, 60000)).toBe(120)
  })

  it('准确率保留 1 位小数，空按键视为 100', () => {
    expect(accuracyFrom(9, 10)).toBe(90)
    expect(accuracyFrom(0, 0)).toBe(100)
    expect(accuracyFrom(1, 3)).toBe(33.3)
  })

  it('综合评分由准确率主导且上限 100', () => {
    expect(scoreFrom(100, 0)).toBe(85)
    expect(scoreFrom(100, 60)).toBe(100)
    expect(scoreFrom(0, 0)).toBe(0)
  })
})
