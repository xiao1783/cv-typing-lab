# CV键知 —— 面向计算机视觉的代码打字与交互式学习平台

> 键入代码，理解视觉。

一个**纯前端**的计算机视觉教学平台：通过真实 Python / NumPy / OpenCV 代码的**跟打、填空与实战**训练，配合浏览器端**实时图像处理**、知识解析、测验与学习数据分析，帮助学习者系统掌握从图像卷积、平滑去噪、边缘检测到 SIFT 特征匹配与图像拼接的完整 CV 编程能力。

本项目无后端、无登录、无外部数据库，所有数据保存在浏览器本地（IndexedDB），可直接静态部署到 GitHub Pages。

---

## 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | Vue 3 + TypeScript + Vite |
| 路由 / 状态 | Vue Router（Hash 模式）+ Pinia |
| UI | Element Plus（中文语言包、全图标） |
| 代码编辑 | Monaco Editor（Python 语法高亮） |
| 数学公式 | KaTeX |
| 数据可视化 | ECharts |
| 本地持久化 | Dexie（IndexedDB） |
| 图像处理 | 基于 Canvas `ImageData` 的真实 JavaScript 算法 + Web Worker |
| 测试 | Vitest（单元）+ Playwright（端到端） |

图像处理**不引入 OpenCV.js**，而是在浏览器中用经过验证的 JavaScript 算法对真实像素做计算；扩展实验（DoG 关键点、特征匹配、RANSAC、拼接）同样为实时计算，并在界面上诚实标注“教学简化”，不使用任何预加载效果图或伪造结果。

---

## 环境要求

- Node.js ≥ 18（推荐 20 / 22）
- npm ≥ 9

## 安装与启动

```bash
# 安装依赖
npm install

# 本地开发（默认 http://localhost:5173）
npm run dev

# 类型检查
npm run typecheck

# 生产构建（输出到 dist/）
npm run build

# 本地预览构建产物（默认 http://localhost:4173）
npm run preview
```

## 测试

```bash
# 单元测试（Vitest，纯逻辑：引擎 / 统计 / 校验 / 备份）
npm test

# 端到端测试（Playwright，首次运行需安装浏览器）
npx playwright install chromium
npm run e2e
```

---

## 核心功能

- **代码打字引擎**：逻辑与视图分离。严格模式逐字符精确匹配；宽松模式仅忽略行尾空白，行首缩进（对 Python 有语义作用）始终强制。正确处理输入法组合、光标移动、选择、粘贴、中间修改；统计 WPM（5 字符/词）、CPM、准确率与综合评分。
- **三种练习模式**：代码跟打、代码填空（多答案、空白折叠、提示）、代码实战（不执行 Python、不使用 `eval` 的静态结构分析，明确标注验证边界）。
- **知识解析**：功能概述、逐行讲解、Python 语法、OpenCV API 与参数、数学公式（KaTeX）、执行流程、应用场景、科研用途、常见错误与相关推荐。
- **算法实验室**：左参数 / 中结果 / 右原理三栏布局，内置程序化生成示例图与本地上传，支持滑块调参、拖动分割线对比、缩放、结果保存、耗时统计、卷积核可视化、像素矩阵过程。
- **知识测验**：单选、多选、判断、代码填空、参数选择、结果判断六类题型，错题自动加入错题本。
- **学习分析**：ECharts 趋势、雷达、易错字符柱状与日历热力图，全部基于真实记录，无数据时提供空状态。
- **本地持久化**：进度、记录、错题、收藏、成就、设置与最近位置；支持 JSON 导出、结构校验 + 覆盖确认的导入、恢复默认与清空数据。

---

## 部署到 GitHub Pages

项目已为静态部署做了两项配置：

1. `vite.config.ts` 中 `base: './'`，使用相对路径；
2. 路由使用 `createWebHashHistory`（Hash 路由），任意子路径刷新都不会 404。

部署步骤：

```bash
npm run build        # 生成 dist/
```

然后任选一种方式：

- **最简单**：把 `dist/` 目录内容推送到仓库的 `gh-pages` 分支，或在仓库 Settings → Pages 中选择该分支。
- **使用 gh-pages 工具**：

  ```bash
  npx gh-pages -d dist
  ```

- **GitHub Actions**：在工作流中执行 `npm ci && npm run build`，并将 `dist` 上传到 `github-pages` 环境。

部署后通过 `https://<用户名>.github.io/<仓库名>/` 访问即可。

---

## 目录结构

```
.
├─ e2e/                     # Playwright 端到端测试
├─ public/                  # 静态资源（favicon）
├─ src/
│  ├─ components/           # 通用组件、打字组件、实验室组件
│  ├─ config/               # 导航、成就配置
│  ├─ data/                 # 课程与测验数据（TS 模块，与 UI 分离）
│  ├─ db/                   # Dexie 数据库、类型、统一服务层
│  ├─ engine/               # 打字引擎、静态校验、评分（纯逻辑）
│  ├─ imaging/              # 核、运算、特征、Worker、实验注册表
│  ├─ layouts/              # 全局布局
│  ├─ router/               # 路由
│  ├─ services/             # 统计服务
│  ├─ stores/               # Pinia
│  └─ views/                # 页面视图
├─ index.html
├─ vite.config.ts
└─ tsconfig.json
```

---

## 数据与隐私说明

- 所有学习数据仅保存在**当前浏览器**的 IndexedDB（库名 `cv-jianzhi-db`），不会上传到任何服务器。
- 清除浏览器站点数据会同时清除学习记录，可使用“导出备份”迁移或留存。
- 导入备份前会校验结构，并在覆盖现有数据前要求确认。

## 教学简化与边界

- 代码实战为**静态结构检查**，不执行 Python、不使用 `eval`；通过检查不代表运行结果正确。
- SIFT / 匹配 / RANSAC / 拼接为真实浏览器端实时计算，但在亚像素拟合、主方向归一化与融合策略上做了教学精简，不等同于完整 OpenCV 实现，界面均有明确标注。
