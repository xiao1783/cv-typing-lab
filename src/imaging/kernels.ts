/* 卷积核生成与常用边缘核（真实数值计算） */

export function gaussianKernel1d(size: number, sigma: number): number[] {
  const half = Math.floor(size / 2)
  const raw: number[] = []
  let sum = 0
  for (let i = -half; i <= half; i++) {
    const v = Math.exp(-(i * i) / (2 * sigma * sigma))
    raw.push(v)
    sum += v
  }
  return raw.map((v) => v / sum)
}

export function gaussianKernel2d(size: number, sigma: number): number[][] {
  const k1 = gaussianKernel1d(size, sigma)
  return k1.map((a) => k1.map((b) => a * b))
}

export function meanKernel(size: number): number[][] {
  const v = 1 / (size * size)
  return Array.from({ length: size }, () => new Array(size).fill(v))
}

export function boxKernel(size: number, normalize: boolean): number[][] {
  const v = normalize ? 1 / (size * size) : 1
  return Array.from({ length: size }, () => new Array(size).fill(v))
}

/* 常用一阶/二阶边缘核 */
export const ROBERTS_X = [
  [1, 0],
  [0, -1]
]
export const ROBERTS_Y = [
  [0, 1],
  [-1, 0]
]

export const PREWITT_X = [
  [-1, 0, 1],
  [-1, 0, 1],
  [-1, 0, 1]
]
export const PREWITT_Y = [
  [-1, -1, -1],
  [0, 0, 0],
  [1, 1, 1]
]

export const SOBEL_X = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1]
]
export const SOBEL_Y = [
  [-1, -2, -1],
  [0, 0, 0],
  [1, 2, 1]
]

export const SCHARR_X = [
  [-3, 0, 3],
  [-10, 0, 10],
  [-3, 0, 3]
]
export const SCHARR_Y = [
  [-3, -10, -3],
  [0, 0, 0],
  [3, 10, 3]
]

export const LAPLACIAN = [
  [0, 1, 0],
  [1, -4, 1],
  [0, 1, 0]
]

export function flattenKernel(k: number[][]): number[] {
  return k.flat()
}
