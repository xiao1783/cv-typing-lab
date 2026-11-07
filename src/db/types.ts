/* ============ IndexedDB 持久化记录类型 ============ */

export type LevelStatus = 'in-progress' | 'completed'

export interface ProgressRecord {
  /** 主键，使用 levelId */
  id: string
  levelId: string
  status: LevelStatus
  bestWpm: number
  bestAccuracy: number
  bestScore: number
  startedAt: number
  updatedAt: number
  completedAt?: number
}

export interface TypingRecord {
  id?: number
  levelId: string
  mode: string
  wpm: number
  cpm: number
  accuracy: number
  errors: number
  backspaces: number
  durationSec: number
  charsTyped: number
  errorFreq?: Record<string, number>
  createdAt: number
}

export interface QuizRecord {
  id?: number
  levelId: string
  score: number
  total: number
  correct: number
  durationSec: number
  createdAt: number
}

export interface MistakeRecord {
  id?: number
  kind: 'quiz' | 'typing'
  refId: string
  levelId: string
  question: string
  userAnswer: string
  correctAnswer: string
  reason: string
  createdAt: number
  resolved: boolean
}

export interface FavoriteRecord {
  /** 主键 levelId */
  id: string
  levelId: string
  createdAt: number
}

export interface AchievementRecord {
  /** 主键 achievementId */
  id: string
  unlockedAt: number
}

export interface SettingsRecord {
  id: 'singleton'
  theme: 'light' | 'dark'
  codeTheme: 'vs' | 'vs-dark' | 'hc-black'
  strictMode: boolean
  soundEnabled: boolean
  autoSave: boolean
  fontSize: number
  tabSize: number
  userName: string
  avatarColor: string
}

export interface MetaRecord {
  id: string
  value: unknown
}

/** 备份文件根结构，version 用于数据结构校验与升级 */
export interface BackupPayload {
  app: 'CV键知'
  version: number
  exportedAt: number
  data: {
    progress: ProgressRecord[]
    typing: TypingRecord[]
    quiz: QuizRecord[]
    mistakes: MistakeRecord[]
    favorites: FavoriteRecord[]
    achievements: AchievementRecord[]
    settings: SettingsRecord | null
    meta: MetaRecord[]
  }
}
