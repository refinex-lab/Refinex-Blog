/*
 * 站点导航页配置
 *
 * 图标约定：
 * - 图片：推荐将本地图标放到 `public/navigate-icons/`，然后用 `/navigate-icons/xxx.svg` 引用。
 * - 外链：也可以使用外链图标（https://...）。
 * - iconfont：填写 `iconFontId`（例如 icon-home => 渲染 #icon-home），并在 `src/config/site.ts`
 *   配置 `iconfont.scriptUrl` 注入 iconfont.js。
 */

export type NavigateCategory = {
  id: string;
  label: string;
  description?: string;
};

export type NavigateSite = {
  id: string;
  title: string;
  description: string;
  href: string;
  categoryId: NavigateCategory["id"];
  iconSrc?: string;
  // iconfont Symbol id（例如：icon-home，渲染时会引用 #icon-home）
  iconFontId?: string;
  pinned?: boolean;
};

export const navigateConfig: {
  categories: NavigateCategory[];
  sites: NavigateSite[];
} = {
  categories: [
    {
      id: "ai",
      label: "AI & 生产力",
      description: "对话、编码、写作与效率工具",
    },
    {
      id: "dev",
      label: "开发与工具",
      description: "文档、云服务与工程效率",
    },
    {
      id: "read",
      label: "阅读与灵感",
      description: "资讯、文章与设计参考",
    },
  ],
  sites: [
    {
      id: "openai",
      title: "OpenAI",
      description: "模型与产品生态，面向开发者与研究者。",
      href: "https://openai.com/",
      categoryId: "ai",
      iconSrc: "/navigate-icons/openai.svg",
      pinned: true,
    },
    {
      id: "chatgpt",
      title: "ChatGPT",
      description: "日常对话、写作与思考的工作台。",
      href: "https://chatgpt.com/",
      categoryId: "ai",
      iconSrc: "/navigate-icons/chatgpt.svg",
      pinned: true,
    },
    {
      id: "github",
      title: "GitHub",
      description: "代码托管、协作与开源生态。",
      href: "https://github.com/",
      categoryId: "dev",
      iconSrc: "/navigate-icons/github.svg",
    },
    {
      id: "vercel",
      title: "Vercel",
      description: "前端部署与边缘网络平台。",
      href: "https://vercel.com/",
      categoryId: "dev",
      iconSrc: "/navigate-icons/vercel.svg",
    },
    {
      id: "tailwind",
      title: "Tailwind CSS",
      description: "实用优先的 CSS 工具集与设计系统。",
      href: "https://tailwindcss.com/",
      categoryId: "dev",
      iconSrc: "/navigate-icons/tailwind.svg",
    },
    {
      id: "radix",
      title: "Radix UI",
      description: "无障碍优先的 Headless UI 组件库。",
      href: "https://www.radix-ui.com/",
      categoryId: "dev",
      iconSrc: "/navigate-icons/radix.svg",
    },
    {
      id: "codex",
      title: "OpenAI Codex",
      description: "面向开发者的 AI 编程助手与工作流。",
      href: "https://openai.com/codex/",
      categoryId: "ai",
      iconSrc: "/navigate-icons/codex.svg",
    },
    {
      id: "mdn",
      title: "MDN Web Docs",
      description: "Web 平台权威文档与最佳实践。",
      href: "https://developer.mozilla.org/",
      categoryId: "read",
      iconSrc: "/navigate-icons/mdn.svg",
    },
  ],
};
