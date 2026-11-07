import type { Chapter } from '../types'
import { knowledge, lv } from './helpers'

export const ch5: Chapter = {
  id: 'ch5',
  index: 5,
  title: '特征匹配与图像拼接',
  subtitle: '描述子距离、比值检验、RANSAC 单应性与图像拼接',
  intro:
    '有了描述子，如何判断两张图中的对应关系？本章从欧氏距离入手，实现 BFMatcher 与 FLANN 匹配、Lowe 最近邻比值检验，并用 RANSAC 鲁棒估计单应性矩阵，最终完成透视变换与图像拼接。',
  objectives: [
    '理解描述子距离与暴力/近似最近邻匹配',
    '掌握 knnMatch 与 Lowe 比值检验',
    '理解 findHomography 与 RANSAC 鲁棒估计',
    '能用 warpPerspective 与 Stitcher 完成拼接'
  ],
  icon: 'Connection',
  levels: [
    lv('ch5', 1, '描述子欧氏距离', {
      difficulty: '进阶',
      estMinutes: 10,
      code: `import numpy as np

def euclidean(a, b):
    return np.sqrt(np.sum((a.astype(np.float32) - b.astype(np.float32)) ** 2))

d1 = np.array([1, 2, 3])
d2 = np.array([1, 3, 2])
print("欧氏距离:", round(euclidean(d1, d2), 3))`,
      task: '跟打欧氏距离函数，距离越小表示两个描述子越相似。',
      tags: ['欧氏距离', 'NumPy'],
      know: knowledge({
        overview:
          '匹配的本质是衡量描述子相似性。欧氏距离计算两个向量各维差的平方和再开方，距离越小越相似，是 BFMatcher 的默认度量。',
        lineExplanations: [
          { code: '(a-b) ** 2', explain: '逐维差的平方' },
          { code: 'np.sqrt(np.sum(...))', explain: '平方和开根号得到 L2 距离' }
        ],
        pythonNotes: ['def 定义带返回值的函数，round 保留小数'],
        apiDocs: [],
        formulas: [{ title: '欧氏距离', latex: 'd(\\mathbf{a},\\mathbf{b})=\\sqrt{\\sum_{i=1}^{n}(a_i-b_i)^2}' }],
        flow: ['对齐两个描述子', '逐维差平方求和', '开方得到距离'],
        scenarios: ['特征匹配的相似度度量', '最近邻搜索基础'],
        research: ['距离度量选择（L2/汉明/余弦）取决于描述子类型'],
        pitfalls: [
          { problem: '整数类型相减溢出', fix: '匹配前转 float32' },
          { problem: '二进制描述子误用 L2', fix: 'ORB/BRIEF 等二进制描述子应使用汉明距离 NORM_HAMMING' }
        ],
        related: ['ch5-l02', 'ch4-l06']
      })
    }),
    lv('ch5', 2, 'BFMatcher 暴力匹配', {
      mode: 'blank',
      difficulty: '进阶',
      estMinutes: 10,
      code: `import cv2

img1 = cv2.imread("box.png", 0)
img2 = cv2.imread("box_in_scene.png", 0)
sift = cv2.SIFT_create()
kp1, d1 = sift.detectAndCompute(img1, None)
kp2, d2 = sift.detectAndCompute(img2, None)
bf = cv2.BFMatcher(cv2.NORM_L2, crossCheck=False)
matches = bf.match(d1, d2)
print("匹配对数量:", len(matches))`,
      task: '跟打 BFMatcher，理解 NORM_L2 与 match 的一对一返回。',
      tags: ['BFMatcher', '匹配'],
      labExperiment: 'match',
      blank: {
        template: 'bf = cv2.{{1}}(cv2.{{2}}, crossCheck=False)',
        answers: [['BFMatcher'], ['NORM_L2']],
        hints: ['暴力匹配器名', 'SIFT 浮点描述子用 L2 范数'],
        analysis: ['BFMatcher 穷举所有描述子对，取距离最小者；NORM_L2 适配 SIFT']
      },
      know: knowledge({
        overview:
          'BFMatcher 对第一组每个描述子，在第二组中穷举距离最近的描述子。match 返回每个查询的最佳匹配，crossCheck=True 时要求互为最近邻，更可靠但数量更少。',
        lineExplanations: [
          { code: 'cv2.NORM_L2', explain: '距离类型，SIFT/SURF 用 L2，二进制描述子用 NORM_HAMMING' },
          { code: 'bf.match(d1,d2)', explain: '返回 DMatch 列表，每个含 queryIdx/trainIdx/distance' }
        ],
        pythonNotes: [],
        apiDocs: [
          {
            name: 'cv2.BFMatcher',
            signature: 'cv2.BFMatcher(normType=NORM_L2, crossCheck=False)',
            params: [
              { name: 'normType', type: 'int', desc: '距离度量类型', default: 'NORM_L2' },
              { name: 'crossCheck', type: 'bool', desc: '是否要求互最近邻', default: 'False' }
            ]
          }
        ],
        flow: ['选择距离类型', '创建匹配器', 'match 得到最佳匹配'],
        scenarios: ['小规模特征精确匹配', '教学理解匹配过程'],
        research: ['暴力匹配是评估近似最近邻（FLANN）质量的基准'],
        pitfalls: [
          { problem: 'SIFT 误用 NORM_HAMMING', fix: '浮点描述子用 NORM_L2' },
          { problem: '匹配含大量误匹配', fix: '结合比值检验或 crossCheck 过滤' }
        ],
        related: ['ch5-l03', 'ch5-l05']
      })
    }),
    lv('ch5', 3, 'knnMatch 最近邻匹配', {
      difficulty: '进阶',
      estMinutes: 10,
      code: `import cv2

img1 = cv2.imread("box.png", 0)
img2 = cv2.imread("box_in_scene.png", 0)
sift = cv2.SIFT_create()
kp1, d1 = sift.detectAndCompute(img1, None)
kp2, d2 = sift.detectAndCompute(img2, None)
bf = cv2.BFMatcher()
knn = bf.knnMatch(d1, d2, k=2)
print("查询匹配组数:", len(knn))
print("每组近邻数:", len(knn[0]))`,
      task: '跟打 knnMatch(k=2)，为每个查询返回两个最近邻。',
      tags: ['knnMatch', '最近邻'],
      know: knowledge({
        overview:
          'knnMatch 为每个查询描述子返回 k 个最近邻，k=2 时得到最佳与次佳匹配，是 Lowe 比值检验的前提。',
        lineExplanations: [
          { code: 'knnMatch(d1,d2,k=2)', explain: '每个元素是长度 2 的 DMatch 列表' },
          { code: 'm.distance', explain: 'DMatch 的 distance 字段越小越相似' }
        ],
        pythonNotes: [],
        apiDocs: [
          {
            name: 'BFMatcher.knnMatch',
            signature: 'knnMatch(queryDescriptors, trainDescriptors, k)',
            params: [
              { name: 'k', type: 'int', desc: '返回的最近邻个数，比值检验取 2' }
            ]
          }
        ],
        flow: ['创建匹配器', '请求 k 个近邻', '交给比值检验过滤'],
        scenarios: ['需要区分“真匹配”和“模糊匹配”', '比值检验前置'],
        research: ['k 近邻结构是许多匹配与检索算法的基础'],
        pitfalls: [
          { problem: '描述子不足 k 个时该组长度小于 2', fix: '使用前检查每组长度，避免越界' },
          { problem: '直接用 knn 全部结果', fix: '必须经过比值检验筛选' }
        ],
        related: ['ch5-l05']
      })
    }),
    lv('ch5', 4, 'FLANN 快速近似匹配', {
      difficulty: '挑战',
      estMinutes: 11,
      code: `import cv2

img1 = cv2.imread("box.png", 0)
img2 = cv2.imread("box_in_scene.png", 0)
sift = cv2.SIFT_create()
kp1, d1 = sift.detectAndCompute(img1, None)
kp2, d2 = sift.detectAndCompute(img2, None)
index_params = dict(algorithm=1, trees=5)
search_params = dict(checks=50)
flann = cv2.FlannBasedMatcher(index_params, search_params)
matches = flann.knnMatch(d1, d2, k=2)
print("FLANN 匹配组数:", len(matches))`,
      task: '跟打 FLANN 配置，大规模特征下比暴力匹配快得多。',
      tags: ['FLANN', '近似最近邻'],
      know: knowledge({
        overview:
          'FLANN（Fast Library for Approximate Nearest Neighbors）用 KD 树等索引做近似最近邻搜索，在大量高维描述子下显著快于暴力匹配，代价是可能牺牲少量精度。',
        lineExplanations: [
          { code: 'algorithm=1, trees=5', explain: 'FLANN_INDEX_KDTREE，树越多索引越精细' },
          { code: 'checks=50', explain: '搜索时检查的叶子数，越大越准但越慢' }
        ],
        pythonNotes: ['dict(...) 是创建字典的函数式写法'],
        apiDocs: [
          {
            name: 'cv2.FlannBasedMatcher',
            signature: 'cv2.FlannBasedMatcher(indexParams, searchParams)',
            params: [
              { name: 'indexParams', type: 'dict', desc: '索引算法与参数' },
              { name: 'searchParams', type: 'dict', desc: '搜索参数，如 checks' }
            ]
          }
        ],
        flow: ['配置索引参数', '构建 FLANN 匹配器', 'knnMatch 近似搜索'],
        scenarios: ['大规模描述子匹配', '对速度敏感的拼接任务'],
        research: ['近似最近邻是大规模图像检索与 SLAM 的常用组件'],
        pitfalls: [
          { problem: '二进制描述子用 KD 树参数不匹配', fix: 'ORB 等应使用 LSH 索引参数' },
          { problem: 'checks 过小匹配质量下降', fix: '在速度与内点率间平衡，常用 50' }
        ],
        related: ['ch5-l03', 'ch5-l02']
      })
    }),
    lv('ch5', 5, 'Lowe 最近邻比值检验', {
      difficulty: '挑战',
      estMinutes: 12,
      code: `import cv2

img1 = cv2.imread("box.png", 0)
img2 = cv2.imread("box_in_scene.png", 0)
sift = cv2.SIFT_create()
kp1, d1 = sift.detectAndCompute(img1, None)
kp2, d2 = sift.detectAndCompute(img2, None)
good = []
for m, n in cv2.BFMatcher().knnMatch(d1, d2, k=2):
    if m.distance < 0.75 * n.distance:
        good.append(m)
print("比值检验通过的好匹配:", len(good))`,
      task: '跟打比值检验，最佳与次佳距离比小于 0.75 才保留。',
      tags: ['比值检验', 'Lowe'],
      labExperiment: 'match',
      know: knowledge({
        overview:
          '若一个描述子的最佳匹配距离远小于次佳匹配，说明它区分度高、匹配可信；两者接近则处于重复纹理区域，应剔除。阈值 0.75 来自 Lowe 经典论文。',
        lineExplanations: [
          { code: 'for m, n in ...knnMatch(...,k=2)', explain: '解包最佳 m 与次佳 n' },
          { code: 'm.distance < 0.75 * n.distance', explain: '比值检验核心条件，阈值可在 0.6-0.8 调整' }
        ],
        pythonNotes: [],
        apiDocs: [],
        formulas: [{ title: '比值检验', latex: '\\frac{d_{1}}{d_{2}} < \\rho,\\quad \\rho=0.75' }],
        flow: ['取 k=2 近邻', '计算距离比', '保留高区分度匹配'],
        scenarios: ['剔除重复纹理误匹配', '拼接前的匹配净化'],
        research: ['比值阈值是 SIFT 匹配论文中被广泛引用的经验值'],
        pitfalls: [
          { problem: '阈值过松引入误匹配', fix: '更严格时降到 0.6-0.7' },
          { problem: '某些组不足两个近邻导致解包失败', fix: '先判断 len(pair)==2' }
        ],
        related: ['ch5-l03', 'ch5-l06']
      })
    }),
    lv('ch5', 6, '单应性矩阵 findHomography', {
      difficulty: '挑战',
      estMinutes: 12,
      code: `import cv2
import numpy as np

good = []
src_pts = np.float32([kp[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
dst_pts = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
print("单应性矩阵形状:", H.shape if H is not None else None)
print("内点数量:", int(mask.sum()) if mask is not None else 0)`,
      task: '跟打 findHomography，由对应点求解 3×3 单应性矩阵。',
      tags: ['单应性', 'findHomography'],
      labExperiment: 'ransac',
      know: knowledge({
        overview:
          '单应性矩阵 H 是 3×3 矩阵，描述同一平面在两幅图像间的投影映射。findHomography 由至少 4 对对应点求解，配合 RANSAC 抵抗误匹配。',
        lineExplanations: [
          { code: 'src_pts/dst_pts', explain: '好匹配对应的两图像坐标，形状 (-1,1,2)' },
          { code: 'cv2.RANSAC, 5.0', explain: '鲁棒方法与重投影阈值（像素）' },
          { code: 'mask', explain: '内点掩码，1 表示符合该单应性的匹配' }
        ],
        pythonNotes: ['列表推导 + reshape 组织坐标张量'],
        apiDocs: [
          {
            name: 'cv2.findHomography',
            signature: 'cv2.findHomography(srcPoints, dstPoints, method=0, ransacReprojThreshold=3)',
            params: [
              { name: 'method', type: 'int', desc: '0 最小二乘；RANSAC/LMEDS 鲁棒方法', default: '0' },
              { name: 'ransacReprojThreshold', type: 'float', desc: '判定内点的最大重投影误差', default: '3' }
            ],
            returns: '(H 3×3, mask 内点掩码)'
          }
        ],
        formulas: [{ title: '平面投影映射', latex: '\\begin{bmatrix}x^{\\prime}\\\\y^{\\prime}\\\\1\\end{bmatrix}\\sim H\\begin{bmatrix}x\\\\y\\\\1\\end{bmatrix}' }],
        flow: ['收集好匹配坐标', 'RANSAC 选内点', 'DLT 求解 H'],
        scenarios: ['平面目标识别', '图像拼接对齐'],
        research: ['单应性估计是几何视觉与 AR 平面注册的基础'],
        pitfalls: [
          { problem: '内点不足 H 为 None', fix: '增加匹配数量或放宽比值阈值，保证至少 4 对' },
          { problem: '非平面场景单应性不成立', fix: '单应性假设场景平面或纯旋转相机' }
        ],
        related: ['ch5-l07', 'ch5-l08']
      })
    }),
    lv('ch5', 7, 'RANSAC 鲁棒估计', {
      difficulty: '挑战',
      estMinutes: 12,
      code: `import cv2
import numpy as np

rng = np.random.default_rng(42)
data = rng.normal(size=(100, 2))
data[:20] += 10
inliers = 0
for _ in range(50):
    sample = rng.choice(data, 4, replace=False)
    dist = np.linalg.norm(sample - sample.mean(axis=0), axis=1)
    inliers = max(inliers, int((dist < 2).sum()))
print("RANSAC 风格抽样内点示例:", inliers)`,
      task: '跟打 RANSAC 抽样思想：随机最小子集 → 拟合 → 统计内点。',
      tags: ['RANSAC', '鲁棒估计'],
      labExperiment: 'ransac',
      know: knowledge({
        overview:
          'RANSAC 反复随机选取最小数据子集拟合模型，统计误差阈值内的内点，内点最多的模型获胜，能在含大量外点（误匹配）时稳健估计。',
        lineExplanations: [
          { code: 'rng.choice(data,4)', explain: '随机抽 4 对（单应性最小子集）' },
          { code: 'dist < 2', explain: '按误差阈值统计内点数量' }
        ],
        pythonNotes: ['np.random.default_rng 是新版随机数生成器接口'],
        apiDocs: [],
        formulas: [{ title: '迭代次数', latex: 'N=\\frac{\\log(1-p)}{\\log(1-w^s)}' }],
        flow: ['随机最小子集', '拟合模型', '统计内点并迭代', '选最佳模型'],
        scenarios: ['含误匹配的几何估计', '稳健模型拟合'],
        research: ['RANSAC 及其变体（PROSAC/USAC）广泛用于 SLAM 与 SfM'],
        pitfalls: [
          { problem: '迭代次数太少漏掉好模型', fix: '按外点比例用公式估算所需迭代次数' },
          { problem: '阈值固定不适应噪声', fix: '结合测量噪声尺度设置重投影阈值' }
        ],
        related: ['ch5-l06']
      })
    }),
    lv('ch5', 8, '透视变换 warpPerspective', {
      difficulty: '进阶',
      estMinutes: 10,
      code: `import cv2
import numpy as np

img = cv2.imread("card.jpg")
h, w = img.shape[:2]
src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
dst = np.float32([[20, 30], [w - 10, 0], [w, h - 20], [10, h]])
M = cv2.getPerspectiveTransform(src, dst)
warped = cv2.warpPerspective(img, M, (w, h))
print("透视变换结果:", warped.shape)`,
      task: '跟打 getPerspectiveTransform 与 warpPerspective。',
      tags: ['透视变换', 'warpPerspective'],
      know: knowledge({
        overview:
          'warpPerspective 依据 3×3 变换矩阵把源图像逐像素映射到新视角，getPerspectiveTransform 由 4 对点直接计算矩阵，常用于视角校正。',
        lineExplanations: [
          { code: 'getPerspectiveTransform(src,dst)', explain: '4 对对应点求透视矩阵' },
          { code: 'warpPerspective(img,M,(w,h))', explain: '按目标尺寸做逆映射插值输出' }
        ],
        pythonNotes: ['img.shape[:2] 切片只取前两个元素'],
        apiDocs: [
          {
            name: 'cv2.warpPerspective',
            signature: 'cv2.warpPerspective(src, M, dsize, flags=INTER_LINEAR)',
            params: [
              { name: 'M', type: 'Mat', desc: '3×3 变换矩阵' },
              { name: 'dsize', type: 'tuple', desc: '(宽, 高) 输出尺寸' }
            ]
          }
        ],
        flow: ['准备 4 对点', '求透视矩阵', 'warp 输出新视角'],
        scenarios: ['文档/卡片校正', '拼接中的图像变形'],
        research: ['透视 warp 是图像拼接与俯视变换（BEV）的关键步骤'],
        pitfalls: [
          { problem: 'dsize 用 (高,宽) 报错/错位', fix: 'dsize 是 (宽, 高)' },
          { problem: '点顺序错乱导致扭曲', fix: '四点按左上、右上、右下、左下一致顺序' }
        ],
        related: ['ch5-l06', 'ch5-l09']
      })
    }),
    lv('ch5', 9, 'Stitcher 图像拼接', {
      difficulty: '进阶',
      estMinutes: 11,
      code: `import cv2

img1 = cv2.imread("left.jpg")
img2 = cv2.imread("right.jpg")
stitcher = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)
status, pano = stitcher.stitch([img1, img2])
if status == cv2.Stitcher_OK:
    cv2.imwrite("panorama.png", pano)
print("拼接状态码:", status)`,
      task: '跟打 Stitcher 流程，注意检查返回状态码。',
      tags: ['Stitcher', '图像拼接'],
      labExperiment: 'stitch',
      know: knowledge({
        overview:
          'cv2.Stitcher 封装了特征检测、匹配、单应性估计、warp 与融合的完整拼接管线，返回状态码与全景图；状态码非 0 表示失败原因。',
        lineExplanations: [
          { code: 'Stitcher_create(PANORAMA)', explain: '创建全景模式拼接器' },
          { code: 'stitch([img1,img2])', explain: '输入有序图像列表，返回 (状态码, 全景图)' },
          { code: 'Stitcher_OK', explain: '状态码 0 表示成功' }
        ],
        pythonNotes: [],
        apiDocs: [
          {
            name: 'cv2.Stitcher.stitch',
            signature: 'stitch(images, masks=None) -> (status, pano)',
            params: [{ name: 'images', type: 'list[Mat]', desc: '按空间顺序排列的输入图像' }]
          }
        ],
        flow: ['输入图像列表', '内部特征匹配与几何估计', 'warp 融合输出全景'],
        scenarios: ['全景照片生成', '无人机/监控视野拼接'],
        research: ['自动拼接是计算摄影与遥感制图的经典应用'],
        pitfalls: [
          { problem: '重叠不足返回错误码', fix: '保证相邻图像约 25%-40% 重叠' },
          { problem: '图像顺序混乱失败', fix: '按从左到右的真实顺序传入' }
        ],
        related: ['ch5-l10']
      })
    }),
    lv('ch5', 10, '特征匹配与拼接综合任务', {
      mode: 'challenge',
      difficulty: '挑战',
      estMinutes: 18,
      code: `import cv2

img1 = cv2.imread("left.jpg", 0)
img2 = cv2.imread("right.jpg", 0)
sift = cv2.SIFT_create()
kp1, d1 = sift.detectAndCompute(img1, None)
kp2, d2 = sift.detectAndCompute(img2, None)
good = []
for pair in cv2.BFMatcher().knnMatch(d1, d2, k=2):
    if len(pair) == 2 and pair[0].distance < 0.75 * pair[1].distance:
        good.append(pair[0])
print("好匹配数量:", len(good))`,
      task: '实战：独立完成特征提取、knnMatch 与比值检验，输出好匹配数量。',
      tags: ['综合实战', '匹配'],
      validators: [
        { type: 'function_call', name: 'cv2.SIFT_create', description: '创建 SIFT 特征检测器' },
        { type: 'function_call', name: 'detectAndCompute', description: '对两张图检测关键点并计算描述子' },
        { type: 'function_call', name: 'knnMatch', description: '使用 k=2 最近邻匹配' },
        { type: 'structure_count', name: 'knnMatch', min: 1, description: '至少执行一次最近邻匹配' },
        { type: 'keyword', name: 'if', description: '对比值检验结果进行条件判断' }
      ],
      labExperiment: 'stitch',
      know: knowledge({
        overview:
          '本实战要求把第四、五章知识串成完整匹配管线，并对 knn 结果做长度与比值双重保护，是拼接前的关键一步。',
        lineExplanations: [
          { code: 'len(pair) == 2', explain: '防御性检查，避免近邻不足解包错误' },
          { code: 'pair[0].distance < 0.75*pair[1].distance', explain: 'Lowe 比值检验' }
        ],
        pythonNotes: ['实战模式不执行 Python，仅对结构做静态检查，详见模式限制说明'],
        apiDocs: [],
        flow: ['提取特征', 'knn 匹配', '比值检验', '得到好匹配'],
        scenarios: ['拼接前对齐', '目标识别匹配'],
        research: ['好匹配内点质量决定后续单应性估计成败'],
        pitfalls: [
          { problem: '不做长度检查导致异常', fix: '保留 len(pair)==2 条件' },
          { problem: '把静态检查当成真实运行', fix: '理解实战模式只验证结构，不执行任意代码' }
        ],
        related: ['ch5-l05', 'ch5-l06', 'ch5-l09']
      })
    })
  ]
}
