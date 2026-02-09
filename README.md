# Refinex Blog

基于 **React + TypeScript + Tailwind CSS + Radix UI** 的前端技术博客初始化项目。内置基础页面结构与 Radix Dialog 示例，便于快速二次开发。

## 技术栈

- React 19 + TypeScript
- Vite
- Tailwind CSS v3
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
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts
```

## Tailwind 配置

已配置 `tailwind.config.js` 的 `content` 字段以扫描 `index.html` 与 `src` 目录下的源码。

## 常见问题

- **npm 缓存权限报错**
  可使用项目内缓存目录：
  ```bash
  npm install --cache ./.npm-cache
  ```
  该目录已在 `.gitignore` 中忽略。

## 下一步建议

- 接入路由（如 React Router）
- 增加博客文章数据层（Markdown / CMS）
- 引入主题切换与搜索功能

---

如需扩展页面结构或增加模块，请告诉我你的规划。
