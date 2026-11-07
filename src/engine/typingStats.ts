/* 打字统计纯函数，便于单元测试 */

/** WPM：标准约定每 5 个字符计为一个“词” */
export function wpmFrom(correctChars: number, elapsedMs: number): number {
  const minutes = elapsedMs / 60000
  if (minutes <= 0) return 0
  return Math.round(correctChars / 5 / minutes)
}

/** CPM：每分钟正确字符数 */
export function cpmFrom(correctChars: number, elapsedMs: number): number {
  const minutes = elapsedMs / 60000
  if (minutes <= 0) return 0
  return Math.round(correctChars / minutes)
}

/** 准确率：正确按键数 / 总按键数（百分比，保留 1 位小数） */
export function accuracyFrom(correctPresses: number, totalPresses: number): number {
  if (totalPresses <= 0) return 100
  return Math.round((correctPresses / totalPresses) * 1000) / 10
}

/** 综合练习评分（0-100）：准确率主导，速度作为加分项 */
export function scoreFrom(accuracy: number, wpm: number): number {
  const speedBonus = Math.min(15, wpm * 0.3)
  return Math.round(Math.min(100, accuracy * 0.85 + speedBonus))
}
