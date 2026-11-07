import type { Chapter } from '../types'
import { knowledge, lv } from './helpers'

export const ch2: Chapter = {
  id: 'ch2',
  index: 2,
  title: '图像平滑与去噪',
  subtitle: '用邻域加权平均抑制噪声，理解核大小与参数的影响',
  intro:
    '真实图像普遍带有噪声。本章从噪声模拟出发，系统实现均值、方框、高斯、中值等滤波方法，对比核大小与标准差参数，理解不同滤波器的适用场景，并在实验室中实时观察效果。',
  objectives: [
    '能够模拟高斯噪声与椒盐噪声',
    '掌握均值、方框、高斯、中值、双边滤波 API',
    '理解高斯核的生成与可分离性',
    '能根据噪声类型选择合适的去噪策略'
  ],
  icon: 'WindPower',
  levels: [
    lv('ch2', 1, '噪声模拟：高斯与椒盐', {
      difficulty: '进阶',
      estMinutes: 12,
      code: `import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
noise = np.random.normal(0, 25, img.shape).astype(np.int16)
gaussian_noisy = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
sp = img.copy()
num = 1000
for _ in range(num):
    x, y = np.random.randint(0, img.shape[1]), np.random.randint(0, img.shape[0])
    sp[y, x] = 0 if np.random.rand() < 0.5 else 255`,
      task: '跟打噪声生成代码，理解高斯噪声与椒盐噪声的区别。',
      tags: ['噪声', 'NumPy随机'],
      know: knowledge({
        overview:
          '高斯噪声是叠加在像素上、服从正态分布的随机扰动；椒盐噪声随机把像素置为 0（黑）或 255（白）。用 np.random 生成后必须 clip 防止越界。',
        lineExplanations: [
          { code: 'np.random.normal(0, 25, img.shape)', explain: '均值 0、标准差 25 的同形状高斯噪声' },
          { code: 'np.clip(..., 0, 255)', explain: '限制到合法灰度范围，避免溢出' },
          { code: 'sp[y, x] = 0/255', explain: '随机注入黑点或白点，模拟脉冲噪声' }
        ],
        pythonNotes: ['np.random.rand() 返回 [0,1) 均匀随机数'],
        apiDocs: [],
        formulas: [{ title: '高斯噪声概率密度', latex: 'p(z)=\\frac{1}{\\sqrt{2\\pi}\\,\\sigma}\\exp\\left(-\\frac{(z-\\mu)^2}{2\\sigma^2}\\right)' }],
        flow: ['生成随机扰动', '叠加到原图', 'clip 到合法范围'],
        scenarios: ['构造受控测试数据', '定量评估去噪算法'],
        research: ['可控噪声下的 PSNR/SSIM 对比是去噪论文标准实验'],
        pitfalls: [
          { problem: 'int16 相加后直接显示类型错误', fix: 'clip 后再 astype(np.uint8)' },
          { problem: '每次运行结果不同难以复现', fix: '用 np.random.seed(42) 固定随机种子' }
        ],
        related: ['ch2-l02', 'ch2-l06']
      })
    }),
    lv('ch2', 2, '均值滤波 blur', {
      difficulty: '基础',
      estMinutes: 7,
      code: `import cv2

img = cv2.imread("lena.jpg")
blur3 = cv2.blur(img, (3, 3))
blur5 = cv2.blur(img, (5, 5))
print("3x3 均值形状:", blur3.shape)
print("5x5 均值形状:", blur5.shape)`,
      task: '跟打均值滤波代码，观察核大小对模糊程度的影响。',
      tags: ['均值滤波', 'blur'],
      labExperiment: 'blur',
      know: knowledge({
        overview:
          '均值滤波用核内所有像素的算术平均值替换中心像素，核越大平滑越强、细节丢失越多。cv2.blur 是归一化的方框滤波。',
        lineExplanations: [
          { code: 'cv2.blur(img, (3,3))', explain: '3×3 邻域平均，轻度去噪' },
          { code: 'cv2.blur(img, (5,5))', explain: '5×5 邻域平均，更强模糊' }
        ],
        pythonNotes: [],
        apiDocs: [
          {
            name: 'cv2.blur',
            signature: 'cv2.blur(src, ksize, anchor=(-1,-1), borderType=BORDER_DEFAULT)',
            params: [
              { name: 'src', type: 'Mat', desc: '输入图像' },
              { name: 'ksize', type: 'tuple', desc: '核大小 (宽, 高)，通常为奇数' },
              { name: 'anchor', type: 'tuple', desc: '锚点，默认中心', default: '(-1,-1)' }
            ]
          }
        ],
        formulas: [{ title: '邻域均值', latex: 'K=\\frac{1}{k_w k_h}\\sum_{(u,v)\\in\\Omega} I(u,v)' }],
        flow: ['选择奇数核大小', '邻域求和', '除以元素个数取平均'],
        scenarios: ['轻度随机噪声抑制', '需要快速简单平滑时'],
        research: ['作为基线与复杂去噪网络对比 PSNR'],
        pitfalls: [
          { problem: '核过大导致边缘严重模糊', fix: '从 3×3 开始尝试，按需增大' },
          { problem: '对椒盐噪声效果差', fix: '脉冲噪声应优先使用中值滤波' }
        ],
        related: ['ch2-l03', 'ch2-l04']
      })
    }),
    lv('ch2', 3, '方框滤波 boxFilter', {
      mode: 'blank',
      difficulty: '基础',
      estMinutes: 8,
      code: `import cv2

img = cv2.imread("lena.jpg")
norm = cv2.boxFilter(img, cv2.CV_8U, (3, 3), normalize=True)
raw = cv2.boxFilter(img, cv2.CV_8U, (3, 3), normalize=False)
print("归一化方框:", norm.shape)
print("未归一化方框:", raw.shape)`,
      task: '跟打方框滤波，理解 normalize=True/False 的本质区别。',
      tags: ['方框滤波', 'boxFilter'],
      labExperiment: 'box',
      blank: {
        template: 'norm = cv2.{{1}}(img, cv2.CV_8U, (3, 3), normalize={{2}})',
        answers: [['boxFilter'], ['True', 'TRUE', 'true']],
        hints: ['方框滤波函数名', '布尔值首字母大写'],
        analysis: ['normalize=True 时除以核面积，等价于 blur；False 时直接求和，uint8 易溢出截断']
      },
      know: knowledge({
        overview:
          'boxFilter 是方框滤波，normalize=True 时对邻域求和后除以面积（等价 blur），normalize=False 时直接求和，在 uint8 下很容易超过 255 被截断。',
        lineExplanations: [
          { code: 'normalize=True', explain: '权重和为 1，亮度保持，等价均值滤波' },
          { code: 'normalize=False', explain: '纯邻域求和，结果可能大面积饱和变白' }
        ],
        pythonNotes: ['Python 布尔值是 True/False（首字母大写）'],
        apiDocs: [
          {
            name: 'cv2.boxFilter',
            signature: 'cv2.boxFilter(src, ddepth, ksize, anchor=(-1,-1), normalize=True, borderType=BORDER_DEFAULT)',
            params: [
              { name: 'ddepth', type: 'int', desc: '输出深度' },
              { name: 'ksize', type: 'tuple', desc: '核大小' },
              { name: 'normalize', type: 'bool', desc: '是否按核面积归一化', default: 'True' }
            ]
          }
        ],
        flow: ['邻域求和', '根据 normalize 决定是否除以面积', '输出结果'],
        scenarios: ['积分图像思想教学', '需要邻域求和的特征计算'],
        research: ['方框滤波是 Viola-Jones 类快速特征的基础'],
        pitfalls: [
          { problem: '未归一化结果一片白', fix: 'uint8 下应 normalize=True，或改用更深位深' },
          { problem: '与 blur 混淆', fix: 'blur 就是 normalize=True 的 boxFilter' }
        ],
        related: ['ch2-l02']
      })
    }),
    lv('ch2', 4, '高斯滤波 GaussianBlur', {
      difficulty: '基础',
      estMinutes: 9,
      code: `import cv2

img = cv2.imread("lena.jpg")
gauss = cv2.GaussianBlur(img, (5, 5), sigmaX=1.0)
print("高斯滤波结果:", gauss.shape)
cv2.imwrite("gauss.png", gauss)`,
      task: '跟打高斯滤波，核大小必须为奇数，sigma 控制权重衰减。',
      tags: ['高斯滤波', 'GaussianBlur'],
      labExperiment: 'gaussian',
      know: knowledge({
        overview:
          '高斯滤波按高斯函数给邻域加权，越靠近中心权重越大，在平滑噪声的同时比均值滤波更好地保留整体结构。核大小须为奇数，sigma 决定权重分布宽度。',
        lineExplanations: [
          { code: '(5, 5)', explain: '高斯核尺寸，宽高必须为正奇数（或为 0 由 sigma 推导）' },
          { code: 'sigmaX=1.0', explain: 'X 方向标准差，越大越模糊；为 0 时由核大小自动计算' }
        ],
        pythonNotes: ['sigmaX=1.0 是关键字参数，提升可读性'],
        apiDocs: [
          {
            name: 'cv2.GaussianBlur',
            signature: 'cv2.GaussianBlur(src, ksize, sigmaX, sigmaY=0, borderType=BORDER_DEFAULT)',
            params: [
              { name: 'ksize', type: 'tuple', desc: '(宽,高)，均为奇数' },
              { name: 'sigmaX', type: 'float', desc: 'X 方向高斯标准差' },
              { name: 'sigmaY', type: 'float', desc: 'Y 方向标准差，0 表示等于 sigmaX', default: '0' }
            ]
          }
        ],
        formulas: [
          { title: '二维高斯函数', latex: 'G(x,y)=\\frac{1}{2\\pi\\sigma^2}\\exp\\left(-\\frac{x^2+y^2}{2\\sigma^2}\\right)' }
        ],
        flow: ['按 sigma 生成高斯权重', '核内加权求和', '归一化输出'],
        scenarios: ['高斯白噪声抑制', 'SIFT/边缘检测前的尺度预处理'],
        research: ['高斯核是尺度空间理论的核心，SIFT、Canny 均依赖它'],
        pitfalls: [
          { problem: '核大小传偶数报错', fix: '高斯核尺寸必须为奇数，才有明确中心像素' },
          { problem: 'sigma 与 ksize 不匹配', fix: '让其中一个为 0 由 OpenCV 自动推导，避免矛盾' }
        ],
        related: ['ch2-l05', 'ch4-l01']
      })
    }),
    lv('ch2', 5, '高斯核生成与可分离性', {
      difficulty: '进阶',
      estMinutes: 10,
      code: `import cv2
import numpy as np

k1d = cv2.getGaussianKernel(ksize=5, sigma=1.0)
k2d = k1d @ k1d.T
print("一维核:\\n", k1d.ravel())
print("二维核权重和:", k2d.sum())`,
      task: '跟打高斯核生成代码，理解一维核外积得到二维核。',
      tags: ['高斯核', '可分离滤波'],
      know: knowledge({
        overview:
          '二维高斯核可分解为两个相同一维核的外积，因此高斯滤波可先沿 X 再沿 Y 做两次一维卷积，把复杂度从 O(k²) 降到 O(2k)。',
        lineExplanations: [
          { code: 'cv2.getGaussianKernel(5, 1.0)', explain: '返回 5×1 的归一化一维列向量' },
          { code: 'k1d @ k1d.T', explain: '矩阵外积得到 5×5 二维高斯核' },
          { code: 'k2d.sum()', explain: '权重和约为 1，保证亮度不变' }
        ],
        pythonNotes: ['@ 是 Python 的矩阵乘法运算符', '.ravel() 把数组展平为一维'],
        apiDocs: [
          {
            name: 'cv2.getGaussianKernel',
            signature: 'cv2.getGaussianKernel(ksize, sigma, ktype=CV_64F)',
            params: [
              { name: 'ksize', type: 'int', desc: '奇数核大小' },
              { name: 'sigma', type: 'float', desc: '标准差；非正则由 ksize 推导' }
            ]
          }
        ],
        flow: ['生成一维核', '外积构造二维核', '利用可分离性加速卷积'],
        scenarios: ['理解滤波加速原理', '自定义高斯权重'],
        research: ['可分离卷积在大核与实时系统中显著降低计算量'],
        pitfalls: [
          { problem: '忘记外积直接用一维核做二维卷积', fix: '用 k @ k.T 构造二维核' },
          { problem: '权重和不等于 1', fix: 'getGaussianKernel 已归一化，外积后和仍为 1' }
        ],
        related: ['ch2-l04']
      })
    }),
    lv('ch2', 6, '中值滤波 medianBlur', {
      difficulty: '基础',
      estMinutes: 8,
      code: `import cv2

img = cv2.imread("lena.jpg")
median = cv2.medianBlur(img, ksize=5)
print("中值滤波结果:", median.shape)`,
      task: '跟打中值滤波，它是椒盐噪声的首选克星。',
      tags: ['中值滤波', 'medianBlur'],
      labExperiment: 'median',
      know: knowledge({
        overview:
          '中值滤波取邻域内所有像素排序后的中位数替换中心像素，能有效剔除孤立的椒盐极值点，同时比均值滤波更好地保护边缘。',
        lineExplanations: [
          { code: 'cv2.medianBlur(img, 5)', explain: '注意 ksize 是整数而非元组，5 表示 5×5 邻域' }
        ],
        pythonNotes: [],
        apiDocs: [
          {
            name: 'cv2.medianBlur',
            signature: 'cv2.medianBlur(src, ksize)',
            params: [{ name: 'ksize', type: 'int', desc: '奇数孔径尺寸（整数，不是元组）' }]
          }
        ],
        flow: ['收集邻域像素', '排序取中位数', '替换中心像素'],
        scenarios: ['椒盐/脉冲噪声去除', '需要保边的简单去噪'],
        research: ['医学、文档图像中的脉冲噪声常用中值类方法预处理'],
        pitfalls: [
          { problem: '把 ksize 写成 (5,5) 元组报错', fix: 'medianBlur 的 ksize 是单个奇数整数' },
          { problem: '对高斯噪声表现一般', fix: '高斯噪声应选 GaussianBlur' }
        ],
        related: ['ch2-l01', 'ch2-l07']
      })
    }),
    lv('ch2', 7, '双边滤波 bilateralFilter', {
      difficulty: '进阶',
      estMinutes: 11,
      code: `import cv2

img = cv2.imread("lena.jpg")
bilat = cv2.bilateralFilter(img, d=9, sigmaColor=75, sigmaSpace=75)
print("双边滤波结果:", bilat.shape)`,
      task: '跟打双边滤波，理解它为何能“去噪又保边”。',
      tags: ['双边滤波', '保边去噪'],
      know: knowledge({
        overview:
          '双边滤波同时考虑空间距离权重和像素值差异权重：平坦区域正常平滑，边缘两侧因灰度差异大而降低权重，从而在去噪的同时保留边缘。',
        lineExplanations: [
          { code: 'd=9', explain: '邻域直径；非正则由 sigmaSpace 推导' },
          { code: 'sigmaColor=75', explain: '灰度差异 sigma，越大越能容忍强度差异' },
          { code: 'sigmaSpace=75', explain: '空间距离 sigma，越大平滑范围越广' }
        ],
        pythonNotes: [],
        apiDocs: [
          {
            name: 'cv2.bilateralFilter',
            signature: 'cv2.bilateralFilter(src, d, sigmaColor, sigmaSpace, borderType=BORDER_DEFAULT)',
            params: [
              { name: 'd', type: 'int', desc: '滤波邻域直径' },
              { name: 'sigmaColor', type: 'float', desc: '颜色空间标准差' },
              { name: 'sigmaSpace', type: 'float', desc: '坐标空间标准差' }
            ]
          }
        ],
        formulas: [
          { title: '双边权重', latex: 'w=\\underbrace{G_{\\sigma_s}(\\|p-q\\|)}_{空间}\\cdot\\underbrace{G_{\\sigma_r}(|I_p-I_q|)}_{灰度}' }
        ],
        flow: ['计算空间高斯权重', '乘以灰度相似权重', '归一化加权求和'],
        scenarios: ['卡通化预处理', '需要保边的去噪'],
        research: ['保边滤波思想影响了引导滤波与许多计算摄影方法'],
        pitfalls: [
          { problem: '计算明显比高斯滤波慢', fix: '控制 d 与 sigma，避免在大图上使用过大邻域' },
          { problem: '参数过小几乎无效果', fix: 'sigmaColor 通常取 50-100 区间试验' }
        ],
        related: ['ch2-l04', 'ch2-l06']
      })
    }),
    lv('ch2', 8, '核大小参数对比', {
      difficulty: '进阶',
      estMinutes: 10,
      code: `import cv2

img = cv2.imread("lena.jpg", 0)
for k in (3, 5, 7, 9):
    dst = cv2.GaussianBlur(img, (k, k), 0)
    print(f"核大小 {k} -> 均值 {dst.mean():.2f}")`,
      task: '跟打循环对比代码，量化不同核大小下的结果。',
      tags: ['参数对比', '循环'],
      know: knowledge({
        overview:
          '固定图像、遍历核大小可以系统观察平滑强度变化。f-string 把变量嵌入输出，均值变化反映细节被平滑的程度。',
        lineExplanations: [
          { code: 'for k in (3,5,7,9):', explain: '遍历一组奇数核大小' },
          { code: 'f"...{dst.mean():.2f}"', explain: 'f-string 格式化，:.2f 保留两位小数' }
        ],
        pythonNotes: ['f-string 是 Python 3.6+ 的字符串插值语法', '元组 (3,5,7,9) 可直接迭代'],
        apiDocs: [],
        flow: ['准备参数序列', '循环执行滤波', '记录并比较指标'],
        scenarios: ['超参数网格试验', '撰写实验报告'],
        research: ['参数敏感性分析是论文消融实验的常见组成'],
        pitfalls: [
          { problem: '核大小含偶数导致报错', fix: '对比序列只放奇数' },
          { problem: '只看主观图难以下结论', fix: '同时记录均值/方差或 PSNR 等客观指标' }
        ],
        related: ['ch2-l04', 'ch2-l09']
      })
    }),
    lv('ch2', 9, 'sigma标准差参数对比', {
      difficulty: '进阶',
      estMinutes: 10,
      code: `import cv2

img = cv2.imread("lena.jpg", 0)
for s in (0.5, 1.0, 2.0, 4.0):
    dst = cv2.GaussianBlur(img, (0, 0), sigmaX=s)
    print(f"sigma={s} 输出尺寸 {dst.shape}")`,
      task: '跟打 sigma 对比，核大小给 0 让 OpenCV 按 sigma 自动确定。',
      tags: ['sigma', '参数对比'],
      know: knowledge({
        overview:
          '固定核大小为 0，让 OpenCV 根据 sigma 自动计算所需核尺寸，可单独研究标准差对平滑程度的影响，sigma 越大权重分布越宽、越模糊。',
        lineExplanations: [
          { code: '(0, 0)', explain: '核大小为 0 时由 sigma 自动推导实际尺寸' },
          { code: 'sigmaX=s', explain: '逐个增大标准差，观察模糊增强' }
        ],
        pythonNotes: [],
        apiDocs: [],
        flow: ['设置 ksize=0', '遍历 sigma', '比较自动核与输出效果'],
        scenarios: ['尺度空间参数选择', '教学演示 sigma 作用'],
        research: ['不同 sigma 对应不同尺度，是多尺度分析的基础'],
        pitfalls: [
          { problem: 'sigma 过小几乎无平滑', fix: '结合目标尺度选择，多做对比' },
          { problem: '同时设置 ksize 与 sigma 产生矛盾', fix: '研究 sigma 时把 ksize 置 0' }
        ],
        related: ['ch2-l08', 'ch4-l01']
      })
    }),
    lv('ch2', 10, '去噪综合流程', {
      difficulty: '挑战',
      estMinutes: 14,
      code: `import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
noisy = cv2.GaussianBlur(img, (0, 0), 0)
noise = np.random.normal(0, 20, img.shape)
noisy = np.clip(img.astype(np.float32) + noise, 0, 255).astype(np.uint8)
gauss = cv2.GaussianBlur(noisy, (5, 5), 0)
median = cv2.medianBlur(noisy, 5)
cv2.imwrite("noisy.png", noisy)
cv2.imwrite("gauss.png", gauss)
cv2.imwrite("median.png", median)`,
      task: '跟打完整去噪流程：加噪 → 两种滤波 → 分别保存对比。',
      tags: ['综合流程', '去噪'],
      labExperiment: 'gaussian',
      know: knowledge({
        overview:
          '本关把噪声模拟与多种滤波串成完整管线，并分别保存结果，便于横向比较高斯与中值滤波对同一噪声图像的差异。',
        lineExplanations: [
          { code: 'np.clip(img+noise,...)', explain: '生成受控高斯噪声图像' },
          { code: 'GaussianBlur / medianBlur', explain: '两种代表性去噪方法并行对比' },
          { code: 'imwrite 三张图', explain: '保存噪声图与两种结果用于报告' }
        ],
        pythonNotes: [],
        apiDocs: [],
        flow: ['读取并加噪', '分别用高斯、中值处理', '保存并对比'],
        scenarios: ['课程实验报告', '算法基线对比'],
        research: ['可进一步计算 PSNR/SSIM 做定量评价'],
        pitfalls: [
          { problem: '第一行多余的 GaussianBlur 造成混淆', fix: '保持管线简洁，每步只做一件事' },
          { problem: '只保存最终结果无法对比', fix: '中间结果都应保存或显示' }
        ],
        related: ['ch2-l01', 'ch2-l04', 'ch2-l06']
      })
    })
  ]
}
