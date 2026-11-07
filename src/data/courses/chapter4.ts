import type { Chapter } from '../types'
import { knowledge, lv } from './helpers'

export const ch4: Chapter = {
  id: 'ch4',
  index: 4,
  title: 'SIFT与多尺度特征',
  subtitle: '尺度空间、DoG 极值、主方向与 128 维描述子',
  intro:
    'SIFT（尺度不变特征变换）能在不同尺度、旋转和光照下提取稳定的局部特征。本章从高斯尺度空间与 DoG 出发，讲解关键点检测、主方向分配与 128 维描述子的生成，并掌握 OpenCV 中的 SIFT API。',
  objectives: [
    '理解高斯尺度空间与 DoG 的构建',
    '理解极值点检测、精确定位与主方向分配',
    '掌握 128 维描述子的结构与含义',
    '熟练使用 SIFT_create / detectAndCompute / drawKeypoints'
  ],
  icon: 'View',
  levels: [
    lv('ch4', 1, '高斯尺度空间', {
      difficulty: '进阶',
      estMinutes: 11,
      code: `import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
scales = []
for sigma in (1.0, 1.6, 2.5, 4.0):
    blurred = cv2.GaussianBlur(img, (0, 0), sigmaX=sigma)
    scales.append(blurred)
print("尺度图像数量:", len(scales))
print("每个尺度形状:", scales[0].shape)`,
      task: '跟打尺度空间构建，不同 sigma 对应不同观测尺度。',
      tags: ['尺度空间', '高斯'],
      know: knowledge({
        overview:
          '尺度空间理论认为物体描述应在多个尺度上进行。对同一图像用递增标准差的高斯核模糊，得到一组尺度图像，使特征不依赖于物体的绝对大小。',
        lineExplanations: [
          { code: 'for sigma in (1.0,1.6,2.5,4.0):', explain: '递增标准差，构造由细到粗的尺度' },
          { code: 'GaussianBlur(...,sigmaX=sigma)', explain: '线性高斯模糊是尺度空间的标准生成算子' }
        ],
        pythonNotes: ['scales.append 把结果加入列表'],
        apiDocs: [],
        formulas: [{ title: '高斯尺度空间', latex: 'L(x,y,\\sigma)=G(x,y,\\sigma)*I(x,y)' }],
        flow: ['选择基准图像', '递增 sigma 高斯模糊', '形成尺度序列（octave）'],
        scenarios: ['多尺度特征提取', '不同大小目标检测'],
        research: ['尺度空间是 SIFT、SURF 及多尺度 CNN 的理论源头'],
        pitfalls: [
          { problem: 'sigma 增长无规律导致尺度不连续', fix: '按固定倍数（如 k=2^(1/s)）组织尺度' },
          { problem: '只在单一尺度找特征', fix: '大目标与小目标需要跨尺度检测' }
        ],
        related: ['ch4-l02', 'ch2-l04']
      })
    }),
    lv('ch4', 2, '高斯差分 DoG', {
      difficulty: '进阶',
      estMinutes: 11,
      code: `import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
a = cv2.GaussianBlur(img, (0, 0), 1.0)
b = cv2.GaussianBlur(img, (0, 0), 1.6)
dog = cv2.subtract(b.astype(np.float32), a.astype(np.float32))
print("DoG 范围:", dog.min(), dog.max())
print("DoG 形状:", dog.shape)`,
      task: '跟打相邻尺度相减得到 DoG，理解它是 LoG 的高效近似。',
      tags: ['DoG', '尺度'],
      know: knowledge({
        overview:
          'DoG（Difference of Gaussians）将相邻两个尺度的高斯模糊图像相减，近似归一化拉普拉斯 LoG，计算量小且便于在尺度维搜索极值。',
        lineExplanations: [
          { code: 'cv2.subtract(b, a)', explain: '相邻尺度逐像素差分，浮点类型保留正负' },
          { code: 'astype(np.float32)', explain: '避免 uint8 相减截断' }
        ],
        pythonNotes: [],
        apiDocs: [
          {
            name: 'cv2.subtract',
            signature: 'cv2.subtract(src1, src2, mask=None, dtype=-1)',
            params: [
              { name: 'src1,src2', type: 'Mat', desc: '被减数与减数图像' },
              { name: 'dtype', type: 'int', desc: '输出深度，默认与输入相同', default: '-1' }
            ]
          }
        ],
        formulas: [
          { title: 'DoG 定义', latex: 'D(x,y,\\sigma)=L(x,y,k\\sigma)-L(x,y,\\sigma)' },
          { title: '与 LoG 的关系', latex: 'D\\approx (k-1)\\,\\sigma^2\\,\\nabla^2 G' }
        ],
        flow: ['构建相邻尺度', '逐像素相减', '得到 DoG 尺度堆'],
        scenarios: ['SIFT 极值搜索', '斑点检测'],
        research: ['DoG 近似在精度与效率间取得经典平衡'],
        pitfalls: [
          { problem: 'uint8 相减丢失负值', fix: '先转浮点再 subtract' },
          { problem: '尺度比 k 过大近似粗糙', fix: 'SIFT 采用 k=2^(1/3) 的密集尺度' }
        ],
        related: ['ch4-l01', 'ch4-l03']
      })
    }),
    lv('ch4', 3, 'DoG 极值点检测', {
      difficulty: '挑战',
      estMinutes: 13,
      code: `import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
stack = []
for s in (1.0, 1.6, 2.5):
    stack.append(cv2.GaussianBlur(img, (0, 0), s).astype(np.float32))
candidates = []
for o in range(1, len(stack) - 1):
    for y in range(1, img.shape[0] - 1):
        for x in range(1, img.shape[1] - 1):
            cube = [stack[o - 1], stack[o], stack[o + 1]]
            v = cube[1][y, x]
            neighborhood = np.concatenate([m[y - 1:y + 2, x - 1:x + 2].ravel() for m in cube])
            if v == neighborhood.max() or v == neighborhood.min():
                candidates.append((x, y, o))
print("候选极值点数量:", len(candidates))`,
      task: '跟打 3×3×3 邻域极值搜索，理解候选关键点如何产生。',
      tags: ['极值检测', '关键点'],
      know: knowledge({
        overview:
          '每个像素与其同尺度 8 邻域、上下相邻尺度各 9 个点共 26 个邻居比较，是局部最大或最小才成为候选关键点，保证尺度与空间双重稳定。',
        lineExplanations: [
          { code: 'cube = 三个尺度', explain: '构成 3×3×3 的比较立方体' },
          { code: 'neighborhood 26 个邻居', explain: '拼接三尺度邻域（含自身共 27 点）' },
          { code: 'max() or min()', explain: '局部极值即候选关键点' }
        ],
        pythonNotes: ['np.concatenate 拼接数组，.ravel 展平'],
        apiDocs: [],
        flow: ['定位 DoG 像素', '收集 26 个尺度空间邻居', '判断局部极值'],
        scenarios: ['SIFT 候选点生成', '理解尺度不变性来源'],
        research: ['极值搜索是许多局部特征检测器的通用范式'],
        pitfalls: [
          { problem: '三重循环在大图上很慢', fix: '教学用小图，工程实现由 OpenCV 底层优化' },
          { problem: '候选点含大量低对比度点', fix: '需要后续精确定位与阈值过滤' }
        ],
        related: ['ch4-l04']
      })
    }),
    lv('ch4', 4, '关键点精确定位与过滤', {
      difficulty: '挑战',
      estMinutes: 12,
      code: `import cv2

img = cv2.imread("lena.jpg", 0)
sift = cv2.SIFT_create(contrastThreshold=0.04, edgeThreshold=10)
kp, _ = sift.detectAndCompute(img, None)
strong = [k for k in kp if k.response > 0.02]
print("过滤后关键点数量:", len(strong))`,
      task: '跟打关键点过滤，理解对比度阈值与边缘响应阈值的作用。',
      tags: ['关键点过滤', '对比度'],
      know: knowledge({
        overview:
          '原始极值点中包含低对比度和落在边缘上的不稳定点。SIFT 通过局部二次拟合精确定位，并用 contrastThreshold 与 edgeThreshold 剔除弱响应与边缘点。',
        lineExplanations: [
          { code: 'contrastThreshold=0.04', explain: '对比度阈值，越大关键点越少但越可靠' },
          { code: 'edgeThreshold=10', explain: '边缘响应阈值，过滤类似边缘的不稳定点' },
          { code: 'k.response > 0.02', explain: '按响应强度进一步筛选关键点' }
        ],
        pythonNotes: ['列表推导式 [k for k in kp if ...] 做过滤'],
        apiDocs: [],
        formulas: [{ title: '亚像素拟合', latex: '\\hat{x}=-\\frac{\\partial^2 D^{-1}}{\\partial x^2}\\frac{\\partial D}{\\partial x}' }],
        flow: ['候选极值点', '二次拟合亚像素定位', '对比度/边缘阈值过滤'],
        scenarios: ['提升匹配鲁棒性', '控制关键点数量'],
        research: ['稳定关键点筛选直接影响后续匹配的内点率'],
        pitfalls: [
          { problem: '阈值过高关键点过少', fix: '降低 contrastThreshold 观察数量变化' },
          { problem: '边缘点导致误匹配', fix: '保留 edgeThreshold 过滤步骤' }
        ],
        related: ['ch4-l03', 'ch4-l07']
      })
    }),
    lv('ch4', 5, '关键点主方向分配', {
      difficulty: '挑战',
      estMinutes: 12,
      code: `import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
sift = cv2.SIFT_create()
kp = sift.detect(img, None)
angles = [k.angle for k in kp]
print("前 5 个关键点方向:", [round(a, 1) for a in angles[:5]])
print("方向取值范围:", round(min(angles), 1), round(max(angles), 1))`,
      task: '跟打主方向读取，理解方向直方图如何赋予旋转不变性。',
      tags: ['主方向', '旋转不变'],
      know: knowledge({
        overview:
          '在关键点邻域统计梯度方向的 36 桶直方图，最高峰方向作为关键点主方向；描述子相对主方向建立，从而实现旋转不变。',
        lineExplanations: [
          { code: 'k.angle', explain: '每个关键点的主方向角（0-360 度）' },
          { code: '方向直方图', explain: '按梯度方向加权投票，峰值即主方向' }
        ],
        pythonNotes: ['min/max 作用于列表求极值'],
        apiDocs: [],
        formulas: [{ title: '方向直方图', latex: 'H(\\theta)=\\sum w(\\|m\\|)\\cdot \\mathbb{1}[\\theta\\in bin]' }],
        flow: ['计算邻域梯度', '方向加权投票', '取峰值为主方向'],
        scenarios: ['旋转目标匹配', '理解旋转不变性'],
        research: ['方向归一化是局部特征抵抗视角旋转的关键设计'],
        pitfalls: [
          { problem: '平坦区域方向不稳定', fix: '依赖对比度阈值保证邻域有足够梯度' },
          { problem: '多个峰值只取一个', fix: '次峰超过主峰 80% 时可生成额外关键点' }
        ],
        related: ['ch4-l06', 'ch3-l06']
      })
    }),
    lv('ch4', 6, '128 维描述子', {
      difficulty: '挑战',
      estMinutes: 12,
      code: `import cv2

img = cv2.imread("lena.jpg", 0)
sift = cv2.SIFT_create()
kp, desc = sift.detectAndCompute(img, None)
print("描述子形状:", desc.shape)
print("单个描述子长度:", desc.shape[1])
print("描述子数据类型:", desc.dtype)`,
      task: '跟打描述子查看，确认形状为 (关键点数, 128)。',
      tags: ['描述子', '128维'],
      know: knowledge({
        overview:
          'SIFT 把关键点邻域分成 4×4 子区域，每个子区域统计 8 个方向的梯度直方图，4×4×8=128 维向量，再归一化以抵抗光照变化。',
        lineExplanations: [
          { code: 'desc.shape', explain: '每行一个关键点的 128 维描述子' },
          { code: '4×4×8', explain: '子区域数 × 方向桶数 = 128' }
        ],
        pythonNotes: [],
        apiDocs: [],
        formulas: [{ title: '描述子归一化', latex: 'd_i^{\\prime}=\\frac{d_i}{\\sqrt{\\sum_j d_j^2+\\epsilon}}' }],
        flow: ['旋转到主方向', '4×4 子区域梯度统计', '128 维向量归一化'],
        scenarios: ['跨图像特征匹配', '图像检索'],
        research: ['局部描述子维度与区分度的权衡影响匹配与检索性能'],
        pitfalls: [
          { problem: '描述子含光照敏感的原始幅值', fix: '归一化并截断大值，降低亮度影响' },
          { problem: '误以为描述子是关键点坐标', fix: 'desc 是特征向量，坐标在 kp 中' }
        ],
        related: ['ch4-l05', 'ch5-l01']
      })
    }),
    lv('ch4', 7, 'SIFT_create 构造器', {
      mode: 'blank',
      difficulty: '进阶',
      estMinutes: 10,
      code: `import cv2

sift = cv2.SIFT_create(
    nfeatures=0,
    nOctaveLayers=3,
    contrastThreshold=0.04,
    edgeThreshold=10,
    sigma=1.6
)
print("SIFT 对象创建完成:", type(sift).__name__)`,
      task: '跟打 SIFT_create 构造器，记住五个核心参数及默认值。',
      tags: ['SIFT_create', '参数'],
      blank: {
        template: 'sift = cv2.{{1}}(nfeatures=0, nOctaveLayers={{2}}, contrastThreshold=0.04)',
        answers: [['SIFT_create'], ['3']],
        hints: ['构造函数名', '每个 octave 的层数默认 3'],
        analysis: ['nOctaveLayers 默认 3，与尺度因子 k=2^(1/3) 对应']
      },
      know: knowledge({
        overview:
          'cv2.SIFT_create 返回 SIFT 检测器对象，参数控制关键点数量、尺度层数、阈值与初始模糊，是后续 detect/detectAndCompute 的入口。',
        lineExplanations: [
          { code: 'nfeatures=0', explain: '保留的最佳特征数，0 表示不限制' },
          { code: 'nOctaveLayers=3', explain: '每个 octave 内的层数，默认 3' },
          { code: 'sigma=1.6', explain: '第 0 层图像的初始高斯标准差' }
        ],
        pythonNotes: ['多行参数用括号包裹并换行，提升可读性'],
        apiDocs: [
          {
            name: 'cv2.SIFT_create',
            signature: 'cv2.SIFT_create(nfeatures=0, nOctaveLayers=3, contrastThreshold=0.04, edgeThreshold=10, sigma=1.6)',
            params: [
              { name: 'nfeatures', type: 'int', desc: '保留特征数', default: '0' },
              { name: 'contrastThreshold', type: 'float', desc: '对比度阈值', default: '0.04' },
              { name: 'edgeThreshold', type: 'float', desc: '边缘阈值', default: '10' },
              { name: 'sigma', type: 'float', desc: '初始高斯 sigma', default: '1.6' }
            ]
          }
        ],
        flow: ['创建 SIFT 对象', '配置参数', '调用检测方法'],
        scenarios: ['按需控制特征密度', '复现论文参数设置'],
        research: ['参数调整是特征实验中控制内点率与速度的手段'],
        pitfalls: [
          { problem: '旧版 cv2.SIFT() 写法兼容性问题', fix: '新版统一使用 cv2.SIFT_create()' },
          { problem: '需要 opencv-contrib 支持', fix: '确保安装的构建包含 features2d 贡献模块' }
        ],
        related: ['ch4-l08', 'ch4-l09']
      })
    }),
    lv('ch4', 8, 'detectAndCompute 检测与计算', {
      difficulty: '进阶',
      estMinutes: 10,
      code: `import cv2

img = cv2.imread("lena.jpg", 0)
sift = cv2.SIFT_create()
kp1 = sift.detect(img, None)
kp2, desc = sift.detectAndCompute(img, None)
print("仅检测关键点数:", len(kp1))
print("检测并计算:", len(kp2), desc.shape)`,
      task: '跟打 detect 与 detectAndCompute，区分两者返回值。',
      tags: ['detectAndCompute', 'API'],
      know: knowledge({
        overview:
          'detect 只返回关键点列表；detectAndCompute 一步同时返回关键点与描述子矩阵，是最常用的组合调用。mask 参数可限制检测区域。',
        lineExplanations: [
          { code: 'sift.detect(img, None)', explain: '第二参数是可选掩码，None 表示整图检测' },
          { code: 'detectAndCompute', explain: '返回 (关键点元组, 描述子矩阵)' }
        ],
        pythonNotes: [],
        apiDocs: [
          {
            name: 'SIFT.detectAndCompute',
            signature: 'detectAndCompute(image, mask, descriptors=None, useProvidedKeypoints=False)',
            params: [
              { name: 'image', type: 'Mat', desc: '灰度输入图像' },
              { name: 'mask', type: 'Mat', desc: '可选区域掩码，None 表示全图' }
            ],
            returns: '(KeyPoint 元组, np.ndarray 描述子)'
          }
        ],
        flow: ['准备灰度图', '检测关键点', '（可选）计算描述子'],
        scenarios: ['匹配前的特征提取', '只需要关键点位置的可视化'],
        research: ['统一接口便于在 SIFT/ORB/AKAZE 间切换对比'],
        pitfalls: [
          { problem: '传入彩色图导致结果异常', fix: 'SIFT 输入应为单通道灰度图' },
          { problem: '无关键点时 desc 为 None', fix: '后续匹配前需判空' }
        ],
        related: ['ch4-l07', 'ch4-l09']
      })
    }),
    lv('ch4', 9, 'drawKeypoints 可视化', {
      difficulty: '基础',
      estMinutes: 8,
      code: `import cv2

img = cv2.imread("lena.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
sift = cv2.SIFT_create()
kp, _ = sift.detectAndCompute(gray, None)
out = cv2.drawKeypoints(img, kp, None, flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
cv2.imwrite("keypoints.png", out)
print("关键点数量:", len(kp))`,
      task: '跟打关键点绘制，RICH 标志会画出尺度与方向。',
      tags: ['drawKeypoints', '可视化'],
      labExperiment: 'sift',
      know: knowledge({
        overview:
          'drawKeypoints 在图像上绘制关键点；使用 DRAW_RICH_KEYPOINTS 标志时圆圈大小反映尺度、线段反映方向，便于直观检查特征分布。',
        lineExplanations: [
          { code: 'flags=DRAW_RICH_KEYPOINTS', explain: '丰富绘制：尺度圆 + 方向线' },
          { code: 'None 作为输出参数', explain: '传 None 时函数自动创建结果图像' }
        ],
        pythonNotes: [],
        apiDocs: [
          {
            name: 'cv2.drawKeypoints',
            signature: 'cv2.drawKeypoints(image, keypoints, outImage, color=None, flags=0)',
            params: [
              { name: 'keypoints', type: 'KeyPoint[]', desc: '关键点序列' },
              { name: 'flags', type: 'int', desc: '绘制标志，默认仅画点', default: '0' }
            ]
          }
        ],
        flow: ['检测关键点', '选择绘制标志', '输出标注图并保存'],
        scenarios: ['论文/报告配图', '检查特征覆盖是否均匀'],
        research: ['关键点空间分布可视化有助于诊断检测器行为'],
        pitfalls: [
          { problem: '默认标志看不到尺度方向', fix: '使用 DRAW_RICH_KEYPOINTS' },
          { problem: '在灰度图上彩色标注不明显', fix: '在 BGR 彩色图上绘制' }
        ],
        related: ['ch4-l08']
      })
    }),
    lv('ch4', 10, 'SIFT 参数调优实验', {
      difficulty: '挑战',
      estMinutes: 13,
      code: `import cv2

img = cv2.imread("lena.jpg", 0)
for n in (0, 50, 200):
    sift = cv2.SIFT_create(nfeatures=n)
    kp, desc = sift.detectAndCompute(img, None)
    print(f"nfeatures={n} -> 关键点 {len(kp)} 个")`,
      task: '跟打参数调优循环，量化 nfeatures 对结果的影响。',
      tags: ['参数调优', '实验'],
      labExperiment: 'sift',
      know: knowledge({
        overview:
          '通过循环改变 nfeatures 观察关键点数量与描述子形状变化，理解“保留最佳 N 个特征”的含义，为速度与区分度取舍提供依据。',
        lineExplanations: [
          { code: 'nfeatures=n', explain: '0 不限；设值时按响应保留前 N 个' },
          { code: 'len(kp)', explain: '量化不同设置下的实际特征数' }
        ],
        pythonNotes: [],
        apiDocs: [],
        flow: ['设定参数梯度', '循环检测', '记录数量与耗时'],
        scenarios: ['实时性要求下的特征预算', '匹配前的特征数量控制'],
        research: ['特征数量与匹配内点率、运行时间的关系是常见实验维度'],
        pitfalls: [
          { problem: '只看数量不看质量', fix: '结合匹配内点率综合评估' },
          { problem: 'nfeatures 大于实际候选数无效果', fix: '理解上限语义，候选不足时不会补点' }
        ],
        related: ['ch4-l07', 'ch4-l04']
      })
    })
  ]
}
