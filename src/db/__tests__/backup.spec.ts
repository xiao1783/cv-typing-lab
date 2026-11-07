import { describe, expect, it } from 'vitest'
import { validateBackup } from '../repo'
import type { BackupPayload } from '../types'

function validPayload(): BackupPayload {
  return {
    app: 'CV键知',
    version: 2,
    exportedAt: Date.now(),
    data: {
      progress: [],
      typing: [],
      quiz: [],
      mistakes: [],
      favorites: [],
      achievements: [],
      settings: null,
      meta: []
    }
  }
}

describe('validateBackup', () => {
  it('结构完整的备份通过校验', () => {
    expect(validateBackup(validPayload())).toEqual([])
  })

  it('非对象根节点报错', () => {
    expect(validateBackup(null)).toContain('备份根节点不是对象')
    expect(validateBackup('x')).toContain('备份根节点不是对象')
  })

  it('标识或版本不符报错', () => {
    const p = validPayload()
    ;(p as { app: string }).app = 'other'
    expect(validateBackup(p).join()).toContain('app')
    const p2 = validPayload()
    ;(p2 as { version?: number }).version = undefined
    expect(validateBackup(p2).join()).toContain('version')
  })

  it('数据表不是数组时报错', () => {
    const p = validPayload()
    p.data.typing = {} as never
    expect(validateBackup(p).join()).toContain('typing')
  })

  it('settings 类型无效时报错', () => {
    const p = validPayload()
    p.data.settings = 'bad' as never
    expect(validateBackup(p).join()).toContain('settings')
  })
})
