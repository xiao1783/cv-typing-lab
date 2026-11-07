import type { QuizQuestion } from '../types'
import { q, opts } from './helpers'

export const quizCh4: QuizQuestion[] = [
  q('ch4-l01', 'single', {
    topic: '尺度空间',
    stem: '构建高斯尺度空间需要对同一图像做什么？',
    options: opts(['A', '递增 sigma 的高斯模糊'], ['B', '统一裁剪'], ['C', '重复复制'], ['D', '颜色反转']),
    answer: ['A'],
    explanation: '由细到粗的高斯模糊构成尺度序列。',
    mistakeReason: '不理解尺度空间的构建方式'
  }),
  q('ch4-l01', 'judge', {
    topic: '多尺度',
    stem: '多尺度表示使特征不依赖目标的绝对大小。',
    answer: ['T'],
    explanation: '不同大小目标可在对应尺度被检测。',
    mistakeReason: '未理解尺度不变的含义'
  }),
  q('ch4-l02', 'single', {
    topic: 'DoG',
    stem: 'DoG 由相邻两个尺度的高斯图像如何得到？',
    options: opts(['A', '相加'], ['B', '相减'], ['C', '相乘'], ['D', '取平均']),
    answer: ['B'],
    explanation: 'Difference of Gaussians 即相邻尺度差分。',
    mistakeReason: '未掌握 DoG 的差分定义'
  }),
  q('ch4-l02', 'judge', {
    topic: '近似',
    stem: 'DoG 是归一化拉普拉斯 LoG 的高效近似。',
    answer: ['T'],
    explanation: 'DoG 计算量更小且与 LoG 近似等价。',
    mistakeReason: '不了解 DoG 与 LoG 的关系'
  }),
  q('ch4-l03', 'single', {
    topic: '极值邻居',
    stem: 'SIFT 候选点需要与 3×3×3 邻域中多少个邻居比较？',
    options: opts(['A', '8'], ['B', '26'], ['C', '9'], ['D', '27']),
    answer: ['B'],
    explanation: '同尺度 8 个加上下尺度各 9 个，共 26 个邻居。',
    mistakeReason: '数错尺度空间邻居数量'
  }),
  q('ch4-l03', 'judge', {
    topic: '过滤',
    stem: '原始极值点含低对比度点，需要后续精确定位与过滤。',
    answer: ['T'],
    explanation: '候选点需阈值净化才稳定。',
    mistakeReason: '误以为所有极值点都可靠'
  }),
  q('ch4-l04', 'single', {
    topic: '对比度',
    stem: '剔除低对比度关键点使用的参数是？',
    options: opts(['A', 'contrastThreshold'], ['B', 'sigma'], ['C', 'ksize'], ['D', 'nfeatures']),
    answer: ['A'],
    explanation: 'contrastThreshold 控制对比度门限。',
    mistakeReason: '未记住对比度阈值参数'
  }),
  q('ch4-l04', 'judge', {
    topic: '边缘点',
    stem: '落在边缘上的不稳定点应通过 edgeThreshold 剔除。',
    answer: ['T'],
    explanation: '边缘响应阈值过滤类边缘关键点。',
    mistakeReason: '忽视边缘点带来的误匹配'
  }),
  q('ch4-l05', 'single', {
    topic: '主方向',
    stem: '关键点主方向由什么确定？',
    options: opts(['A', '邻域梯度方向直方图峰值'], ['B', '像素坐标'], ['C', '随机分配'], ['D', '图像均值']),
    answer: ['A'],
    explanation: '梯度方向加权投票，峰值即主方向。',
    mistakeReason: '不理解主方向的直方图来源'
  }),
  q('ch4-l05', 'judge', {
    topic: '旋转不变',
    stem: '描述子相对主方向建立，从而获得旋转不变性。',
    answer: ['T'],
    explanation: '方向归一化抵消整体旋转。',
    mistakeReason: '未理解主方向与旋转不变的关系'
  }),
  q('ch4-l06', 'single', {
    topic: '维度',
    stem: '标准 SIFT 描述子的向量维度是？',
    options: opts(['A', '64'], ['B', '128'], ['C', '256'], ['D', '36']),
    answer: ['B'],
    explanation: '4×4 子区域 × 8 方向 = 128 维。',
    mistakeReason: '未记住描述子维度'
  }),
  q('ch4-l06', 'judge', {
    topic: '归一化',
    stem: '描述子归一化可降低光照变化的影响。',
    answer: ['T'],
    explanation: '单位化并截断大值增强鲁棒性。',
    mistakeReason: '不理解描述子归一化作用'
  }),
  q('ch4-l07', 'single', {
    topic: '层数',
    stem: 'SIFT_create 中 nOctaveLayers 的默认值是？',
    options: opts(['A', '1'], ['B', '3'], ['C', '5'], ['D', '10']),
    answer: ['B'],
    explanation: '默认 3，对应 k=2^(1/3)。',
    mistakeReason: '未记住默认 octave 层数'
  }),
  q('ch4-l07', 'codeBlank', {
    topic: '构造器',
    stem: '补全：sift = cv2.____(nfeatures=0)',
    answer: ['SIFT_create'],
    acceptable: ['SIFT_create'],
    explanation: '新版统一用 SIFT_create 构造检测器。',
    mistakeReason: '未记住 SIFT 构造函数名'
  }),
  q('ch4-l08', 'single', {
    topic: '返回值',
    stem: 'detectAndCompute 的返回结果是？',
    options: opts(['A', '仅关键点'], ['B', '关键点与描述子'], ['C', '仅描述子'], ['D', '图像数组']),
    answer: ['B'],
    explanation: '一步返回 (KeyPoint 元组, 描述子矩阵)。',
    mistakeReason: '不了解 detectAndCompute 的返回结构'
  }),
  q('ch4-l08', 'judge', {
    topic: '输入',
    stem: 'SIFT 检测应使用单通道灰度图像。',
    answer: ['T'],
    explanation: '彩色图需先转灰度再检测。',
    mistakeReason: '直接用彩色图做 SIFT'
  }),
  q('ch4-l09', 'single', {
    topic: '绘制标志',
    stem: 'drawKeypoints 使用 DRAW_RICH_KEYPOINTS 会画出？',
    options: opts(['A', '仅点'], ['B', '尺度圆与方向线'], ['C', '全图填充'], ['D', '文字标签']),
    answer: ['B'],
    explanation: '圆圈大小反映尺度、线段反映方向。',
    mistakeReason: '未掌握 RICH 标志的含义'
  }),
  q('ch4-l09', 'judge', {
    topic: '输出参数',
    stem: 'drawKeypoints 输出参数传 None 时函数自动创建结果图。',
    answer: ['T'],
    explanation: 'None 让函数内部新建图像。',
    mistakeReason: '不了解 None 输出参数语义'
  }),
  q('ch4-l10', 'single', {
    topic: '特征预算',
    stem: 'nfeatures 参数控制的是？',
    options: opts(['A', '保留的最佳特征数'], ['B', '图像尺寸'], ['C', 'sigma 数量'], ['D', '颜色通道']),
    answer: ['A'],
    explanation: '按响应保留前 N 个，0 为不限。',
    mistakeReason: '不理解 nfeatures 的上限语义'
  }),
  q('ch4-l10', 'judge', {
    topic: '评估',
    stem: '特征调优应结合匹配内点率而非只看数量。',
    answer: ['T'],
    explanation: '数量与质量需综合评估。',
    mistakeReason: '只关注关键点数量'
  })
]
