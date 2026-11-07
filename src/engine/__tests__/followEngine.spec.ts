import { describe, expect, it } from 'vitest'
import { createFollowEngine } from '../followEngine'

describe('followEngine', () => {
  it('逐字符正确输入后完成', () => {
    const engine = createFollowEngine('abc', { strict: true })
    engine.apply('a', 1000)
    engine.apply('ab', 2000)
    engine.apply('abc', 3000)
    const snap = engine.snapshot(3000)
    expect(snap.finished).toBe(true)
    expect(snap.correctChars).toBe(3)
    expect(snap.accuracy).toBe(100)
    expect(snap.progress).toBe(1)
  })

  it('错误字符标记为 incorrect 并统计错误', () => {
    const engine = createFollowEngine('abc', { strict: true })
    engine.apply('x', 1000)
    const snap = engine.snapshot(1000)
    expect(snap.charStatus[0]).toBe('incorrect')
    expect(snap.errorChars).toBe(1)
    expect(snap.errorCount).toBe(1)
  })

  it('支持粘贴式一次输入与对账', () => {
    const engine = createFollowEngine('hello', { strict: true })
    engine.apply('hello', 1000)
    expect(engine.snapshot(1000).finished).toBe(true)
  })

  it('宽松模式仅忽略行尾空白', () => {
    const engine = createFollowEngine('a\nb', { strict: false })
    engine.apply('a   \nb', 1000)
    expect(engine.snapshot(1000).finished).toBe(true)
  })

  it('行首缩进在宽松模式下仍被强制', () => {
    const engine = createFollowEngine('a\n  b', { strict: false })
    engine.apply('a\nb', 1000)
    expect(engine.snapshot(1000).finished).toBe(false)
  })

  it('统计退格与暂停/恢复', () => {
    const engine = createFollowEngine('abc', { strict: true })
    engine.apply('a', 1000)
    engine.noteBackspace()
    expect(engine.snapshot(1000).backspaceCount).toBe(1)
    engine.pause(2000)
    expect(engine.snapshot(2000).paused).toBe(true)
    engine.resume(3000)
    expect(engine.snapshot(3000).paused).toBe(false)
  })

  it('reset 清空状态', () => {
    const engine = createFollowEngine('abc', { strict: true })
    engine.apply('ab', 1000)
    engine.reset()
    const snap = engine.snapshot(1000)
    expect(snap.typed).toBe('')
    expect(snap.correctChars).toBe(0)
  })
})
