/*
 * 站点导航页配置
 *
 * 图标约定：
 * - 图片：推荐将本地图标放到 `public/navigate-icons/`，然后用 `/navigate-icons/xxx.svg` 引用。
 * - 外链：也可以使用外链图标（https://...）。
 * - iconfont：支持 Symbol 与 font-class 两种模式。
 *   - Symbol：填写 `iconFontId`（例如 icon-home => 渲染 #icon-home），并在 `src/config/site.ts`
 *     配置 `iconfont.scriptUrl` 注入 iconfont.js。
 *   - font-class：填写 `iconFontClass`（例如 icon-home），并在 `src/config/site.ts`
 *     配置 `iconfont.cssUrl` 注入 iconfont.css。
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
  // iconfont font-class（例如：icon-home => class="iconfont icon-home"）
  iconFontClass?: string;
  pinned?: boolean;
};

export const navigateConfig: {
  categories: NavigateCategory[];
  sites: NavigateSite[];
} = {
  categories: [
    {
      id: "ai",
      label: "AI 助手",
      description: "对话、搜索与智能助理",
    },
    {
      id: "frontend",
      label: "前端文档",
      description: "框架、语言与工程化工具",
    },
    {
      id: "backend-java",
      label: "后端（Java）",
      description: "框架、ORM 与构建工具",
    },
    {
      id: "ui",
      label: "UI 框架",
      description: "组件库与设计系统",
    },
    {
      id: "design",
      label: "设计与灵感",
      description: "UI 设计、灵感与案例",
    },
    {
      id: "notes",
      label: "笔记与知识库",
      description: "协作、整理与沉淀",
    },
    {
      id: "diagram",
      label: "画图与原型",
      description: "流程图、白板与原型",
    },
    {
      id: "code",
      label: "代码托管",
      description: "仓库与协作平台",
    },
    {
      id: "media",
      label: "媒体娱乐",
      description: "视频、音乐与内容平台",
    },
  ],
  sites: [
    {
      id: "chatgpt",
      title: "ChatGPT",
      description: "OpenAI 的对话式 AI 助手。",
      href: "https://chatgpt.com/",
      categoryId: "ai",
      pinned: true,
      iconSrc: "icon-OpenAiLogo",
    },
    {
      id: "claude",
      title: "Claude",
      description: "Anthropic 推出的通用 AI 助手。",
      href: "https://claude.com/",
      categoryId: "ai",
      iconSrc: "icon-Claude",
    },
    {
      id: "grok",
      title: "Grok",
      description: "xAI 旗下的对话式 AI。",
      href: "https://grok.com/",
      categoryId: "ai",
      iconSrc: "icon-grok",
    },
    {
      id: "zai",
      title: "Z.ai",
      description: "GLM 系列 AI 助手入口。",
      href: "https://z.ai/",
      categoryId: "ai",
      iconSrc: "icon-a-zailogo",
    },
    {
      id: "deepseek",
      title: "DeepSeek",
      description: "深度求索 AI 平台与模型入口。",
      href: "https://deepseek.com/",
      categoryId: "ai",
      iconSrc: "icon-deepseek",
    },
    {
      id: "mdn",
      title: "MDN Web Docs",
      description: "Web 平台权威文档。",
      href: "https://developer.mozilla.org/",
      categoryId: "frontend",
      pinned: true,
      iconSrc: "icon-mdn",
    },
    {
      id: "react",
      title: "React",
      description: "React 官方文档。",
      href: "https://react.dev/",
      categoryId: "frontend",
      iconSrc: "icon-react",
    },
    {
      id: "vue",
      title: "Vue",
      description: "Vue 官方文档。",
      href: "https://vuejs.org/",
      categoryId: "frontend",
      iconSrc: "icon-Vue",
    },
    {
      id: "angular",
      title: "Angular",
      description: "Angular 官方文档。",
      href: "https://angular.dev/",
      categoryId: "frontend",
      iconSrc: "icon-Angular",
    },
    {
      id: "svelte",
      title: "Svelte",
      description: "Svelte 官方文档。",
      href: "https://svelte.dev/",
      categoryId: "frontend",
      iconSrc: "icon-ListOneServlet",
    },
    {
      id: "nextjs",
      title: "Next.js",
      description: "Next.js 官方文档。",
      href: "https://nextjs.org/",
      categoryId: "frontend",
      iconSrc: "icon-cib-next-js",
    },
    {
      id: "vite",
      title: "Vite",
      description: "Vite 官方文档。",
      href: "https://vite.dev/",
      categoryId: "frontend",
      iconSrc: "icon-vite",
    },
    {
      id: "tailwindcss",
      title: "Tailwind CSS",
      description: "Tailwind CSS 官方文档。",
      href: "https://tailwindcss.com/",
      categoryId: "frontend",
      iconSrc: "icon-tailwindcss",
    },
    {
      id: "typescript",
      title: "TypeScript",
      description: "TypeScript 官方文档。",
      href: "https://www.typescriptlang.org/",
      categoryId: "frontend",
      iconSrc: "icon-typescript",
    },
    {
      id: "spring",
      title: "Spring",
      description: "Spring 官方入口。",
      href: "https://spring.io/",
      categoryId: "backend-java",
      iconSrc: "icon-spring",
    },
    {
      id: "spring-boot",
      title: "Spring Boot",
      description: "Spring Boot 官方文档。",
      href: "https://spring.io/projects/spring-boot/",
      categoryId: "backend-java",
      pinned: true,
      iconSrc: "icon-spring",
    },
    {
      id: "spring-cloud",
      title: "Spring Cloud",
      description: "Spring Cloud 官方文档。",
      href: "https://spring.io/projects/spring-cloud/",
      categoryId: "backend-java",
      iconSrc: "icon-spring",
    },
    {
      id: "mybatis",
      title: "MyBatis",
      description: "MyBatis 官方文档。",
      href: "https://mybatis.org/",
      categoryId: "backend-java",
      iconSrc: "icon-mybatis",
    },
    {
      id: "mybatis-plus",
      title: "MyBatis-Plus",
      description: "MyBatis-Plus 官方站点。",
      href: "https://baomidou.com/",
      categoryId: "backend-java",
      iconSrc: "icon-mybatisplus",
    },
    {
      id: "hibernate",
      title: "Hibernate ORM",
      description: "Hibernate ORM 官方文档。",
      href: "https://hibernate.org/orm/",
      categoryId: "backend-java",
      iconSrc: "icon-Hibernate",
    },
    {
      id: "jakarta-persistence",
      title: "Jakarta Persistence",
      description: "JPA 规范（Jakarta Persistence）。",
      href: "https://jakarta.ee/specifications/persistence/",
      categoryId: "backend-java",
      iconSrc: "icon-a-cfdf5c8c-002f-4733-8a31-6a911c4015d31",
    },
    {
      id: "maven",
      title: "Apache Maven",
      description: "Maven 构建工具官方文档。",
      href: "https://maven.apache.org/",
      categoryId: "backend-java",
      iconSrc: "icon-maven",
    },
    {
      id: "gradle",
      title: "Gradle",
      description: "Gradle 构建工具官方文档。",
      href: "https://gradle.org/",
      categoryId: "backend-java",
      iconSrc: "icon-gradle",
    },
    {
      id: "java-se",
      title: "Java SE Docs",
      description: "Java SE 官方文档。",
      href: "https://docs.oracle.com/en/java/javase/",
      categoryId: "backend-java",
      iconSrc: "icon-java",
    },
    {
      id: "ant-design",
      title: "Ant Design",
      description: "企业级设计系统与组件库。",
      href: "https://ant.design/",
      categoryId: "ui",
      iconSrc: "icon-antd",
    },
    {
      id: "element-plus",
      title: "Element Plus",
      description: "Vue 3 UI 组件库。",
      href: "https://element-plus.org/",
      categoryId: "ui",
      iconSrc: "icon-a-ElementPlus",
    },
    {
      id: "arco-design",
      title: "Arco Design",
      description: "字节跳动出品的设计系统。",
      href: "https://arco.design/",
      categoryId: "ui",
      iconSrc: "icon-arco-design",
    },
    {
      id: "mui",
      title: "MUI",
      description: "React 组件库。",
      href: "https://mui.com/",
      categoryId: "ui",
    },
    {
      id: "radix-ui",
      title: "Radix UI",
      description: "无障碍优先的 UI 组件。",
      href: "https://www.radix-ui.com/",
      categoryId: "ui",
    },
    {
      id: "shadcn-ui",
      title: "shadcn/ui",
      description: "可组合的 React UI 组件集。",
      href: "https://ui.shadcn.com/",
      categoryId: "ui",
    },
    {
      id: "figma",
      title: "Figma",
      description: "协作式 UI 设计工具。",
      href: "https://www.figma.com/",
      categoryId: "design",
      iconSrc: "icon-Figma",
    },
    {
      id: "dribbble",
      title: "Dribbble",
      description: "设计作品与灵感社区。",
      href: "https://dribbble.com/",
      categoryId: "design",
      iconSrc: "icon-behance",
    },
    {
      id: "behance",
      title: "Behance",
      description: "Adobe 旗下设计作品平台。",
      href: "https://www.behance.net/",
      categoryId: "design",
      iconSrc: "icon-OpenAiLogo",
    },
    {
      id: "feishu",
      title: "飞书",
      description: "协作与文档平台。",
      href: "https://www.feishu.cn/",
      categoryId: "notes",
      iconSrc: "icon-feishu",
    },
    {
      id: "yuque",
      title: "语雀",
      description: "知识库与文档协作。",
      href: "https://www.yuque.com/",
      categoryId: "notes",
      iconSrc: "icon-yuque",
    },
    {
      id: "notion",
      title: "Notion",
      description: "一体化笔记与协作空间。",
      href: "https://www.notion.so/",
      categoryId: "notes",
      iconSrc: "icon-notion",
    },
    {
      id: "obsidian",
      title: "Obsidian",
      description: "本地优先的知识库。",
      href: "https://obsidian.md/",
      categoryId: "notes",
      iconSrc: "icon-obsidian",
    },
    {
      id: "diagrams-net",
      title: "diagrams.net",
      description: "在线流程图与图表工具。",
      href: "https://www.diagrams.net/",
      categoryId: "diagram",
      iconSrc: "icon-Diagrams",
    },
    {
      id: "excalidraw",
      title: "Excalidraw",
      description: "手绘风白板工具。",
      href: "https://excalidraw.com/",
      categoryId: "diagram",
      iconSrc: "icon-Excalidraw",
    },
    {
      id: "mermaid-live",
      title: "Mermaid Live",
      description: "Mermaid 在线编辑器。",
      href: "https://mermaid.live/",
      categoryId: "diagram",
      iconSrc: "icon-Mermaid",
    },
    {
      id: "tldraw",
      title: "tldraw",
      description: "在线白板与原型工具。",
      href: "https://tldraw.com/",
      categoryId: "diagram",
      iconSrc: "icon-tldraw_light",
    },
    {
      id: "github",
      title: "GitHub",
      description: "代码托管与协作平台。",
      href: "https://github.com/",
      categoryId: "code",
      pinned: true,
      iconSrc: "icon-github",
    },
    {
      id: "gitlab",
      title: "GitLab",
      description: "DevOps 一体化平台。",
      href: "https://gitlab.com/",
      categoryId: "code",
      iconSrc: "icon-gitlab",
    },
    {
      id: "gitee",
      title: "Gitee",
      description: "国内代码托管平台。",
      href: "https://gitee.com/",
      categoryId: "code",
      iconSrc: "icon-logo",
    },
    {
      id: "bitbucket",
      title: "Bitbucket",
      description: "Atlassian 代码托管服务。",
      href: "https://bitbucket.org/",
      categoryId: "code",
      iconSrc: "icon-bitbucket",
    },
    {
      id: "apple-music",
      title: "Apple Music",
      description: "Apple 的音乐流媒体服务。",
      href: "https://music.apple.com/",
      categoryId: "media",
      iconSrc: "icon-AppleMusic",
    },
    {
      id: "bilibili",
      title: "Bilibili",
      description: "国内视频内容平台。",
      href: "https://www.bilibili.com/",
      categoryId: "media",
      iconSrc: "icon-bilibili",
    },
    {
      id: "youtube",
      title: "YouTube",
      description: "全球视频内容平台。",
      href: "https://www.youtube.com/",
      categoryId: "media",
      iconSrc: "icon-youtobe",
    },
  ],
};
