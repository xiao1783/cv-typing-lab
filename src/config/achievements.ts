export interface AchievementDef {
  id: string
  title: string
  desc: string
  icon: string
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-step', title: '初入视觉', desc: '完成第一个关卡', icon: 'Flag' },
  { id: 'level-10', title: '小有所成', desc: '累计完成 10 个关卡', icon: 'Medal' },
  { id: 'level-30', title: '勤学不辍', desc: '累计完成 30 个关卡', icon: 'Reading' },
  { id: 'level-all', title: '视觉大师', desc: '完成全部关卡', icon: 'TrophyBase' },
  { id: 'speed-40', title: '指尖生风', desc: '单次练习 WPM 达到 40', icon: 'Lightning' },
  { id: 'perfect', title: '分毫不差', desc: '单次练习准确率达到 100%', icon: 'MagicStick' },
  { id: 'streak-3', title: '三日坚持', desc: '连续学习 3 天', icon: 'Calendar' },
  { id: 'streak-7', title: '一周之约', desc: '连续学习 7 天', icon: 'AlarmClock' },
  { id: 'quiz-first', title: '初试测验', desc: '完成第一次知识测验', icon: 'EditPen' },
  { id: 'quiz-full', title: '满分答卷', desc: '测验获得满分', icon: 'Stamp' }
]

export interface AchievementContext {
  completedCount: number
  totalCount: number
  wpm: number
  accuracy: number
  streak: number
  quizCount: number
  quizFull: boolean
  existing: Record<string, unknown>
}

/** 根据当前上下文计算应解锁但尚未解锁的成就 id */
export function evaluateAchievements(ctx: AchievementContext): string[] {
  const want = new Set<string>()
  if (ctx.completedCount >= 1) want.add('first-step')
  if (ctx.completedCount >= 10) want.add('level-10')
  if (ctx.completedCount >= 30) want.add('level-30')
  if (ctx.completedCount >= ctx.totalCount && ctx.totalCount > 0) want.add('level-all')
  if (ctx.wpm >= 40) want.add('speed-40')
  if (ctx.accuracy >= 100) want.add('perfect')
  if (ctx.streak >= 3) want.add('streak-3')
  if (ctx.streak >= 7) want.add('streak-7')
  if (ctx.quizCount >= 1) want.add('quiz-first')
  if (ctx.quizFull) want.add('quiz-full')
  return [...want].filter((id) => !ctx.existing[id])
}
