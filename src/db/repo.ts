import { db, DB_VERSION, DEFAULT_SETTINGS } from './database'
import type {
  AchievementRecord,
  BackupPayload,
  FavoriteRecord,
  MetaRecord,
  MistakeRecord,
  ProgressRecord,
  QuizRecord,
  SettingsRecord,
  TypingRecord
} from './types'

/* ---------- 进度 ---------- */
export const progressRepo = {
  all: () => db.progress.toArray(),
  get: (levelId: string) => db.progress.get(levelId),
  async save(rec: ProgressRecord): Promise<void> {
    await db.progress.put(rec)
  },
  async upsertTypingResult(
    levelId: string,
    result: { wpm: number; accuracy: number; score: number },
    completed: boolean
  ): Promise<ProgressRecord> {
    const existing = await db.progress.get(levelId)
    const now = Date.now()
    const rec: ProgressRecord = existing
      ? {
          ...existing,
          status: completed ? 'completed' : existing.status,
          bestWpm: Math.max(existing.bestWpm, result.wpm),
          bestAccuracy: Math.max(existing.bestAccuracy, result.accuracy),
          bestScore: Math.max(existing.bestScore, result.score),
          updatedAt: now,
          completedAt: completed ? existing.completedAt ?? now : existing.completedAt
        }
      : {
          id: levelId,
          levelId,
          status: completed ? 'completed' : 'in-progress',
          bestWpm: result.wpm,
          bestAccuracy: result.accuracy,
          bestScore: result.score,
          startedAt: now,
          updatedAt: now,
          completedAt: completed ? now : undefined
        }
    await db.progress.put(rec)
    return rec
  }
}

/* ---------- 打字记录 ---------- */
export const typingRepo = {
  all: () => db.typing.orderBy('createdAt').toArray(),
  add: (rec: Omit<TypingRecord, 'id'>) => db.typing.add(rec),
  count: () => db.typing.count()
}

/* ---------- 测验记录 ---------- */
export const quizRepo = {
  all: () => db.quiz.orderBy('createdAt').toArray(),
  add: (rec: Omit<QuizRecord, 'id'>) => db.quiz.add(rec)
}

/* ---------- 错题 ---------- */
export const mistakeRepo = {
  all: () => db.mistakes.orderBy('createdAt').reverse().toArray(),
  add: (rec: Omit<MistakeRecord, 'id'>) => db.mistakes.add(rec),
  async toggleResolved(id: number, resolved: boolean): Promise<void> {
    await db.mistakes.update(id, { resolved })
  },
  remove: (id: number) => db.mistakes.delete(id)
}

/* ---------- 收藏 ---------- */
export const favoriteRepo = {
  all: () => db.favorites.toArray(),
  has: async (levelId: string): Promise<boolean> => (await db.favorites.get(levelId)) != null,
  async toggle(levelId: string): Promise<boolean> {
    const existing = await db.favorites.get(levelId)
    if (existing) {
      await db.favorites.delete(levelId)
      return false
    }
    const rec: FavoriteRecord = { id: levelId, levelId, createdAt: Date.now() }
    await db.favorites.put(rec)
    return true
  }
}

/* ---------- 成就 ---------- */
export const achievementRepo = {
  all: () => db.achievements.toArray(),
  async unlock(achievementId: string): Promise<boolean> {
    const existing = await db.achievements.get(achievementId)
    if (existing) return false
    const rec: AchievementRecord = { id: achievementId, unlockedAt: Date.now() }
    await db.achievements.put(rec)
    return true
  }
}

/* ---------- 设置 ---------- */
export const settingsRepo = {
  async get(): Promise<SettingsRecord> {
    const rec = await db.settings.get('singleton')
    return rec ? { ...DEFAULT_SETTINGS, ...rec } : { ...DEFAULT_SETTINGS }
  },
  save(settings: SettingsRecord): Promise<string> {
    return db.settings.put(settings)
  }
}

/* ---------- 元信息（最近学习位置等） ---------- */
export const metaRepo = {
  async get<T>(id: string, fallback: T): Promise<T> {
    const rec = await db.meta.get(id)
    return rec ? (rec.value as T) : fallback
  },
  async set(id: string, value: unknown): Promise<void> {
    const rec: MetaRecord = { id, value }
    await db.meta.put(rec)
  }
}

/* ---------- 备份 / 恢复 / 清空 ---------- */

const TABLE_KEYS = ['progress', 'typing', 'quiz', 'mistakes', 'favorites', 'achievements', 'meta'] as const

export async function exportBackup(): Promise<BackupPayload> {
  const [progress, typing, quiz, mistakes, favorites, achievements, settings, meta] = await Promise.all([
    db.progress.toArray(),
    db.typing.toArray(),
    db.quiz.toArray(),
    db.mistakes.toArray(),
    db.favorites.toArray(),
    db.achievements.toArray(),
    (await db.settings.get('singleton')) ?? null,
    db.meta.toArray()
  ])
  return {
    app: 'CV键知',
    version: DB_VERSION,
    exportedAt: Date.now(),
    data: { progress, typing, quiz, mistakes, favorites, achievements, settings, meta }
  }
}

/** 校验备份结构，返回错误信息数组；为空数组表示通过 */
export function validateBackup(payload: unknown): string[] {
  const errors: string[] = []
  if (typeof payload !== 'object' || payload === null) {
    return ['备份根节点不是对象']
  }
  const p = payload as Partial<BackupPayload>
  if (p.app !== 'CV键知') errors.push('备份标识 app 不匹配')
  if (typeof p.version !== 'number') errors.push('缺少有效的版本号 version')
  if (typeof p.data !== 'object' || p.data === null) {
    errors.push('缺少 data 数据节点')
    return errors
  }
  for (const key of TABLE_KEYS) {
    const v = (p.data as Record<string, unknown>)[key]
    if (!Array.isArray(v)) errors.push(`数据表 ${key} 缺失或不是数组`)
  }
  const settings = (p.data as Record<string, unknown>).settings
  if (settings !== null && typeof settings !== 'object') errors.push('settings 节点类型无效')
  return errors
}

export async function importBackup(payload: BackupPayload): Promise<void> {
  await db.transaction(
    'rw',
    [db.progress, db.typing, db.quiz, db.mistakes, db.favorites, db.achievements, db.settings, db.meta],
    async () => {
      await Promise.all(TABLE_KEYS.map((key) => db.table(key).clear()))
      await db.progress.bulkPut(payload.data.progress)
      await db.typing.bulkPut(payload.data.typing)
      await db.quiz.bulkPut(payload.data.quiz)
      await db.mistakes.bulkPut(payload.data.mistakes)
      await db.favorites.bulkPut(payload.data.favorites)
      await db.achievements.bulkPut(payload.data.achievements)
      await db.meta.bulkPut(payload.data.meta)
      if (payload.data.settings) await db.settings.put(payload.data.settings)
    }
  )
}

export async function clearLearningData(): Promise<void> {
  await db.transaction(
    'rw',
    [db.progress, db.typing, db.quiz, db.mistakes, db.favorites, db.achievements, db.meta],
    async () => {
      await Promise.all([
        db.progress.clear(),
        db.typing.clear(),
        db.quiz.clear(),
        db.mistakes.clear(),
        db.favorites.clear(),
        db.achievements.clear(),
        db.meta.clear()
      ])
    }
  )
}

export async function resetSettings(): Promise<void> {
  await db.settings.put({ ...DEFAULT_SETTINGS })
}
