import type { Chapter } from '../types'
import { knowledge, lv } from './helpers'

export const ch6: Chapter = {
  id: 'ch6',
  index: 6,
  title: '综合编程实践',
  subtitle: '把滤波、边缘、特征与拼接整合为完整可运行项目',
  intro:
    '本章是课程的收官。你将不再练习孤立函数，而是完成从读图、预处理、滤波/边缘/特征提取到匹配拼接的完整 Python 项目，训练工程化组织代码与多步骤管线的能力。',
  objectives: [
    '能独立编写完整的滤波与边缘检测管线',
    '能组织特征匹配与图像拼接的多步骤项目',
    '能在实战模式下通过结构化检查并理解其验证边界',
    '形成可迁移到真实 CV 项目的工程习惯'
  ],
  icon: 'Tools',
  levels: [
    lv('ch6', 1, '完整图像滤波流程', {
      difficulty: '进阶',
      estMinutes: 13,
      code: `import cv2
import numpy as np

img = cv2.imread("lena.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
mean = cv2.blur(gray, (5, 5))
gauss = cv2.GaussianBlur(gray, (5, 5), 1.2)
median = cv2.medianBlur(gray, 5)
cv2.imwrite("mean.png", mean)
cv2.imwrite("gauss.png", gauss)
cv2.imwrite("median.png", median)`,
      task: '跟打完整滤波项目：灰度化后三种滤波并行处理并保存。',
      tags: ['综合', '滤波'],
      labExperiment: 'gaussian',
      know: knowledge({
        overview:
          '本项目把灰度化与三种代表性滤波器组织成一个可运行脚本，输出三张结果图，体现同一输入下不同滤波策略的差异。',
        lineExplanations: [
          { code: 'cvtColor 灰度化', explain: '统一单通道输入，简化后续处理' },
          { code: 'blur/GaussianBlur/medianBlur', explain: '均值、高斯、中值三种并行结果' },
          { code: 'imwrite 三张图', explain: '分别保存用于横向对比' }
        ],
        pythonNotes: [],
        apiDocs: [],
        flow: ['读图', '灰度化', '三种滤波', '保存对比'],
        scenarios: ['课程综合实验', '滤波方案选型'],
        research: ['可进一步用 PSNR/SSIM 在加噪图上定量比较'],
        pitfalls: [
          { problem: '在彩色图上直接中值/均值参数混乱', fix: '先统一灰度化再处理' },
          { problem: '输出文件覆盖难以区分', fix: '文件名带方法标识' }
        ],
        related: ['ch6-l02', 'ch6-l03']
      })
    }),
    lv('ch6', 2, '多滤波器参数网格对比', {
      difficulty: '挑战',
      estMinutes: 14,
      code: `import cv2

img = cv2.imread("lena.jpg", 0)
for k in (3, 5, 7):
    for s in (0.5, 1.5):
        dst = cv2.GaussianBlur(img, (k, k), sigmaX=s)
        print(f"ksize={k}, sigma={s}, mean={dst.mean():.1f}")`,
      task: '跟打嵌套循环网格，系统遍历核大小与 sigma 组合。',
      tags: ['网格试验', '嵌套循环'],
      know: knowledge({
        overview:
          '嵌套循环构成参数网格，对每种 ksize×sigma 组合执行滤波并记录均值，是工程化超参数试验的标准写法。',
        lineExplanations: [
          { code: 'for k ... for s ...', explain: '双重循环枚举参数组合' },
          { code: 'print(f...)', explain: '记录每组参数与输出指标' }
        ],
        pythonNotes: ['嵌套循环通过缩进体现层级'],
        apiDocs: [],
        flow: ['确定参数维度', '网格枚举', '执行并记录指标'],
        scenarios: ['消融实验', '参数敏感性分析'],
        research: ['网格搜索思想可迁移到模型超参数调优'],
        pitfalls: [
          { problem: '核大小含偶数报错', fix: '网格只放奇数' },
          { problem: '输出太多难以分析', fix: '把结果写入表格或列表后统一分析' }
        ],
        related: ['ch6-l01']
      })
    }),
    lv('ch6', 3, '自定义滤波管线', {
      mode: 'blank',
      difficulty: '挑战',
      estMinutes: 13,
      code: `import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], dtype=np.float32)
sharp = cv2.filter2D(img, cv2.CV_8U, kernel)
cv2.imwrite("sharp.png", sharp)
print("锐化结果:", sharp.shape)`,
      task: '跟打自定义锐化核（中心 5、四周 -1）并通过 filter2D 应用。',
      tags: ['锐化', '自定义核'],
      labExperiment: 'conv',
      blank: {
        template: 'sharp = cv2.{{1}}(img, cv2.CV_8U, {{2}})',
        answers: [['filter2D'], ['kernel']],
        hints: ['通用卷积函数', '上面定义的核变量名'],
        analysis: ['锐化核中心权重 5、四邻域 -1，权重和为 1，增强边缘对比']
      },
      know: knowledge({
        overview:
          '通过自定义卷积核实现锐化：中心权重大于 1、邻域为负，突出像素与邻域差异，增强边缘与细节。filter2D 统一应用任意核。',
        lineExplanations: [
          { code: '中心 5、四周 -1', explain: '经典锐化核，权重和为 1 保持整体亮度' },
          { code: 'filter2D 应用', explain: '与均值/高斯使用同一卷积接口' }
        ],
        pythonNotes: [],
        apiDocs: [],
        formulas: [{ title: '锐化思想', latex: 'I_{sharp}=I+\\alpha(I-I_{blur})' }],
        flow: ['设计核', 'filter2D 卷积', '保存锐化结果'],
        scenarios: ['细节增强', '打印/显示前的清晰度提升'],
        research: ['反锐化掩膜（unsharp mask）是常用增强手段'],
        pitfalls: [
          { problem: '核权重和不为 1 亮度漂移', fix: '检查权重和' },
          { problem: '过度锐化产生光晕', fix: '减小中心与邻域反差' }
        ],
        related: ['ch6-l01']
      })
    }),
    lv('ch6', 4, '边缘检测完整流程', {
      difficulty: '进阶',
      estMinutes: 13,
      code: `import cv2

img = cv2.imread("lena.jpg", 0)
blur = cv2.GaussianBlur(img, (3, 3), 1.0)
sx = cv2.Sobel(blur, cv2.CV_64F, 1, 0)
sy = cv2.Sobel(blur, cv2.CV_64F, 0, 1)
mag = cv2.convertScaleAbs(cv2.magnitude(sx, sy))
_, edges = cv2.threshold(mag, 50, 255, cv2.THRESH_BINARY)
cv2.imwrite("edge_pipeline.png", edges)`,
      task: '跟打完整边缘管线，注意每一步的输入输出类型。',
      tags: ['综合', '边缘检测'],
      labExperiment: 'sobel',
      know: knowledge({
        overview:
          '完整边缘项目串联平滑、双向 Sobel、幅值合成与阈值化，是工业检测与特征提取中常见的预处理管线。',
        lineExplanations: [
          { code: 'GaussianBlur', explain: '抗噪第一步' },
          { code: 'magnitude + convertScaleAbs', explain: '合成强度并转 uint8' },
          { code: 'threshold', explain: '二值化输出干净边缘' }
        ],
        pythonNotes: [],
        apiDocs: [],
        flow: ['平滑', '梯度', '幅值', '阈值', '保存'],
        scenarios: ['缺陷检测预处理', '结构提取'],
        research: ['替换各环节算子可做完整消融研究'],
        pitfalls: [
          { problem: '跳过平滑噪声多', fix: '保留 GaussianBlur' },
          { problem: '固定阈值不适配', fix: '可换 Otsu' }
        ],
        related: ['ch6-l05', 'ch6-l06']
      })
    }),
    lv('ch6', 5, '多算子边缘对比项目', {
      difficulty: '挑战',
      estMinutes: 14,
      code: `import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
blur = cv2.GaussianBlur(img, (3, 3), 0)
sobel = cv2.convertScaleAbs(cv2.Sobel(blur, cv2.CV_64F, 1, 1))
lap = cv2.convertScaleAbs(cv2.Laplacian(blur, cv2.CV_64F))
scharr = cv2.convertScaleAbs(cv2.Scharr(blur, cv2.CV_64F, 1, 0))
for name, out in (("sobel", sobel), ("lap", lap), ("scharr", scharr)):
    cv2.imwrite(name + ".png", out)`,
      task: '跟打多算子对比，循环保存 Sobel、Laplacian、Scharr 结果。',
      tags: ['算子对比', '边缘'],
      know: knowledge({
        overview:
          '同一输入分别用一阶 Sobel、Scharr 与二阶 Laplacian 处理，循环保存，便于比较不同阶数算子的边缘表现。',
        lineExplanations: [
          { code: '三个算子', explain: '不同阶数/权重的边缘响应' },
          { code: 'for name, out in tuple', explain: '元组循环批量保存' }
        ],
        pythonNotes: ['for name, out in (..) 同时解包两个变量'],
        apiDocs: [],
        flow: ['统一平滑输入', '分别计算', '批量保存'],
        scenarios: ['算子选型', '教学对比'],
        research: ['多算子对比有助于理解一阶/二阶方法差异'],
        pitfalls: [
          { problem: '响应尺度不同难以直接比较', fix: '统一归一化或分别调阈值' },
          { problem: '字符串拼接路径易错', fix: '用 name + ".png" 规范命名' }
        ],
        related: ['ch6-l04']
      })
    }),
    lv('ch6', 6, '边缘检测实战任务', {
      mode: 'challenge',
      difficulty: '挑战',
      estMinutes: 16,
      code: `import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
blur = cv2.GaussianBlur(img, (5, 5), 0)
gx = cv2.Sobel(blur, cv2.CV_64F, 1, 0)
gy = cv2.Sobel(blur, cv2.CV_64F, 0, 1)
edges = cv2.magnitude(gx, gy)
_, binary = cv2.threshold(cv2.convertScaleAbs(edges), 60, 255, cv2.THRESH_BINARY)
cv2.imwrite("final_edges.png", binary)`,
      task: '实战：独立组织平滑、Sobel、幅值与阈值，输出二值边缘。',
      tags: ['实战', '边缘检测'],
      validators: [
        { type: 'function_call', name: 'cv2.GaussianBlur', description: '先做高斯平滑抗噪' },
        { type: 'function_call', name: 'cv2.Sobel', description: '计算 x、y 方向梯度' },
        { type: 'structure_count', name: 'cv2.Sobel', min: 2, description: '分别求两个方向梯度' },
        { type: 'function_call', name: 'cv2.threshold', description: '阈值化得到二值边缘' },
        { type: 'function_call', name: 'cv2.imwrite', description: '保存最终边缘图' }
      ],
      labExperiment: 'sobel',
      know: knowledge({
        overview:
          '实战要求独立复现边缘管线，静态检查器会核对关键函数调用与方向次数，帮助确认结构完整，但不会执行代码。',
        lineExplanations: [
          { code: '两次 Sobel', explain: '检查器要求 x、y 各一次' },
          { code: 'threshold + imwrite', explain: '二值化并保存' }
        ],
        pythonNotes: ['静态检查不运行 Python，仅验证结构与调用'],
        apiDocs: [],
        flow: ['平滑', '双向梯度', '幅值', '阈值', '保存'],
        scenarios: ['独立工程练习', '检测管线模板'],
        research: ['该模板可直接迁移到真实检测项目'],
        pitfalls: [
          { problem: '只做一次混合 Sobel', fix: '检查器要求两个方向分别调用' },
          { problem: '误以为检查通过等于结果正确', fix: '静态检查只保证结构，效果需在实验室验证' }
        ],
        related: ['ch6-l04', 'ch6-l05']
      })
    }),
    lv('ch6', 7, '特征匹配完整流程', {
      difficulty: '挑战',
      estMinutes: 15,
      code: `import cv2

img1 = cv2.imread("a.png", 0)
img2 = cv2.imread("b.png", 0)
sift = cv2.SIFT_create()
kp1, d1 = sift.detectAndCompute(img1, None)
kp2, d2 = sift.detectAndCompute(img2, None)
good = []
for pair in cv2.BFMatcher().knnMatch(d1, d2, k=2):
    if len(pair) == 2 and pair[0].distance < 0.7 * pair[1].distance:
        good.append(pair[0])
out = cv2.drawMatches(img1, kp1, img2, kp2, good, None)
cv2.imwrite("matches.png", out)`,
      task: '跟打完整匹配项目并 drawMatches 绘制连线。',
      tags: ['综合', '特征匹配'],
      labExperiment: 'match',
      know: knowledge({
        overview:
          '完整匹配项目从特征提取到比值检验，再用 drawMatches 绘制对应连线，输出可直接用于报告的匹配图。',
        lineExplanations: [
          { code: 'knnMatch + 比值检验', explain: '净化匹配' },
          { code: 'drawMatches', explain: '把两图与好匹配连线绘制到一起' }
        ],
        pythonNotes: [],
        apiDocs: [
          {
            name: 'cv2.drawMatches',
            signature: 'cv2.drawMatches(img1, kp1, img2, kp2, matches1to2, outImg, flags=0)',
            params: [
              { name: 'matches1to2', type: 'DMatch[]', desc: '要绘制的好匹配列表' }
            ]
          }
        ],
        flow: ['特征', '匹配', '比值检验', '绘制保存'],
        scenarios: ['目标识别', '拼接前验证'],
        research: ['匹配连线图是评估特征质量的直观证据'],
        pitfalls: [
          { problem: '好匹配过少 drawMatches 空', fix: '放宽比值阈值或改善图像' },
          { problem: '不过滤直接画连线杂乱', fix: '只画 good 匹配' }
        ],
        related: ['ch6-l08']
      })
    }),
    lv('ch6', 8, '特征匹配实战任务', {
      mode: 'challenge',
      difficulty: '挑战',
      estMinutes: 17,
      code: `import cv2

sift = cv2.SIFT_create()
kp1, d1 = sift.detectAndCompute(img1, None)
kp2, d2 = sift.detectAndCompute(img2, None)
matcher = cv2.BFMatcher()
good = []
for pair in matcher.knnMatch(d1, d2, k=2):
    if len(pair) == 2 and pair[0].distance < 0.75 * pair[1].distance:
        good.append(pair[0])
print("好匹配:", len(good))`,
      task: '实战：独立完成 SIFT 提取、BFMatcher 与比值检验。',
      tags: ['实战', '匹配'],
      validators: [
        { type: 'function_call', name: 'detectAndCompute', description: '两图检测并计算描述子' },
        { type: 'structure_count', name: 'detectAndCompute', min: 2, description: '两张图各执行一次' },
        { type: 'function_call', name: 'cv2.BFMatcher', description: '创建暴力匹配器' },
        { type: 'function_call', name: 'knnMatch', description: 'k=2 最近邻匹配' },
        { type: 'keyword', name: 'for', description: '遍历匹配对做比值检验' }
      ],
      labExperiment: 'match',
      know: knowledge({
        overview: '实战检查器核对特征提取次数、匹配器与比值检验循环，确认匹配管线结构完整。',
        lineExplanations: [
          { code: '两次 detectAndCompute', explain: '检查器要求两图各一次' },
          { code: 'knnMatch + for', explain: '最近邻与比值检验' }
        ],
        pythonNotes: [],
        apiDocs: [],
        flow: ['提取', '匹配', '检验', '输出'],
        scenarios: ['独立匹配项目', '拼接前置步骤'],
        research: ['结构完整是几何估计成功的前提'],
        pitfalls: [
          { problem: '只提取一次', fix: '两张图都要 detectAndCompute' },
          { problem: '缺少检验循环', fix: '保留 for 比值检验' }
        ],
        related: ['ch6-l07', 'ch6-l09']
      })
    }),
    lv('ch6', 9, '图像拼接实战任务', {
      mode: 'challenge',
      difficulty: '挑战',
      estMinutes: 18,
      code: `import cv2

img1 = cv2.imread("left.jpg")
img2 = cv2.imread("right.jpg")
stitcher = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)
status, pano = stitcher.stitch([img1, img2])
if status == cv2.Stitcher_OK:
    cv2.imwrite("panorama.png", pano)
print("状态:", status)`,
      task: '实战：用 Stitcher 完成两图拼接并按状态码处理结果。',
      tags: ['实战', '拼接'],
      validators: [
        { type: 'function_call', name: 'cv2.Stitcher_create', description: '创建拼接器' },
        { type: 'function_call', name: 'stitch', description: '执行拼接' },
        { type: 'keyword', name: 'if', description: '根据状态码判断是否成功' },
        { type: 'function_call', name: 'cv2.imwrite', description: '成功后保存全景图' }
      ],
      labExperiment: 'stitch',
      know: knowledge({
        overview: '拼接实战要求正确创建 Stitcher、执行 stitch 并依据状态码条件处理，成功才保存。',
        lineExplanations: [
          { code: 'Stitcher_create', explain: '全景模式' },
          { code: 'if status == OK', explain: '状态判断后保存' }
        ],
        pythonNotes: [],
        apiDocs: [],
        flow: ['读图', '创建拼接器', 'stitch', '状态判断', '保存'],
        scenarios: ['全景拼接', '视野扩展'],
        research: ['状态码处理是健壮工程代码的基本要求'],
        pitfalls: [
          { problem: '不判断状态直接保存', fix: '保留 if 判断' },
          { problem: '重叠不足失败', fix: '保证足够重叠区域' }
        ],
        related: ['ch6-l10']
      })
    }),
    lv('ch6', 10, '端到端 CV 综合项目', {
      mode: 'challenge',
      difficulty: '挑战',
      estMinutes: 20,
      code: `import cv2
import numpy as np

img = cv2.imread("scene.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
blur = cv2.GaussianBlur(gray, (3, 3), 1.0)
sift = cv2.SIFT_create()
kp, desc = sift.detectAndCompute(blur, None)
vis = cv2.drawKeypoints(img, kp, None, flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
cv2.imwrite("e2e_keypoints.png", vis)
print("关键点:", len(kp), "描述子:", desc.shape)`,
      task: '终极实战：组织读图→灰度→平滑→SIFT→可视化的端到端项目。',
      tags: ['终极实战', '端到端'],
      validators: [
        { type: 'import', module: 'cv2', description: '导入 OpenCV' },
        { type: 'import', module: 'numpy', description: '导入 NumPy' },
        { type: 'function_call', name: 'cv2.cvtColor', description: '颜色空间转换' },
        { type: 'function_call', name: 'cv2.GaussianBlur', description: '高斯平滑' },
        { type: 'function_call', name: 'cv2.SIFT_create', description: '创建 SIFT' },
        { type: 'function_call', name: 'detectAndCompute', description: '检测关键点并计算描述子' },
        { type: 'function_call', name: 'cv2.drawKeypoints', description: '可视化关键点' },
        { type: 'function_call', name: 'cv2.imwrite', description: '保存项目成果' }
      ],
      labExperiment: 'sift',
      know: knowledge({
        overview:
          '终极项目把前六章核心技能整合为一条端到端管线，覆盖颜色、平滑、特征与可视化，是可迁移到真实科研与工程的项目骨架。',
        lineExplanations: [
          { code: 'cvtColor + GaussianBlur', explain: '预处理' },
          { code: 'SIFT_create + detectAndCompute', explain: '特征提取核心' },
          { code: 'drawKeypoints + imwrite', explain: '可视化交付' }
        ],
        pythonNotes: ['完成本项目即打通本平台核心学习闭环'],
        apiDocs: [],
        flow: ['读图', '预处理', '特征提取', '可视化', '保存'],
        scenarios: ['课程毕业设计', '真实项目脚手架'],
        research: ['可在此骨架上扩展匹配、拼接与定量评估'],
        pitfalls: [
          { problem: '管线步骤顺序混乱', fix: '按预处理→特征→交付的顺序组织' },
          { problem: '类型不匹配', fix: '注意灰度/彩色与 uint8/float 的切换' }
        ],
        related: ['ch6-l06', 'ch6-l08']
      })
    })
  ]
}
