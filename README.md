# Refinex Blog

基于 **React + TypeScript + Tailwind CSS + Radix UI** 的前端技术博客初始化项目。内置基础页面结构与 Radix Dialog 示例，便于快速二次开发。

## 技术栈

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Radix UI (Dialog + Icons)

## 快速开始

> 如遇 npm 缓存权限问题，可使用项目内缓存（见下方「常见问题」）。

```bash
npm install
npm run dev
```

访问浏览器提示的本地地址即可查看。

## 常用脚本

```bash
npm run dev      # 本地开发
npm run build    # 生产构建
npm run preview  # 预览构建产物
npm run lint     # 代码检查
```

## 目录结构

```
.
├── index.html
├── src
│   ├── App.tsx        # 页面骨架与 Radix Dialog 示例
│   ├── index.css      # Tailwind 入口与全局样式
│   └── main.tsx       # 入口文件
└── vite.config.ts
```

## Tailwind 配置

使用 Tailwind CSS v4 + `@tailwindcss/vite` 插件，样式入口在 `src/index.css` 中通过 `@import "tailwindcss"` 引入。
