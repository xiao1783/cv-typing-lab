/* 各练习模式统一产出的结果结构 */
export interface PracticeOutcome {
  mode: string
  wpm: number
  cpm: number
  accuracy: number
  score: number
  errors: number
  backspaces: number
  durationSec: number
  charsTyped: number
  errorFreq?: Record<string, number>
}
