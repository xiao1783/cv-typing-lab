import type { Chapter } from '../types'
import { knowledge, lv } from './helpers'

export const ch1: Chapter = {
  id: 'ch1',
  index: 1,
  title: 'OpenCV基础与图像卷积',
  subtitle: '从导入库到二维卷积，建立图像即数组的核心认知',
  intro:
    '本章是整个 CV 编程的地基。你将学会用 Python 导入 OpenCV 与 NumPy，读取并理解图像的数组结构，完成颜色空间转换，并亲手实现和调用二维卷积 filter2D，为后续滤波、边缘与特征章节打下基础。',
  objectives: [
    '掌握 cv2、numpy 的标准导入与图像读取显示',
    '理解图像在 NumPy 中的形状、维度与 uint8 数据类型',
    '能够进行颜色空间转换与像素访问',
    '理解二维卷积的数学过程并能用 filter2D 实现'
  ],
  icon: 'Picture',
  levels: [
    lv('ch1', 1, '导入OpenCV与NumPy', {
      difficulty: '入门',
      estMinutes: 6,
      code: `import cv2
import numpy as np

print("OpenCV version:", cv2.__version__)
print("NumPy version:", np.__version__)`,
      task: '请逐字符跟打导入语句，建立 Python CV 编程的标准开头。',
      tags: ['导入', '环境'],
      know: knowledge({
        overview:
          'OpenCV 的 Python 模块名为 cv2，数值计算库 NumPy 按惯例别名为 np。几乎所有 OpenCV 程序都以这两行导入开始。',
        lineExplanations: [
          { code: 'import cv2', explain: '导入 OpenCV 计算机视觉库，调用时写 cv2.函数名' },
          { code: 'import numpy as np', explain: '导入 NumPy 并约定别名为 np，图像数据本质是 np.ndarray' },
          { code: 'cv2.__version__', explain: '查看 OpenCV 版本号字符串，用于确认安装与 API 兼容性' }
        ],
        pythonNotes: ['import 是 Python 的模块导入关键字', 'as 用于给模块起别名，np 是 NumPy 的社区惯例'],
        apiDocs: [],
        flow: ['导入 cv2 与 numpy', '确认库版本', '进入后续图像处理流程'],
        scenarios: ['所有 OpenCV 脚本的标准开头', '环境配置与版本排查'],
        research: ['复现论文代码前先确认 OpenCV 版本，避免 API 差异'],
        pitfalls: [
          { problem: 'ModuleNotFoundError: No module named cv2', fix: '在终端执行 pip install opencv-python 安装' },
          { problem: '误写 import opencv', fix: 'Python 中模块名是 cv2 而非 opencv' }
        ],
        related: ['ch1-l02']
      })
    }),
    lv('ch1', 2, '读取本地图像', {
      difficulty: '入门',
      estMinutes: 7,
      code: `import cv2

img = cv2.imread("lena.jpg")
if img is None:
    raise FileNotFoundError("图像读取失败，请检查路径")
print("图像形状:", img.shape)`,
      task: '跟打图像读取代码，注意 imread 失败时返回 None 而非抛异常。',
      tags: ['IO', 'imread'],
      labExperiment: 'gray',
      know: knowledge({
        overview:
          'cv2.imread 从磁盘读取图像并返回 NumPy 数组。默认以 BGR 三通道、uint8 格式读取；文件不存在时返回 None，需要手动判空。',
        lineExplanations: [
          { code: 'img = cv2.imread("lena.jpg")', explain: '读取图像，默认 flags=IMREAD_COLOR，得到 BGR 数组' },
          { code: 'if img is None:', explain: '路径错误或文件损坏时 imread 返回 None，不会自动报错' },
          { code: 'img.shape', explain: '返回 (高, 宽, 通道数)，注意高度在前、宽度在后' }
        ],
        pythonNotes: ['is None 是 Python 判断空值的规范写法', 'raise 用于主动抛出异常'],
        apiDocs: [
          {
            name: 'cv2.imread',
            signature: 'cv2.imread(filename, flags=cv2.IMREAD_COLOR) -> Mat',
            returns: '图像数组；读取失败返回 None',
            params: [
              { name: 'filename', type: 'str', desc: '图像文件路径，支持相对/绝对路径' },
              {
                name: 'flags',
                type: 'int',
                desc: '读取方式',
                default: 'IMREAD_COLOR（彩色 BGR，忽略 alpha）'
              }
            ]
          }
        ],
        flow: ['给定文件路径', 'imread 解码为数组', '判空后使用'],
        scenarios: ['加载训练/测试图像', '批量读图前的单图验证'],
        research: ['数据集加载管线的第一步，需统一路径与判空逻辑'],
        pitfalls: [
          { problem: '中文路径在部分平台读取失败', fix: '可用 np.fromfile 配合 cv2.imdecode 读取' },
          { problem: '不判空直接使用导致 AttributeError', fix: '读取后立即检查 img is None' }
        ],
        related: ['ch1-l01', 'ch1-l03']
      })
    }),
    lv('ch1', 3, '图像形状与数组属性', {
      difficulty: '基础',
      estMinutes: 8,
      code: `import cv2

img = cv2.imread("lena.jpg")
h, w, c = img.shape
print("高度:", h, "宽度:", w, "通道数:", c)
print("维度:", img.ndim, "数据类型:", img.dtype)
print("总像素:", img.size)`,
      task: '跟打数组属性代码，理解 shape、ndim、dtype、size 的含义。',
      tags: ['NumPy', '数组'],
      know: knowledge({
        overview:
          '彩色图像是形状为 (H, W, 3) 的三维数组，灰度图是 (H, W) 的二维数组。ndim 表示维度数，dtype 表示元素类型，size 是元素总数。',
        lineExplanations: [
          { code: 'h, w, c = img.shape', explain: '元组解包，依次得到高、宽、通道数' },
          { code: 'img.ndim', explain: '数组维度，彩色图为 3，灰度图为 2' },
          { code: 'img.size', explain: '元素总数 = H×W×C' }
        ],
        pythonNotes: ['h, w, c = ... 是 Python 的序列解包语法'],
        apiDocs: [],
        flow: ['读取图像', '查看 shape/ndim/dtype', '判断数组是否满足后续算法要求'],
        scenarios: ['确认输入尺寸', '调试通道不匹配问题'],
        research: ['论文中常报告输入分辨率，需要先核对 shape'],
        pitfalls: [
          { problem: '灰度图解包三个值报错', fix: '灰度图 shape 只有两个元素，应写 h, w = img.shape' },
          { problem: '混淆宽高顺序', fix: 'OpenCV 数组是 (行=高, 列=宽)，而绘制参数常是 (宽,高)' }
        ],
        related: ['ch1-l02', 'ch1-l05']
      })
    }),
    lv('ch1', 4, '颜色空间转换', {
      difficulty: '基础',
      estMinutes: 8,
      code: `import cv2

img = cv2.imread("lena.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
print("灰度形状:", gray.shape, "RGB形状:", rgb.shape)`,
      task: '跟打 cvtColor 代码，记住 OpenCV 默认 BGR 而不是 RGB。',
      tags: ['颜色空间', 'cvtColor'],
      labExperiment: 'gray',
      know: knowledge({
        overview:
          'cv2.cvtColor 用于颜色空间转换。OpenCV 默认通道顺序为 BGR，与 Matplotlib 的 RGB 相反，显示前常需转换；灰度化是许多算法的前置步骤。',
        lineExplanations: [
          { code: 'COLOR_BGR2GRAY', explain: '三通道 BGR 转单通道灰度，按加权公式计算亮度' },
          { code: 'COLOR_BGR2RGB', explain: '通道顺序交换，便于 Matplotlib 正确显示' }
        ],
        pythonNotes: ['常量名全大写，属于 cv2 模块定义的整数枚举'],
        apiDocs: [
          {
            name: 'cv2.cvtColor',
            signature: 'cv2.cvtColor(src, code, dstCn=0) -> dst',
            params: [
              { name: 'src', type: 'Mat', desc: '输入图像' },
              { name: 'code', type: 'int', desc: '转换码，如 COLOR_BGR2GRAY' },
              { name: 'dstCn', type: 'int', desc: '目标通道数，0 表示自动推断', default: '0' }
            ]
          }
        ],
        formulas: [
          {
            title: 'BGR 转灰度（ITU-R BT.601）',
            latex: 'Y = 0.299\\,R + 0.587\\,G + 0.114\\,B'
          }
        ],
        flow: ['读取 BGR 图像', '选择转换码', '输出目标颜色空间数组'],
        scenarios: ['算法要求灰度输入', '跨库显示前的通道对齐'],
        research: ['灰度化降低计算量，是边缘检测、特征提取的常见预处理'],
        pitfalls: [
          { problem: 'Matplotlib 显示颜色发蓝/发红', fix: '先用 COLOR_BGR2RGB 转换再 imshow' },
          { problem: '转换码方向写反', fix: '确认 src 与目标空间，如 BGR2GRAY 而非 GRAY2BGR' }
        ],
        related: ['ch1-l02', 'ch3-l01']
      })
    }),
    lv('ch1', 5, 'NumPy创建图像数组', {
      difficulty: '基础',
      estMinutes: 8,
      code: `import numpy as np

zeros = np.zeros((200, 300), dtype=np.uint8)
ones = np.ones((200, 300, 3), dtype=np.uint8) * 255
print("零数组形状:", zeros.shape)
print("白图像素范围:", ones.min(), ones.max())`,
      task: '跟打 zeros/ones 创建数组代码，注意 dtype 必须指定 uint8。',
      tags: ['NumPy', '创建数组'],
      know: knowledge({
        overview:
          'np.zeros 生成全 0 数组（黑色），np.ones 生成全 1 数组，乘 255 得到白色画布。图像数组默认需要 uint8 类型，取值 0-255。',
        lineExplanations: [
          { code: 'np.zeros((200,300), dtype=np.uint8)', explain: '200 行 300 列的黑色灰度图' },
          { code: 'np.ones(...) * 255', explain: 'NumPy 广播，逐元素乘 255 得到白色三通道图' },
          { code: 'ones.min()/max()', explain: '验证像素取值范围是否在 0-255' }
        ],
        pythonNotes: ['关键字参数 dtype 指定元素类型', '* 对 ndarray 是逐元素运算（广播）'],
        apiDocs: [],
        flow: ['确定形状 (H,W[,C])', '指定 uint8 创建', '在画布上绘制或作为掩码'],
        scenarios: ['创建掩码 mask', '初始化空白画布'],
        research: ['掩膜、标注图常以全零数组初始化'],
        pitfalls: [
          { problem: '默认 float64 无法正常显示/保存', fix: '显式指定 dtype=np.uint8' },
          { problem: '形状顺序写反', fix: '形状元组是 (高, 宽)，不是 (宽, 高)' }
        ],
        related: ['ch1-l03', 'ch1-l07']
      })
    }),
    lv('ch1', 6, '像素访问与区域切片', {
      difficulty: '基础',
      estMinutes: 9,
      code: `import cv2
import numpy as np

img = cv2.imread("lena.jpg")
b, g, r = img[100, 200]
img[100, 200] = [255, 255, 255]
roi = img[50:150, 100:300]
print("该像素 BGR:", b, g, r)
print("ROI 形状:", roi.shape)`,
      task: '跟打像素索引与切片代码，理解行列索引与 BGR 取值。',
      tags: ['NumPy', '像素', '切片'],
      know: knowledge({
        overview:
          '通过 img[y, x] 访问像素，彩色像素返回 [B,G,R]。切片 img[y1:y2, x1:x2] 提取感兴趣区域 ROI，切片是视图，修改会影响原图。',
        lineExplanations: [
          { code: 'img[100, 200]', explain: '第 100 行、第 200 列像素，返回 BGR 三值' },
          { code: 'img[100, 200] = [255,255,255]', explain: '把该像素设为白色' },
          { code: 'img[50:150, 100:300]', explain: '行 50-149、列 100-299 的矩形 ROI' }
        ],
        pythonNotes: ['Python 切片左闭右开，含起始不含结束', '多变量解包 b, g, r = ...'],
        apiDocs: [],
        flow: ['按 (行,列) 定位', '读取/赋值像素', '用切片提取 ROI'],
        scenarios: ['局部区域处理', '像素级标注'],
        research: ['ROI 分析在目标检测区域评估中常见'],
        pitfalls: [
          { problem: '坐标写成 img[x, y] 导致位置错位', fix: '第一个索引是行 y，第二个才是列 x' },
          { problem: '修改 ROI 意外改动原图', fix: '需要独立副本时写 roi = img[...].copy()' }
        ],
        related: ['ch1-l05']
      })
    }),
    lv('ch1', 7, 'uint8数据类型与归一化', {
      difficulty: '进阶',
      estMinutes: 10,
      code: `import cv2
import numpy as np

img = cv2.imread("lena.jpg")
f = img.astype(np.float64) / 255.0
back = (f * 255).astype(np.uint8)
print("归一化范围:", f.min(), f.max())
print("还原后形状:", back.shape, back.dtype)`,
      task: '跟打类型转换与归一化代码，理解为什么运算前常转 float。',
      tags: ['dtype', '归一化'],
      know: knowledge({
        overview:
          'uint8 只存 0-255 整数，做减法、卷积等运算容易溢出或截断。先 astype 转浮点并归一化到 [0,1]，运算完成后再转回 uint8 显示。',
        lineExplanations: [
          { code: 'img.astype(np.float64)', explain: '复制并转换为 64 位浮点，支持小数与负数' },
          { code: '/ 255.0', explain: '归一化到 [0,1]，深度学习与数学运算的常见输入域' },
          { code: '(f*255).astype(np.uint8)', explain: '映射回 0-255 并转为图像类型' }
        ],
        pythonNotes: ['astype 返回新数组，不修改原数组'],
        apiDocs: [],
        formulas: [{ title: '线性归一化', latex: 'x_{norm} = \\frac{x}{255}' }],
        flow: ['uint8 转 float', '归一化后做数学运算', '缩放回 255 并转 uint8'],
        scenarios: ['卷积/差分前的类型保护', '深度学习图像预处理'],
        research: ['论文中输入归一化可稳定梯度、加速收敛'],
        pitfalls: [
          { problem: 'uint8 下负数变 255 附近的值（溢出）', fix: '运算前先转浮点类型' },
          { problem: '浮点数组直接 imshow 显示异常', fix: '显示前转回 uint8' }
        ],
        related: ['ch1-l05', 'ch1-l08']
      })
    }),
    lv('ch1', 8, '手动实现二维卷积', {
      difficulty: '挑战',
      estMinutes: 14,
      code: `import numpy as np

def conv2d(image, kernel):
    kh, kw = kernel.shape
    ph, pw = kh // 2, kw // 2
    padded = np.pad(image, ((ph, ph), (pw, pw)), mode="edge")
    out = np.zeros_like(image, dtype=np.float64)
    for i in range(image.shape[0]):
        for j in range(image.shape[1]):
            region = padded[i:i + kh, j:j + kw]
            out[i, j] = np.sum(region * kernel)
    return out`,
      task: '跟打手动卷积函数，重点理解嵌套循环、边缘填充与逐元素乘加。',
      tags: ['卷积', 'NumPy', '算法原理'],
      labExperiment: 'conv',
      know: knowledge({
        overview:
          '二维卷积在每个像素位置取核大小邻域，与卷积核逐元素相乘再求和，作为输出像素。边缘填充保证输出尺寸不变；"edge" 用边界像素填充。',
        lineExplanations: [
          { code: 'np.pad(..., mode="edge")', explain: '边缘复制填充，避免输出缩小' },
          { code: 'for i ... for j ...', explain: '遍历每个输出像素位置' },
          { code: 'np.sum(region * kernel)', explain: '邻域与核逐元素乘加，即卷积核心运算' }
        ],
        pythonNotes: ['def 定义函数，缩进决定函数体', 'np.zeros_like 生成同形状数组'],
        apiDocs: [],
        formulas: [
          {
            title: '二维离散卷积（相关）',
            latex: 'G(i,j)=\\sum_{u}\\sum_{v} I(i+u,\\ j+v)\\,K(u,v)'
          }
        ],
        flow: ['核中心对齐像素', '提取邻域并填充', '乘加求和写入输出'],
        scenarios: ['理解滤波与边缘检测的统一底层', '自定义核实验'],
        research: ['卷积是 CNN 的基本操作，手工实现有助于理解感受野与参数共享'],
        pitfalls: [
          { problem: '不填充导致输出尺寸变小', fix: '使用 np.pad 做 same 填充' },
          { problem: 'uint8 求和截断', fix: '输出数组使用 float64，最后再转换' }
        ],
        related: ['ch1-l09', 'ch2-l01']
      })
    }),
    lv('ch1', 9, 'filter2D调用卷积', {
      mode: 'blank',
      difficulty: '进阶',
      estMinutes: 10,
      code: `import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
kernel = np.ones((3, 3), dtype=np.float32) / 9.0
dst = cv2.filter2D(img, cv2.CV_8U, kernel)
print("输出形状:", dst.shape, "数据类型:", dst.dtype)`,
      task: '跟打 filter2D 调用，理解 ddepth 与归一化卷积核。',
      tags: ['filter2D', '卷积'],
      labExperiment: 'conv',
      blank: {
        template: 'kernel = np.ones({{1}}, dtype=np.float32) / {{2}}\ndst = cv2.{{3}}(img, cv2.CV_8U, kernel)',
        answers: [['(3, 3)'], ['9.0', '9'], ['filter2D']],
        hints: ['3×3 核的形状元组', '9 个元素求平均，分母为 9', 'OpenCV 的卷积函数名'],
        analysis: ['3×3 均值核共 9 个元素，除以 9 使权重和为 1，输出亮度保持不变']
      },
      know: knowledge({
        overview:
          'cv2.filter2D 是 OpenCV 的通用卷积（实际为相关）函数，支持任意自定义核。ddepth 指定目标位深，CV_8U 即 uint8；核权重和决定输出亮度。',
        lineExplanations: [
          { code: 'np.ones((3,3))/9.0', explain: '构造 3×3 均值核，权重和为 1' },
          { code: 'cv2.CV_8U', explain: '目标深度 8 位无符号；需要负值结果时用 CV_64F' }
        ],
        pythonNotes: ['imread 第二参数 0 等价于 IMREAD_GRAYSCALE'],
        apiDocs: [
          {
            name: 'cv2.filter2D',
            signature: 'cv2.filter2D(src, ddepth, kernel, anchor=(-1,-1), delta=0, borderType=BORDER_DEFAULT)',
            params: [
              { name: 'src', type: 'Mat', desc: '输入图像' },
              { name: 'ddepth', type: 'int', desc: '目标深度，-1 表示与源相同' },
              { name: 'kernel', type: 'Mat', desc: '单通道浮点卷积核' },
              { name: 'anchor', type: 'tuple', desc: '核锚点，(-1,-1) 表示中心', default: '(-1,-1)' }
            ]
          }
        ],
        flow: ['构造卷积核', '设置 ddepth', 'filter2D 输出结果'],
        scenarios: ['自定义锐化/浮雕核', '统一滤波接口'],
        research: ['快速验证自定义核效果，比手写双重循环快得多（底层 C 实现）'],
        pitfalls: [
          { problem: '核未归一化导致图像变白/变暗', fix: '均值核权重和应为 1' },
          { problem: '边缘检测负值被截断为 0', fix: 'ddepth 改用 cv2.CV_64F 再取绝对值' }
        ],
        related: ['ch1-l08', 'ch2-l02']
      })
    }),
    lv('ch1', 10, '图像显示与保存', {
      difficulty: '入门',
      estMinutes: 7,
      code: `import cv2

img = cv2.imread("lena.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
cv2.imshow("gray window", gray)
cv2.waitKey(0)
cv2.destroyAllWindows()
cv2.imwrite("gray_result.png", gray)`,
      task: '跟打显示、等待按键与保存代码，记住 waitKey 与销毁窗口的搭配。',
      tags: ['imshow', 'imwrite', '窗口'],
      know: knowledge({
        overview:
          'imshow 在命名窗口显示图像，waitKey 等待按键（0 表示无限等待），结束后 destroyAllWindows 释放窗口，imwrite 将数组编码保存到磁盘。',
        lineExplanations: [
          { code: 'cv2.imshow("gray window", gray)', explain: '窗口标题与要显示的数组' },
          { code: 'cv2.waitKey(0)', explain: '阻塞等待按键，返回按键码；不给 waitKey 窗口会卡死' },
          { code: 'cv2.imwrite("gray_result.png", gray)', explain: '按扩展名编码保存，返回是否成功' }
        ],
        pythonNotes: [],
        apiDocs: [
          {
            name: 'cv2.waitKey',
            signature: 'cv2.waitKey(delay) -> int',
            params: [{ name: 'delay', type: 'int', desc: '等待毫秒数，0 表示无限等待' }]
          }
        ],
        flow: ['imshow 显示', 'waitKey 保持窗口', '销毁窗口并 imwrite 保存'],
        scenarios: ['调试中间结果', '导出处理后的图像'],
        research: ['论文配图可通过 imwrite 批量导出'],
        pitfalls: [
          { problem: '窗口一闪而过或无响应', fix: 'imshow 后必须调用 waitKey' },
          { problem: 'imwrite 静默失败', fix: '检查返回值与目录写权限、路径是否合法' }
        ],
        related: ['ch1-l02', 'ch1-l04']
      })
    })
  ]
}
