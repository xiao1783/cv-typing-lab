export type ParamWidget = 'slider' | 'number' | 'select'

export interface ParamSpec {
  key: string
  label: string
  widget: ParamWidget
  default: number | string | boolean
  min?: number
  max?: number
  step?: number
  options?: { value: string | number | boolean; label: string }[]
}

export interface ExperimentDef {
  id: string
  title: string
  group: '基础实验' | '扩展实验'
  realtime: boolean
  simplified?: boolean
  needsTwoImages?: boolean
  params: ParamSpec[]
  principle: string
}

const ksizeParam = (label: string, d = 3): ParamSpec => ({
  key: 'ksize',
  label,
  widget: 'slider',
  default: d,
  min: 3,
  max: 9,
  step: 2
})

export const EXPERIMENTS: ExperimentDef[] = [
  {
    id: 'gray',
    title: '灰度化',
    group: '基础实验',
    realtime: true,
    params: [],
    principle: '依据人眼对三原色敏感度，用 Y=0.299R+0.587G+0.114B 把彩色信息压缩为亮度通道，是多数算法的前置步骤。'
  },
  {
    id: 'threshold',
    title: '阈值分割',
    group: '基础实验',
    realtime: true,
    params: [
      { key: 't', label: '阈值 t', widget: 'slider', default: 128, min: 0, max: 255, step: 1 }
    ],
    principle: '按固定门限把像素分为前景/背景两类，输出只有 0 与 255 的二值图，用于简单分割与边缘后处理。'
  },
  {
    id: 'conv',
    title: '二维卷积',
    group: '基础实验',
    realtime: true,
    params: [
      {
        key: 'size',
        label: '核尺寸',
        widget: 'select',
        default: 3,
        options: [
          { value: 3, label: '3×3' },
          { value: 5, label: '5×5' }
        ]
      },
      {
        key: 'preset',
        label: '核类型',
        widget: 'select',
        default: 'mean',
        options: [
          { value: 'mean', label: '均值核' },
          { value: 'sharp', label: '锐化核' },
          { value: 'box', label: '方框核' }
        ]
      }
    ],
    principle: '卷积在每个像素处取邻域与核逐元素乘加，是滤波、边缘与 CNN 的统一底层操作。右侧实时显示当前核权重。'
  },
  {
    id: 'blur',
    title: '均值滤波',
    group: '基础实验',
    realtime: true,
    params: [ksizeParam('核大小 ksize')],
    principle: '用邻域算术平均替换中心像素，核越大平滑越强、细节丢失越多，适合轻度随机噪声。'
  },
  {
    id: 'box',
    title: '方框滤波',
    group: '基础实验',
    realtime: true,
    params: [
      ksizeParam('核大小 ksize'),
      {
        key: 'normalize',
        label: '是否归一化',
        widget: 'select',
        default: true,
        options: [
          { value: true, label: '归一化（除以面积）' },
          { value: false, label: '直接求和' }
        ]
      }
    ],
    principle: '归一化时等价均值滤波；未归一化直接对邻域求和，uint8 下超过 255 会被截断为白色。'
  },
  {
    id: 'gaussian',
    title: '高斯滤波',
    group: '基础实验',
    realtime: true,
    params: [
      ksizeParam('核大小 ksize', 5),
      { key: 'sigma', label: '标准差 sigma', widget: 'slider', default: 1.2, min: 0.1, max: 6, step: 0.1 }
    ],
    principle: '按高斯函数给邻域加权，中心权重最大，在抑制高斯噪声的同时较好保留整体结构，是尺度空间的基础。'
  },
  {
    id: 'median',
    title: '中值滤波',
    group: '基础实验',
    realtime: true,
    params: [ksizeParam('孔径 ksize')],
    principle: '取邻域排序后的中位数替换中心像素，能剔除孤立椒盐极值点并保护边缘。'
  },
  {
    id: 'roberts',
    title: 'Roberts 边缘检测',
    group: '基础实验',
    realtime: true,
    params: [],
    principle: '2×2 交叉对角差分近似梯度并合成幅值，定位快但无平滑环节、对噪声敏感。'
  },
  {
    id: 'prewitt',
    title: 'Prewitt 边缘检测',
    group: '基础实验',
    realtime: true,
    params: [],
    principle: '3×3 方向核在差分同时做邻域平均，检测水平/垂直边缘，抗噪性优于 Roberts。'
  },
  {
    id: 'sobel',
    title: 'Sobel 边缘检测',
    group: '基础实验',
    realtime: true,
    params: [],
    principle: '带高斯平滑的一阶差分，中心行权重更大，抗噪与定位取得良好平衡，是最常用边缘算子。'
  },
  {
    id: 'scharr',
    title: 'Scharr 边缘检测',
    group: '基础实验',
    realtime: true,
    params: [],
    principle: '固定 3×3 优化系数，小核下旋转对称性与梯度方向精度优于 Sobel。'
  },
  {
    id: 'laplacian',
    title: 'Laplacian 边缘检测',
    group: '基础实验',
    realtime: true,
    params: [],
    principle: '二阶偏导之和，边缘处产生过零/强响应，因二阶导放大噪声，实际使用前需先平滑。'
  },
  {
    id: 'sift',
    title: 'SIFT 关键点检测',
    group: '扩展实验',
    realtime: true,
    simplified: true,
    params: [
      { key: 'maxCount', label: '最大关键点数', widget: 'slider', default: 80, min: 10, max: 200, step: 10 },
      { key: 'lowThreshold', label: '响应阈值', widget: 'slider', default: 1.5, min: 0, max: 10, step: 0.5 }
    ],
    principle: '真实构建高斯尺度空间与 DoG，在 3×3×3 邻域检测极值。属教学简化：关键点亚像素拟合与主方向归一化做了精简，结果为实时计算而非预加载。'
  },
  {
    id: 'match',
    title: 'SIFT 特征匹配',
    group: '扩展实验',
    realtime: true,
    simplified: true,
    needsTwoImages: true,
    params: [
      { key: 'ratio', label: '比值检验阈值', widget: 'slider', default: 0.75, min: 0.4, max: 1, step: 0.05 }
    ],
    principle: '对两图分别检测 DoG 关键点并计算 128 维简化描述子，做最近邻匹配与 Lowe 比值检验，连线为实时计算结果。'
  },
  {
    id: 'ransac',
    title: 'RANSAC 几何估计',
    group: '扩展实验',
    realtime: true,
    simplified: true,
    needsTwoImages: true,
    params: [
      { key: 'threshold', label: '重投影阈值', widget: 'slider', default: 5, min: 1, max: 15, step: 1 },
      { key: 'iterations', label: '迭代次数', widget: 'slider', default: 100, min: 20, max: 500, step: 20 }
    ],
    principle: '在匹配点上反复随机抽 4 对做 DLT 单应性估计，按重投影误差统计内点，内点最多的模型获胜，可抵抗误匹配。'
  },
  {
    id: 'stitch',
    title: '图像拼接',
    group: '扩展实验',
    realtime: true,
    simplified: true,
    needsTwoImages: true,
    params: [],
    principle: '基于 RANSAC 单应性矩阵对第二张图做逆映射变形并与第一张融合，输出实时拼接结果；融合与曝光补偿做了教学简化。'
  }
]

export function findExperiment(id: string): ExperimentDef | undefined {
  return EXPERIMENTS.find((e) => e.id === id)
}

export function defaultParams(def: ExperimentDef): Record<string, number | string | boolean> {
  const out: Record<string, number | string | boolean> = {}
  for (const p of def.params) out[p.key] = p.default
  return out
}
