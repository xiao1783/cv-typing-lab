import type { QuizQuestion } from '../types'
import { q, opts } from './helpers'

export const quizCh2: QuizQuestion[] = [
  q('ch2-l01', 'single', {
    topic: '噪声类型',
    stem: '椒盐噪声对像素的典型操作是？',
    options: opts(['A', '整体加随机小数'], ['B', '随机置为 0 或 255'], ['C', '统一减 50'], ['D', '通道交换']),
    answer: ['B'],
    explanation: '椒盐噪声是随机黑点(0)与白点(255)的脉冲干扰。',
    mistakeReason: '混淆高斯噪声与椒盐噪声的表现'
  }),
  q('ch2-l01', 'judge', {
    topic: '截断',
    stem: '叠加噪声后应使用 np.clip 把像素限制在 0-255。',
    answer: ['T'],
    explanation: 'clip 防止越界得到非法灰度值。',
    mistakeReason: '忽略加噪后的合法范围约束'
  }),
  q('ch2-l02', 'single', {
    topic: '核大小',
    stem: '其他条件不变，均值滤波核越大，图像通常会？',
    options: opts(['A', '越清晰'], ['B', '越模糊'], ['C', '不变'], ['D', '变黑']),
    answer: ['B'],
    explanation: '参与平均的邻域越大，细节被平滑得越多。',
    mistakeReason: '不理解核大小与平滑强度的关系'
  }),
  q('ch2-l02', 'judge', {
    topic: '关系',
    stem: 'cv2.blur 等价于 normalize=True 的方框滤波。',
    answer: ['T'],
    explanation: 'blur 对邻域求和后除以面积，即归一化方框。',
    mistakeReason: '未建立 blur 与 boxFilter 的联系'
  }),
  q('ch2-l03', 'single', {
    topic: '归一化',
    stem: 'boxFilter 在 uint8 图像上 normalize=False 时，常见结果是？',
    options: opts(['A', '保持不变'], ['B', '大面积饱和变白'], ['C', '全黑'], ['D', '报错退出']),
    answer: ['B'],
    explanation: '纯邻域求和易超过 255 被截断为白色。',
    mistakeReason: '不理解未归一化求和的截断现象'
  }),
  q('ch2-l03', 'judge', {
    topic: '布尔值',
    stem: 'Python 中布尔真值写作 True（首字母大写）。',
    answer: ['T'],
    explanation: 'Python 布尔字面量为 True/False。',
    mistakeReason: 'Python 布尔字面量大小写错误'
  }),
  q('ch2-l04', 'single', {
    topic: '核尺寸',
    stem: 'GaussianBlur 的 ksize 宽高必须满足？',
    options: opts(['A', '偶数'], ['B', '奇数'], ['C', '相等且为 0'], ['D', '任意']),
    answer: ['B'],
    explanation: '奇数核才有明确的中心像素。',
    mistakeReason: '不知道高斯核必须为奇数'
  }),
  q('ch2-l04', 'param', {
    topic: 'sigma',
    stem: '高斯滤波中 sigmaX 增大，权重分布与模糊程度会？',
    options: opts(['A', '变窄更清晰'], ['B', '变宽更模糊'], ['C', '不变'], ['D', '只改变颜色']),
    answer: ['B'],
    explanation: 'sigma 越大高斯权重覆盖越宽，平滑越强。',
    mistakeReason: '不理解 sigma 对高斯权重的控制'
  }),
  q('ch2-l05', 'single', {
    topic: '外积',
    stem: '二维高斯核可由一维高斯核通过什么运算得到？',
    options: opts(['A', '加法'], ['B', '外积'], ['C', '取平均'], ['D', '阈值']),
    answer: ['B'],
    explanation: 'k2d = k1d @ k1d.T，即外积。',
    mistakeReason: '不理解高斯核的可分离构造'
  }),
  q('ch2-l05', 'judge', {
    topic: '复杂度',
    stem: '可分离滤波把 k×k 卷积降为两次一维卷积，复杂度更低。',
    answer: ['T'],
    explanation: '由 O(k²) 降到 O(2k)，大核收益明显。',
    mistakeReason: '不理解可分离卷积的加速原理'
  }),
  q('ch2-l06', 'single', {
    topic: '选型',
    stem: '去除椒盐噪声的首选滤波器是？',
    options: opts(['A', '均值'], ['B', '高斯'], ['C', '中值'], ['D', '方框']),
    answer: ['C'],
    explanation: '中值能剔除孤立极值点且保边。',
    mistakeReason: '未针对脉冲噪声选择中值滤波'
  }),
  q('ch2-l06', 'param', {
    topic: '参数形式',
    stem: 'cv2.medianBlur 的 ksize 参数类型是？',
    options: opts(['A', '元组 (k,k)'], ['B', '单个奇数整数'], ['C', '浮点 sigma'], ['D', '字符串']),
    answer: ['B'],
    explanation: 'medianBlur 直接传奇数整数，如 5。',
    mistakeReason: '把中值滤波参数误写成元组'
  }),
  q('ch2-l07', 'single', {
    topic: '特性',
    stem: '双边滤波最突出的特点是？',
    options: opts(['A', '去噪同时保留边缘'], ['B', '速度最快'], ['C', '只能处理灰度'], ['D', '不需要参数']),
    answer: ['A'],
    explanation: '灰度相似权重使边缘处不参与平滑。',
    mistakeReason: '不理解双边滤波的保边机制'
  }),
  q('ch2-l07', 'judge', {
    topic: '权重',
    stem: '双边滤波权重同时包含空间距离与像素值差异两部分。',
    answer: ['T'],
    explanation: '两类高斯权重相乘构成双边权重。',
    mistakeReason: '未掌握双边权重的两个组成'
  }),
  q('ch2-l08', 'single', {
    topic: '网格试验',
    stem: '系统遍历多个核大小与参数组合，适合用什么结构？',
    options: opts(['A', '单条语句'], ['B', '嵌套循环'], ['C', 'if 判断'], ['D', '常量定义']),
    answer: ['B'],
    explanation: '嵌套循环枚举参数网格。',
    mistakeReason: '不会用循环组织参数网格'
  }),
  q('ch2-l08', 'judge', {
    topic: '取值',
    stem: '高斯核大小参数序列应只包含奇数。',
    answer: ['T'],
    explanation: '偶数核会直接报错。',
    mistakeReason: '参数网格中混入偶数核'
  }),
  q('ch2-l09', 'single', {
    topic: '自动核',
    stem: 'GaussianBlur 把 ksize 设为 (0,0) 时，核尺寸由什么决定？',
    options: opts(['A', '图像大小'], ['B', 'sigma 自动推导'], ['C', '固定 3×3'], ['D', '随机']),
    answer: ['B'],
    explanation: 'ksize=0 时由 sigma 计算实际核尺寸。',
    mistakeReason: '不理解 ksize=0 的自动推导语义'
  }),
  q('ch2-l09', 'judge', {
    topic: '尺度',
    stem: '在自动核模式下，sigma 越大得到的平滑越强。',
    answer: ['T'],
    explanation: 'sigma 决定自动核的宽度与权重。',
    mistakeReason: '未把 sigma 与平滑强度联系起来'
  }),
  q('ch2-l10', 'single', {
    topic: '定量指标',
    stem: '对去噪结果做定量评价，常用的指标是？',
    options: opts(['A', 'WPM'], ['B', 'PSNR / SSIM'], ['C', 'WPM/CPM'], ['D', '方差只看均值']),
    answer: ['B'],
    explanation: 'PSNR 与 SSIM 是去噪质量的标准客观指标。',
    mistakeReason: '不知道去噪的定量评价指标'
  }),
  q('ch2-l10', 'judge', {
    topic: '流程',
    stem: '综合去噪实验应保存噪声图与各方法中间结果以便对比。',
    answer: ['T'],
    explanation: '完整保留中间结果才能横向比较。',
    mistakeReason: '只保留最终结果导致无法对比'
  })
]
