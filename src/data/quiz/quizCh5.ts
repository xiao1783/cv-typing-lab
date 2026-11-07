import type { QuizQuestion } from '../types'
import { q, opts } from './helpers'

export const quizCh5: QuizQuestion[] = [
  q('ch5-l01', 'single', {
    topic: '距离',
    stem: '两个描述子欧氏距离越小，说明它们？',
    options: opts(['A', '越相似'], ['B', '越无关'], ['C', '维度不同'], ['D', '类型不同']),
    answer: ['A'],
    explanation: 'L2 距离越小特征越接近。',
    mistakeReason: '颠倒距离与相似度关系'
  }),
  q('ch5-l01', 'judge', {
    topic: '度量选择',
    stem: 'ORB 等二进制描述子应使用汉明距离而非 L2。',
    answer: ['T'],
    explanation: '二进制串用 NORM_HAMMING 更合适。',
    mistakeReason: '二进制描述子误用 L2'
  }),
  q('ch5-l02', 'single', {
    topic: '范数',
    stem: '对 SIFT 浮点描述子创建 BFMatcher 应使用？',
    options: opts(['A', 'NORM_HAMMING'], ['B', 'NORM_L2'], ['C', 'NORM_L1'], ['D', 'NORM_INF']),
    answer: ['B'],
    explanation: 'SIFT 用 L2 欧氏距离。',
    mistakeReason: '未按描述子类型选择范数'
  }),
  q('ch5-l02', 'judge', {
    topic: 'match',
    stem: 'BFMatcher.match 为每个查询返回一个最佳匹配。',
    answer: ['T'],
    explanation: 'match 取距离最小者。',
    mistakeReason: '混淆 match 与 knnMatch'
  }),
  q('ch5-l03', 'single', {
    topic: 'knn',
    stem: 'knnMatch(k=2) 为每个查询返回？',
    options: opts(['A', '1 个匹配'], ['B', '2 个近邻'], ['C', '2 个查询'], ['D', '2 张图像']),
    answer: ['B'],
    explanation: '返回最佳与次佳两个近邻。',
    mistakeReason: '不理解 k 的含义'
  }),
  q('ch5-l03', 'judge', {
    topic: '防御',
    stem: '使用 knn 结果前应检查每组长度是否为 2。',
    answer: ['T'],
    explanation: '描述子不足时该组长度可能小于 2。',
    mistakeReason: '未做长度检查导致越界'
  }),
  q('ch5-l04', 'single', {
    topic: 'FLANN',
    stem: 'FLANN 相比暴力匹配的主要优势是？',
    options: opts(['A', '大规模高维下更快'], ['B', '永远更准确'], ['C', '不需要参数'], ['D', '占用内存为零']),
    answer: ['A'],
    explanation: '近似索引加速最近邻搜索。',
    mistakeReason: '不了解 FLANN 的加速定位'
  }),
  q('ch5-l04', 'judge', {
    topic: '近似',
    stem: 'FLANN 是近似搜索，可能牺牲少量匹配精度。',
    answer: ['T'],
    explanation: '速度与精度需要权衡。',
    mistakeReason: '误以为 FLANN 是精确匹配'
  }),
  q('ch5-l05', 'single', {
    topic: '比值阈值',
    stem: 'Lowe 比值检验常用的阈值 rho 是？',
    options: opts(['A', '0.25'], ['B', '0.75'], ['C', '1.0'], ['D', '0.5']),
    answer: ['B'],
    explanation: '最佳/次佳距离比小于 0.75 才保留。',
    mistakeReason: '未记住经典比值阈值'
  }),
  q('ch5-l05', 'judge', {
    topic: '重复纹理',
    stem: '比值检验用于剔除重复纹理区域的模糊匹配。',
    answer: ['T'],
    explanation: '最佳次佳接近时区分度低，应剔除。',
    mistakeReason: '不理解比值检验针对的场景'
  }),
  q('ch5-l06', 'single', {
    topic: '单应性',
    stem: 'findHomography 求解的单应性矩阵尺寸是？',
    options: opts(['A', '2×2'], ['B', '3×3'], ['C', '3×4'], ['D', '1×3']),
    answer: ['B'],
    explanation: 'H 是描述平面投影的 3×3 矩阵。',
    mistakeReason: '未记住单应性矩阵尺寸'
  }),
  q('ch5-l06', 'judge', {
    topic: '最少点',
    stem: '求解单应性矩阵至少需要 4 对对应点。',
    answer: ['T'],
    explanation: '8 个自由度由 4 对点确定。',
    mistakeReason: '不知道单应性的最少对应点'
  }),
  q('ch5-l07', 'single', {
    topic: 'RANSAC',
    stem: 'RANSAC 在多轮迭代后如何选择模型？',
    options: opts(['A', '随机选一个'], ['B', '内点最多的模型'], ['C', '参数最少的'], ['D', '最先拟合的']),
    answer: ['B'],
    explanation: '内点最多即数据支持度最高。',
    mistakeReason: '不理解 RANSAC 的选择准则'
  }),
  q('ch5-l07', 'judge', {
    topic: '鲁棒',
    stem: 'RANSAC 能在含大量误匹配（外点）时稳健估计。',
    answer: ['T'],
    explanation: '外点不参与最终模型拟合。',
    mistakeReason: '不了解 RANSAC 的抗外点能力'
  }),
  q('ch5-l08', 'single', {
    topic: 'dsize',
    stem: 'warpPerspective 的 dsize 参数顺序是？',
    options: opts(['A', '(高, 宽)'], ['B', '(宽, 高)'], ['C', '(通道, 宽)'], ['D', '任意']),
    answer: ['B'],
    explanation: '输出尺寸按 (宽, 高) 给定。',
    mistakeReason: 'dsize 宽高顺序写反'
  }),
  q('ch5-l08', 'judge', {
    topic: '对应点',
    stem: 'getPerspectiveTransform 由 4 对点计算透视矩阵。',
    answer: ['T'],
    explanation: '四点确定透视变换。',
    mistakeReason: '不知道透视变换的点数要求'
  }),
  q('ch5-l09', 'single', {
    topic: '状态码',
    stem: 'Stitcher 拼接成功对应的状态码是？',
    options: opts(['A', 'Stitcher_OK（0）'], ['B', '1'], ['C', '-1'], ['D', '255']),
    answer: ['A'],
    explanation: '状态码 0 表示成功，其余为错误码。',
    mistakeReason: '未掌握 Stitcher 状态码'
  }),
  q('ch5-l09', 'judge', {
    topic: '重叠',
    stem: 'Stitcher 要求相邻图像具有足够重叠区域。',
    answer: ['T'],
    explanation: '通常需要约 25%-40% 重叠。',
    mistakeReason: '忽视图像重叠要求'
  }),
  q('ch5-l10', 'single', {
    topic: '综合',
    stem: '综合匹配任务中比值检验的阈值取？',
    options: opts(['A', '0.75'], ['B', '0.25'], ['C', '1.5'], ['D', '0']),
    answer: ['A'],
    explanation: '与 Lowe 经典阈值一致。',
    mistakeReason: '综合任务阈值用错'
  }),
  q('ch5-l10', 'judge', {
    topic: '防御',
    stem: '综合管线保留 len(pair)==2 的长度检查。',
    answer: ['T'],
    explanation: '防御性条件避免解包错误。',
    mistakeReason: '省略长度检查'
  })
]
