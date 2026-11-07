import Dexie, { type Table } from 'dexie'
import type {
  AchievementRecord,
  FavoriteRecord,
  MetaRecord,
  MistakeRecord,
  ProgressRecord,
  QuizRecord,
  SettingsRecord,
  TypingRecord
} from './types'

export const DB_VERSION = 2

export class CvDatabase extends Dexie {
  progress!: Table<ProgressRecord, string>
  typing!: Table<TypingRecord, number>
  quiz!: Table<QuizRecord, number>
  mistakes!: Table<MistakeRecord, number>
  favorites!: Table<FavoriteRecord, string>
  achievements!: Table<AchievementRecord, string>
  settings!: Table<SettingsRecord, string>
  meta!: Table<MetaRecord, string>

  constructor() {
    super('cv-jianzhi-db')
    this.version(1).stores({
      progress: 'id, levelId, status, updatedAt',
      typing: '++id, levelId, createdAt',
      quiz: '++id, levelId, createdAt',
      mistakes: '++id, levelId, kind, resolved, createdAt',
      favorites: 'id, levelId',
      achievements: 'id, unlockedAt',
      settings: 'id',
      meta: 'id'
    })
    // v2：进度增加 bestScore 索引字段（Dexie 升级时非索引字段自动保留，此处演示版本升级流程）
    this.version(2).stores({
      progress: 'id, levelId, status, updatedAt, bestScore',
      typing: '++id, levelId, mode, createdAt',
      quiz: '++id, levelId, createdAt',
      mistakes: '++id, levelId, kind, resolved, createdAt',
      favorites: 'id, levelId',
      achievements: 'id, unlockedAt',
      settings: 'id',
      meta: 'id'
    })
  }
}

export const db = new CvDatabase()

export const DEFAULT_SETTINGS: SettingsRecord = {
  id: 'singleton',
  theme: 'light',
  codeTheme: 'vs',
  strictMode: true,
  soundEnabled: true,
  autoSave: true,
  fontSize: 14,
  tabSize: 4,
  userName: 'CV学习者',
  avatarColor: '#1d4ed8'
}
