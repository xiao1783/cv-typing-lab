import type { QuizQuestion } from '../types'
import { q, opts } from './helpers'

export const quizCh3: QuizQuestion[] = [
  q('ch3-l01', 'single', {
    topic: '差分',
    stem: '离散图像上偏导数通常用什么近似？',
    options: opts(['A', '相邻像素差分'], ['B', '像素求和'], ['C', '随机采样'], ['D', '通道相除']),
    answer: ['A'],
    explanation: '用相邻像素之差近似连续偏导。',
    mistakeReason: '不理解离散导数的差分近似'
  }),
  q('ch3-l01', 'judge', {
    topic: '类型',
    stem: '差分结果可能为负，应使用浮点类型保存。',
    answer: ['T'],
    explanation: 'uint8 无法保存负差分。',
    mistakeReason: '忽视差分负值与类型选择'
  }),
  q('ch3-l02', 'single', {
    topic: '核大小',
    stem: 'Roberts 算子使用的核尺寸是？',
    options: opts(['A', '2×2'], ['B', '3×3'], ['C', '5×5'], ['D', '1×1']),
    answer: ['A'],
    explanation: 'Roberts 是 2×2 交叉差分核。',
    mistakeReason: '未记住 Roberts 的核尺寸'
  }),
  q('ch3-l02', 'judge', {
    topic: '抗噪',
    stem: 'Roberts 算子结构简单，对噪声较敏感。',
    answer: ['T'],
    explanation: '没有平滑环节，噪声直接影响差分。',
    mistakeReason: '不了解 Roberts 的抗噪弱点'
  }),
  q('ch3-l03', 'single', {
    topic: '对比',
    stem: '相比 Roberts，Prewitt 因邻域平均而更？',
    options: opts(['A', '抗噪'], ['B', '慢且无差别'], ['C', '只能检测对角'], ['D', '不需要核']),
    answer: ['A'],
    explanation: '三行/列平均带来一定抗噪能力。',
    mistakeReason: '未理解 Prewitt 平均带来的抗噪性'
  }),
  q('ch3-l03', 'judge', {
    topic: '方向',
    stem: 'Prewitt 适合检测水平与垂直方向边缘。',
    answer: ['T'],
    explanation: '方向核分别响应两个主轴方向。',
    mistakeReason: '不熟悉 Prewitt 的方向特性'
  }),
  q('ch3-l04', 'single', {
    topic: '求导阶数',
    stem: 'Sobel 中 dx=1, dy=0 表示？',
    options: opts(['A', '只对 x 求一阶导'], ['B', '对 y 求导'], ['C', '二阶导'], ['D', '不求导']),
    answer: ['A'],
    explanation: 'dx 控制 x 方向求导阶数。',
    mistakeReason: '未掌握 dx/dy 参数含义'
  }),
  q('ch3-l04', 'codeBlank', {
    topic: '函数名',
    stem: '补全：sx = cv2.____(img, cv2.CV_64F, 1, 0)',
    answer: ['Sobel'],
    acceptable: ['Sobel'],
    explanation: 'Sobel 算子函数名为 cv2.Sobel。',
    mistakeReason: '未记住 Sobel 函数名'
  }),
  q('ch3-l05', 'single', {
    topic: '核尺寸',
    stem: 'Scharr 算子的核尺寸是？',
    options: opts(['A', '固定 3×3'], ['B', '可选 5×5'], ['C', '2×2'], ['D', '由用户指定']),
    answer: ['A'],
    explanation: 'Scharr 固定 3×3 且无 ksize 参数。',
    mistakeReason: '误以为 Scharr 可自定义核大小'
  }),
  q('ch3-l05', 'judge', {
    topic: '精度',
    stem: '在 3×3 小核下 Scharr 比 Sobel 具有更好的梯度精度。',
    answer: ['T'],
    explanation: '优化系数改善旋转对称性。',
    mistakeReason: '不了解 Scharr 的优化目标'
  }),
  q('ch3-l06', 'single', {
    topic: '方向角',
    stem: '计算梯度方向角使用的函数是？',
    options: opts(['A', 'atan2（cartToPolar）'], ['B', 'sqrt'], ['C', 'mean'], ['D', 'threshold']),
    answer: ['A'],
    explanation: 'atan2 由 gx,gy 得到方向，cartToPolar 一次给出。',
    mistakeReason: '未掌握方向角计算方法'
  }),
  q('ch3-l06', 'judge', {
    topic: '极坐标',
    stem: 'cv2.cartToPolar 可同时返回梯度幅值与方向。',
    answer: ['T'],
    explanation: '直角坐标转极坐标，输出幅值和角度。',
    mistakeReason: '不了解 cartToPolar 的两个返回值'
  }),
  q('ch3-l07', 'single', {
    topic: '阶数',
    stem: 'Laplacian 属于第几阶导数算子？',
    options: opts(['A', '一阶'], ['B', '二阶'], ['C', '零阶'], ['D', '三阶']),
    answer: ['B'],
    explanation: 'Laplacian 是两个方向二阶偏导之和。',
    mistakeReason: '未区分一阶与二阶算子'
  }),
  q('ch3-l07', 'judge', {
    topic: '预处理',
    stem: '使用 Laplacian 前通常先做高斯平滑以抑制噪声。',
    answer: ['T'],
    explanation: '二阶导放大噪声，需先平滑。',
    mistakeReason: '忽视二阶导对噪声的放大'
  }),
  q('ch3-l08', 'single', {
    topic: '二值化',
    stem: 'THRESH_BINARY 处理后图像只包含哪两个值？',
    options: opts(['A', '0 和 255'], ['B', '0 和 1'], ['C', '128 和 255'], ['D', '任意两值']),
    answer: ['A'],
    explanation: '超阈值置 maxval=255，否则置 0。',
    mistakeReason: '不理解二值阈值的输出取值'
  }),
  q('ch3-l08', 'param', {
    topic: '门限',
    stem: '其他条件不变，阈值 thresh 增大时保留的边缘像素会？',
    options: opts(['A', '增多'], ['B', '减少'], ['C', '不变'], ['D', '变色']),
    answer: ['B'],
    explanation: '需要更强响应才能超过更高门限。',
    mistakeReason: '不理解阈值高低对边缘数量的影响'
  }),
  q('ch3-l09', 'single', {
    topic: 'Otsu',
    stem: 'Otsu 法通过最大化什么来确定阈值？',
    options: opts(['A', '类间方差'], ['B', '像素总数'], ['C', '均值'], ['D', '核大小']),
    answer: ['A'],
    explanation: '使前景背景两类的类间方差最大。',
    mistakeReason: '未掌握 Otsu 的优化准则'
  }),
  q('ch3-l09', 'judge', {
    topic: '参数',
    stem: '使用 Otsu 时阈值参数传 0，由算法自动确定。',
    answer: ['T'],
    explanation: '返回值 ret 即自动选出的阈值。',
    mistakeReason: '不知道 Otsu 阈值参数写法'
  }),
  q('ch3-l10', 'single', {
    topic: '流程顺序',
    stem: '标准边缘检测管线的正确顺序是？',
    options: opts(['A', '阈值→平滑→梯度'], ['B', '平滑→梯度→幅值→阈值'], ['C', '梯度→平滑→保存'], ['D', '阈值→幅值→平滑']),
    answer: ['B'],
    explanation: '先抗噪再求梯度合成幅值，最后阈值化。',
    mistakeReason: '未掌握管线的先后逻辑'
  }),
  q('ch3-l10', 'judge', {
    topic: '消融',
    stem: '在统一管线上替换不同算子可做消融对比。',
    answer: ['T'],
    explanation: '控制变量替换各环节比较边缘质量。',
    mistakeReason: '不理解管线化对消融实验的意义'
  })
]
