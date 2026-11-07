import { defineStore } from 'pinia'
import {
  achievementRepo,
  favoriteRepo,
  progressRepo
} from '@/db/repo'
import type {
  AchievementRecord,
  FavoriteRecord,
  ProgressRecord
} from '@/db/types'

export const useProgressStore = defineStore('progress', {
  state: () => ({
    progressMap: {} as Record<string, ProgressRecord>,
    favorites: {} as Record<string, FavoriteRecord>,
    achievements: {} as Record<string, AchievementRecord>,
    loaded: false
  }),
  getters: {
    completedCount: (s) =>
      Object.values(s.progressMap).filter((p) => p.status === 'completed').length,
    startedCount: (s) => Object.keys(s.progressMap).length,
    isCompleted: (s) => (levelId: string) => s.progressMap[levelId]?.status === 'completed',
    isFavorite: (s) => (levelId: string) => !!s.favorites[levelId]
  },
  actions: {
    async load() {
      const [progress, favorites, achievements] = await Promise.all([
        progressRepo.all(),
        favoriteRepo.all(),
        achievementRepo.all()
      ])
      this.progressMap = Object.fromEntries(progress.map((p) => [p.levelId, p]))
      this.favorites = Object.fromEntries(favorites.map((f) => [f.levelId, f]))
      this.achievements = Object.fromEntries(achievements.map((a) => [a.id, a]))
      this.loaded = true
    },
    async recordTyping(
      levelId: string,
      result: { wpm: number; accuracy: number; score: number },
      completed: boolean
    ) {
      const rec = await progressRepo.upsertTypingResult(levelId, result, completed)
      this.progressMap[levelId] = rec
    },
    async toggleFavorite(levelId: string) {
      const fav = await favoriteRepo.toggle(levelId)
      if (fav) {
        this.favorites[levelId] = { id: levelId, levelId, createdAt: Date.now() }
      } else {
        delete this.favorites[levelId]
      }
      return fav
    },
    async unlock(achievementId: string) {
      const isNew = await achievementRepo.unlock(achievementId)
      if (isNew) this.achievements[achievementId] = { id: achievementId, unlockedAt: Date.now() }
      return isNew
    },
    replaceFromBackup(
      progress: ProgressRecord[],
      favorites: FavoriteRecord[],
      achievements: AchievementRecord[]
    ) {
      this.progressMap = Object.fromEntries(progress.map((p) => [p.levelId, p]))
      this.favorites = Object.fromEntries(favorites.map((f) => [f.levelId, f]))
      this.achievements = Object.fromEntries(achievements.map((a) => [a.id, a]))
    }
  }
})
