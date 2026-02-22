# Refinex Blog

基于 **React 19 + TypeScript + Vite 7 + Tailwind CSS v4 + Radix UI** 构建的文档型技术博客。

![](/public/readme/readme-light-home.png)

## 特性

- 📂 内容驱动 — 把 Markdown / MDX 放进 `content/` 即可自动生成目录树、搜索索引和路由
- 🔍 全文搜索 — 基于 FlexSearch，原生支持中文
- 🧩 MDX 组件 — Tabs、Steps、Callout、Terminal、FileTree 等 14 个内置组件
- 🛠 开发者工具 — 内置 25+ 在线工具（JSON 格式化、Diff 对比、正则测试、白板等）
- 🌗 亮暗主题 — Light / Dark / System 三种模式

## 技术栈

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4
- Radix UI（Dialog、Tabs、Dropdown、Collapsible、HoverCard）
- MDX（`@mdx-js/rollup`）
- FlexSearch（全文搜索）
- Mermaid（图表渲染）
- Monaco Editor（代码编辑器）
- Excalidraw（白板工具）

## 快速开始

```bash
git clone https://github.com/refinex-lab/Refinex-Blog.git
cd Refinex-Blog
npm install
npm run dev
```

访问终端输出的本地地址即可查看（通常是 `http://localhost:5173`）。

## 常用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # TypeScript 类型检查 + 生产构建
npm run preview  # 本地预览构建产物
npm run lint     # ESLint 代码检查
```

## 目录结构

```
Refinex-Blog/
├── content/                # 文档内容（Markdown / MDX）
│   ├── 01_开始使用/
│   ├── 02_搭建本站/
│   └── 03_Spring 生态/
├── public/                 # 静态资源
├── src/
│   ├── config/             # 站点配置（导航、个人信息、书签）
│   ├── docs/               # 文档系统核心（渲染、索引、搜索、MDX 组件）
│   ├── pages/              # 页面（首页、文档、工具、导航、关于）
│   ├── providers/          # 主题 Provider
│   └── components/ui/      # 通用 UI 组件
├── vite.config.ts
└── package.json
```

## 内容约定

目录和文件使用 `XX_名称` 格式命名，数字前缀控制排序，渲染时自动去除：

```
content/
  01_开始使用/
    01_快速开始.md
  02_搭建本站/
    01_项目介绍.md
    02_快速开始.md
```

- `01_快速开始.md` → 显示为「快速开始」，URL 为 `/docs/开始使用/快速开始`
- 支持 `.md`（纯 Markdown）和 `.mdx`（Markdown + React 组件）两种格式
