function e(i){return{overview:i.overview??"",lineExplanations:i.lineExplanations??[],pythonNotes:i.pythonNotes??[],apiDocs:i.apiDocs??[],formulas:i.formulas??[],flow:i.flow??[],scenarios:i.scenarios??[],research:i.research??[],pitfalls:i.pitfalls??[],related:i.related??[]}}function a(i,n,r,t){const o=String(n).padStart(2,"0");return{id:`${i}-l${o}`,chapterId:i,index:n,title:r,difficulty:t.difficulty??"基础",estMinutes:t.estMinutes??8,mode:t.mode??"follow",targetCode:t.code,task:t.task,blank:t.blank,validators:t.validators,knowledge:t.know,quizIds:[`q-${i}-l${o}`],tags:t.tags??[],labExperiment:t.labExperiment}}const l={id:"ch1",index:1,title:"OpenCV基础与图像卷积",subtitle:"从导入库到二维卷积，建立图像即数组的核心认知",intro:"本章是整个 CV 编程的地基。你将学会用 Python 导入 OpenCV 与 NumPy，读取并理解图像的数组结构，完成颜色空间转换，并亲手实现和调用二维卷积 filter2D，为后续滤波、边缘与特征章节打下基础。",objectives:["掌握 cv2、numpy 的标准导入与图像读取显示","理解图像在 NumPy 中的形状、维度与 uint8 数据类型","能够进行颜色空间转换与像素访问","理解二维卷积的数学过程并能用 filter2D 实现"],icon:"Picture",levels:[a("ch1",1,"导入OpenCV与NumPy",{difficulty:"入门",estMinutes:6,code:`import cv2
import numpy as np

print("OpenCV version:", cv2.__version__)
print("NumPy version:", np.__version__)`,task:"请逐字符跟打导入语句，建立 Python CV 编程的标准开头。",tags:["导入","环境"],know:e({overview:"OpenCV 的 Python 模块名为 cv2，数值计算库 NumPy 按惯例别名为 np。几乎所有 OpenCV 程序都以这两行导入开始。",lineExplanations:[{code:"import cv2",explain:"导入 OpenCV 计算机视觉库，调用时写 cv2.函数名"},{code:"import numpy as np",explain:"导入 NumPy 并约定别名为 np，图像数据本质是 np.ndarray"},{code:"cv2.__version__",explain:"查看 OpenCV 版本号字符串，用于确认安装与 API 兼容性"}],pythonNotes:["import 是 Python 的模块导入关键字","as 用于给模块起别名，np 是 NumPy 的社区惯例"],apiDocs:[],flow:["导入 cv2 与 numpy","确认库版本","进入后续图像处理流程"],scenarios:["所有 OpenCV 脚本的标准开头","环境配置与版本排查"],research:["复现论文代码前先确认 OpenCV 版本，避免 API 差异"],pitfalls:[{problem:"ModuleNotFoundError: No module named cv2",fix:"在终端执行 pip install opencv-python 安装"},{problem:"误写 import opencv",fix:"Python 中模块名是 cv2 而非 opencv"}],related:["ch1-l02"]})}),a("ch1",2,"读取本地图像",{difficulty:"入门",estMinutes:7,code:`import cv2

img = cv2.imread("lena.jpg")
if img is None:
    raise FileNotFoundError("图像读取失败，请检查路径")
print("图像形状:", img.shape)`,task:"跟打图像读取代码，注意 imread 失败时返回 None 而非抛异常。",tags:["IO","imread"],labExperiment:"gray",know:e({overview:"cv2.imread 从磁盘读取图像并返回 NumPy 数组。默认以 BGR 三通道、uint8 格式读取；文件不存在时返回 None，需要手动判空。",lineExplanations:[{code:'img = cv2.imread("lena.jpg")',explain:"读取图像，默认 flags=IMREAD_COLOR，得到 BGR 数组"},{code:"if img is None:",explain:"路径错误或文件损坏时 imread 返回 None，不会自动报错"},{code:"img.shape",explain:"返回 (高, 宽, 通道数)，注意高度在前、宽度在后"}],pythonNotes:["is None 是 Python 判断空值的规范写法","raise 用于主动抛出异常"],apiDocs:[{name:"cv2.imread",signature:"cv2.imread(filename, flags=cv2.IMREAD_COLOR) -> Mat",returns:"图像数组；读取失败返回 None",params:[{name:"filename",type:"str",desc:"图像文件路径，支持相对/绝对路径"},{name:"flags",type:"int",desc:"读取方式",default:"IMREAD_COLOR（彩色 BGR，忽略 alpha）"}]}],flow:["给定文件路径","imread 解码为数组","判空后使用"],scenarios:["加载训练/测试图像","批量读图前的单图验证"],research:["数据集加载管线的第一步，需统一路径与判空逻辑"],pitfalls:[{problem:"中文路径在部分平台读取失败",fix:"可用 np.fromfile 配合 cv2.imdecode 读取"},{problem:"不判空直接使用导致 AttributeError",fix:"读取后立即检查 img is None"}],related:["ch1-l01","ch1-l03"]})}),a("ch1",3,"图像形状与数组属性",{difficulty:"基础",estMinutes:8,code:`import cv2

img = cv2.imread("lena.jpg")
h, w, c = img.shape
print("高度:", h, "宽度:", w, "通道数:", c)
print("维度:", img.ndim, "数据类型:", img.dtype)
print("总像素:", img.size)`,task:"跟打数组属性代码，理解 shape、ndim、dtype、size 的含义。",tags:["NumPy","数组"],know:e({overview:"彩色图像是形状为 (H, W, 3) 的三维数组，灰度图是 (H, W) 的二维数组。ndim 表示维度数，dtype 表示元素类型，size 是元素总数。",lineExplanations:[{code:"h, w, c = img.shape",explain:"元组解包，依次得到高、宽、通道数"},{code:"img.ndim",explain:"数组维度，彩色图为 3，灰度图为 2"},{code:"img.size",explain:"元素总数 = H×W×C"}],pythonNotes:["h, w, c = ... 是 Python 的序列解包语法"],apiDocs:[],flow:["读取图像","查看 shape/ndim/dtype","判断数组是否满足后续算法要求"],scenarios:["确认输入尺寸","调试通道不匹配问题"],research:["论文中常报告输入分辨率，需要先核对 shape"],pitfalls:[{problem:"灰度图解包三个值报错",fix:"灰度图 shape 只有两个元素，应写 h, w = img.shape"},{problem:"混淆宽高顺序",fix:"OpenCV 数组是 (行=高, 列=宽)，而绘制参数常是 (宽,高)"}],related:["ch1-l02","ch1-l05"]})}),a("ch1",4,"颜色空间转换",{difficulty:"基础",estMinutes:8,code:`import cv2

img = cv2.imread("lena.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
print("灰度形状:", gray.shape, "RGB形状:", rgb.shape)`,task:"跟打 cvtColor 代码，记住 OpenCV 默认 BGR 而不是 RGB。",tags:["颜色空间","cvtColor"],labExperiment:"gray",know:e({overview:"cv2.cvtColor 用于颜色空间转换。OpenCV 默认通道顺序为 BGR，与 Matplotlib 的 RGB 相反，显示前常需转换；灰度化是许多算法的前置步骤。",lineExplanations:[{code:"COLOR_BGR2GRAY",explain:"三通道 BGR 转单通道灰度，按加权公式计算亮度"},{code:"COLOR_BGR2RGB",explain:"通道顺序交换，便于 Matplotlib 正确显示"}],pythonNotes:["常量名全大写，属于 cv2 模块定义的整数枚举"],apiDocs:[{name:"cv2.cvtColor",signature:"cv2.cvtColor(src, code, dstCn=0) -> dst",params:[{name:"src",type:"Mat",desc:"输入图像"},{name:"code",type:"int",desc:"转换码，如 COLOR_BGR2GRAY"},{name:"dstCn",type:"int",desc:"目标通道数，0 表示自动推断",default:"0"}]}],formulas:[{title:"BGR 转灰度（ITU-R BT.601）",latex:"Y = 0.299\\,R + 0.587\\,G + 0.114\\,B"}],flow:["读取 BGR 图像","选择转换码","输出目标颜色空间数组"],scenarios:["算法要求灰度输入","跨库显示前的通道对齐"],research:["灰度化降低计算量，是边缘检测、特征提取的常见预处理"],pitfalls:[{problem:"Matplotlib 显示颜色发蓝/发红",fix:"先用 COLOR_BGR2RGB 转换再 imshow"},{problem:"转换码方向写反",fix:"确认 src 与目标空间，如 BGR2GRAY 而非 GRAY2BGR"}],related:["ch1-l02","ch3-l01"]})}),a("ch1",5,"NumPy创建图像数组",{difficulty:"基础",estMinutes:8,code:`import numpy as np

zeros = np.zeros((200, 300), dtype=np.uint8)
ones = np.ones((200, 300, 3), dtype=np.uint8) * 255
print("零数组形状:", zeros.shape)
print("白图像素范围:", ones.min(), ones.max())`,task:"跟打 zeros/ones 创建数组代码，注意 dtype 必须指定 uint8。",tags:["NumPy","创建数组"],know:e({overview:"np.zeros 生成全 0 数组（黑色），np.ones 生成全 1 数组，乘 255 得到白色画布。图像数组默认需要 uint8 类型，取值 0-255。",lineExplanations:[{code:"np.zeros((200,300), dtype=np.uint8)",explain:"200 行 300 列的黑色灰度图"},{code:"np.ones(...) * 255",explain:"NumPy 广播，逐元素乘 255 得到白色三通道图"},{code:"ones.min()/max()",explain:"验证像素取值范围是否在 0-255"}],pythonNotes:["关键字参数 dtype 指定元素类型","* 对 ndarray 是逐元素运算（广播）"],apiDocs:[],flow:["确定形状 (H,W[,C])","指定 uint8 创建","在画布上绘制或作为掩码"],scenarios:["创建掩码 mask","初始化空白画布"],research:["掩膜、标注图常以全零数组初始化"],pitfalls:[{problem:"默认 float64 无法正常显示/保存",fix:"显式指定 dtype=np.uint8"},{problem:"形状顺序写反",fix:"形状元组是 (高, 宽)，不是 (宽, 高)"}],related:["ch1-l03","ch1-l07"]})}),a("ch1",6,"像素访问与区域切片",{difficulty:"基础",estMinutes:9,code:`import cv2
import numpy as np

img = cv2.imread("lena.jpg")
b, g, r = img[100, 200]
img[100, 200] = [255, 255, 255]
roi = img[50:150, 100:300]
print("该像素 BGR:", b, g, r)
print("ROI 形状:", roi.shape)`,task:"跟打像素索引与切片代码，理解行列索引与 BGR 取值。",tags:["NumPy","像素","切片"],know:e({overview:"通过 img[y, x] 访问像素，彩色像素返回 [B,G,R]。切片 img[y1:y2, x1:x2] 提取感兴趣区域 ROI，切片是视图，修改会影响原图。",lineExplanations:[{code:"img[100, 200]",explain:"第 100 行、第 200 列像素，返回 BGR 三值"},{code:"img[100, 200] = [255,255,255]",explain:"把该像素设为白色"},{code:"img[50:150, 100:300]",explain:"行 50-149、列 100-299 的矩形 ROI"}],pythonNotes:["Python 切片左闭右开，含起始不含结束","多变量解包 b, g, r = ..."],apiDocs:[],flow:["按 (行,列) 定位","读取/赋值像素","用切片提取 ROI"],scenarios:["局部区域处理","像素级标注"],research:["ROI 分析在目标检测区域评估中常见"],pitfalls:[{problem:"坐标写成 img[x, y] 导致位置错位",fix:"第一个索引是行 y，第二个才是列 x"},{problem:"修改 ROI 意外改动原图",fix:"需要独立副本时写 roi = img[...].copy()"}],related:["ch1-l05"]})}),a("ch1",7,"uint8数据类型与归一化",{difficulty:"进阶",estMinutes:10,code:`import cv2
import numpy as np

img = cv2.imread("lena.jpg")
f = img.astype(np.float64) / 255.0
back = (f * 255).astype(np.uint8)
print("归一化范围:", f.min(), f.max())
print("还原后形状:", back.shape, back.dtype)`,task:"跟打类型转换与归一化代码，理解为什么运算前常转 float。",tags:["dtype","归一化"],know:e({overview:"uint8 只存 0-255 整数，做减法、卷积等运算容易溢出或截断。先 astype 转浮点并归一化到 [0,1]，运算完成后再转回 uint8 显示。",lineExplanations:[{code:"img.astype(np.float64)",explain:"复制并转换为 64 位浮点，支持小数与负数"},{code:"/ 255.0",explain:"归一化到 [0,1]，深度学习与数学运算的常见输入域"},{code:"(f*255).astype(np.uint8)",explain:"映射回 0-255 并转为图像类型"}],pythonNotes:["astype 返回新数组，不修改原数组"],apiDocs:[],formulas:[{title:"线性归一化",latex:"x_{norm} = \\frac{x}{255}"}],flow:["uint8 转 float","归一化后做数学运算","缩放回 255 并转 uint8"],scenarios:["卷积/差分前的类型保护","深度学习图像预处理"],research:["论文中输入归一化可稳定梯度、加速收敛"],pitfalls:[{problem:"uint8 下负数变 255 附近的值（溢出）",fix:"运算前先转浮点类型"},{problem:"浮点数组直接 imshow 显示异常",fix:"显示前转回 uint8"}],related:["ch1-l05","ch1-l08"]})}),a("ch1",8,"手动实现二维卷积",{difficulty:"挑战",estMinutes:14,code:`import numpy as np

def conv2d(image, kernel):
    kh, kw = kernel.shape
    ph, pw = kh // 2, kw // 2
    padded = np.pad(image, ((ph, ph), (pw, pw)), mode="edge")
    out = np.zeros_like(image, dtype=np.float64)
    for i in range(image.shape[0]):
        for j in range(image.shape[1]):
            region = padded[i:i + kh, j:j + kw]
            out[i, j] = np.sum(region * kernel)
    return out`,task:"跟打手动卷积函数，重点理解嵌套循环、边缘填充与逐元素乘加。",tags:["卷积","NumPy","算法原理"],labExperiment:"conv",know:e({overview:'二维卷积在每个像素位置取核大小邻域，与卷积核逐元素相乘再求和，作为输出像素。边缘填充保证输出尺寸不变；"edge" 用边界像素填充。',lineExplanations:[{code:'np.pad(..., mode="edge")',explain:"边缘复制填充，避免输出缩小"},{code:"for i ... for j ...",explain:"遍历每个输出像素位置"},{code:"np.sum(region * kernel)",explain:"邻域与核逐元素乘加，即卷积核心运算"}],pythonNotes:["def 定义函数，缩进决定函数体","np.zeros_like 生成同形状数组"],apiDocs:[],formulas:[{title:"二维离散卷积（相关）",latex:"G(i,j)=\\sum_{u}\\sum_{v} I(i+u,\\ j+v)\\,K(u,v)"}],flow:["核中心对齐像素","提取邻域并填充","乘加求和写入输出"],scenarios:["理解滤波与边缘检测的统一底层","自定义核实验"],research:["卷积是 CNN 的基本操作，手工实现有助于理解感受野与参数共享"],pitfalls:[{problem:"不填充导致输出尺寸变小",fix:"使用 np.pad 做 same 填充"},{problem:"uint8 求和截断",fix:"输出数组使用 float64，最后再转换"}],related:["ch1-l09","ch2-l01"]})}),a("ch1",9,"filter2D调用卷积",{mode:"blank",difficulty:"进阶",estMinutes:10,code:`import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
kernel = np.ones((3, 3), dtype=np.float32) / 9.0
dst = cv2.filter2D(img, cv2.CV_8U, kernel)
print("输出形状:", dst.shape, "数据类型:", dst.dtype)`,task:"跟打 filter2D 调用，理解 ddepth 与归一化卷积核。",tags:["filter2D","卷积"],labExperiment:"conv",blank:{template:`kernel = np.ones({{1}}, dtype=np.float32) / {{2}}
dst = cv2.{{3}}(img, cv2.CV_8U, kernel)`,answers:[["(3, 3)"],["9.0","9"],["filter2D"]],hints:["3×3 核的形状元组","9 个元素求平均，分母为 9","OpenCV 的卷积函数名"],analysis:["3×3 均值核共 9 个元素，除以 9 使权重和为 1，输出亮度保持不变"]},know:e({overview:"cv2.filter2D 是 OpenCV 的通用卷积（实际为相关）函数，支持任意自定义核。ddepth 指定目标位深，CV_8U 即 uint8；核权重和决定输出亮度。",lineExplanations:[{code:"np.ones((3,3))/9.0",explain:"构造 3×3 均值核，权重和为 1"},{code:"cv2.CV_8U",explain:"目标深度 8 位无符号；需要负值结果时用 CV_64F"}],pythonNotes:["imread 第二参数 0 等价于 IMREAD_GRAYSCALE"],apiDocs:[{name:"cv2.filter2D",signature:"cv2.filter2D(src, ddepth, kernel, anchor=(-1,-1), delta=0, borderType=BORDER_DEFAULT)",params:[{name:"src",type:"Mat",desc:"输入图像"},{name:"ddepth",type:"int",desc:"目标深度，-1 表示与源相同"},{name:"kernel",type:"Mat",desc:"单通道浮点卷积核"},{name:"anchor",type:"tuple",desc:"核锚点，(-1,-1) 表示中心",default:"(-1,-1)"}]}],flow:["构造卷积核","设置 ddepth","filter2D 输出结果"],scenarios:["自定义锐化/浮雕核","统一滤波接口"],research:["快速验证自定义核效果，比手写双重循环快得多（底层 C 实现）"],pitfalls:[{problem:"核未归一化导致图像变白/变暗",fix:"均值核权重和应为 1"},{problem:"边缘检测负值被截断为 0",fix:"ddepth 改用 cv2.CV_64F 再取绝对值"}],related:["ch1-l08","ch2-l02"]})}),a("ch1",10,"图像显示与保存",{difficulty:"入门",estMinutes:7,code:`import cv2

img = cv2.imread("lena.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
cv2.imshow("gray window", gray)
cv2.waitKey(0)
cv2.destroyAllWindows()
cv2.imwrite("gray_result.png", gray)`,task:"跟打显示、等待按键与保存代码，记住 waitKey 与销毁窗口的搭配。",tags:["imshow","imwrite","窗口"],know:e({overview:"imshow 在命名窗口显示图像，waitKey 等待按键（0 表示无限等待），结束后 destroyAllWindows 释放窗口，imwrite 将数组编码保存到磁盘。",lineExplanations:[{code:'cv2.imshow("gray window", gray)',explain:"窗口标题与要显示的数组"},{code:"cv2.waitKey(0)",explain:"阻塞等待按键，返回按键码；不给 waitKey 窗口会卡死"},{code:'cv2.imwrite("gray_result.png", gray)',explain:"按扩展名编码保存，返回是否成功"}],pythonNotes:[],apiDocs:[{name:"cv2.waitKey",signature:"cv2.waitKey(delay) -> int",params:[{name:"delay",type:"int",desc:"等待毫秒数，0 表示无限等待"}]}],flow:["imshow 显示","waitKey 保持窗口","销毁窗口并 imwrite 保存"],scenarios:["调试中间结果","导出处理后的图像"],research:["论文配图可通过 imwrite 批量导出"],pitfalls:[{problem:"窗口一闪而过或无响应",fix:"imshow 后必须调用 waitKey"},{problem:"imwrite 静默失败",fix:"检查返回值与目录写权限、路径是否合法"}],related:["ch1-l02","ch1-l04"]})})]},p={id:"ch2",index:2,title:"图像平滑与去噪",subtitle:"用邻域加权平均抑制噪声，理解核大小与参数的影响",intro:"真实图像普遍带有噪声。本章从噪声模拟出发，系统实现均值、方框、高斯、中值等滤波方法，对比核大小与标准差参数，理解不同滤波器的适用场景，并在实验室中实时观察效果。",objectives:["能够模拟高斯噪声与椒盐噪声","掌握均值、方框、高斯、中值、双边滤波 API","理解高斯核的生成与可分离性","能根据噪声类型选择合适的去噪策略"],icon:"WindPower",levels:[a("ch2",1,"噪声模拟：高斯与椒盐",{difficulty:"进阶",estMinutes:12,code:`import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
noise = np.random.normal(0, 25, img.shape).astype(np.int16)
gaussian_noisy = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
sp = img.copy()
num = 1000
for _ in range(num):
    x, y = np.random.randint(0, img.shape[1]), np.random.randint(0, img.shape[0])
    sp[y, x] = 0 if np.random.rand() < 0.5 else 255`,task:"跟打噪声生成代码，理解高斯噪声与椒盐噪声的区别。",tags:["噪声","NumPy随机"],know:e({overview:"高斯噪声是叠加在像素上、服从正态分布的随机扰动；椒盐噪声随机把像素置为 0（黑）或 255（白）。用 np.random 生成后必须 clip 防止越界。",lineExplanations:[{code:"np.random.normal(0, 25, img.shape)",explain:"均值 0、标准差 25 的同形状高斯噪声"},{code:"np.clip(..., 0, 255)",explain:"限制到合法灰度范围，避免溢出"},{code:"sp[y, x] = 0/255",explain:"随机注入黑点或白点，模拟脉冲噪声"}],pythonNotes:["np.random.rand() 返回 [0,1) 均匀随机数"],apiDocs:[],formulas:[{title:"高斯噪声概率密度",latex:"p(z)=\\frac{1}{\\sqrt{2\\pi}\\,\\sigma}\\exp\\left(-\\frac{(z-\\mu)^2}{2\\sigma^2}\\right)"}],flow:["生成随机扰动","叠加到原图","clip 到合法范围"],scenarios:["构造受控测试数据","定量评估去噪算法"],research:["可控噪声下的 PSNR/SSIM 对比是去噪论文标准实验"],pitfalls:[{problem:"int16 相加后直接显示类型错误",fix:"clip 后再 astype(np.uint8)"},{problem:"每次运行结果不同难以复现",fix:"用 np.random.seed(42) 固定随机种子"}],related:["ch2-l02","ch2-l06"]})}),a("ch2",2,"均值滤波 blur",{difficulty:"基础",estMinutes:7,code:`import cv2

img = cv2.imread("lena.jpg")
blur3 = cv2.blur(img, (3, 3))
blur5 = cv2.blur(img, (5, 5))
print("3x3 均值形状:", blur3.shape)
print("5x5 均值形状:", blur5.shape)`,task:"跟打均值滤波代码，观察核大小对模糊程度的影响。",tags:["均值滤波","blur"],labExperiment:"blur",know:e({overview:"均值滤波用核内所有像素的算术平均值替换中心像素，核越大平滑越强、细节丢失越多。cv2.blur 是归一化的方框滤波。",lineExplanations:[{code:"cv2.blur(img, (3,3))",explain:"3×3 邻域平均，轻度去噪"},{code:"cv2.blur(img, (5,5))",explain:"5×5 邻域平均，更强模糊"}],pythonNotes:[],apiDocs:[{name:"cv2.blur",signature:"cv2.blur(src, ksize, anchor=(-1,-1), borderType=BORDER_DEFAULT)",params:[{name:"src",type:"Mat",desc:"输入图像"},{name:"ksize",type:"tuple",desc:"核大小 (宽, 高)，通常为奇数"},{name:"anchor",type:"tuple",desc:"锚点，默认中心",default:"(-1,-1)"}]}],formulas:[{title:"邻域均值",latex:"K=\\frac{1}{k_w k_h}\\sum_{(u,v)\\in\\Omega} I(u,v)"}],flow:["选择奇数核大小","邻域求和","除以元素个数取平均"],scenarios:["轻度随机噪声抑制","需要快速简单平滑时"],research:["作为基线与复杂去噪网络对比 PSNR"],pitfalls:[{problem:"核过大导致边缘严重模糊",fix:"从 3×3 开始尝试，按需增大"},{problem:"对椒盐噪声效果差",fix:"脉冲噪声应优先使用中值滤波"}],related:["ch2-l03","ch2-l04"]})}),a("ch2",3,"方框滤波 boxFilter",{mode:"blank",difficulty:"基础",estMinutes:8,code:`import cv2

img = cv2.imread("lena.jpg")
norm = cv2.boxFilter(img, cv2.CV_8U, (3, 3), normalize=True)
raw = cv2.boxFilter(img, cv2.CV_8U, (3, 3), normalize=False)
print("归一化方框:", norm.shape)
print("未归一化方框:", raw.shape)`,task:"跟打方框滤波，理解 normalize=True/False 的本质区别。",tags:["方框滤波","boxFilter"],labExperiment:"box",blank:{template:"norm = cv2.{{1}}(img, cv2.CV_8U, (3, 3), normalize={{2}})",answers:[["boxFilter"],["True","TRUE","true"]],hints:["方框滤波函数名","布尔值首字母大写"],analysis:["normalize=True 时除以核面积，等价于 blur；False 时直接求和，uint8 易溢出截断"]},know:e({overview:"boxFilter 是方框滤波，normalize=True 时对邻域求和后除以面积（等价 blur），normalize=False 时直接求和，在 uint8 下很容易超过 255 被截断。",lineExplanations:[{code:"normalize=True",explain:"权重和为 1，亮度保持，等价均值滤波"},{code:"normalize=False",explain:"纯邻域求和，结果可能大面积饱和变白"}],pythonNotes:["Python 布尔值是 True/False（首字母大写）"],apiDocs:[{name:"cv2.boxFilter",signature:"cv2.boxFilter(src, ddepth, ksize, anchor=(-1,-1), normalize=True, borderType=BORDER_DEFAULT)",params:[{name:"ddepth",type:"int",desc:"输出深度"},{name:"ksize",type:"tuple",desc:"核大小"},{name:"normalize",type:"bool",desc:"是否按核面积归一化",default:"True"}]}],flow:["邻域求和","根据 normalize 决定是否除以面积","输出结果"],scenarios:["积分图像思想教学","需要邻域求和的特征计算"],research:["方框滤波是 Viola-Jones 类快速特征的基础"],pitfalls:[{problem:"未归一化结果一片白",fix:"uint8 下应 normalize=True，或改用更深位深"},{problem:"与 blur 混淆",fix:"blur 就是 normalize=True 的 boxFilter"}],related:["ch2-l02"]})}),a("ch2",4,"高斯滤波 GaussianBlur",{difficulty:"基础",estMinutes:9,code:`import cv2

img = cv2.imread("lena.jpg")
gauss = cv2.GaussianBlur(img, (5, 5), sigmaX=1.0)
print("高斯滤波结果:", gauss.shape)
cv2.imwrite("gauss.png", gauss)`,task:"跟打高斯滤波，核大小必须为奇数，sigma 控制权重衰减。",tags:["高斯滤波","GaussianBlur"],labExperiment:"gaussian",know:e({overview:"高斯滤波按高斯函数给邻域加权，越靠近中心权重越大，在平滑噪声的同时比均值滤波更好地保留整体结构。核大小须为奇数，sigma 决定权重分布宽度。",lineExplanations:[{code:"(5, 5)",explain:"高斯核尺寸，宽高必须为正奇数（或为 0 由 sigma 推导）"},{code:"sigmaX=1.0",explain:"X 方向标准差，越大越模糊；为 0 时由核大小自动计算"}],pythonNotes:["sigmaX=1.0 是关键字参数，提升可读性"],apiDocs:[{name:"cv2.GaussianBlur",signature:"cv2.GaussianBlur(src, ksize, sigmaX, sigmaY=0, borderType=BORDER_DEFAULT)",params:[{name:"ksize",type:"tuple",desc:"(宽,高)，均为奇数"},{name:"sigmaX",type:"float",desc:"X 方向高斯标准差"},{name:"sigmaY",type:"float",desc:"Y 方向标准差，0 表示等于 sigmaX",default:"0"}]}],formulas:[{title:"二维高斯函数",latex:"G(x,y)=\\frac{1}{2\\pi\\sigma^2}\\exp\\left(-\\frac{x^2+y^2}{2\\sigma^2}\\right)"}],flow:["按 sigma 生成高斯权重","核内加权求和","归一化输出"],scenarios:["高斯白噪声抑制","SIFT/边缘检测前的尺度预处理"],research:["高斯核是尺度空间理论的核心，SIFT、Canny 均依赖它"],pitfalls:[{problem:"核大小传偶数报错",fix:"高斯核尺寸必须为奇数，才有明确中心像素"},{problem:"sigma 与 ksize 不匹配",fix:"让其中一个为 0 由 OpenCV 自动推导，避免矛盾"}],related:["ch2-l05","ch4-l01"]})}),a("ch2",5,"高斯核生成与可分离性",{difficulty:"进阶",estMinutes:10,code:`import cv2
import numpy as np

k1d = cv2.getGaussianKernel(ksize=5, sigma=1.0)
k2d = k1d @ k1d.T
print("一维核:\\n", k1d.ravel())
print("二维核权重和:", k2d.sum())`,task:"跟打高斯核生成代码，理解一维核外积得到二维核。",tags:["高斯核","可分离滤波"],know:e({overview:"二维高斯核可分解为两个相同一维核的外积，因此高斯滤波可先沿 X 再沿 Y 做两次一维卷积，把复杂度从 O(k²) 降到 O(2k)。",lineExplanations:[{code:"cv2.getGaussianKernel(5, 1.0)",explain:"返回 5×1 的归一化一维列向量"},{code:"k1d @ k1d.T",explain:"矩阵外积得到 5×5 二维高斯核"},{code:"k2d.sum()",explain:"权重和约为 1，保证亮度不变"}],pythonNotes:["@ 是 Python 的矩阵乘法运算符",".ravel() 把数组展平为一维"],apiDocs:[{name:"cv2.getGaussianKernel",signature:"cv2.getGaussianKernel(ksize, sigma, ktype=CV_64F)",params:[{name:"ksize",type:"int",desc:"奇数核大小"},{name:"sigma",type:"float",desc:"标准差；非正则由 ksize 推导"}]}],flow:["生成一维核","外积构造二维核","利用可分离性加速卷积"],scenarios:["理解滤波加速原理","自定义高斯权重"],research:["可分离卷积在大核与实时系统中显著降低计算量"],pitfalls:[{problem:"忘记外积直接用一维核做二维卷积",fix:"用 k @ k.T 构造二维核"},{problem:"权重和不等于 1",fix:"getGaussianKernel 已归一化，外积后和仍为 1"}],related:["ch2-l04"]})}),a("ch2",6,"中值滤波 medianBlur",{difficulty:"基础",estMinutes:8,code:`import cv2

img = cv2.imread("lena.jpg")
median = cv2.medianBlur(img, ksize=5)
print("中值滤波结果:", median.shape)`,task:"跟打中值滤波，它是椒盐噪声的首选克星。",tags:["中值滤波","medianBlur"],labExperiment:"median",know:e({overview:"中值滤波取邻域内所有像素排序后的中位数替换中心像素，能有效剔除孤立的椒盐极值点，同时比均值滤波更好地保护边缘。",lineExplanations:[{code:"cv2.medianBlur(img, 5)",explain:"注意 ksize 是整数而非元组，5 表示 5×5 邻域"}],pythonNotes:[],apiDocs:[{name:"cv2.medianBlur",signature:"cv2.medianBlur(src, ksize)",params:[{name:"ksize",type:"int",desc:"奇数孔径尺寸（整数，不是元组）"}]}],flow:["收集邻域像素","排序取中位数","替换中心像素"],scenarios:["椒盐/脉冲噪声去除","需要保边的简单去噪"],research:["医学、文档图像中的脉冲噪声常用中值类方法预处理"],pitfalls:[{problem:"把 ksize 写成 (5,5) 元组报错",fix:"medianBlur 的 ksize 是单个奇数整数"},{problem:"对高斯噪声表现一般",fix:"高斯噪声应选 GaussianBlur"}],related:["ch2-l01","ch2-l07"]})}),a("ch2",7,"双边滤波 bilateralFilter",{difficulty:"进阶",estMinutes:11,code:`import cv2

img = cv2.imread("lena.jpg")
bilat = cv2.bilateralFilter(img, d=9, sigmaColor=75, sigmaSpace=75)
print("双边滤波结果:", bilat.shape)`,task:"跟打双边滤波，理解它为何能“去噪又保边”。",tags:["双边滤波","保边去噪"],know:e({overview:"双边滤波同时考虑空间距离权重和像素值差异权重：平坦区域正常平滑，边缘两侧因灰度差异大而降低权重，从而在去噪的同时保留边缘。",lineExplanations:[{code:"d=9",explain:"邻域直径；非正则由 sigmaSpace 推导"},{code:"sigmaColor=75",explain:"灰度差异 sigma，越大越能容忍强度差异"},{code:"sigmaSpace=75",explain:"空间距离 sigma，越大平滑范围越广"}],pythonNotes:[],apiDocs:[{name:"cv2.bilateralFilter",signature:"cv2.bilateralFilter(src, d, sigmaColor, sigmaSpace, borderType=BORDER_DEFAULT)",params:[{name:"d",type:"int",desc:"滤波邻域直径"},{name:"sigmaColor",type:"float",desc:"颜色空间标准差"},{name:"sigmaSpace",type:"float",desc:"坐标空间标准差"}]}],formulas:[{title:"双边权重",latex:"w=\\underbrace{G_{\\sigma_s}(\\|p-q\\|)}_{空间}\\cdot\\underbrace{G_{\\sigma_r}(|I_p-I_q|)}_{灰度}"}],flow:["计算空间高斯权重","乘以灰度相似权重","归一化加权求和"],scenarios:["卡通化预处理","需要保边的去噪"],research:["保边滤波思想影响了引导滤波与许多计算摄影方法"],pitfalls:[{problem:"计算明显比高斯滤波慢",fix:"控制 d 与 sigma，避免在大图上使用过大邻域"},{problem:"参数过小几乎无效果",fix:"sigmaColor 通常取 50-100 区间试验"}],related:["ch2-l04","ch2-l06"]})}),a("ch2",8,"核大小参数对比",{difficulty:"进阶",estMinutes:10,code:`import cv2

img = cv2.imread("lena.jpg", 0)
for k in (3, 5, 7, 9):
    dst = cv2.GaussianBlur(img, (k, k), 0)
    print(f"核大小 {k} -> 均值 {dst.mean():.2f}")`,task:"跟打循环对比代码，量化不同核大小下的结果。",tags:["参数对比","循环"],know:e({overview:"固定图像、遍历核大小可以系统观察平滑强度变化。f-string 把变量嵌入输出，均值变化反映细节被平滑的程度。",lineExplanations:[{code:"for k in (3,5,7,9):",explain:"遍历一组奇数核大小"},{code:'f"...{dst.mean():.2f}"',explain:"f-string 格式化，:.2f 保留两位小数"}],pythonNotes:["f-string 是 Python 3.6+ 的字符串插值语法","元组 (3,5,7,9) 可直接迭代"],apiDocs:[],flow:["准备参数序列","循环执行滤波","记录并比较指标"],scenarios:["超参数网格试验","撰写实验报告"],research:["参数敏感性分析是论文消融实验的常见组成"],pitfalls:[{problem:"核大小含偶数导致报错",fix:"对比序列只放奇数"},{problem:"只看主观图难以下结论",fix:"同时记录均值/方差或 PSNR 等客观指标"}],related:["ch2-l04","ch2-l09"]})}),a("ch2",9,"sigma标准差参数对比",{difficulty:"进阶",estMinutes:10,code:`import cv2

img = cv2.imread("lena.jpg", 0)
for s in (0.5, 1.0, 2.0, 4.0):
    dst = cv2.GaussianBlur(img, (0, 0), sigmaX=s)
    print(f"sigma={s} 输出尺寸 {dst.shape}")`,task:"跟打 sigma 对比，核大小给 0 让 OpenCV 按 sigma 自动确定。",tags:["sigma","参数对比"],know:e({overview:"固定核大小为 0，让 OpenCV 根据 sigma 自动计算所需核尺寸，可单独研究标准差对平滑程度的影响，sigma 越大权重分布越宽、越模糊。",lineExplanations:[{code:"(0, 0)",explain:"核大小为 0 时由 sigma 自动推导实际尺寸"},{code:"sigmaX=s",explain:"逐个增大标准差，观察模糊增强"}],pythonNotes:[],apiDocs:[],flow:["设置 ksize=0","遍历 sigma","比较自动核与输出效果"],scenarios:["尺度空间参数选择","教学演示 sigma 作用"],research:["不同 sigma 对应不同尺度，是多尺度分析的基础"],pitfalls:[{problem:"sigma 过小几乎无平滑",fix:"结合目标尺度选择，多做对比"},{problem:"同时设置 ksize 与 sigma 产生矛盾",fix:"研究 sigma 时把 ksize 置 0"}],related:["ch2-l08","ch4-l01"]})}),a("ch2",10,"去噪综合流程",{difficulty:"挑战",estMinutes:14,code:`import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
noisy = cv2.GaussianBlur(img, (0, 0), 0)
noise = np.random.normal(0, 20, img.shape)
noisy = np.clip(img.astype(np.float32) + noise, 0, 255).astype(np.uint8)
gauss = cv2.GaussianBlur(noisy, (5, 5), 0)
median = cv2.medianBlur(noisy, 5)
cv2.imwrite("noisy.png", noisy)
cv2.imwrite("gauss.png", gauss)
cv2.imwrite("median.png", median)`,task:"跟打完整去噪流程：加噪 → 两种滤波 → 分别保存对比。",tags:["综合流程","去噪"],labExperiment:"gaussian",know:e({overview:"本关把噪声模拟与多种滤波串成完整管线，并分别保存结果，便于横向比较高斯与中值滤波对同一噪声图像的差异。",lineExplanations:[{code:"np.clip(img+noise,...)",explain:"生成受控高斯噪声图像"},{code:"GaussianBlur / medianBlur",explain:"两种代表性去噪方法并行对比"},{code:"imwrite 三张图",explain:"保存噪声图与两种结果用于报告"}],pythonNotes:[],apiDocs:[],flow:["读取并加噪","分别用高斯、中值处理","保存并对比"],scenarios:["课程实验报告","算法基线对比"],research:["可进一步计算 PSNR/SSIM 做定量评价"],pitfalls:[{problem:"第一行多余的 GaussianBlur 造成混淆",fix:"保持管线简洁，每步只做一件事"},{problem:"只保存最终结果无法对比",fix:"中间结果都应保存或显示"}],related:["ch2-l01","ch2-l04","ch2-l06"]})})]},m={id:"ch3",index:3,title:"图像梯度与边缘检测",subtitle:"从离散差分到各阶边缘算子，定位图像中的强度突变",intro:"边缘对应像素强度的剧烈变化，而梯度正是刻画变化率的数学工具。本章从 Roberts、Prewitt 到 Sobel、Scharr、Laplacian，系统实现一阶梯度与二阶导数算子，并结合阈值处理得到清晰边缘图。",objectives:["理解图像梯度、幅值与方向的数学含义","掌握 filter2D 实现 Roberts/Prewitt 及 Sobel/Scharr/Laplacian API","能处理负梯度值并合成梯度幅值","能结合阈值处理得到二值边缘图"],icon:"Aim",levels:[a("ch3",1,"梯度概念与灰度差分",{difficulty:"基础",estMinutes:9,code:`import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
gx = np.zeros_like(img, dtype=np.float64)
gx[:, 1:] = img[:, 1:].astype(np.float64) - img[:, :-1]
print("水平差分范围:", gx.min(), gx.max())
print("差分形状:", gx.shape)`,task:"跟打水平差分代码，理解梯度就是相邻像素之差。",tags:["梯度","差分"],know:e({overview:"离散图像上导数用相邻像素差分近似。水平方向相邻列相减得到 x 方向梯度，强度变化越大差分绝对值越大，边缘处出现大值。",lineExplanations:[{code:"img[:, 1:] - img[:, :-1]",explain:"所有行上，后一列减前一列，得到 x 方向差分"},{code:"astype(np.float64)",explain:"差分可能为负，必须用浮点类型保存"}],pythonNotes:["[:, 1:] 中冒号表示该维度全部取，切片错位实现相邻差分"],apiDocs:[],formulas:[{title:"前向差分近似偏导",latex:"\\frac{\\partial I}{\\partial x}\\approx I(x+1,y)-I(x,y)"}],flow:["灰度化","相邻像素相减","取绝对值定位强度变化"],scenarios:["理解梯度来源","最简单的变化检测"],research:["有限差分是数值计算与图像偏导的基础"],pitfalls:[{problem:"uint8 下负差分被截断",fix:"先转 float 再相减"},{problem:"边界列无法差分",fix:"输出首列保持 0 或做填充"}],related:["ch3-l04","ch3-l06"]})}),a("ch3",2,"Roberts 边缘检测",{difficulty:"进阶",estMinutes:10,code:`import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
kernel_x = np.array([[1, 0], [0, -1]], dtype=np.float32)
kernel_y = np.array([[0, 1], [-1, 0]], dtype=np.float32)
rx = cv2.filter2D(img, cv2.CV_64F, kernel_x)
ry = cv2.filter2D(img, cv2.CV_64F, kernel_y)
roberts = cv2.magnitude(rx, ry)
print("Roberts 形状:", roberts.shape)`,task:"跟打 Roberts 交叉差分核与幅值合成。",tags:["Roberts","filter2D"],labExperiment:"roberts",know:e({overview:"Roberts 算子用 2×2 交叉对角差分近似梯度，定位较准但对噪声敏感，是最古老简洁的边缘算子之一。",lineExplanations:[{code:"[[1,0],[0,-1]]",explain:"主对角线差分核，检测 45° 方向变化"},{code:"cv2.magnitude(rx,ry)",explain:"由两个方向分量合成梯度幅值"}],pythonNotes:["np.array 嵌套列表定义二维矩阵"],apiDocs:[],formulas:[{title:"Roberts 幅值",latex:"G=\\sqrt{(z_1-z_4)^2+(z_2-z_3)^2}"}],flow:["定义两个交叉核","filter2D 求分量","magnitude 合成"],scenarios:["低噪声、简单场景的快速边缘","教学对比算子演进"],research:["常作为算子对比的历史基线"],pitfalls:[{problem:"2×2 核没有明确中心",fix:"理解其定位特性，需要更稳时改用 Sobel"},{problem:"噪声下边缘破碎",fix:"先做高斯平滑或换抗噪算子"}],related:["ch3-l03","ch3-l04"]})}),a("ch3",3,"Prewitt 边缘检测",{difficulty:"进阶",estMinutes:10,code:`import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
kx = np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], dtype=np.float32)
ky = np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]], dtype=np.float32)
px = cv2.filter2D(img, cv2.CV_64F, kx)
py = cv2.filter2D(img, cv2.CV_64F, ky)
prewitt = cv2.magnitude(px, py)
print("Prewitt 范围:", prewitt.min(), prewitt.max())`,task:"跟打 Prewitt 3×3 方向核，理解平均差分带来的抗噪性。",tags:["Prewitt"],labExperiment:"prewitt",know:e({overview:"Prewitt 用 3×3 核在差分的同时对三行/列做平均，比 Roberts 更抗噪，适合检测水平与垂直方向边缘。",lineExplanations:[{code:"kx 三列 -1,0,1",explain:"x 方向核，左右两侧差分"},{code:"ky 三行 -1,0,1",explain:"y 方向核，上下差分"}],pythonNotes:[],apiDocs:[],formulas:[{title:"Prewitt 幅值",latex:"G=\\sqrt{G_x^2+G_y^2}"}],flow:["构造方向核","卷积求分量","合成幅值"],scenarios:["规则方向边缘提取","噪声中等的场景"],research:["方向模板思想用于纹理与结构分析"],pitfalls:[{problem:"边缘定位略粗",fix:"对精度要求高时结合阈值或使用 Sobel/Canny"},{problem:"核内权重未区分中心",fix:"这是 Prewitt 与 Sobel 的关键区别"}],related:["ch3-l02","ch3-l04"]})}),a("ch3",4,"Sobel 算子",{mode:"blank",difficulty:"进阶",estMinutes:11,code:`import cv2

img = cv2.imread("lena.jpg", 0)
sx = cv2.Sobel(img, cv2.CV_64F, dx=1, dy=0, ksize=3)
sy = cv2.Sobel(img, cv2.CV_64F, dx=0, dy=1, ksize=3)
absx = cv2.convertScaleAbs(sx)
absy = cv2.convertScaleAbs(sy)
sobel = cv2.addWeighted(absx, 0.5, absy, 0.5, 0)
print("Sobel 形状:", sobel.shape)`,task:"跟打 Sobel 调用，dx/dy 决定求导方向，负值需 convertScaleAbs。",tags:["Sobel"],labExperiment:"sobel",blank:{template:"sx = cv2.{{1}}(img, cv2.CV_64F, dx={{2}}, dy=0, ksize=3)",answers:[["Sobel"],["1"]],hints:["算子函数名","x 方向一阶导，dx 为 1"],analysis:["Sobel 结合高斯平滑与差分，dx=1,dy=0 表示只对 x 求一阶偏导"]},know:e({overview:"Sobel 在 Prewitt 基础上给中心行/列更大权重（带平滑的差分），抗噪与定位取得良好平衡，是最常用的一阶边缘算子之一。",lineExplanations:[{code:"dx=1, dy=0",explain:"只对 x 求一阶导，得到垂直边缘响应"},{code:"convertScaleAbs",explain:"取绝对值并转回 uint8，避免负响应丢失"},{code:"addWeighted 0.5",explain:"两个方向结果等权融合"}],pythonNotes:[],apiDocs:[{name:"cv2.Sobel",signature:"cv2.Sobel(src, ddepth, dx, dy, ksize=3, scale=1, delta=0)",params:[{name:"ddepth",type:"int",desc:"输出深度，通常用 CV_64F 保留负值"},{name:"dx,dy",type:"int",desc:"x、y 方向求导阶数"},{name:"ksize",type:"int",desc:"奇数核大小，1/3/5/7",default:"3"}]}],formulas:[{title:"Sobel x 核",latex:"K_x=\\begin{bmatrix}-1&0&1\\\\-2&0&2\\\\-1&0&1\\end{bmatrix}"}],flow:["设置求导阶数","Sobel 卷积（含平滑）","取绝对值并融合"],scenarios:["通用边缘提取","梯度方向特征"],research:["Sobel 响应常用于 HOG 等特征与结构先验"],pitfalls:[{problem:"ddepth 用 CV_8U 丢失负边缘",fix:"用 CV_64F 再 convertScaleAbs"},{problem:"dx、dy 同时为 1 导致混合响应",fix:"通常分别求 x、y 再融合"}],related:["ch3-l05","ch3-l06"]})}),a("ch3",5,"Scharr 算子",{difficulty:"进阶",estMinutes:10,code:`import cv2

img = cv2.imread("lena.jpg", 0)
scx = cv2.Scharr(img, cv2.CV_64F, dx=1, dy=0)
scy = cv2.Scharr(img, cv2.CV_64F, dx=0, dy=1)
scharr = cv2.magnitude(scx, scy)
print("Scharr 形状:", scharr.shape)`,task:"跟打 Scharr，它是 3×3 下 Sobel 的高精度增强版。",tags:["Scharr"],labExperiment:"scharr",know:e({overview:"Scharr 使用固定 3×3 但权重系数经过优化，在小核尺寸下比 Sobel 具有更好的旋转对称性与梯度精度，不能自定义 ksize。",lineExplanations:[{code:"cv2.Scharr(...)",explain:"无 ksize 参数，固定 3×3 优化系数"},{code:"magnitude(scx,scy)",explain:"合成幅值，与其他算子流程一致"}],pythonNotes:[],apiDocs:[{name:"cv2.Scharr",signature:"cv2.Scharr(src, ddepth, dx, dy, scale=1, delta=0)",params:[{name:"ddepth",type:"int",desc:"输出深度"},{name:"dx,dy",type:"int",desc:"求导阶数，其中一个为 1、另一个为 0"}]}],formulas:[{title:"Scharr x 核",latex:"K_x=\\begin{bmatrix}-3&0&3\\\\-10&0&10\\\\-3&0&3\\end{bmatrix}"}],flow:["选择求导方向","Scharr 卷积","合成幅值"],scenarios:["3×3 小核下追求精度","需要准确梯度方向"],research:["光流与梯度估计中 Scharr 能减小方向误差"],pitfalls:[{problem:"尝试传 ksize 参数报错",fix:"Scharr 固定 3×3，无该参数"},{problem:"响应值比 Sobel 大",fix:"系数不同导致尺度差异，阈值需相应调整"}],related:["ch3-l04"]})}),a("ch3",6,"梯度幅值与方向",{difficulty:"挑战",estMinutes:12,code:`import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
gx = cv2.Sobel(img, cv2.CV_64F, 1, 0)
gy = cv2.Sobel(img, cv2.CV_64F, 0, 1)
mag, angle = cv2.cartToPolar(gx, gy, angleInDegrees=True)
print("幅值范围:", mag.min(), mag.max())
print("方向范围(度):", angle.min(), angle.max())`,task:"跟打 cartToPolar，同时得到梯度幅值与方向角。",tags:["幅值","方向","cartToPolar"],know:e({overview:"梯度是矢量，包含幅值（边缘强度）与方向（边缘走向）。cartToPolar 把直角坐标 (gx,gy) 转为极坐标 (幅值,角度)，角度以度或弧度表示。",lineExplanations:[{code:"cv2.cartToPolar(gx,gy,angleInDegrees=True)",explain:"一次调用同时返回幅值与角度（度）"}],pythonNotes:[],apiDocs:[{name:"cv2.cartToPolar",signature:"cv2.cartToPolar(x, y, angleInDegrees=False) -> (magnitude, angle)",params:[{name:"x,y",type:"Mat",desc:"x、y 方向梯度分量"},{name:"angleInDegrees",type:"bool",desc:"True 输出角度制，否则弧度制",default:"False"}]}],formulas:[{title:"梯度幅值",latex:"M=\\sqrt{g_x^2+g_y^2}"},{title:"梯度方向",latex:"\\theta=\\operatorname{atan2}(g_y,g_x)"}],flow:["求两个方向梯度","转极坐标","按方向分桶（如 HOG）"],scenarios:["HOG 方向直方图","边缘方向分析"],research:["梯度方向直方图是 SIFT/HOG 描述子的核心步骤"],pitfalls:[{problem:"角度单位用错",fix:"明确 angleInDegrees，弧度与度不可混用"},{problem:"只看幅值忽略方向",fix:"描述子类任务必须保留方向信息"}],related:["ch3-l04","ch4-l05"]})}),a("ch3",7,"Laplacian 二阶算子",{difficulty:"挑战",estMinutes:11,code:`import cv2

img = cv2.imread("lena.jpg", 0)
blur = cv2.GaussianBlur(img, (3, 3), 0)
lap = cv2.Laplacian(blur, cv2.CV_64F, ksize=3)
print("Laplacian 范围:", lap.min(), lap.max())
print("形状:", lap.shape)`,task:"跟打 Laplacian，注意它对噪声敏感，先高斯平滑再使用。",tags:["Laplacian","二阶导"],labExperiment:"laplacian",know:e({overview:"Laplacian 是二阶导数算子，对图像求两个方向二阶偏导之和，边缘处产生过零点；因为二阶导放大噪声，使用前通常先高斯平滑。",lineExplanations:[{code:"GaussianBlur 先平滑",explain:"抑制噪声，防止二阶导产生大量伪边缘"},{code:"cv2.Laplacian(...,ksize=3)",explain:"计算二阶导数，输出含正负值"}],pythonNotes:[],apiDocs:[{name:"cv2.Laplacian",signature:"cv2.Laplacian(src, ddepth, ksize=1, scale=1, delta=0)",params:[{name:"ddepth",type:"int",desc:"输出深度，常用 CV_64F"},{name:"ksize",type:"int",desc:"奇数孔径",default:"1"}]}],formulas:[{title:"拉普拉斯定义",latex:"\\nabla^2 I=\\frac{\\partial^2 I}{\\partial x^2}+\\frac{\\partial^2 I}{\\partial y^2}"}],flow:["高斯平滑","Laplacian 求二阶导","通过过零点判断边缘"],scenarios:["blob 检测（LoG）","边缘过零点分析"],research:["LoG/DoG 是斑点与关键点检测的理论基础"],pitfalls:[{problem:"不平滑直接做导致满屏噪点",fix:"务必先 GaussianBlur"},{problem:"正负响应难以直接当边缘",fix:"结合过零点或取绝对值后阈值化"}],related:["ch3-l04","ch4-l02"]})}),a("ch3",8,"阈值处理 threshold",{difficulty:"基础",estMinutes:9,code:`import cv2

img = cv2.imread("lena.jpg", 0)
edges = cv2.Sobel(img, cv2.CV_64F, 1, 1)
edges = cv2.convertScaleAbs(edges)
_, binary = cv2.threshold(edges, thresh=50, maxval=255, type=cv2.THRESH_BINARY)
print("二值图唯一值:", set(binary.ravel().tolist()))`,task:"跟打阈值处理，把灰度响应转为只有 0/255 的二值边缘。",tags:["阈值","threshold"],labExperiment:"threshold",know:e({overview:"阈值处理按固定门限分割像素：大于阈值置 maxval、小于置 0，得到干净的二值图，是边缘图后处理与分割的基础操作。",lineExplanations:[{code:"thresh=50",explain:"门限值，需根据响应分布调整"},{code:"THRESH_BINARY",explain:"超阈值置 255，否则置 0"}],pythonNotes:["set(...) 查看数组中实际出现的取值集合"],apiDocs:[{name:"cv2.threshold",signature:"cv2.threshold(src, thresh, maxval, type) -> (retval, dst)",params:[{name:"thresh",type:"float",desc:"门限值"},{name:"maxval",type:"float",desc:"超过门限时的赋值"},{name:"type",type:"int",desc:"阈值类型，如 THRESH_BINARY"}]}],flow:["得到灰度响应","设定门限","输出二值图"],scenarios:["边缘图细化","简单图像分割"],research:["自适应/全局阈值比较是文档处理与分割的常见课题"],pitfalls:[{problem:"阈值过高边缘丢失、过低噪声多",fix:"结合直方图或 Otsu 自动阈值选择"},{problem:"threshold 必须作用于灰度图",fix:"先确保输入是单通道"}],related:["ch3-l09","ch3-l10"]})}),a("ch3",9,"Otsu 自动阈值与边缘判断",{difficulty:"挑战",estMinutes:11,code:`import cv2

img = cv2.imread("lena.jpg", 0)
blur = cv2.GaussianBlur(img, (5, 5), 0)
ret, otsu = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
print("Otsu 自动阈值:", ret)
print("输出形状:", otsu.shape)`,task:"跟打 Otsu 自动阈值，理解阈值为 0 时由算法自动确定。",tags:["Otsu","自动阈值"],know:e({overview:"Otsu 法通过最大化类间方差自动确定最佳全局阈值，无需手工试错；阈值参数传 0，返回值 ret 即算法选出的门限。",lineExplanations:[{code:"THRESH_BINARY + THRESH_OTSU",explain:"标志位相加，启用 Otsu 自动选择"},{code:"ret",explain:"自动计算出的阈值，可用于报告与复现"}],pythonNotes:["整数标志通过 + 组合是 OpenCV 位掩码惯例"],apiDocs:[],formulas:[{title:"类间方差最大化",latex:"\\sigma_b^2(t)=w_0(t)w_1(t)\\,[\\mu_0(t)-\\mu_1(t)]^2"}],flow:["平滑直方图","Otsu 搜索最佳门限","自动二值化"],scenarios:["双峰直方图图像分割","批量处理免调参"],research:["自动阈值常用于文档二值化与细胞分割预处理"],pitfalls:[{problem:"单峰/复杂背景效果差",fix:"考虑自适应阈值或先改善光照"},{problem:"忘记加 THRESH_OTSU 标志",fix:"类型标志必须与 OTSU 组合"}],related:["ch3-l08"]})}),a("ch3",10,"边缘检测综合流程",{difficulty:"挑战",estMinutes:14,code:`import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
blur = cv2.GaussianBlur(img, (3, 3), 0)
sx = cv2.Sobel(blur, cv2.CV_64F, 1, 0)
sy = cv2.Sobel(blur, cv2.CV_64F, 0, 1)
mag = cv2.magnitude(sx, sy)
mag = cv2.convertScaleAbs(mag)
_, edges = cv2.threshold(mag, 60, 255, cv2.THRESH_BINARY)
cv2.imwrite("edges.png", edges)`,task:"跟打完整管线：平滑 → 双向 Sobel → 幅值 → 阈值 → 保存。",tags:["综合流程","边缘检测"],labExperiment:"sobel",know:e({overview:"本关串联标准边缘检测管线：先平滑抗噪，再求双向梯度并合成幅值，最后阈值化得到二值边缘，体现各知识点如何协作。",lineExplanations:[{code:"GaussianBlur",explain:"第一步抗噪，稳定后续梯度"},{code:"magnitude + convertScaleAbs",explain:"合成边缘强度并转 uint8"},{code:"threshold(...,60,...)",explain:"门限化得到最终二值边缘"}],pythonNotes:[],apiDocs:[],flow:["平滑","梯度分量","幅值","阈值化","保存"],scenarios:["课程综合实验","工业视觉检测预处理"],research:["可替换各环节算子做消融，对比边缘质量"],pitfalls:[{problem:"省略平滑导致边缘噪声多",fix:"保留 GaussianBlur 步骤"},{problem:"阈值固定不适配所有图像",fix:"可改用 Otsu 或自适应阈值"}],related:["ch3-l04","ch3-l08","ch3-l09"]})})]},d={id:"ch4",index:4,title:"SIFT与多尺度特征",subtitle:"尺度空间、DoG 极值、主方向与 128 维描述子",intro:"SIFT（尺度不变特征变换）能在不同尺度、旋转和光照下提取稳定的局部特征。本章从高斯尺度空间与 DoG 出发，讲解关键点检测、主方向分配与 128 维描述子的生成，并掌握 OpenCV 中的 SIFT API。",objectives:["理解高斯尺度空间与 DoG 的构建","理解极值点检测、精确定位与主方向分配","掌握 128 维描述子的结构与含义","熟练使用 SIFT_create / detectAndCompute / drawKeypoints"],icon:"View",levels:[a("ch4",1,"高斯尺度空间",{difficulty:"进阶",estMinutes:11,code:`import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
scales = []
for sigma in (1.0, 1.6, 2.5, 4.0):
    blurred = cv2.GaussianBlur(img, (0, 0), sigmaX=sigma)
    scales.append(blurred)
print("尺度图像数量:", len(scales))
print("每个尺度形状:", scales[0].shape)`,task:"跟打尺度空间构建，不同 sigma 对应不同观测尺度。",tags:["尺度空间","高斯"],know:e({overview:"尺度空间理论认为物体描述应在多个尺度上进行。对同一图像用递增标准差的高斯核模糊，得到一组尺度图像，使特征不依赖于物体的绝对大小。",lineExplanations:[{code:"for sigma in (1.0,1.6,2.5,4.0):",explain:"递增标准差，构造由细到粗的尺度"},{code:"GaussianBlur(...,sigmaX=sigma)",explain:"线性高斯模糊是尺度空间的标准生成算子"}],pythonNotes:["scales.append 把结果加入列表"],apiDocs:[],formulas:[{title:"高斯尺度空间",latex:"L(x,y,\\sigma)=G(x,y,\\sigma)*I(x,y)"}],flow:["选择基准图像","递增 sigma 高斯模糊","形成尺度序列（octave）"],scenarios:["多尺度特征提取","不同大小目标检测"],research:["尺度空间是 SIFT、SURF 及多尺度 CNN 的理论源头"],pitfalls:[{problem:"sigma 增长无规律导致尺度不连续",fix:"按固定倍数（如 k=2^(1/s)）组织尺度"},{problem:"只在单一尺度找特征",fix:"大目标与小目标需要跨尺度检测"}],related:["ch4-l02","ch2-l04"]})}),a("ch4",2,"高斯差分 DoG",{difficulty:"进阶",estMinutes:11,code:`import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
a = cv2.GaussianBlur(img, (0, 0), 1.0)
b = cv2.GaussianBlur(img, (0, 0), 1.6)
dog = cv2.subtract(b.astype(np.float32), a.astype(np.float32))
print("DoG 范围:", dog.min(), dog.max())
print("DoG 形状:", dog.shape)`,task:"跟打相邻尺度相减得到 DoG，理解它是 LoG 的高效近似。",tags:["DoG","尺度"],know:e({overview:"DoG（Difference of Gaussians）将相邻两个尺度的高斯模糊图像相减，近似归一化拉普拉斯 LoG，计算量小且便于在尺度维搜索极值。",lineExplanations:[{code:"cv2.subtract(b, a)",explain:"相邻尺度逐像素差分，浮点类型保留正负"},{code:"astype(np.float32)",explain:"避免 uint8 相减截断"}],pythonNotes:[],apiDocs:[{name:"cv2.subtract",signature:"cv2.subtract(src1, src2, mask=None, dtype=-1)",params:[{name:"src1,src2",type:"Mat",desc:"被减数与减数图像"},{name:"dtype",type:"int",desc:"输出深度，默认与输入相同",default:"-1"}]}],formulas:[{title:"DoG 定义",latex:"D(x,y,\\sigma)=L(x,y,k\\sigma)-L(x,y,\\sigma)"},{title:"与 LoG 的关系",latex:"D\\approx (k-1)\\,\\sigma^2\\,\\nabla^2 G"}],flow:["构建相邻尺度","逐像素相减","得到 DoG 尺度堆"],scenarios:["SIFT 极值搜索","斑点检测"],research:["DoG 近似在精度与效率间取得经典平衡"],pitfalls:[{problem:"uint8 相减丢失负值",fix:"先转浮点再 subtract"},{problem:"尺度比 k 过大近似粗糙",fix:"SIFT 采用 k=2^(1/3) 的密集尺度"}],related:["ch4-l01","ch4-l03"]})}),a("ch4",3,"DoG 极值点检测",{difficulty:"挑战",estMinutes:13,code:`import cv2
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
print("候选极值点数量:", len(candidates))`,task:"跟打 3×3×3 邻域极值搜索，理解候选关键点如何产生。",tags:["极值检测","关键点"],know:e({overview:"每个像素与其同尺度 8 邻域、上下相邻尺度各 9 个点共 26 个邻居比较，是局部最大或最小才成为候选关键点，保证尺度与空间双重稳定。",lineExplanations:[{code:"cube = 三个尺度",explain:"构成 3×3×3 的比较立方体"},{code:"neighborhood 26 个邻居",explain:"拼接三尺度邻域（含自身共 27 点）"},{code:"max() or min()",explain:"局部极值即候选关键点"}],pythonNotes:["np.concatenate 拼接数组，.ravel 展平"],apiDocs:[],flow:["定位 DoG 像素","收集 26 个尺度空间邻居","判断局部极值"],scenarios:["SIFT 候选点生成","理解尺度不变性来源"],research:["极值搜索是许多局部特征检测器的通用范式"],pitfalls:[{problem:"三重循环在大图上很慢",fix:"教学用小图，工程实现由 OpenCV 底层优化"},{problem:"候选点含大量低对比度点",fix:"需要后续精确定位与阈值过滤"}],related:["ch4-l04"]})}),a("ch4",4,"关键点精确定位与过滤",{difficulty:"挑战",estMinutes:12,code:`import cv2

img = cv2.imread("lena.jpg", 0)
sift = cv2.SIFT_create(contrastThreshold=0.04, edgeThreshold=10)
kp, _ = sift.detectAndCompute(img, None)
strong = [k for k in kp if k.response > 0.02]
print("过滤后关键点数量:", len(strong))`,task:"跟打关键点过滤，理解对比度阈值与边缘响应阈值的作用。",tags:["关键点过滤","对比度"],know:e({overview:"原始极值点中包含低对比度和落在边缘上的不稳定点。SIFT 通过局部二次拟合精确定位，并用 contrastThreshold 与 edgeThreshold 剔除弱响应与边缘点。",lineExplanations:[{code:"contrastThreshold=0.04",explain:"对比度阈值，越大关键点越少但越可靠"},{code:"edgeThreshold=10",explain:"边缘响应阈值，过滤类似边缘的不稳定点"},{code:"k.response > 0.02",explain:"按响应强度进一步筛选关键点"}],pythonNotes:["列表推导式 [k for k in kp if ...] 做过滤"],apiDocs:[],formulas:[{title:"亚像素拟合",latex:"\\hat{x}=-\\frac{\\partial^2 D^{-1}}{\\partial x^2}\\frac{\\partial D}{\\partial x}"}],flow:["候选极值点","二次拟合亚像素定位","对比度/边缘阈值过滤"],scenarios:["提升匹配鲁棒性","控制关键点数量"],research:["稳定关键点筛选直接影响后续匹配的内点率"],pitfalls:[{problem:"阈值过高关键点过少",fix:"降低 contrastThreshold 观察数量变化"},{problem:"边缘点导致误匹配",fix:"保留 edgeThreshold 过滤步骤"}],related:["ch4-l03","ch4-l07"]})}),a("ch4",5,"关键点主方向分配",{difficulty:"挑战",estMinutes:12,code:`import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
sift = cv2.SIFT_create()
kp = sift.detect(img, None)
angles = [k.angle for k in kp]
print("前 5 个关键点方向:", [round(a, 1) for a in angles[:5]])
print("方向取值范围:", round(min(angles), 1), round(max(angles), 1))`,task:"跟打主方向读取，理解方向直方图如何赋予旋转不变性。",tags:["主方向","旋转不变"],know:e({overview:"在关键点邻域统计梯度方向的 36 桶直方图，最高峰方向作为关键点主方向；描述子相对主方向建立，从而实现旋转不变。",lineExplanations:[{code:"k.angle",explain:"每个关键点的主方向角（0-360 度）"},{code:"方向直方图",explain:"按梯度方向加权投票，峰值即主方向"}],pythonNotes:["min/max 作用于列表求极值"],apiDocs:[],formulas:[{title:"方向直方图",latex:"H(\\theta)=\\sum w(\\|m\\|)\\cdot \\mathbb{1}[\\theta\\in bin]"}],flow:["计算邻域梯度","方向加权投票","取峰值为主方向"],scenarios:["旋转目标匹配","理解旋转不变性"],research:["方向归一化是局部特征抵抗视角旋转的关键设计"],pitfalls:[{problem:"平坦区域方向不稳定",fix:"依赖对比度阈值保证邻域有足够梯度"},{problem:"多个峰值只取一个",fix:"次峰超过主峰 80% 时可生成额外关键点"}],related:["ch4-l06","ch3-l06"]})}),a("ch4",6,"128 维描述子",{difficulty:"挑战",estMinutes:12,code:`import cv2

img = cv2.imread("lena.jpg", 0)
sift = cv2.SIFT_create()
kp, desc = sift.detectAndCompute(img, None)
print("描述子形状:", desc.shape)
print("单个描述子长度:", desc.shape[1])
print("描述子数据类型:", desc.dtype)`,task:"跟打描述子查看，确认形状为 (关键点数, 128)。",tags:["描述子","128维"],know:e({overview:"SIFT 把关键点邻域分成 4×4 子区域，每个子区域统计 8 个方向的梯度直方图，4×4×8=128 维向量，再归一化以抵抗光照变化。",lineExplanations:[{code:"desc.shape",explain:"每行一个关键点的 128 维描述子"},{code:"4×4×8",explain:"子区域数 × 方向桶数 = 128"}],pythonNotes:[],apiDocs:[],formulas:[{title:"描述子归一化",latex:"d_i^{\\prime}=\\frac{d_i}{\\sqrt{\\sum_j d_j^2+\\epsilon}}"}],flow:["旋转到主方向","4×4 子区域梯度统计","128 维向量归一化"],scenarios:["跨图像特征匹配","图像检索"],research:["局部描述子维度与区分度的权衡影响匹配与检索性能"],pitfalls:[{problem:"描述子含光照敏感的原始幅值",fix:"归一化并截断大值，降低亮度影响"},{problem:"误以为描述子是关键点坐标",fix:"desc 是特征向量，坐标在 kp 中"}],related:["ch4-l05","ch5-l01"]})}),a("ch4",7,"SIFT_create 构造器",{mode:"blank",difficulty:"进阶",estMinutes:10,code:`import cv2

sift = cv2.SIFT_create(
    nfeatures=0,
    nOctaveLayers=3,
    contrastThreshold=0.04,
    edgeThreshold=10,
    sigma=1.6
)
print("SIFT 对象创建完成:", type(sift).__name__)`,task:"跟打 SIFT_create 构造器，记住五个核心参数及默认值。",tags:["SIFT_create","参数"],blank:{template:"sift = cv2.{{1}}(nfeatures=0, nOctaveLayers={{2}}, contrastThreshold=0.04)",answers:[["SIFT_create"],["3"]],hints:["构造函数名","每个 octave 的层数默认 3"],analysis:["nOctaveLayers 默认 3，与尺度因子 k=2^(1/3) 对应"]},know:e({overview:"cv2.SIFT_create 返回 SIFT 检测器对象，参数控制关键点数量、尺度层数、阈值与初始模糊，是后续 detect/detectAndCompute 的入口。",lineExplanations:[{code:"nfeatures=0",explain:"保留的最佳特征数，0 表示不限制"},{code:"nOctaveLayers=3",explain:"每个 octave 内的层数，默认 3"},{code:"sigma=1.6",explain:"第 0 层图像的初始高斯标准差"}],pythonNotes:["多行参数用括号包裹并换行，提升可读性"],apiDocs:[{name:"cv2.SIFT_create",signature:"cv2.SIFT_create(nfeatures=0, nOctaveLayers=3, contrastThreshold=0.04, edgeThreshold=10, sigma=1.6)",params:[{name:"nfeatures",type:"int",desc:"保留特征数",default:"0"},{name:"contrastThreshold",type:"float",desc:"对比度阈值",default:"0.04"},{name:"edgeThreshold",type:"float",desc:"边缘阈值",default:"10"},{name:"sigma",type:"float",desc:"初始高斯 sigma",default:"1.6"}]}],flow:["创建 SIFT 对象","配置参数","调用检测方法"],scenarios:["按需控制特征密度","复现论文参数设置"],research:["参数调整是特征实验中控制内点率与速度的手段"],pitfalls:[{problem:"旧版 cv2.SIFT() 写法兼容性问题",fix:"新版统一使用 cv2.SIFT_create()"},{problem:"需要 opencv-contrib 支持",fix:"确保安装的构建包含 features2d 贡献模块"}],related:["ch4-l08","ch4-l09"]})}),a("ch4",8,"detectAndCompute 检测与计算",{difficulty:"进阶",estMinutes:10,code:`import cv2

img = cv2.imread("lena.jpg", 0)
sift = cv2.SIFT_create()
kp1 = sift.detect(img, None)
kp2, desc = sift.detectAndCompute(img, None)
print("仅检测关键点数:", len(kp1))
print("检测并计算:", len(kp2), desc.shape)`,task:"跟打 detect 与 detectAndCompute，区分两者返回值。",tags:["detectAndCompute","API"],know:e({overview:"detect 只返回关键点列表；detectAndCompute 一步同时返回关键点与描述子矩阵，是最常用的组合调用。mask 参数可限制检测区域。",lineExplanations:[{code:"sift.detect(img, None)",explain:"第二参数是可选掩码，None 表示整图检测"},{code:"detectAndCompute",explain:"返回 (关键点元组, 描述子矩阵)"}],pythonNotes:[],apiDocs:[{name:"SIFT.detectAndCompute",signature:"detectAndCompute(image, mask, descriptors=None, useProvidedKeypoints=False)",params:[{name:"image",type:"Mat",desc:"灰度输入图像"},{name:"mask",type:"Mat",desc:"可选区域掩码，None 表示全图"}],returns:"(KeyPoint 元组, np.ndarray 描述子)"}],flow:["准备灰度图","检测关键点","（可选）计算描述子"],scenarios:["匹配前的特征提取","只需要关键点位置的可视化"],research:["统一接口便于在 SIFT/ORB/AKAZE 间切换对比"],pitfalls:[{problem:"传入彩色图导致结果异常",fix:"SIFT 输入应为单通道灰度图"},{problem:"无关键点时 desc 为 None",fix:"后续匹配前需判空"}],related:["ch4-l07","ch4-l09"]})}),a("ch4",9,"drawKeypoints 可视化",{difficulty:"基础",estMinutes:8,code:`import cv2

img = cv2.imread("lena.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
sift = cv2.SIFT_create()
kp, _ = sift.detectAndCompute(gray, None)
out = cv2.drawKeypoints(img, kp, None, flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
cv2.imwrite("keypoints.png", out)
print("关键点数量:", len(kp))`,task:"跟打关键点绘制，RICH 标志会画出尺度与方向。",tags:["drawKeypoints","可视化"],labExperiment:"sift",know:e({overview:"drawKeypoints 在图像上绘制关键点；使用 DRAW_RICH_KEYPOINTS 标志时圆圈大小反映尺度、线段反映方向，便于直观检查特征分布。",lineExplanations:[{code:"flags=DRAW_RICH_KEYPOINTS",explain:"丰富绘制：尺度圆 + 方向线"},{code:"None 作为输出参数",explain:"传 None 时函数自动创建结果图像"}],pythonNotes:[],apiDocs:[{name:"cv2.drawKeypoints",signature:"cv2.drawKeypoints(image, keypoints, outImage, color=None, flags=0)",params:[{name:"keypoints",type:"KeyPoint[]",desc:"关键点序列"},{name:"flags",type:"int",desc:"绘制标志，默认仅画点",default:"0"}]}],flow:["检测关键点","选择绘制标志","输出标注图并保存"],scenarios:["论文/报告配图","检查特征覆盖是否均匀"],research:["关键点空间分布可视化有助于诊断检测器行为"],pitfalls:[{problem:"默认标志看不到尺度方向",fix:"使用 DRAW_RICH_KEYPOINTS"},{problem:"在灰度图上彩色标注不明显",fix:"在 BGR 彩色图上绘制"}],related:["ch4-l08"]})}),a("ch4",10,"SIFT 参数调优实验",{difficulty:"挑战",estMinutes:13,code:`import cv2

img = cv2.imread("lena.jpg", 0)
for n in (0, 50, 200):
    sift = cv2.SIFT_create(nfeatures=n)
    kp, desc = sift.detectAndCompute(img, None)
    print(f"nfeatures={n} -> 关键点 {len(kp)} 个")`,task:"跟打参数调优循环，量化 nfeatures 对结果的影响。",tags:["参数调优","实验"],labExperiment:"sift",know:e({overview:"通过循环改变 nfeatures 观察关键点数量与描述子形状变化，理解“保留最佳 N 个特征”的含义，为速度与区分度取舍提供依据。",lineExplanations:[{code:"nfeatures=n",explain:"0 不限；设值时按响应保留前 N 个"},{code:"len(kp)",explain:"量化不同设置下的实际特征数"}],pythonNotes:[],apiDocs:[],flow:["设定参数梯度","循环检测","记录数量与耗时"],scenarios:["实时性要求下的特征预算","匹配前的特征数量控制"],research:["特征数量与匹配内点率、运行时间的关系是常见实验维度"],pitfalls:[{problem:"只看数量不看质量",fix:"结合匹配内点率综合评估"},{problem:"nfeatures 大于实际候选数无效果",fix:"理解上限语义，候选不足时不会补点"}],related:["ch4-l07","ch4-l04"]})})]},f={id:"ch5",index:5,title:"特征匹配与图像拼接",subtitle:"描述子距离、比值检验、RANSAC 单应性与图像拼接",intro:"有了描述子，如何判断两张图中的对应关系？本章从欧氏距离入手，实现 BFMatcher 与 FLANN 匹配、Lowe 最近邻比值检验，并用 RANSAC 鲁棒估计单应性矩阵，最终完成透视变换与图像拼接。",objectives:["理解描述子距离与暴力/近似最近邻匹配","掌握 knnMatch 与 Lowe 比值检验","理解 findHomography 与 RANSAC 鲁棒估计","能用 warpPerspective 与 Stitcher 完成拼接"],icon:"Connection",levels:[a("ch5",1,"描述子欧氏距离",{difficulty:"进阶",estMinutes:10,code:`import numpy as np

def euclidean(a, b):
    return np.sqrt(np.sum((a.astype(np.float32) - b.astype(np.float32)) ** 2))

d1 = np.array([1, 2, 3])
d2 = np.array([1, 3, 2])
print("欧氏距离:", round(euclidean(d1, d2), 3))`,task:"跟打欧氏距离函数，距离越小表示两个描述子越相似。",tags:["欧氏距离","NumPy"],know:e({overview:"匹配的本质是衡量描述子相似性。欧氏距离计算两个向量各维差的平方和再开方，距离越小越相似，是 BFMatcher 的默认度量。",lineExplanations:[{code:"(a-b) ** 2",explain:"逐维差的平方"},{code:"np.sqrt(np.sum(...))",explain:"平方和开根号得到 L2 距离"}],pythonNotes:["def 定义带返回值的函数，round 保留小数"],apiDocs:[],formulas:[{title:"欧氏距离",latex:"d(\\mathbf{a},\\mathbf{b})=\\sqrt{\\sum_{i=1}^{n}(a_i-b_i)^2}"}],flow:["对齐两个描述子","逐维差平方求和","开方得到距离"],scenarios:["特征匹配的相似度度量","最近邻搜索基础"],research:["距离度量选择（L2/汉明/余弦）取决于描述子类型"],pitfalls:[{problem:"整数类型相减溢出",fix:"匹配前转 float32"},{problem:"二进制描述子误用 L2",fix:"ORB/BRIEF 等二进制描述子应使用汉明距离 NORM_HAMMING"}],related:["ch5-l02","ch4-l06"]})}),a("ch5",2,"BFMatcher 暴力匹配",{mode:"blank",difficulty:"进阶",estMinutes:10,code:`import cv2

img1 = cv2.imread("box.png", 0)
img2 = cv2.imread("box_in_scene.png", 0)
sift = cv2.SIFT_create()
kp1, d1 = sift.detectAndCompute(img1, None)
kp2, d2 = sift.detectAndCompute(img2, None)
bf = cv2.BFMatcher(cv2.NORM_L2, crossCheck=False)
matches = bf.match(d1, d2)
print("匹配对数量:", len(matches))`,task:"跟打 BFMatcher，理解 NORM_L2 与 match 的一对一返回。",tags:["BFMatcher","匹配"],labExperiment:"match",blank:{template:"bf = cv2.{{1}}(cv2.{{2}}, crossCheck=False)",answers:[["BFMatcher"],["NORM_L2"]],hints:["暴力匹配器名","SIFT 浮点描述子用 L2 范数"],analysis:["BFMatcher 穷举所有描述子对，取距离最小者；NORM_L2 适配 SIFT"]},know:e({overview:"BFMatcher 对第一组每个描述子，在第二组中穷举距离最近的描述子。match 返回每个查询的最佳匹配，crossCheck=True 时要求互为最近邻，更可靠但数量更少。",lineExplanations:[{code:"cv2.NORM_L2",explain:"距离类型，SIFT/SURF 用 L2，二进制描述子用 NORM_HAMMING"},{code:"bf.match(d1,d2)",explain:"返回 DMatch 列表，每个含 queryIdx/trainIdx/distance"}],pythonNotes:[],apiDocs:[{name:"cv2.BFMatcher",signature:"cv2.BFMatcher(normType=NORM_L2, crossCheck=False)",params:[{name:"normType",type:"int",desc:"距离度量类型",default:"NORM_L2"},{name:"crossCheck",type:"bool",desc:"是否要求互最近邻",default:"False"}]}],flow:["选择距离类型","创建匹配器","match 得到最佳匹配"],scenarios:["小规模特征精确匹配","教学理解匹配过程"],research:["暴力匹配是评估近似最近邻（FLANN）质量的基准"],pitfalls:[{problem:"SIFT 误用 NORM_HAMMING",fix:"浮点描述子用 NORM_L2"},{problem:"匹配含大量误匹配",fix:"结合比值检验或 crossCheck 过滤"}],related:["ch5-l03","ch5-l05"]})}),a("ch5",3,"knnMatch 最近邻匹配",{difficulty:"进阶",estMinutes:10,code:`import cv2

img1 = cv2.imread("box.png", 0)
img2 = cv2.imread("box_in_scene.png", 0)
sift = cv2.SIFT_create()
kp1, d1 = sift.detectAndCompute(img1, None)
kp2, d2 = sift.detectAndCompute(img2, None)
bf = cv2.BFMatcher()
knn = bf.knnMatch(d1, d2, k=2)
print("查询匹配组数:", len(knn))
print("每组近邻数:", len(knn[0]))`,task:"跟打 knnMatch(k=2)，为每个查询返回两个最近邻。",tags:["knnMatch","最近邻"],know:e({overview:"knnMatch 为每个查询描述子返回 k 个最近邻，k=2 时得到最佳与次佳匹配，是 Lowe 比值检验的前提。",lineExplanations:[{code:"knnMatch(d1,d2,k=2)",explain:"每个元素是长度 2 的 DMatch 列表"},{code:"m.distance",explain:"DMatch 的 distance 字段越小越相似"}],pythonNotes:[],apiDocs:[{name:"BFMatcher.knnMatch",signature:"knnMatch(queryDescriptors, trainDescriptors, k)",params:[{name:"k",type:"int",desc:"返回的最近邻个数，比值检验取 2"}]}],flow:["创建匹配器","请求 k 个近邻","交给比值检验过滤"],scenarios:["需要区分“真匹配”和“模糊匹配”","比值检验前置"],research:["k 近邻结构是许多匹配与检索算法的基础"],pitfalls:[{problem:"描述子不足 k 个时该组长度小于 2",fix:"使用前检查每组长度，避免越界"},{problem:"直接用 knn 全部结果",fix:"必须经过比值检验筛选"}],related:["ch5-l05"]})}),a("ch5",4,"FLANN 快速近似匹配",{difficulty:"挑战",estMinutes:11,code:`import cv2

img1 = cv2.imread("box.png", 0)
img2 = cv2.imread("box_in_scene.png", 0)
sift = cv2.SIFT_create()
kp1, d1 = sift.detectAndCompute(img1, None)
kp2, d2 = sift.detectAndCompute(img2, None)
index_params = dict(algorithm=1, trees=5)
search_params = dict(checks=50)
flann = cv2.FlannBasedMatcher(index_params, search_params)
matches = flann.knnMatch(d1, d2, k=2)
print("FLANN 匹配组数:", len(matches))`,task:"跟打 FLANN 配置，大规模特征下比暴力匹配快得多。",tags:["FLANN","近似最近邻"],know:e({overview:"FLANN（Fast Library for Approximate Nearest Neighbors）用 KD 树等索引做近似最近邻搜索，在大量高维描述子下显著快于暴力匹配，代价是可能牺牲少量精度。",lineExplanations:[{code:"algorithm=1, trees=5",explain:"FLANN_INDEX_KDTREE，树越多索引越精细"},{code:"checks=50",explain:"搜索时检查的叶子数，越大越准但越慢"}],pythonNotes:["dict(...) 是创建字典的函数式写法"],apiDocs:[{name:"cv2.FlannBasedMatcher",signature:"cv2.FlannBasedMatcher(indexParams, searchParams)",params:[{name:"indexParams",type:"dict",desc:"索引算法与参数"},{name:"searchParams",type:"dict",desc:"搜索参数，如 checks"}]}],flow:["配置索引参数","构建 FLANN 匹配器","knnMatch 近似搜索"],scenarios:["大规模描述子匹配","对速度敏感的拼接任务"],research:["近似最近邻是大规模图像检索与 SLAM 的常用组件"],pitfalls:[{problem:"二进制描述子用 KD 树参数不匹配",fix:"ORB 等应使用 LSH 索引参数"},{problem:"checks 过小匹配质量下降",fix:"在速度与内点率间平衡，常用 50"}],related:["ch5-l03","ch5-l02"]})}),a("ch5",5,"Lowe 最近邻比值检验",{difficulty:"挑战",estMinutes:12,code:`import cv2

img1 = cv2.imread("box.png", 0)
img2 = cv2.imread("box_in_scene.png", 0)
sift = cv2.SIFT_create()
kp1, d1 = sift.detectAndCompute(img1, None)
kp2, d2 = sift.detectAndCompute(img2, None)
good = []
for m, n in cv2.BFMatcher().knnMatch(d1, d2, k=2):
    if m.distance < 0.75 * n.distance:
        good.append(m)
print("比值检验通过的好匹配:", len(good))`,task:"跟打比值检验，最佳与次佳距离比小于 0.75 才保留。",tags:["比值检验","Lowe"],labExperiment:"match",know:e({overview:"若一个描述子的最佳匹配距离远小于次佳匹配，说明它区分度高、匹配可信；两者接近则处于重复纹理区域，应剔除。阈值 0.75 来自 Lowe 经典论文。",lineExplanations:[{code:"for m, n in ...knnMatch(...,k=2)",explain:"解包最佳 m 与次佳 n"},{code:"m.distance < 0.75 * n.distance",explain:"比值检验核心条件，阈值可在 0.6-0.8 调整"}],pythonNotes:[],apiDocs:[],formulas:[{title:"比值检验",latex:"\\frac{d_{1}}{d_{2}} < \\rho,\\quad \\rho=0.75"}],flow:["取 k=2 近邻","计算距离比","保留高区分度匹配"],scenarios:["剔除重复纹理误匹配","拼接前的匹配净化"],research:["比值阈值是 SIFT 匹配论文中被广泛引用的经验值"],pitfalls:[{problem:"阈值过松引入误匹配",fix:"更严格时降到 0.6-0.7"},{problem:"某些组不足两个近邻导致解包失败",fix:"先判断 len(pair)==2"}],related:["ch5-l03","ch5-l06"]})}),a("ch5",6,"单应性矩阵 findHomography",{difficulty:"挑战",estMinutes:12,code:`import cv2
import numpy as np

good = []
src_pts = np.float32([kp[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
dst_pts = np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
H, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
print("单应性矩阵形状:", H.shape if H is not None else None)
print("内点数量:", int(mask.sum()) if mask is not None else 0)`,task:"跟打 findHomography，由对应点求解 3×3 单应性矩阵。",tags:["单应性","findHomography"],labExperiment:"ransac",know:e({overview:"单应性矩阵 H 是 3×3 矩阵，描述同一平面在两幅图像间的投影映射。findHomography 由至少 4 对对应点求解，配合 RANSAC 抵抗误匹配。",lineExplanations:[{code:"src_pts/dst_pts",explain:"好匹配对应的两图像坐标，形状 (-1,1,2)"},{code:"cv2.RANSAC, 5.0",explain:"鲁棒方法与重投影阈值（像素）"},{code:"mask",explain:"内点掩码，1 表示符合该单应性的匹配"}],pythonNotes:["列表推导 + reshape 组织坐标张量"],apiDocs:[{name:"cv2.findHomography",signature:"cv2.findHomography(srcPoints, dstPoints, method=0, ransacReprojThreshold=3)",params:[{name:"method",type:"int",desc:"0 最小二乘；RANSAC/LMEDS 鲁棒方法",default:"0"},{name:"ransacReprojThreshold",type:"float",desc:"判定内点的最大重投影误差",default:"3"}],returns:"(H 3×3, mask 内点掩码)"}],formulas:[{title:"平面投影映射",latex:"\\begin{bmatrix}x^{\\prime}\\\\y^{\\prime}\\\\1\\end{bmatrix}\\sim H\\begin{bmatrix}x\\\\y\\\\1\\end{bmatrix}"}],flow:["收集好匹配坐标","RANSAC 选内点","DLT 求解 H"],scenarios:["平面目标识别","图像拼接对齐"],research:["单应性估计是几何视觉与 AR 平面注册的基础"],pitfalls:[{problem:"内点不足 H 为 None",fix:"增加匹配数量或放宽比值阈值，保证至少 4 对"},{problem:"非平面场景单应性不成立",fix:"单应性假设场景平面或纯旋转相机"}],related:["ch5-l07","ch5-l08"]})}),a("ch5",7,"RANSAC 鲁棒估计",{difficulty:"挑战",estMinutes:12,code:`import cv2
import numpy as np

rng = np.random.default_rng(42)
data = rng.normal(size=(100, 2))
data[:20] += 10
inliers = 0
for _ in range(50):
    sample = rng.choice(data, 4, replace=False)
    dist = np.linalg.norm(sample - sample.mean(axis=0), axis=1)
    inliers = max(inliers, int((dist < 2).sum()))
print("RANSAC 风格抽样内点示例:", inliers)`,task:"跟打 RANSAC 抽样思想：随机最小子集 → 拟合 → 统计内点。",tags:["RANSAC","鲁棒估计"],labExperiment:"ransac",know:e({overview:"RANSAC 反复随机选取最小数据子集拟合模型，统计误差阈值内的内点，内点最多的模型获胜，能在含大量外点（误匹配）时稳健估计。",lineExplanations:[{code:"rng.choice(data,4)",explain:"随机抽 4 对（单应性最小子集）"},{code:"dist < 2",explain:"按误差阈值统计内点数量"}],pythonNotes:["np.random.default_rng 是新版随机数生成器接口"],apiDocs:[],formulas:[{title:"迭代次数",latex:"N=\\frac{\\log(1-p)}{\\log(1-w^s)}"}],flow:["随机最小子集","拟合模型","统计内点并迭代","选最佳模型"],scenarios:["含误匹配的几何估计","稳健模型拟合"],research:["RANSAC 及其变体（PROSAC/USAC）广泛用于 SLAM 与 SfM"],pitfalls:[{problem:"迭代次数太少漏掉好模型",fix:"按外点比例用公式估算所需迭代次数"},{problem:"阈值固定不适应噪声",fix:"结合测量噪声尺度设置重投影阈值"}],related:["ch5-l06"]})}),a("ch5",8,"透视变换 warpPerspective",{difficulty:"进阶",estMinutes:10,code:`import cv2
import numpy as np

img = cv2.imread("card.jpg")
h, w = img.shape[:2]
src = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
dst = np.float32([[20, 30], [w - 10, 0], [w, h - 20], [10, h]])
M = cv2.getPerspectiveTransform(src, dst)
warped = cv2.warpPerspective(img, M, (w, h))
print("透视变换结果:", warped.shape)`,task:"跟打 getPerspectiveTransform 与 warpPerspective。",tags:["透视变换","warpPerspective"],know:e({overview:"warpPerspective 依据 3×3 变换矩阵把源图像逐像素映射到新视角，getPerspectiveTransform 由 4 对点直接计算矩阵，常用于视角校正。",lineExplanations:[{code:"getPerspectiveTransform(src,dst)",explain:"4 对对应点求透视矩阵"},{code:"warpPerspective(img,M,(w,h))",explain:"按目标尺寸做逆映射插值输出"}],pythonNotes:["img.shape[:2] 切片只取前两个元素"],apiDocs:[{name:"cv2.warpPerspective",signature:"cv2.warpPerspective(src, M, dsize, flags=INTER_LINEAR)",params:[{name:"M",type:"Mat",desc:"3×3 变换矩阵"},{name:"dsize",type:"tuple",desc:"(宽, 高) 输出尺寸"}]}],flow:["准备 4 对点","求透视矩阵","warp 输出新视角"],scenarios:["文档/卡片校正","拼接中的图像变形"],research:["透视 warp 是图像拼接与俯视变换（BEV）的关键步骤"],pitfalls:[{problem:"dsize 用 (高,宽) 报错/错位",fix:"dsize 是 (宽, 高)"},{problem:"点顺序错乱导致扭曲",fix:"四点按左上、右上、右下、左下一致顺序"}],related:["ch5-l06","ch5-l09"]})}),a("ch5",9,"Stitcher 图像拼接",{difficulty:"进阶",estMinutes:11,code:`import cv2

img1 = cv2.imread("left.jpg")
img2 = cv2.imread("right.jpg")
stitcher = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)
status, pano = stitcher.stitch([img1, img2])
if status == cv2.Stitcher_OK:
    cv2.imwrite("panorama.png", pano)
print("拼接状态码:", status)`,task:"跟打 Stitcher 流程，注意检查返回状态码。",tags:["Stitcher","图像拼接"],labExperiment:"stitch",know:e({overview:"cv2.Stitcher 封装了特征检测、匹配、单应性估计、warp 与融合的完整拼接管线，返回状态码与全景图；状态码非 0 表示失败原因。",lineExplanations:[{code:"Stitcher_create(PANORAMA)",explain:"创建全景模式拼接器"},{code:"stitch([img1,img2])",explain:"输入有序图像列表，返回 (状态码, 全景图)"},{code:"Stitcher_OK",explain:"状态码 0 表示成功"}],pythonNotes:[],apiDocs:[{name:"cv2.Stitcher.stitch",signature:"stitch(images, masks=None) -> (status, pano)",params:[{name:"images",type:"list[Mat]",desc:"按空间顺序排列的输入图像"}]}],flow:["输入图像列表","内部特征匹配与几何估计","warp 融合输出全景"],scenarios:["全景照片生成","无人机/监控视野拼接"],research:["自动拼接是计算摄影与遥感制图的经典应用"],pitfalls:[{problem:"重叠不足返回错误码",fix:"保证相邻图像约 25%-40% 重叠"},{problem:"图像顺序混乱失败",fix:"按从左到右的真实顺序传入"}],related:["ch5-l10"]})}),a("ch5",10,"特征匹配与拼接综合任务",{mode:"challenge",difficulty:"挑战",estMinutes:18,code:`import cv2

img1 = cv2.imread("left.jpg", 0)
img2 = cv2.imread("right.jpg", 0)
sift = cv2.SIFT_create()
kp1, d1 = sift.detectAndCompute(img1, None)
kp2, d2 = sift.detectAndCompute(img2, None)
good = []
for pair in cv2.BFMatcher().knnMatch(d1, d2, k=2):
    if len(pair) == 2 and pair[0].distance < 0.75 * pair[1].distance:
        good.append(pair[0])
print("好匹配数量:", len(good))`,task:"实战：独立完成特征提取、knnMatch 与比值检验，输出好匹配数量。",tags:["综合实战","匹配"],validators:[{type:"function_call",name:"cv2.SIFT_create",description:"创建 SIFT 特征检测器"},{type:"function_call",name:"detectAndCompute",description:"对两张图检测关键点并计算描述子"},{type:"function_call",name:"knnMatch",description:"使用 k=2 最近邻匹配"},{type:"structure_count",name:"knnMatch",min:1,description:"至少执行一次最近邻匹配"},{type:"keyword",name:"if",description:"对比值检验结果进行条件判断"}],labExperiment:"stitch",know:e({overview:"本实战要求把第四、五章知识串成完整匹配管线，并对 knn 结果做长度与比值双重保护，是拼接前的关键一步。",lineExplanations:[{code:"len(pair) == 2",explain:"防御性检查，避免近邻不足解包错误"},{code:"pair[0].distance < 0.75*pair[1].distance",explain:"Lowe 比值检验"}],pythonNotes:["实战模式不执行 Python，仅对结构做静态检查，详见模式限制说明"],apiDocs:[],flow:["提取特征","knn 匹配","比值检验","得到好匹配"],scenarios:["拼接前对齐","目标识别匹配"],research:["好匹配内点质量决定后续单应性估计成败"],pitfalls:[{problem:"不做长度检查导致异常",fix:"保留 len(pair)==2 条件"},{problem:"把静态检查当成真实运行",fix:"理解实战模式只验证结构，不执行任意代码"}],related:["ch5-l05","ch5-l06","ch5-l09"]})})]},h={id:"ch6",index:6,title:"综合编程实践",subtitle:"把滤波、边缘、特征与拼接整合为完整可运行项目",intro:"本章是课程的收官。你将不再练习孤立函数，而是完成从读图、预处理、滤波/边缘/特征提取到匹配拼接的完整 Python 项目，训练工程化组织代码与多步骤管线的能力。",objectives:["能独立编写完整的滤波与边缘检测管线","能组织特征匹配与图像拼接的多步骤项目","能在实战模式下通过结构化检查并理解其验证边界","形成可迁移到真实 CV 项目的工程习惯"],icon:"Tools",levels:[a("ch6",1,"完整图像滤波流程",{difficulty:"进阶",estMinutes:13,code:`import cv2
import numpy as np

img = cv2.imread("lena.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
mean = cv2.blur(gray, (5, 5))
gauss = cv2.GaussianBlur(gray, (5, 5), 1.2)
median = cv2.medianBlur(gray, 5)
cv2.imwrite("mean.png", mean)
cv2.imwrite("gauss.png", gauss)
cv2.imwrite("median.png", median)`,task:"跟打完整滤波项目：灰度化后三种滤波并行处理并保存。",tags:["综合","滤波"],labExperiment:"gaussian",know:e({overview:"本项目把灰度化与三种代表性滤波器组织成一个可运行脚本，输出三张结果图，体现同一输入下不同滤波策略的差异。",lineExplanations:[{code:"cvtColor 灰度化",explain:"统一单通道输入，简化后续处理"},{code:"blur/GaussianBlur/medianBlur",explain:"均值、高斯、中值三种并行结果"},{code:"imwrite 三张图",explain:"分别保存用于横向对比"}],pythonNotes:[],apiDocs:[],flow:["读图","灰度化","三种滤波","保存对比"],scenarios:["课程综合实验","滤波方案选型"],research:["可进一步用 PSNR/SSIM 在加噪图上定量比较"],pitfalls:[{problem:"在彩色图上直接中值/均值参数混乱",fix:"先统一灰度化再处理"},{problem:"输出文件覆盖难以区分",fix:"文件名带方法标识"}],related:["ch6-l02","ch6-l03"]})}),a("ch6",2,"多滤波器参数网格对比",{difficulty:"挑战",estMinutes:14,code:`import cv2

img = cv2.imread("lena.jpg", 0)
for k in (3, 5, 7):
    for s in (0.5, 1.5):
        dst = cv2.GaussianBlur(img, (k, k), sigmaX=s)
        print(f"ksize={k}, sigma={s}, mean={dst.mean():.1f}")`,task:"跟打嵌套循环网格，系统遍历核大小与 sigma 组合。",tags:["网格试验","嵌套循环"],know:e({overview:"嵌套循环构成参数网格，对每种 ksize×sigma 组合执行滤波并记录均值，是工程化超参数试验的标准写法。",lineExplanations:[{code:"for k ... for s ...",explain:"双重循环枚举参数组合"},{code:"print(f...)",explain:"记录每组参数与输出指标"}],pythonNotes:["嵌套循环通过缩进体现层级"],apiDocs:[],flow:["确定参数维度","网格枚举","执行并记录指标"],scenarios:["消融实验","参数敏感性分析"],research:["网格搜索思想可迁移到模型超参数调优"],pitfalls:[{problem:"核大小含偶数报错",fix:"网格只放奇数"},{problem:"输出太多难以分析",fix:"把结果写入表格或列表后统一分析"}],related:["ch6-l01"]})}),a("ch6",3,"自定义滤波管线",{mode:"blank",difficulty:"挑战",estMinutes:13,code:`import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], dtype=np.float32)
sharp = cv2.filter2D(img, cv2.CV_8U, kernel)
cv2.imwrite("sharp.png", sharp)
print("锐化结果:", sharp.shape)`,task:"跟打自定义锐化核（中心 5、四周 -1）并通过 filter2D 应用。",tags:["锐化","自定义核"],labExperiment:"conv",blank:{template:"sharp = cv2.{{1}}(img, cv2.CV_8U, {{2}})",answers:[["filter2D"],["kernel"]],hints:["通用卷积函数","上面定义的核变量名"],analysis:["锐化核中心权重 5、四邻域 -1，权重和为 1，增强边缘对比"]},know:e({overview:"通过自定义卷积核实现锐化：中心权重大于 1、邻域为负，突出像素与邻域差异，增强边缘与细节。filter2D 统一应用任意核。",lineExplanations:[{code:"中心 5、四周 -1",explain:"经典锐化核，权重和为 1 保持整体亮度"},{code:"filter2D 应用",explain:"与均值/高斯使用同一卷积接口"}],pythonNotes:[],apiDocs:[],formulas:[{title:"锐化思想",latex:"I_{sharp}=I+\\alpha(I-I_{blur})"}],flow:["设计核","filter2D 卷积","保存锐化结果"],scenarios:["细节增强","打印/显示前的清晰度提升"],research:["反锐化掩膜（unsharp mask）是常用增强手段"],pitfalls:[{problem:"核权重和不为 1 亮度漂移",fix:"检查权重和"},{problem:"过度锐化产生光晕",fix:"减小中心与邻域反差"}],related:["ch6-l01"]})}),a("ch6",4,"边缘检测完整流程",{difficulty:"进阶",estMinutes:13,code:`import cv2

img = cv2.imread("lena.jpg", 0)
blur = cv2.GaussianBlur(img, (3, 3), 1.0)
sx = cv2.Sobel(blur, cv2.CV_64F, 1, 0)
sy = cv2.Sobel(blur, cv2.CV_64F, 0, 1)
mag = cv2.convertScaleAbs(cv2.magnitude(sx, sy))
_, edges = cv2.threshold(mag, 50, 255, cv2.THRESH_BINARY)
cv2.imwrite("edge_pipeline.png", edges)`,task:"跟打完整边缘管线，注意每一步的输入输出类型。",tags:["综合","边缘检测"],labExperiment:"sobel",know:e({overview:"完整边缘项目串联平滑、双向 Sobel、幅值合成与阈值化，是工业检测与特征提取中常见的预处理管线。",lineExplanations:[{code:"GaussianBlur",explain:"抗噪第一步"},{code:"magnitude + convertScaleAbs",explain:"合成强度并转 uint8"},{code:"threshold",explain:"二值化输出干净边缘"}],pythonNotes:[],apiDocs:[],flow:["平滑","梯度","幅值","阈值","保存"],scenarios:["缺陷检测预处理","结构提取"],research:["替换各环节算子可做完整消融研究"],pitfalls:[{problem:"跳过平滑噪声多",fix:"保留 GaussianBlur"},{problem:"固定阈值不适配",fix:"可换 Otsu"}],related:["ch6-l05","ch6-l06"]})}),a("ch6",5,"多算子边缘对比项目",{difficulty:"挑战",estMinutes:14,code:`import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
blur = cv2.GaussianBlur(img, (3, 3), 0)
sobel = cv2.convertScaleAbs(cv2.Sobel(blur, cv2.CV_64F, 1, 1))
lap = cv2.convertScaleAbs(cv2.Laplacian(blur, cv2.CV_64F))
scharr = cv2.convertScaleAbs(cv2.Scharr(blur, cv2.CV_64F, 1, 0))
for name, out in (("sobel", sobel), ("lap", lap), ("scharr", scharr)):
    cv2.imwrite(name + ".png", out)`,task:"跟打多算子对比，循环保存 Sobel、Laplacian、Scharr 结果。",tags:["算子对比","边缘"],know:e({overview:"同一输入分别用一阶 Sobel、Scharr 与二阶 Laplacian 处理，循环保存，便于比较不同阶数算子的边缘表现。",lineExplanations:[{code:"三个算子",explain:"不同阶数/权重的边缘响应"},{code:"for name, out in tuple",explain:"元组循环批量保存"}],pythonNotes:["for name, out in (..) 同时解包两个变量"],apiDocs:[],flow:["统一平滑输入","分别计算","批量保存"],scenarios:["算子选型","教学对比"],research:["多算子对比有助于理解一阶/二阶方法差异"],pitfalls:[{problem:"响应尺度不同难以直接比较",fix:"统一归一化或分别调阈值"},{problem:"字符串拼接路径易错",fix:'用 name + ".png" 规范命名'}],related:["ch6-l04"]})}),a("ch6",6,"边缘检测实战任务",{mode:"challenge",difficulty:"挑战",estMinutes:16,code:`import cv2
import numpy as np

img = cv2.imread("lena.jpg", 0)
blur = cv2.GaussianBlur(img, (5, 5), 0)
gx = cv2.Sobel(blur, cv2.CV_64F, 1, 0)
gy = cv2.Sobel(blur, cv2.CV_64F, 0, 1)
edges = cv2.magnitude(gx, gy)
_, binary = cv2.threshold(cv2.convertScaleAbs(edges), 60, 255, cv2.THRESH_BINARY)
cv2.imwrite("final_edges.png", binary)`,task:"实战：独立组织平滑、Sobel、幅值与阈值，输出二值边缘。",tags:["实战","边缘检测"],validators:[{type:"function_call",name:"cv2.GaussianBlur",description:"先做高斯平滑抗噪"},{type:"function_call",name:"cv2.Sobel",description:"计算 x、y 方向梯度"},{type:"structure_count",name:"cv2.Sobel",min:2,description:"分别求两个方向梯度"},{type:"function_call",name:"cv2.threshold",description:"阈值化得到二值边缘"},{type:"function_call",name:"cv2.imwrite",description:"保存最终边缘图"}],labExperiment:"sobel",know:e({overview:"实战要求独立复现边缘管线，静态检查器会核对关键函数调用与方向次数，帮助确认结构完整，但不会执行代码。",lineExplanations:[{code:"两次 Sobel",explain:"检查器要求 x、y 各一次"},{code:"threshold + imwrite",explain:"二值化并保存"}],pythonNotes:["静态检查不运行 Python，仅验证结构与调用"],apiDocs:[],flow:["平滑","双向梯度","幅值","阈值","保存"],scenarios:["独立工程练习","检测管线模板"],research:["该模板可直接迁移到真实检测项目"],pitfalls:[{problem:"只做一次混合 Sobel",fix:"检查器要求两个方向分别调用"},{problem:"误以为检查通过等于结果正确",fix:"静态检查只保证结构，效果需在实验室验证"}],related:["ch6-l04","ch6-l05"]})}),a("ch6",7,"特征匹配完整流程",{difficulty:"挑战",estMinutes:15,code:`import cv2

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
cv2.imwrite("matches.png", out)`,task:"跟打完整匹配项目并 drawMatches 绘制连线。",tags:["综合","特征匹配"],labExperiment:"match",know:e({overview:"完整匹配项目从特征提取到比值检验，再用 drawMatches 绘制对应连线，输出可直接用于报告的匹配图。",lineExplanations:[{code:"knnMatch + 比值检验",explain:"净化匹配"},{code:"drawMatches",explain:"把两图与好匹配连线绘制到一起"}],pythonNotes:[],apiDocs:[{name:"cv2.drawMatches",signature:"cv2.drawMatches(img1, kp1, img2, kp2, matches1to2, outImg, flags=0)",params:[{name:"matches1to2",type:"DMatch[]",desc:"要绘制的好匹配列表"}]}],flow:["特征","匹配","比值检验","绘制保存"],scenarios:["目标识别","拼接前验证"],research:["匹配连线图是评估特征质量的直观证据"],pitfalls:[{problem:"好匹配过少 drawMatches 空",fix:"放宽比值阈值或改善图像"},{problem:"不过滤直接画连线杂乱",fix:"只画 good 匹配"}],related:["ch6-l08"]})}),a("ch6",8,"特征匹配实战任务",{mode:"challenge",difficulty:"挑战",estMinutes:17,code:`import cv2

sift = cv2.SIFT_create()
kp1, d1 = sift.detectAndCompute(img1, None)
kp2, d2 = sift.detectAndCompute(img2, None)
matcher = cv2.BFMatcher()
good = []
for pair in matcher.knnMatch(d1, d2, k=2):
    if len(pair) == 2 and pair[0].distance < 0.75 * pair[1].distance:
        good.append(pair[0])
print("好匹配:", len(good))`,task:"实战：独立完成 SIFT 提取、BFMatcher 与比值检验。",tags:["实战","匹配"],validators:[{type:"function_call",name:"detectAndCompute",description:"两图检测并计算描述子"},{type:"structure_count",name:"detectAndCompute",min:2,description:"两张图各执行一次"},{type:"function_call",name:"cv2.BFMatcher",description:"创建暴力匹配器"},{type:"function_call",name:"knnMatch",description:"k=2 最近邻匹配"},{type:"keyword",name:"for",description:"遍历匹配对做比值检验"}],labExperiment:"match",know:e({overview:"实战检查器核对特征提取次数、匹配器与比值检验循环，确认匹配管线结构完整。",lineExplanations:[{code:"两次 detectAndCompute",explain:"检查器要求两图各一次"},{code:"knnMatch + for",explain:"最近邻与比值检验"}],pythonNotes:[],apiDocs:[],flow:["提取","匹配","检验","输出"],scenarios:["独立匹配项目","拼接前置步骤"],research:["结构完整是几何估计成功的前提"],pitfalls:[{problem:"只提取一次",fix:"两张图都要 detectAndCompute"},{problem:"缺少检验循环",fix:"保留 for 比值检验"}],related:["ch6-l07","ch6-l09"]})}),a("ch6",9,"图像拼接实战任务",{mode:"challenge",difficulty:"挑战",estMinutes:18,code:`import cv2

img1 = cv2.imread("left.jpg")
img2 = cv2.imread("right.jpg")
stitcher = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)
status, pano = stitcher.stitch([img1, img2])
if status == cv2.Stitcher_OK:
    cv2.imwrite("panorama.png", pano)
print("状态:", status)`,task:"实战：用 Stitcher 完成两图拼接并按状态码处理结果。",tags:["实战","拼接"],validators:[{type:"function_call",name:"cv2.Stitcher_create",description:"创建拼接器"},{type:"function_call",name:"stitch",description:"执行拼接"},{type:"keyword",name:"if",description:"根据状态码判断是否成功"},{type:"function_call",name:"cv2.imwrite",description:"成功后保存全景图"}],labExperiment:"stitch",know:e({overview:"拼接实战要求正确创建 Stitcher、执行 stitch 并依据状态码条件处理，成功才保存。",lineExplanations:[{code:"Stitcher_create",explain:"全景模式"},{code:"if status == OK",explain:"状态判断后保存"}],pythonNotes:[],apiDocs:[],flow:["读图","创建拼接器","stitch","状态判断","保存"],scenarios:["全景拼接","视野扩展"],research:["状态码处理是健壮工程代码的基本要求"],pitfalls:[{problem:"不判断状态直接保存",fix:"保留 if 判断"},{problem:"重叠不足失败",fix:"保证足够重叠区域"}],related:["ch6-l10"]})}),a("ch6",10,"端到端 CV 综合项目",{mode:"challenge",difficulty:"挑战",estMinutes:20,code:`import cv2
import numpy as np

img = cv2.imread("scene.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
blur = cv2.GaussianBlur(gray, (3, 3), 1.0)
sift = cv2.SIFT_create()
kp, desc = sift.detectAndCompute(blur, None)
vis = cv2.drawKeypoints(img, kp, None, flags=cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
cv2.imwrite("e2e_keypoints.png", vis)
print("关键点:", len(kp), "描述子:", desc.shape)`,task:"终极实战：组织读图→灰度→平滑→SIFT→可视化的端到端项目。",tags:["终极实战","端到端"],validators:[{type:"import",module:"cv2",description:"导入 OpenCV"},{type:"import",module:"numpy",description:"导入 NumPy"},{type:"function_call",name:"cv2.cvtColor",description:"颜色空间转换"},{type:"function_call",name:"cv2.GaussianBlur",description:"高斯平滑"},{type:"function_call",name:"cv2.SIFT_create",description:"创建 SIFT"},{type:"function_call",name:"detectAndCompute",description:"检测关键点并计算描述子"},{type:"function_call",name:"cv2.drawKeypoints",description:"可视化关键点"},{type:"function_call",name:"cv2.imwrite",description:"保存项目成果"}],labExperiment:"sift",know:e({overview:"终极项目把前六章核心技能整合为一条端到端管线，覆盖颜色、平滑、特征与可视化，是可迁移到真实科研与工程的项目骨架。",lineExplanations:[{code:"cvtColor + GaussianBlur",explain:"预处理"},{code:"SIFT_create + detectAndCompute",explain:"特征提取核心"},{code:"drawKeypoints + imwrite",explain:"可视化交付"}],pythonNotes:["完成本项目即打通本平台核心学习闭环"],apiDocs:[],flow:["读图","预处理","特征提取","可视化","保存"],scenarios:["课程毕业设计","真实项目脚手架"],research:["可在此骨架上扩展匹配、拼接与定量评估"],pitfalls:[{problem:"管线步骤顺序混乱",fix:"按预处理→特征→交付的顺序组织"},{problem:"类型不匹配",fix:"注意灰度/彩色与 uint8/float 的切换"}],related:["ch6-l06","ch6-l08"]})})]},c=[l,p,m,d,f,h],s=c.flatMap(i=>i.levels),g=s.length;function u(i){return s.find(n=>n.id===i)}function v(i){return c.find(n=>n.id===i)}function x(i){const n=s.findIndex(r=>r.id===i);return n>=0?s[n+1]:void 0}export{s as a,u as b,c,v as f,x as n,g as t};
