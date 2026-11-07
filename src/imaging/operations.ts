import {
  LAPLACIAN,
  PREWITT_X,
  PREWITT_Y,
  ROBERTS_X,
  ROBERTS_Y,
  SCHARR_X,
  SCHARR_Y,
  SOBEL_X,
  SOBEL_Y,
  boxKernel,
  gaussianKernel2d,
  meanKernel
} from './kernels'

export interface GrayImage {
  data: Float32Array
  width: number
  height: number
}

export function toGrayArray(imageData: ImageData): GrayImage {
  const { width, height, data } = imageData
  const out = new Float32Array(width * height)
  for (let i = 0; i < out.length; i++) {
    const p = i * 4
    out[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]
  }
  return { data: out, width, height }
}

export function grayToImageData(gray: GrayImage, source: ImageData): ImageData {
  const out = new ImageData(gray.width, gray.height)
  for (let i = 0; i < gray.data.length; i++) {
    const v = Math.max(0, Math.min(255, Math.round(gray.data[i])))
    const p = i * 4
    out.data[p] = v
    out.data[p + 1] = v
    out.data[p + 2] = v
    out.data[p + 3] = source.data[p + 3]
  }
  return out
}

/** 通用卷积（相关），边界采用复制（clamp）填充 */
export function convolve(gray: GrayImage, kernel: number[][]): Float32Array {
  const { data, width, height } = gray
  const kh = kernel.length
  const kw = kernel[0].length
  const ph = Math.floor(kh / 2)
  const pw = Math.floor(kw / 2)
  const out = new Float32Array(data.length)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0
      for (let u = 0; u < kh; u++) {
        for (let v = 0; v < kw; v++) {
          const yy = Math.min(height - 1, Math.max(0, y + u - ph))
          const xx = Math.min(width - 1, Math.max(0, x + v - pw))
          sum += data[yy * width + xx] * kernel[u][v]
        }
      }
      out[y * width + x] = sum
    }
  }
  return out
}

export function medianFilter(gray: GrayImage, size: number): Float32Array {
  const { data, width, height } = gray
  const half = Math.floor(size / 2)
  const out = new Float32Array(data.length)
  const window: number[] = new Array(size * size)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let n = 0
      for (let u = -half; u <= half; u++) {
        for (let v = -half; v <= half; v++) {
          const yy = Math.min(height - 1, Math.max(0, y + u))
          const xx = Math.min(width - 1, Math.max(0, x + v))
          window[n++] = data[yy * width + xx]
        }
      }
      const sorted = window.slice(0, n).sort((a, b) => a - b)
      out[y * width + x] = sorted[Math.floor(sorted.length / 2)]
    }
  }
  return out
}

/** 把带正负/任意尺度的响应归一化到 0-255 便于显示 */
function scaleResponse(arr: Float32Array): Float32Array {
  let max = 0
  for (const v of arr) max = Math.max(max, Math.abs(v))
  const factor = max === 0 ? 0 : 255 / max
  return arr.map((v) => Math.abs(v) * factor)
}

function edgeMagnitude(gray: GrayImage, kx: number[][], ky: number[][]): Float32Array {
  const ax = convolve(gray, kx)
  const ay = convolve(gray, ky)
  const mag = new Float32Array(ax.length)
  for (let i = 0; i < ax.length; i++) mag[i] = Math.sqrt(ax[i] * ax[i] + ay[i] * ay[i])
  return scaleResponse(mag)
}

export interface OperationResult {
  imageData: ImageData
  kernel?: number[][]
  explanation: string
}

type Params = Record<string, number | string | boolean>

export function runOperation(opId: string, source: ImageData, params: Params): OperationResult {
  const gray = toGrayArray(source)
  let result = new Float32Array(gray.data)
  let kernel: number[][] | undefined
  let explanation = ''

  switch (opId) {
    case 'gray': {
      explanation = '按亮度加权公式将三通道压缩为单通道，所有通道取相同灰度值。'
      break
    }
    case 'threshold': {
      const t = Number(params.t)
      result = gray.data.map((v) => (v >= t ? 255 : 0))
      explanation = `以 ${t} 为门限二值化，高于门限置白、低于置黑。`
      break
    }
    case 'conv': {
      const size = Number(params.size)
      const preset = String(params.preset)
      if (preset === 'mean') kernel = meanKernel(size)
      else if (preset === 'sharp')
        kernel =
          size === 3
            ? [[0, -1, 0], [-1, 5, -1], [0, -1, 0]]
            : meanKernel(size)
      else kernel = boxKernel(size, true)
      result = convolve(gray, kernel)
      explanation = `使用 ${size}×${size} ${preset} 核做通用卷积，右侧可查看核权重。`
      break
    }
    case 'blur': {
      const size = Number(params.ksize)
      kernel = meanKernel(size)
      result = convolve(gray, kernel)
      explanation = `${size}×${size} 邻域算术平均，平滑随机噪声并弱化细节。`
      break
    }
    case 'box': {
      const size = Number(params.ksize)
      const normalize = Boolean(params.normalize)
      kernel = boxKernel(size, normalize)
      result = convolve(gray, kernel)
      explanation = normalize
        ? '归一化方框，权重和为 1，亮度保持。'
        : '未归一化求和，超过 255 的响应被截断。'
      break
    }
    case 'gaussian': {
      const size = Number(params.ksize)
      const sigma = Number(params.sigma)
      kernel = gaussianKernel2d(size, sigma)
      result = convolve(gray, kernel)
      explanation = `高斯核（${size}×${size}, sigma=${sigma}）中心权重大、边缘权重小，平滑同时保留整体结构。`
      break
    }
    case 'median': {
      const size = Number(params.ksize)
      result = medianFilter(gray, size)
      explanation = `取 ${size}×${size} 邻域中位数，剔除孤立极值（椒盐噪声）并保护边缘。`
      break
    }
    case 'roberts':
      result = edgeMagnitude(gray, ROBERTS_X, ROBERTS_Y)
      explanation = '2×2 交叉差分合成梯度幅值，定位快但对噪声敏感。'
      break
    case 'prewitt':
      result = edgeMagnitude(gray, PREWITT_X, PREWITT_Y)
      explanation = '3×3 方向核带平均差分，检测水平/垂直边缘且更抗噪。'
      break
    case 'sobel':
      result = edgeMagnitude(gray, SOBEL_X, SOBEL_Y)
      explanation = '带平滑的一阶 Sobel 差分，抗噪与定位平衡，是最常用边缘算子。'
      break
    case 'scharr':
      result = edgeMagnitude(gray, SCHARR_X, SCHARR_Y)
      explanation = '固定 3×3 优化系数，小核下梯度方向更精确。'
      break
    case 'laplacian': {
      kernel = LAPLACIAN
      result = scaleResponse(convolve(gray, LAPLACIAN))
      explanation = '二阶导数响应，取绝对值并归一化，边缘处出现强响应。'
      break
    }
    default:
      explanation = '未知操作，返回原图。'
  }

  const outGray: GrayImage = { data: result, width: gray.width, height: gray.height }
  return { imageData: grayToImageData(outGray, source), kernel, explanation }
}
