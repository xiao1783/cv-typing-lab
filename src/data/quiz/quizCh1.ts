import type { QuizQuestion } from '../types'
import { q, opts } from './helpers'

export const quizCh1: QuizQuestion[] = [
  q('ch1-l01', 'single', {
    topic: '模块导入',
    stem: 'OpenCV 在 Python 中导入时使用的模块名是？',
    options: opts(['A', 'opencv'], ['B', 'cv2'], ['C', 'cv'], ['D', 'opencv-python']),
    answer: ['B'],
    explanation: 'OpenCV 的 Python 绑定模块名为 cv2，写 import cv2。',
    mistakeReason: '混淆了 pip 包名 opencv-python 与导入模块名 cv2'
  }),
  q('ch1-l01', 'judge', {
    topic: '别名惯例',
    stem: 'NumPy 按社区惯例使用别名 np，即 import numpy as np。',
    answer: ['T'],
    explanation: 'np 是 NumPy 的通用约定，可简化调用。',
    mistakeReason: '不了解 NumPy 的标准别名约定'
  }),
  q('ch1-l02', 'single', {
    topic: 'imread 行为',
    stem: 'cv2.imread 读取不存在的文件时，返回结果是？',
    options: opts(['A', '抛出异常'], ['B', '返回空数组'], ['C', '返回 None'], ['D', '程序退出']),
    answer: ['C'],
    explanation: 'imread 失败不抛异常，而是返回 None，需要手动判空。',
    mistakeReason: '误以为 imread 会自动抛出文件异常'
  }),
  q('ch1-l02', 'param', {
    topic: '读取标志',
    stem: 'imread 默认读取方式 flags 对应下列哪个常量？',
    options: opts(['A', 'IMREAD_GRAYSCALE'], ['B', 'IMREAD_UNCHANGED'], ['C', 'IMREAD_COLOR'], ['D', 'IMREAD_IGNORE_ORIENTATION']),
    answer: ['C'],
    explanation: '默认 IMREAD_COLOR 以 BGR 三通道读取并忽略 alpha。',
    mistakeReason: '未掌握 imread 的默认读取标志'
  }),
  q('ch1-l03', 'single', {
    topic: 'shape 顺序',
    stem: '彩色图像数组 img.shape 返回元组的正确顺序是？',
    options: opts(['A', '(宽, 高, 通道)'], ['B', '(高, 宽, 通道)'], ['C', '(通道, 高, 宽)'], ['D', '(高, 通道, 宽)']),
    answer: ['B'],
    explanation: '数组以行优先，shape 为 (H 高, W 宽, C 通道)。',
    mistakeReason: '混淆了数组行列与图像宽高顺序'
  }),
  q('ch1-l03', 'judge', {
    topic: '维度',
    stem: '灰度图像只有两个轴，因此 ndim 等于 2。',
    answer: ['T'],
    explanation: '灰度图形状 (H,W)，是二维数组。',
    mistakeReason: '未区分灰度与彩色图像的维度'
  }),
  q('ch1-l04', 'single', {
    topic: '通道顺序',
    stem: 'OpenCV 默认彩色图像的通道排列顺序是？',
    options: opts(['A', 'RGB'], ['B', 'RGBA'], ['C', 'BGR'], ['D', 'YCrCb']),
    answer: ['C'],
    explanation: 'OpenCV 历史上采用 BGR 顺序，与 Matplotlib 的 RGB 相反。',
    mistakeReason: '把 OpenCV 通道顺序误认为通用 RGB'
  }),
  q('ch1-l04', 'codeBlank', {
    topic: '转换码',
    stem: '补全：gray = cv2.cvtColor(img, cv2.____)',
    code: 'gray = cv2.cvtColor(img, cv2.{{}})',
    answer: ['COLOR_BGR2GRAY'],
    acceptable: ['COLOR_BGR2GRAY'],
    explanation: 'BGR 转灰度使用 COLOR_BGR2GRAY 转换码。',
    mistakeReason: '未记住灰度化转换常量名'
  }),
  q('ch1-l05', 'single', {
    topic: '数据类型',
    stem: '用于显示的图像数组通常采用哪种数据类型？',
    options: opts(['A', 'np.float32'], ['B', 'np.uint8'], ['C', 'np.int16'], ['D', 'np.bool_']),
    answer: ['B'],
    explanation: '像素 0-255 对应 8 位无符号整数 uint8。',
    mistakeReason: '不理解图像像素与 uint8 的对应关系'
  }),
  q('ch1-l05', 'judge', {
    topic: '数组创建',
    stem: 'np.ones((H,W,3), dtype=np.uint8) * 255 可得到一张白色图像。',
    answer: ['T'],
    explanation: '全 1 乘 255 后所有像素为最大值即白色。',
    mistakeReason: '不理解 NumPy 广播与像素最大值含义'
  }),
  q('ch1-l06', 'single', {
    topic: '像素索引',
    stem: '表达式 img[100, 200] 中第一个索引 100 表示？',
    options: opts(['A', '第 100 列 x'], ['B', '第 100 行 y'], ['C', '通道号'], ['D', '像素值']),
    answer: ['B'],
    explanation: '第一索引是行号（y 坐标），第二索引才是列号（x）。',
    mistakeReason: '把数组行列索引与图像 x,y 坐标顺序颠倒'
  }),
  q('ch1-l06', 'judge', {
    topic: '切片视图',
    stem: '通过 img[y1:y2, x1:x2] 得到的 ROI 默认是原数组的视图，修改会影响原图。',
    answer: ['T'],
    explanation: 'NumPy 切片默认返回视图而非副本，需要独立副本用 .copy()。',
    mistakeReason: '不了解 NumPy 切片的视图语义'
  }),
  q('ch1-l07', 'single', {
    topic: '归一化',
    stem: '把 uint8 图像除以 255 做归一化后，像素取值范围是？',
    options: opts(['A', '[0, 255]'], ['B', '[-1, 1]'], ['C', '[0, 1]'], ['D', '[0, 100]']),
    answer: ['C'],
    explanation: '除以 255 把线性映射到 [0,1]。',
    mistakeReason: '未掌握图像线性归一化的目标区间'
  }),
  q('ch1-l07', 'judge', {
    topic: '溢出',
    stem: 'uint8 类型直接做减法，负值会发生溢出而不是保留负数。',
    answer: ['T'],
    explanation: 'uint8 无符号，运算前应转浮点以保留负数。',
    mistakeReason: '忽视了无符号整数的溢出问题'
  }),
  q('ch1-l08', 'single', {
    topic: '卷积填充',
    stem: '要让卷积输出与输入尺寸相同（same），需要在边界进行？',
    options: opts(['A', '裁剪'], ['B', '填充 padding'], ['C', '缩放'], ['D', '二值化']),
    answer: ['B'],
    explanation: '通过 np.pad 填充边界，保证输出尺寸不变。',
    mistakeReason: '不理解卷积尺寸收缩与填充的关系'
  }),
  q('ch1-l08', 'codeBlank', {
    topic: '卷积运算',
    stem: '补全卷积核心：out[i,j] = np.sum(region * ____)',
    answer: ['kernel'],
    acceptable: ['kernel', 'K'],
    explanation: '邻域与卷积核逐元素相乘再求和。',
    mistakeReason: '未理解卷积的乘加对象是卷积核'
  }),
  q('ch1-l09', 'param', {
    topic: '核归一化',
    stem: '构造 3×3 均值核时，np.ones((3,3)) 应除以多少？',
    options: opts(['A', '3'], ['B', '6'], ['C', '9'], ['D', '255']),
    answer: ['C'],
    explanation: '3×3 共 9 个元素，除以 9 使权重和为 1。',
    mistakeReason: '未按核元素个数进行归一化'
  }),
  q('ch1-l09', 'single', {
    topic: '输出深度',
    stem: '卷积结果需要保留负值时，ddepth 应选择？',
    options: opts(['A', 'cv2.CV_8U'], ['B', 'cv2.CV_64F'], ['C', 'cv2.CV_32S'], ['D', '-1']),
    answer: ['B'],
    explanation: 'CV_64F 为 64 位浮点，可保存负数与小数。',
    mistakeReason: '不理解位深与负值保存的关系'
  }),
  q('ch1-l10', 'single', {
    topic: 'waitKey',
    stem: 'cv2.waitKey(0) 中参数 0 的含义是？',
    options: opts(['A', '不等待'], ['B', '等待 0 毫秒'], ['C', '无限等待直到按键'], ['D', '立即关闭窗口']),
    answer: ['C'],
    explanation: 'delay=0 表示无限等待，否则窗口无响应。',
    mistakeReason: '未掌握 waitKey 的延时语义'
  }),
  q('ch1-l10', 'judge', {
    topic: 'imwrite',
    stem: 'cv2.imwrite 会根据文件扩展名选择编码格式。',
    answer: ['T'],
    explanation: '如 .png 用 PNG 编码，.jpg 用 JPEG 编码。',
    mistakeReason: '不了解 imwrite 与扩展名的关系'
  })
]
