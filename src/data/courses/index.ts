import type { Chapter, Level } from '../types'
import { ch1 } from './chapter1'
import { ch2 } from './chapter2'
import { ch3 } from './chapter3'
import { ch4 } from './chapter4'
import { ch5 } from './chapter5'
import { ch6 } from './chapter6'

export const chapters: Chapter[] = [ch1, ch2, ch3, ch4, ch5, ch6]

export const allLevels: Level[] = chapters.flatMap((c) => c.levels)

export const totalLevelCount = allLevels.length

export function findLevel(levelId: string): Level | undefined {
  return allLevels.find((l) => l.id === levelId)
}

export function findChapter(chapterId: string): Chapter | undefined {
  return chapters.find((c) => c.id === chapterId)
}

export function levelChapter(level: Level): Chapter {
  return chapters.find((c) => c.id === level.chapterId) as Chapter
}

export function nextLevel(levelId: string): Level | undefined {
  const idx = allLevels.findIndex((l) => l.id === levelId)
  return idx >= 0 ? allLevels[idx + 1] : undefined
}
