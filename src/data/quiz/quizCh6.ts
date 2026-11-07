import type { QuizQuestion } from '../types'
import { q, opts } from './helpers'

export const quizCh6: QuizQuestion[] = [
  q('ch6-l01', 'single', {
    topic: '预处理',
    stem: '多滤波项目第一步通常是？',
    options: opts(['A', '直接滤波'], ['B', '读图并灰度化'], ['C', '保存'], ['D', '阈值']),
    answer: ['B'],
    explanation: '统一灰度化简化后续滤波。',
    mistakeReason: '跳过灰度化导致输入不统一'
  }),
  q('ch6-l01', 'judge', {
    topic: '命名',
    stem: '多结果输出文件名应带方法标识以免覆盖。',
    answer: ['T'],
    explanation: '如 mean.png、gauss.png 区分结果。',
    mistakeReason: '文件同名互相覆盖'
  }),
  q('ch6-l02', 'single', {
    topic: '网格',
    stem: '遍历核大小与 sigma 组合采用？',
    options: opts(['A', '单语句'], ['B', '嵌套循环'], ['C', 'if'], ['D', '常量']),
    answer: ['B'],
    explanation: '双重循环枚举参数网格。',
    mistakeReason: '不会用嵌套循环组织网格'
  }),
  q('ch6-l02', 'judge', {
    topic: '取值',
    stem: '参数网格中的核大小只放奇数。',
    answer: ['T'],
    explanation: '偶数核会报错。',
    mistakeReason: '网格混入偶数'
  }),
  q('ch6-l03', 'single', {
    topic: '锐化核',
    stem: '经典锐化核的中心权重取值是？',
    options: opts(['A', '1'], ['B', '5'], ['C', '0'], ['D', '-1']),
    answer: ['B'],
    explanation: '中心 5、四邻域 -1 增强对比。',
    mistakeReason: '未记住锐化核权重'
  }),
  q('ch6-l03', 'judge', {
    topic: '权重和',
    stem: '锐化核权重和应保持为 1 以避免亮度漂移。',
    answer: ['T'],
    explanation: '权重和为 1 保持整体亮度。',
    mistakeReason: '忽视权重和导致亮度变化'
  }),
  q('ch6-l04', 'single', {
    topic: '管线',
    stem: '边缘项目的正确顺序是？',
    options: opts(['A', '阈值→平滑→梯度'], ['B', '平滑→梯度→幅值→阈值'], ['C', '幅值→平滑'], ['D', '梯度→保存→阈值']),
    answer: ['B'],
    explanation: '标准管线按抗噪到二值化组织。',
    mistakeReason: '管线顺序错误'
  }),
  q('ch6-l04', 'judge', {
    topic: '阈值',
    stem: '固定阈值不适配时可改用 Otsu 自动阈值。',
    answer: ['T'],
    explanation: 'Otsu 免手工调门限。',
    mistakeReason: '不知道自动阈值替代方案'
  }),
  q('ch6-l05', 'single', {
    topic: '算子阶数',
    stem: 'Laplacian 与 Sobel 的主要区别是？',
    options: opts(['A', '一个二阶一个一阶'], ['B', '完全相同'], ['C', '颜色不同'], ['D', 'Laplacian 无需求和']),
    answer: ['A'],
    explanation: 'Laplacian 为二阶，Sobel 为一阶。',
    mistakeReason: '未区分算子阶数'
  }),
  q('ch6-l05', 'judge', {
    topic: '归一化',
    stem: '多算子对比时应统一归一化尺度再比较。',
    answer: ['T'],
    explanation: '响应尺度不同需统一。',
    mistakeReason: '响应尺度不一致直接比较'
  }),
  q('ch6-l06', 'single', {
    topic: '梯度次数',
    stem: '静态检查要求 x、y 方向各调用一次 Sobel，共几次？',
    options: opts(['A', '1'], ['B', '2'], ['C', '3'], ['D', '0']),
    answer: ['B'],
    explanation: '两个方向分别调用。',
    mistakeReason: '只做一次混合 Sobel'
  }),
  q('ch6-l06', 'judge', {
    topic: '验证边界',
    stem: '实战静态检查只验证结构，并不执行 Python。',
    answer: ['T'],
    explanation: '检查通过不等于运行结果正确。',
    mistakeReason: '把静态检查当成真实执行'
  }),
  q('ch6-l07', 'single', {
    topic: '绘制',
    stem: '把两图与好匹配连线绘制使用的函数是？',
    options: opts(['A', 'drawMatches'], ['B', 'imwrite'], ['C', 'warp'], ['D', 'threshold']),
    answer: ['A'],
    explanation: 'drawMatches 绘制对应连线。',
    mistakeReason: '未记住匹配绘制函数'
  }),
  q('ch6-l07', 'judge', {
    topic: '过滤',
    stem: '匹配连线只绘制比值检验通过的 good 匹配。',
    answer: ['T'],
    explanation: '未过滤连线会杂乱。',
    mistakeReason: '直接绘制全部匹配'
  }),
  q('ch6-l08', 'single', {
    topic: '提取次数',
    stem: '两图特征需要执行几次 detectAndCompute？',
    options: opts(['A', '1'], ['B', '2'], ['C', '3'], ['D', '4']),
    answer: ['B'],
    explanation: '两张图各一次。',
    mistakeReason: '只对一张图提取特征'
  }),
  q('ch6-l08', 'judge', {
    topic: '循环',
    stem: '实战要求保留 for 比值检验循环。',
    answer: ['T'],
    explanation: '循环逐对做比值判断。',
    mistakeReason: '缺少检验循环'
  }),
  q('ch6-l09', 'single', {
    topic: '状态处理',
    stem: 'Stitcher 结果正确的处理方式是？',
    options: opts(['A', '无条件保存'], ['B', '状态码成功后才保存'], ['C', '忽略状态'], ['D', '直接显示']),
    answer: ['B'],
    explanation: 'if status==OK 再保存全景。',
    mistakeReason: '不判断状态直接保存'
  }),
  q('ch6-l09', 'judge', {
    topic: '重叠',
    stem: '拼接实战需保证输入图像有足够重叠。',
    answer: ['T'],
    explanation: '重叠不足会返回错误码。',
    mistakeReason: '忽视重叠条件'
  }),
  q('ch6-l10', 'single', {
    topic: '端到端',
    stem: '端到端项目的合理顺序是？',
    options: opts(['A', '读图→预处理→特征→可视化保存'], ['B', '保存→读图'], ['C', '特征→读图'], ['D', '可视化→预处理']),
    answer: ['A'],
    explanation: '按预处理、特征、交付的顺序组织。',
    mistakeReason: '端到端顺序混乱'
  }),
  q('ch6-l10', 'judge', {
    topic: '类型',
    stem: '端到端管线需注意灰度/彩色与 uint8/float 的切换。',
    answer: ['T'],
    explanation: '类型不匹配会导致错误。',
    mistakeReason: '忽视类型切换'
  })
]
