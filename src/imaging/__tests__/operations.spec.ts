import { describe, expect, it } from 'vitest'
import { runOperation, toGrayArray } from '../operations'

function makeImage(size: number): ImageData {
  const img = new ImageData(size, size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const p = (y * size + x) * 4
      const v = (x * 255) / (size - 1)
      img.data[p] = v
      img.data[p + 1] = v
      img.data[p + 2] = v
      img.data[p + 3] = 255
    }
  }
  return img
}

describe('operations', () => {
  it('toGrayArray 输出与像素数一致的浮点数组', () => {
    const gray = toGrayArray(makeImage(6))
    expect(gray.data).toHaveLength(36)
    expect(gray.width).toBe(6)
  })

  it('灰度化后三通道相等', () => {
    const out = runOperation('gray', makeImage(6), {})
    const d = out.imageData.data
    for (let i = 0; i < d.length; i += 4) {
      expect(d[i]).toBe(d[i + 1])
      expect(d[i + 1]).toBe(d[i + 2])
    }
  })

  it('阈值分割只产生 0 与 255', () => {
    const out = runOperation('threshold', makeImage(8), { t: 128 })
    const values = new Set()
    for (let i = 0; i < out.imageData.data.length; i += 4) values.add(out.imageData.data[i])
    expect([...values].every((v) => v === 0 || v === 255)).toBe(true)
  })

  it('卷积返回核并保持尺寸', () => {
    const src = makeImage(8)
    const out = runOperation('conv', src, { size: 3, preset: 'mean' })
    expect(out.kernel).toHaveLength(3)
    expect(out.imageData.width).toBe(8)
  })

  it('各滤波与边缘算子均可运行并给出解释', () => {
    const src = makeImage(10)
    for (const id of ['blur', 'gaussian', 'median', 'box', 'sobel', 'laplacian', 'roberts', 'prewitt', 'scharr']) {
      const out = runOperation(id, src, { ksize: 3, sigma: 1.2, normalize: true })
      expect(out.imageData.data.length).toBe(src.data.length)
      expect(out.explanation.length).toBeGreaterThan(0)
    }
  })
})
