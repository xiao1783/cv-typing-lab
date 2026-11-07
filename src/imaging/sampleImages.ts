/* 内置示例图像：全部在浏览器本地用 Canvas 程序化生成，不依赖外部图片文件 */

export interface SampleDef {
  id: string
  name: string
  build: () => ImageData
}

const W = 400
const H = 320

function makeCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  return [canvas, ctx]
}

function shapes(): ImageData {
  const [, ctx] = makeCanvas()
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, '#dbeafe')
  grad.addColorStop(1, '#7dd3fc')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#1d4ed8'
  ctx.beginPath()
  ctx.arc(110, 120, 60, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#06b6d4'
  ctx.fillRect(230, 60, 120, 120)
  ctx.strokeStyle = '#1e3a8a'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(40, 260)
  ctx.lineTo(360, 200)
  ctx.stroke()
  ctx.fillStyle = '#f8fafc'
  ctx.font = 'bold 26px sans-serif'
  ctx.fillText('CV Sample', 130, 300)
  return ctx.getImageData(0, 0, W, H)
}

function pattern(): ImageData {
  const [, ctx] = makeCanvas()
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, W, H)
  const cell = 40
  for (let y = 0; y < H; y += cell) {
    for (let x = 0; x < W; x += cell) {
      ctx.fillStyle = ((x / cell + y / cell) % 2 === 0) ? '#1e3a8a' : '#e0f2fe'
      ctx.fillRect(x, y, cell, cell)
    }
  }
  ctx.fillStyle = '#06b6d4'
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.arc(60 + i * 90, 160, 26, 0, Math.PI * 2)
    ctx.fill()
  }
  return ctx.getImageData(0, 0, W, H)
}

function noisy(): ImageData {
  const base = shapes()
  const d = base.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 60
    d[i] = Math.max(0, Math.min(255, d[i] + n))
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n))
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n))
    if (Math.random() < 0.01) {
      const v = Math.random() < 0.5 ? 0 : 255
      d[i] = d[i + 1] = d[i + 2] = v
    }
  }
  return base
}

export const SAMPLE_IMAGES: SampleDef[] = [
  { id: 'shapes', name: '几何合成图', build: shapes },
  { id: 'pattern', name: '棋盘条纹图', build: pattern },
  { id: 'noisy', name: '带噪合成图', build: noisy }
]

export function buildSample(id: string): ImageData {
  const def = SAMPLE_IMAGES.find((s) => s.id === id) ?? SAMPLE_IMAGES[0]
  return def.build()
}
