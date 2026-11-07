import { convolve, toGrayArray, type GrayImage } from './operations'
import { SOBEL_X, SOBEL_Y, gaussianKernel2d } from './kernels'

export interface KeyPoint {
  x: number
  y: number
  scale: number
  response: number
  angle: number
}

export interface Descriptor {
  point: KeyPoint
  vector: Float32Array
}

/** 高斯模糊栈（尺度空间） */
function gaussianStack(gray: GrayImage, sigmas: number[]): Float32Array[] {
  return sigmas.map((s) => convolve(gray, gaussianKernel2d(5, s)))
}

/** DoG 极值关键点检测：3×3×3 邻域局部最大/最小，按响应取前 maxCount 个 */
export function detectKeypoints(
  imageData: ImageData,
  options: { maxCount: number; lowThreshold: number }
): { points: KeyPoint[]; stack: Float32Array[] } {
  const gray = toGrayArray(imageData)
  const sigmas = [1.0, 1.4, 2.0, 2.8, 4.0]
  const stack = gaussianStack(gray, sigmas)
  const dogs: Float32Array[] = []
  for (let i = 0; i < stack.length - 1; i++) {
    const d = new Float32Array(stack[i].length)
    for (let j = 0; j < d.length; j++) d[j] = stack[i + 1][j] - stack[i][j]
    dogs.push(d)
  }

  const gx = convolve(gray, SOBEL_X)
  const gy = convolve(gray, SOBEL_Y)
  const candidates: KeyPoint[] = []
  const { width, height } = gray

  for (let o = 1; o < dogs.length - 1; o++) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x
        const v = dogs[o][idx]
        if (Math.abs(v) < options.lowThreshold) continue
        let isMax = true
        let isMin = true
        for (let dz = -1; dz <= 1; dz++) {
          const layer = dogs[o + dz]
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dz === 0 && dy === 0 && dx === 0) continue
              const n = layer[(y + dy) * width + (x + dx)]
              if (n >= v) isMax = false
              if (n <= v) isMin = false
            }
          }
        }
        if (isMax || isMin) {
          const angle = Math.atan2(gy[idx], gx[idx]) * 180 / Math.PI
          candidates.push({
            x,
            y,
            scale: sigmas[o],
            response: Math.abs(v),
            angle: angle < 0 ? angle + 360 : angle
          })
        }
      }
    }
  }

  candidates.sort((a, b) => b.response - a.response)
  return { points: candidates.slice(0, options.maxCount), stack }
}

/** 128 维简化描述子：4×4 子区域 × 8 方向（未做旋转归一化，属教学简化） */
export function computeDescriptors(imageData: ImageData, points: KeyPoint[]): Descriptor[] {
  const gray = toGrayArray(imageData)
  const gx = convolve(gray, SOBEL_X)
  const gy = convolve(gray, SOBEL_Y)
  const { width, height } = gray

  return points.map((point) => {
    const vector = new Float32Array(128)
    const radius = Math.max(8, Math.round(point.scale * 4))
    for (let gyy = -2; gyy <= 1; gyy++) {
      for (let gxx = -2; gxx <= 1; gxx++) {
        const cx = Math.round(point.x + gxx * radius / 2)
        const cy = Math.round(point.y + gyy * radius / 2)
        for (let dy = 0; dy < radius / 2; dy++) {
          for (let dx = 0; dx < radius / 2; dx++) {
            const px = Math.min(width - 1, Math.max(0, cx + dx))
            const py = Math.min(height - 1, Math.max(0, cy + dy))
            const idx = py * width + px
            const mag = Math.sqrt(gx[idx] * gx[idx] + gy[idx] * gy[idx])
            let ang = Math.atan2(gy[idx], gx[idx])
            if (ang < 0) ang += Math.PI * 2
            const bin = Math.min(7, Math.floor(ang / (Math.PI / 4)))
            const cell = (gyy + 2) * 4 + (gxx + 2)
            vector[cell * 8 + bin] += mag
          }
        }
      }
    }
    const norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0))
    if (norm > 0) for (let i = 0; i < vector.length; i++) vector[i] /= norm
    return { point, vector }
  })
}

export interface MatchPair {
  a: Descriptor
  b: Descriptor
  distance: number
}

/** 暴力最近邻 + Lowe 比值检验 */
export function matchDescriptors(
  descA: Descriptor[],
  descB: Descriptor[],
  ratio: number
): MatchPair[] {
  const pairs: MatchPair[] = []
  for (const a of descA) {
    let best: Descriptor | null = null
    let second: Descriptor | null = null
    let bestD = Infinity
    let secondD = Infinity
    for (const b of descB) {
      let d = 0
      for (let i = 0; i < a.vector.length; i++) d += (a.vector[i] - b.vector[i]) ** 2
      d = Math.sqrt(d)
      if (d < bestD) {
        secondD = bestD
        second = best
        bestD = d
        best = b
      } else if (d < secondD) {
        secondD = d
        second = b
      }
    }
    if (best && second && bestD < ratio * secondD) {
      pairs.push({ a, b: best, distance: bestD })
    }
  }
  return pairs
}

/** Gauss-Jordan 消元求 DLT 矩阵零空间向量（4 对点、8 方程、9 未知） */
function nullVector(matrix: number[][]): number[] {
  const A = matrix.map((r) => [...r])
  const rows = A.length
  const cols = A[0].length
  let pivotRow = 0
  for (let col = 0; col < cols - 1 && pivotRow < rows; col++) {
    let sel = pivotRow
    for (let r = pivotRow + 1; r < rows; r++) {
      if (Math.abs(A[r][col]) > Math.abs(A[sel][col])) sel = r
    }
    if (Math.abs(A[sel][col]) < 1e-10) continue
    ;[A[pivotRow], A[sel]] = [A[sel], A[pivotRow]]
    const div = A[pivotRow][col]
    for (let c = 0; c < cols; c++) A[pivotRow][c] /= div
    for (let r = 0; r < rows; r++) {
      if (r === pivotRow) continue
      const factor = A[r][col]
      for (let c = 0; c < cols; c++) A[r][c] -= factor * A[pivotRow][c]
    }
    pivotRow++
  }
  // 自由变量取最后一维 = 1，回代得到零空间
  const h = new Array(cols).fill(0)
  h[cols - 1] = 1
  for (let r = 0; r < pivotRow; r++) {
    let pivotCol = 0
    while (pivotCol < cols && Math.abs(A[r][pivotCol]) < 1e-10) pivotCol++
    let sum = A[r][cols - 1]
    for (let c = pivotCol + 1; c < cols; c++) sum += A[r][c] * h[c]
    h[pivotCol] = -sum
  }
  return h
}

function dltRows(x: number, y: number, xp: number, yp: number): number[][] {
  return [
    [-x, -y, -1, 0, 0, 0, x * xp, y * xp, xp],
    [0, 0, 0, -x, -y, -1, x * yp, y * yp, yp]
  ]
}

function project(H: number[], x: number, y: number): [number, number] {
  const w = H[6] * x + H[7] * y + H[8]
  return [(H[0] * x + H[1] * y + H[2]) / w, (H[3] * x + H[4] * y + H[5]) / w]
}

export interface RansacResult {
  H: number[] | null
  inlierCount: number
  inlierMask: boolean[]
}

function invert3x3(m: number[]): number[] | null {
  const [a, b, c, d, e, f, g, h, i] = m
  const A = e * i - f * h
  const B = -(d * i - f * g)
  const C = d * h - e * g
  const det = a * A + b * B + c * C
  if (Math.abs(det) < 1e-12) return null
  const inv = [
    A,
    B,
    C,
    -(b * i - c * h),
    a * i - c * g,
    -(a * h - b * g),
    b * f - c * e,
    -(a * f - c * d),
    a * e - b * d
  ]
  return inv.map((v) => v / det)
}

/** 依据单应性矩阵把 B 逆映射变形并与 A 融合（最近邻采样，教学简化融合） */
export function warpAndStitch(a: ImageData, b: ImageData, H: number[]): ImageData {
  const outW = a.width + b.width
  const outH = Math.max(a.height, b.height)
  const out = new ImageData(outW, outH)
  // 先复制 A
  for (let y = 0; y < a.height; y++) {
    for (let x = 0; x < a.width; x++) {
      const si = (y * a.width + x) * 4
      const di = (y * outW + x) * 4
      out.data[di] = a.data[si]
      out.data[di + 1] = a.data[si + 1]
      out.data[di + 2] = a.data[si + 2]
      out.data[di + 3] = 255
    }
  }
  const inv = invert3x3(H)
  if (!inv) return out
  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const w = inv[6] * x + inv[7] * y + inv[8]
      const sx = (inv[0] * x + inv[1] * y + inv[2]) / w
      const sy = (inv[3] * x + inv[4] * y + inv[5]) / w
      if (sx >= 0 && sx < b.width - 1 && sy >= 0 && sy < b.height - 1) {
        const ix = Math.round(sx)
        const iy = Math.round(sy)
        const si = (iy * b.width + ix) * 4
        const di = (y * outW + x) * 4
        out.data[di] = b.data[si]
        out.data[di + 1] = b.data[si + 1]
        out.data[di + 2] = b.data[si + 2]
        out.data[di + 3] = 255
      }
    }
  }
  return out
}

/** RANSAC 鲁棒单应性估计（真实迭代，阈值为重投影像素误差） */
export function ransacHomography(
  src: [number, number][],
  dst: [number, number][],
  threshold: number,
  iterations: number
): RansacResult {
  const n = src.length
  const mask = new Array(n).fill(false)
  if (n < 4) return { H: null, inlierCount: 0, inlierMask: mask }
  let bestH: number[] | null = null
  let bestCount = 0
  let bestMask = mask

  for (let it = 0; it < iterations; it++) {
    const idx = new Set<number>()
    while (idx.size < 4) idx.add(Math.floor(Math.random() * n))
    const rows: number[][] = []
    for (const i of idx) rows.push(...dltRows(src[i][0], src[i][1], dst[i][0], dst[i][1]))
    let H: number[]
    try {
      H = nullVector(rows)
    } catch {
      continue
    }
    if (H.some((v) => Number.isNaN(v))) continue
    const currentMask = new Array(n).fill(false)
    let count = 0
    for (let i = 0; i < n; i++) {
      const [px, py] = project(H, src[i][0], src[i][1])
      const err = Math.hypot(px - dst[i][0], py - dst[i][1])
      if (err < threshold) {
        currentMask[i] = true
        count++
      }
    }
    if (count > bestCount) {
      bestCount = count
      bestH = H
      bestMask = currentMask
    }
  }
  return { H: bestH, inlierCount: bestCount, inlierMask: bestMask }
}
