import { quizRepo, typingRepo } from '@/db/repo'
import type { QuizRecord, TypingRecord } from '@/db/types'
import { chapters } from '@/data/courses'

export interface DayBucket {
  date: string
  label: string
  minutes: number
  practices: number
}

export function dayKey(ts: number): string {
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export interface StudyStats {
  totalMinutes: number
  practiceCount: number
  avgWpm: number
  avgCpm: number
  avgAccuracy: number
  quizCount: number
  quizAvgAccuracy: number
  streak: number
  last7: DayBucket[]
  activeDays: string[]
  errorCharFrequency: Record<string, number>
  calendar: { date: string; minutes: number }[]
  chapterMastery: { chapterId: string; title: string; mastery: number; completed: number; total: number }[]
}

function emptyStats(): StudyStats {
  return {
    totalMinutes: 0,
    practiceCount: 0,
    avgWpm: 0,
    avgCpm: 0,
    avgAccuracy: 0,
    quizCount: 0,
    quizAvgAccuracy: 0,
    streak: 0,
    last7: [],
    activeDays: [],
    errorCharFrequency: {},
    calendar: [],
    chapterMastery: []
  }
}

export function buildStats(
  typing: TypingRecord[],
  quiz: QuizRecord[],
  progressMap: Record<string, { status: string }>,
  now: number = Date.now()
): StudyStats {
  if (typing.length === 0 && quiz.length === 0) {
    const base = emptyStats()
    base.last7 = buildLast7(new Map(), now)
    base.chapterMastery = chapters.map((c) => ({
      chapterId: c.id,
      title: c.title,
      mastery: 0,
      completed: 0,
      total: c.levels.length
    }))
    return base
  }

  const typingSeconds = typing.reduce((sum, r) => sum + r.durationSec, 0)
  const quizSeconds = quiz.reduce((sum, r) => sum + r.durationSec, 0)
  const totalMinutes = Math.round((typingSeconds + quizSeconds) / 60)

  const avgWpm = Math.round(typing.reduce((s, r) => s + r.wpm, 0) / Math.max(1, typing.length))
  const avgCpm = Math.round(typing.reduce((s, r) => s + r.cpm, 0) / Math.max(1, typing.length))
  const avgAccuracy =
    Math.round((typing.reduce((s, r) => s + r.accuracy, 0) / Math.max(1, typing.length)) * 10) / 10

  const quizAvgAccuracy =
    Math.round((quiz.reduce((s, r) => s + r.correct / r.total, 0) / Math.max(1, quiz.length)) * 1000) / 10

  const errorCharFrequency: Record<string, number> = {}
  for (const r of typing) {
    const freq = (r as TypingRecord & { errorFreq?: Record<string, number> }).errorFreq
    if (freq) {
      for (const [k, v] of Object.entries(freq)) {
        errorCharFrequency[k] = (errorCharFrequency[k] ?? 0) + v
      }
    }
  }

  const dayMinutes = new Map<string, number>()
  for (const r of typing) {
    const k = dayKey(r.createdAt)
    dayMinutes.set(k, (dayMinutes.get(k) ?? 0) + r.durationSec / 60)
  }
  for (const r of quiz) {
    const k = dayKey(r.createdAt)
    dayMinutes.set(k, (dayMinutes.get(k) ?? 0) + r.durationSec / 60)
  }
  const activeDays = [...dayMinutes.keys()].sort()

  const chapterMastery = chapters.map((c) => {
    const completed = c.levels.filter((l) => progressMap[l.id]?.status === 'completed').length
    return {
      chapterId: c.id,
      title: c.title,
      completed,
      total: c.levels.length,
      mastery: Math.round((completed / c.levels.length) * 100)
    }
  })

  return {
    totalMinutes,
    practiceCount: typing.length,
    avgWpm,
    avgCpm,
    avgAccuracy,
    quizCount: quiz.length,
    quizAvgAccuracy,
    streak: computeStreak(activeDays, now),
    last7: buildLast7(dayMinutes, now),
    activeDays,
    errorCharFrequency,
    calendar: [...dayMinutes.entries()].map(([date, minutes]) => ({ date, minutes: Math.round(minutes * 10) / 10 })),
    chapterMastery
  }
}

function buildLast7(dayMinutes: Map<string, number>, now: number): DayBucket[] {
  const buckets: DayBucket[] = []
  const todayStart = startOfDay(now)
  for (let i = 6; i >= 0; i--) {
    const ts = todayStart - i * 86400000
    const k = dayKey(ts)
    const d = new Date(ts)
    buckets.push({
      date: k,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      minutes: Math.round((dayMinutes.get(k) ?? 0) * 10) / 10,
      practices: 0
    })
  }
  return buckets
}

/** 连续学习天数：从今天向前数；今天未学习则允许从昨天起算（不断签） */
export function computeStreak(activeDays: string[], now: number): number {
  if (activeDays.length === 0) return 0
  const set = new Set(activeDays)
  let cursor = startOfDay(now)
  if (!set.has(dayKey(cursor))) cursor -= 86400000
  let streak = 0
  while (set.has(dayKey(cursor))) {
    streak++
    cursor -= 86400000
  }
  return streak
}

export async function loadStats(
  progressMap: Record<string, { status: string }>
): Promise<StudyStats> {
  const [typing, quiz] = await Promise.all([typingRepo.all(), quizRepo.all()])
  return buildStats(typing, quiz, progressMap)
}
