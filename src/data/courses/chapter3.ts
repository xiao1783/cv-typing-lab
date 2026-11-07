import type { Chapter } from '../types'
import { knowledge, lv } from './helpers'

export const ch3: Chapter = {
  id: 'ch3',
  index: 3,
  title: '图像梯度与边缘检测',
  subtitle: '从离散差分到各阶边缘算子，定位图像中的强度突变',
  intro:
    '边缘对应像素强度的剧烈变化，而梯度正是刻画变化率的数学工具。本章从 Roberts、Prewitt 到 Sobel、Scharr、Laplacian，系统实现一阶梯度与二阶导数算子，并结合阈值处理得到清晰边缘图。',
  objectives: [
    '理解图像梯度、幅值与方向的数学含义',
    '掌握 filter2D 实现 Roberts/Prewitt 及 Sobel/Scharr/Laplacian API',
    '能处理负梯度值并合成梯度幅值',
    '能结合阈值处理得到二值边缘图'
  ],
  icon: 'Aim',
  levels: [
    lv('ch3', 1, '梯度概念与灰度差分', {
      difficulty: '基础',
      estMinutes: 9,
      code: `import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
gx = np.zeros_like(img, dtype=np.float64)
gx[:, 1:] = img[:, 1:].astype(np.float64) - img[:, :-1]
print("水平差分范围:", gx.min(), gx.max())
print("差分形状:", gx.shape)`,
      task: '跟打水平差分代码，理解梯度就是相邻像素之差。',
      tags: ['梯度', '差分'],
      know: knowledge({
        overview:
          '离散图像上导数用相邻像素差分近似。水平方向相邻列相减得到 x 方向梯度，强度变化越大差分绝对值越大，边缘处出现大值。',
        lineExplanations: [
          { code: 'img[:, 1:] - img[:, :-1]', explain: '所有行上，后一列减前一列，得到 x 方向差分' },
          { code: 'astype(np.float64)', explain: '差分可能为负，必须用浮点类型保存' }
        ],
        pythonNotes: ['[:, 1:] 中冒号表示该维度全部取，切片错位实现相邻差分'],
        apiDocs: [],
        formulas: [
          { title: '前向差分近似偏导', latex: '\\frac{\\partial I}{\\partial x}\\approx I(x+1,y)-I(x,y)' }
        ],
        flow: ['灰度化', '相邻像素相减', '取绝对值定位强度变化'],
        scenarios: ['理解梯度来源', '最简单的变化检测'],
        research: ['有限差分是数值计算与图像偏导的基础'],
        pitfalls: [
          { problem: 'uint8 下负差分被截断', fix: '先转 float 再相减' },
          { problem: '边界列无法差分', fix: '输出首列保持 0 或做填充' }
        ],
        related: ['ch3-l04', 'ch3-l06']
      })
    }),
    lv('ch3', 2, 'Roberts 边缘检测', {
      difficulty: '进阶',
      estMinutes: 10,
      code: `import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
kernel_x = np.array([[1, 0], [0, -1]], dtype=np.float32)
kernel_y = np.array([[0, 1], [-1, 0]], dtype=np.float32)
rx = cv2.filter2D(img, cv2.CV_64F, kernel_x)
ry = cv2.filter2D(img, cv2.CV_64F, kernel_y)
roberts = cv2.magnitude(rx, ry)
print("Roberts 形状:", roberts.shape)`,
      task: '跟打 Roberts 交叉差分核与幅值合成。',
      tags: ['Roberts', 'filter2D'],
      labExperiment: 'roberts',
      know: knowledge({
        overview:
          'Roberts 算子用 2×2 交叉对角差分近似梯度，定位较准但对噪声敏感，是最古老简洁的边缘算子之一。',
        lineExplanations: [
          { code: '[[1,0],[0,-1]]', explain: '主对角线差分核，检测 45° 方向变化' },
          { code: 'cv2.magnitude(rx,ry)', explain: '由两个方向分量合成梯度幅值' }
        ],
        pythonNotes: ['np.array 嵌套列表定义二维矩阵'],
        apiDocs: [],
        formulas: [{ title: 'Roberts 幅值', latex: 'G=\\sqrt{(z_1-z_4)^2+(z_2-z_3)^2}' }],
        flow: ['定义两个交叉核', 'filter2D 求分量', 'magnitude 合成'],
        scenarios: ['低噪声、简单场景的快速边缘', '教学对比算子演进'],
        research: ['常作为算子对比的历史基线'],
        pitfalls: [
          { problem: '2×2 核没有明确中心', fix: '理解其定位特性，需要更稳时改用 Sobel' },
          { problem: '噪声下边缘破碎', fix: '先做高斯平滑或换抗噪算子' }
        ],
        related: ['ch3-l03', 'ch3-l04']
      })
    }),
    lv('ch3', 3, 'Prewitt 边缘检测', {
      difficulty: '进阶',
      estMinutes: 10,
      code: `import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
kx = np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], dtype=np.float32)
ky = np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]], dtype=np.float32)
px = cv2.filter2D(img, cv2.CV_64F, kx)
py = cv2.filter2D(img, cv2.CV_64F, ky)
prewitt = cv2.magnitude(px, py)
print("Prewitt 范围:", prewitt.min(), prewitt.max())`,
      task: '跟打 Prewitt 3×3 方向核，理解平均差分带来的抗噪性。',
      tags: ['Prewitt'],
      labExperiment: 'prewitt',
      know: knowledge({
        overview:
          'Prewitt 用 3×3 核在差分的同时对三行/列做平均，比 Roberts 更抗噪，适合检测水平与垂直方向边缘。',
        lineExplanations: [
          { code: 'kx 三列 -1,0,1', explain: 'x 方向核，左右两侧差分' },
          { code: 'ky 三行 -1,0,1', explain: 'y 方向核，上下差分' }
        ],
        pythonNotes: [],
        apiDocs: [],
        formulas: [{ title: 'Prewitt 幅值', latex: 'G=\\sqrt{G_x^2+G_y^2}' }],
        flow: ['构造方向核', '卷积求分量', '合成幅值'],
        scenarios: ['规则方向边缘提取', '噪声中等的场景'],
        research: ['方向模板思想用于纹理与结构分析'],
        pitfalls: [
          { problem: '边缘定位略粗', fix: '对精度要求高时结合阈值或使用 Sobel/Canny' },
          { problem: '核内权重未区分中心', fix: '这是 Prewitt 与 Sobel 的关键区别' }
        ],
        related: ['ch3-l02', 'ch3-l04']
      })
    }),
    lv('ch3', 4, 'Sobel 算子', {
      mode: 'blank',
      difficulty: '进阶',
      estMinutes: 11,
      code: `import cv2

img = cv2.imread("lena.jpg", 0)
sx = cv2.Sobel(img, cv2.CV_64F, dx=1, dy=0, ksize=3)
sy = cv2.Sobel(img, cv2.CV_64F, dx=0, dy=1, ksize=3)
absx = cv2.convertScaleAbs(sx)
absy = cv2.convertScaleAbs(sy)
sobel = cv2.addWeighted(absx, 0.5, absy, 0.5, 0)
print("Sobel 形状:", sobel.shape)`,
      task: '跟打 Sobel 调用，dx/dy 决定求导方向，负值需 convertScaleAbs。',
      tags: ['Sobel'],
      labExperiment: 'sobel',
      blank: {
        template: 'sx = cv2.{{1}}(img, cv2.CV_64F, dx={{2}}, dy=0, ksize=3)',
        answers: [['Sobel'], ['1']],
        hints: ['算子函数名', 'x 方向一阶导，dx 为 1'],
        analysis: ['Sobel 结合高斯平滑与差分，dx=1,dy=0 表示只对 x 求一阶偏导']
      },
      know: knowledge({
        overview:
          'Sobel 在 Prewitt 基础上给中心行/列更大权重（带平滑的差分），抗噪与定位取得良好平衡，是最常用的一阶边缘算子之一。',
        lineExplanations: [
          { code: 'dx=1, dy=0', explain: '只对 x 求一阶导，得到垂直边缘响应' },
          { code: 'convertScaleAbs', explain: '取绝对值并转回 uint8，避免负响应丢失' },
          { code: 'addWeighted 0.5', explain: '两个方向结果等权融合' }
        ],
        pythonNotes: [],
        apiDocs: [
          {
            name: 'cv2.Sobel',
            signature: 'cv2.Sobel(src, ddepth, dx, dy, ksize=3, scale=1, delta=0)',
            params: [
              { name: 'ddepth', type: 'int', desc: '输出深度，通常用 CV_64F 保留负值' },
              { name: 'dx,dy', type: 'int', desc: 'x、y 方向求导阶数' },
              { name: 'ksize', type: 'int', desc: '奇数核大小，1/3/5/7', default: '3' }
            ]
          }
        ],
        formulas: [
          { title: 'Sobel x 核', latex: 'K_x=\\begin{bmatrix}-1&0&1\\\\-2&0&2\\\\-1&0&1\\end{bmatrix}' }
        ],
        flow: ['设置求导阶数', 'Sobel 卷积（含平滑）', '取绝对值并融合'],
        scenarios: ['通用边缘提取', '梯度方向特征'],
        research: ['Sobel 响应常用于 HOG 等特征与结构先验'],
        pitfalls: [
          { problem: 'ddepth 用 CV_8U 丢失负边缘', fix: '用 CV_64F 再 convertScaleAbs' },
          { problem: 'dx、dy 同时为 1 导致混合响应', fix: '通常分别求 x、y 再融合' }
        ],
        related: ['ch3-l05', 'ch3-l06']
      })
    }),
    lv('ch3', 5, 'Scharr 算子', {
      difficulty: '进阶',
      estMinutes: 10,
      code: `import cv2

img = cv2.imread("lena.jpg", 0)
scx = cv2.Scharr(img, cv2.CV_64F, dx=1, dy=0)
scy = cv2.Scharr(img, cv2.CV_64F, dx=0, dy=1)
scharr = cv2.magnitude(scx, scy)
print("Scharr 形状:", scharr.shape)`,
      task: '跟打 Scharr，它是 3×3 下 Sobel 的高精度增强版。',
      tags: ['Scharr'],
      labExperiment: 'scharr',
      know: knowledge({
        overview:
          'Scharr 使用固定 3×3 但权重系数经过优化，在小核尺寸下比 Sobel 具有更好的旋转对称性与梯度精度，不能自定义 ksize。',
        lineExplanations: [
          { code: 'cv2.Scharr(...)', explain: '无 ksize 参数，固定 3×3 优化系数' },
          { code: 'magnitude(scx,scy)', explain: '合成幅值，与其他算子流程一致' }
        ],
        pythonNotes: [],
        apiDocs: [
          {
            name: 'cv2.Scharr',
            signature: 'cv2.Scharr(src, ddepth, dx, dy, scale=1, delta=0)',
            params: [
              { name: 'ddepth', type: 'int', desc: '输出深度' },
              { name: 'dx,dy', type: 'int', desc: '求导阶数，其中一个为 1、另一个为 0' }
            ]
          }
        ],
        formulas: [{ title: 'Scharr x 核', latex: 'K_x=\\begin{bmatrix}-3&0&3\\\\-10&0&10\\\\-3&0&3\\end{bmatrix}' }],
        flow: ['选择求导方向', 'Scharr 卷积', '合成幅值'],
        scenarios: ['3×3 小核下追求精度', '需要准确梯度方向'],
        research: ['光流与梯度估计中 Scharr 能减小方向误差'],
        pitfalls: [
          { problem: '尝试传 ksize 参数报错', fix: 'Scharr 固定 3×3，无该参数' },
          { problem: '响应值比 Sobel 大', fix: '系数不同导致尺度差异，阈值需相应调整' }
        ],
        related: ['ch3-l04']
      })
    }),
    lv('ch3', 6, '梯度幅值与方向', {
      difficulty: '挑战',
      estMinutes: 12,
      code: `import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
gx = cv2.Sobel(img, cv2.CV_64F, 1, 0)
gy = cv2.Sobel(img, cv2.CV_64F, 0, 1)
mag, angle = cv2.cartToPolar(gx, gy, angleInDegrees=True)
print("幅值范围:", mag.min(), mag.max())
print("方向范围(度):", angle.min(), angle.max())`,
      task: '跟打 cartToPolar，同时得到梯度幅值与方向角。',
      tags: ['幅值', '方向', 'cartToPolar'],
      know: knowledge({
        overview:
          '梯度是矢量，包含幅值（边缘强度）与方向（边缘走向）。cartToPolar 把直角坐标 (gx,gy) 转为极坐标 (幅值,角度)，角度以度或弧度表示。',
        lineExplanations: [
          { code: 'cv2.cartToPolar(gx,gy,angleInDegrees=True)', explain: '一次调用同时返回幅值与角度（度）' }
        ],
        pythonNotes: [],
        apiDocs: [
          {
            name: 'cv2.cartToPolar',
            signature: 'cv2.cartToPolar(x, y, angleInDegrees=False) -> (magnitude, angle)',
            params: [
              { name: 'x,y', type: 'Mat', desc: 'x、y 方向梯度分量' },
              { name: 'angleInDegrees', type: 'bool', desc: 'True 输出角度制，否则弧度制', default: 'False' }
            ]
          }
        ],
        formulas: [
          { title: '梯度幅值', latex: 'M=\\sqrt{g_x^2+g_y^2}' },
          { title: '梯度方向', latex: '\\theta=\\operatorname{atan2}(g_y,g_x)' }
        ],
        flow: ['求两个方向梯度', '转极坐标', '按方向分桶（如 HOG）'],
        scenarios: ['HOG 方向直方图', '边缘方向分析'],
        research: ['梯度方向直方图是 SIFT/HOG 描述子的核心步骤'],
        pitfalls: [
          { problem: '角度单位用错', fix: '明确 angleInDegrees，弧度与度不可混用' },
          { problem: '只看幅值忽略方向', fix: '描述子类任务必须保留方向信息' }
        ],
        related: ['ch3-l04', 'ch4-l05']
      })
    }),
    lv('ch3', 7, 'Laplacian 二阶算子', {
      difficulty: '挑战',
      estMinutes: 11,
      code: `import cv2

img = cv2.imread("lena.jpg", 0)
blur = cv2.GaussianBlur(img, (3, 3), 0)
lap = cv2.Laplacian(blur, cv2.CV_64F, ksize=3)
print("Laplacian 范围:", lap.min(), lap.max())
print("形状:", lap.shape)`,
      task: '跟打 Laplacian，注意它对噪声敏感，先高斯平滑再使用。',
      tags: ['Laplacian', '二阶导'],
      labExperiment: 'laplacian',
      know: knowledge({
        overview:
          'Laplacian 是二阶导数算子，对图像求两个方向二阶偏导之和，边缘处产生过零点；因为二阶导放大噪声，使用前通常先高斯平滑。',
        lineExplanations: [
          { code: 'GaussianBlur 先平滑', explain: '抑制噪声，防止二阶导产生大量伪边缘' },
          { code: 'cv2.Laplacian(...,ksize=3)', explain: '计算二阶导数，输出含正负值' }
        ],
        pythonNotes: [],
        apiDocs: [
          {
            name: 'cv2.Laplacian',
            signature: 'cv2.Laplacian(src, ddepth, ksize=1, scale=1, delta=0)',
            params: [
              { name: 'ddepth', type: 'int', desc: '输出深度，常用 CV_64F' },
              { name: 'ksize', type: 'int', desc: '奇数孔径', default: '1' }
            ]
          }
        ],
        formulas: [
          { title: '拉普拉斯定义', latex: '\\nabla^2 I=\\frac{\\partial^2 I}{\\partial x^2}+\\frac{\\partial^2 I}{\\partial y^2}' }
        ],
        flow: ['高斯平滑', 'Laplacian 求二阶导', '通过过零点判断边缘'],
        scenarios: ['blob 检测（LoG）', '边缘过零点分析'],
        research: ['LoG/DoG 是斑点与关键点检测的理论基础'],
        pitfalls: [
          { problem: '不平滑直接做导致满屏噪点', fix: '务必先 GaussianBlur' },
          { problem: '正负响应难以直接当边缘', fix: '结合过零点或取绝对值后阈值化' }
        ],
        related: ['ch3-l04', 'ch4-l02']
      })
    }),
    lv('ch3', 8, '阈值处理 threshold', {
      difficulty: '基础',
      estMinutes: 9,
      code: `import cv2

img = cv2.imread("lena.jpg", 0)
edges = cv2.Sobel(img, cv2.CV_64F, 1, 1)
edges = cv2.convertScaleAbs(edges)
_, binary = cv2.threshold(edges, thresh=50, maxval=255, type=cv2.THRESH_BINARY)
print("二值图唯一值:", set(binary.ravel().tolist()))`,
      task: '跟打阈值处理，把灰度响应转为只有 0/255 的二值边缘。',
      tags: ['阈值', 'threshold'],
      labExperiment: 'threshold',
      know: knowledge({
        overview:
          '阈值处理按固定门限分割像素：大于阈值置 maxval、小于置 0，得到干净的二值图，是边缘图后处理与分割的基础操作。',
        lineExplanations: [
          { code: 'thresh=50', explain: '门限值，需根据响应分布调整' },
          { code: 'THRESH_BINARY', explain: '超阈值置 255，否则置 0' }
        ],
        pythonNotes: ['set(...) 查看数组中实际出现的取值集合'],
        apiDocs: [
          {
            name: 'cv2.threshold',
            signature: 'cv2.threshold(src, thresh, maxval, type) -> (retval, dst)',
            params: [
              { name: 'thresh', type: 'float', desc: '门限值' },
              { name: 'maxval', type: 'float', desc: '超过门限时的赋值' },
              { name: 'type', type: 'int', desc: '阈值类型，如 THRESH_BINARY' }
            ]
          }
        ],
        flow: ['得到灰度响应', '设定门限', '输出二值图'],
        scenarios: ['边缘图细化', '简单图像分割'],
        research: ['自适应/全局阈值比较是文档处理与分割的常见课题'],
        pitfalls: [
          { problem: '阈值过高边缘丢失、过低噪声多', fix: '结合直方图或 Otsu 自动阈值选择' },
          { problem: 'threshold 必须作用于灰度图', fix: '先确保输入是单通道' }
        ],
        related: ['ch3-l09', 'ch3-l10']
      })
    }),
    lv('ch3', 9, 'Otsu 自动阈值与边缘判断', {
      difficulty: '挑战',
      estMinutes: 11,
      code: `import cv2

img = cv2.imread("lena.jpg", 0)
blur = cv2.GaussianBlur(img, (5, 5), 0)
ret, otsu = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
print("Otsu 自动阈值:", ret)
print("输出形状:", otsu.shape)`,
      task: '跟打 Otsu 自动阈值，理解阈值为 0 时由算法自动确定。',
      tags: ['Otsu', '自动阈值'],
      know: knowledge({
        overview:
          'Otsu 法通过最大化类间方差自动确定最佳全局阈值，无需手工试错；阈值参数传 0，返回值 ret 即算法选出的门限。',
        lineExplanations: [
          { code: 'THRESH_BINARY + THRESH_OTSU', explain: '标志位相加，启用 Otsu 自动选择' },
          { code: 'ret', explain: '自动计算出的阈值，可用于报告与复现' }
        ],
        pythonNotes: ['整数标志通过 + 组合是 OpenCV 位掩码惯例'],
        apiDocs: [],
        formulas: [{ title: '类间方差最大化', latex: '\\sigma_b^2(t)=w_0(t)w_1(t)\\,[\\mu_0(t)-\\mu_1(t)]^2' }],
        flow: ['平滑直方图', 'Otsu 搜索最佳门限', '自动二值化'],
        scenarios: ['双峰直方图图像分割', '批量处理免调参'],
        research: ['自动阈值常用于文档二值化与细胞分割预处理'],
        pitfalls: [
          { problem: '单峰/复杂背景效果差', fix: '考虑自适应阈值或先改善光照' },
          { problem: '忘记加 THRESH_OTSU 标志', fix: '类型标志必须与 OTSU 组合' }
        ],
        related: ['ch3-l08']
      })
    }),
    lv('ch3', 10, '边缘检测综合流程', {
      difficulty: '挑战',
      estMinutes: 14,
      code: `import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
blur = cv2.GaussianBlur(img, (3, 3), 0)
sx = cv2.Sobel(blur, cv2.CV_64F, 1, 0)
sy = cv2.Sobel(blur, cv2.CV_64F, 0, 1)
mag = cv2.magnitude(sx, sy)
mag = cv2.convertScaleAbs(mag)
_, edges = cv2.threshold(mag, 60, 255, cv2.THRESH_BINARY)
cv2.imwrite("edges.png", edges)`,
      task: '跟打完整管线：平滑 → 双向 Sobel → 幅值 → 阈值 → 保存。',
      tags: ['综合流程', '边缘检测'],
      labExperiment: 'sobel',
      know: knowledge({
        overview:
          '本关串联标准边缘检测管线：先平滑抗噪，再求双向梯度并合成幅值，最后阈值化得到二值边缘，体现各知识点如何协作。',
        lineExplanations: [
          { code: 'GaussianBlur', explain: '第一步抗噪，稳定后续梯度' },
          { code: 'magnitude + convertScaleAbs', explain: '合成边缘强度并转 uint8' },
          { code: 'threshold(...,60,...)', explain: '门限化得到最终二值边缘' }
        ],
        pythonNotes: [],
        apiDocs: [],
        flow: ['平滑', '梯度分量', '幅值', '阈值化', '保存'],
        scenarios: ['课程综合实验', '工业视觉检测预处理'],
        research: ['可替换各环节算子做消融，对比边缘质量'],
        pitfalls: [
          { problem: '省略平滑导致边缘噪声多', fix: '保留 GaussianBlur 步骤' },
          { problem: '阈值固定不适配所有图像', fix: '可改用 Otsu 或自适应阈值' }
        ],
        related: ['ch3-l04', 'ch3-l08', 'ch3-l09']
      })
    })
  ]
}
