---
title: 部署到 Linux 服务器
description: 在 Linux 上构建并通过 Nginx 提供静态站点访问。
order: 99930
cover: http://refienx-notes.oss-cn-shanghai.aliyuncs.com/blog/ceyspz.png
author: 老李
createdAt: 2026-02-01
updatedAt: 2026-02-14
---

# 部署到 Linux 服务器

本站是纯静态站点，生产构建产物在 `dist/`，适合用 Nginx/Apache/Caddy/对象存储 + CDN 进行部署。

## 方案 A：在服务器上构建

1) 服务器安装 Node.js（建议使用 LTS 版本）

2) 克隆并构建：

```bash
git clone <your-repo-url>
cd Refinex-Blog
npm i
npm run build
```

3) 将 `dist/` 作为静态目录交给 Nginx

示例 Nginx 配置（仅供参考）：

```nginx
server {
  listen 80;
  server_name example.com;

  root /var/www/refinex-blog/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## 方案 B：本地构建后上传 dist/

在本地执行：

```bash
npm i
npm run build
```

将 `dist/` 上传到服务器的静态目录即可（例如 `/var/www/refinex-blog/dist`）。

