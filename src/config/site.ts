/*
 * 全局站点配置
 */

// 主题模式：light（亮色）、dark（暗色）、system（跟随系统）
export type ThemeMode = "light" | "dark" | "system";

// 导航项
export type SiteNavItem = {
  label: string;
  href: string;
};

// 站点配置
export type SiteConfig = {
  // 站点标题
  title: string;
  // 站点副标题
  subtitle: string;
  // 站点logo
  logo: {
    type: "icon" | "image";
    imageSrc: string;
    href: string;
  };
  // 导航栏
  nav: SiteNavItem[];
  // 菜单
  menu: SiteNavItem[];
  // 顶部图标组（约定 icon 值与 App 中的 iconMap 对应）
  icons: {
    label: string;
    href: string;
    icon: "github" | "twitter" | "discord" | "rss";
  }[];
  // iconfont（可选）：用于站点导航等模块渲染 iconfont Symbol 图标
  iconfont?: {
    // Symbol 模式脚本地址（iconfont.cn 生成的 `iconfont.js`）
    scriptUrl?: string;
    // 可选：font-class 模式样式地址（iconfont.cn 生成的 `iconfont.css`）
    cssUrl?: string;
  };
  theme: {
    // 是否启用主题切换
    enableToggle: boolean;
    // 默认主题模式
    defaultMode: ThemeMode;
  };
  footer: {
    // 版权信息
    copyright: string;
    // 备案/说明
    meta: string[];
    // 页脚链接
    links: SiteNavItem[];
  };
};

// 全局站点配置
export const siteConfig: SiteConfig = {
  // 站点标题
  title: "Refinex Blog",
  // 站点副标题
  subtitle: "老李的技术随想录",
  // 站点logo
  logo: {
    type: "image",
    imageSrc: "/logo.svg",
    href: "/",
  },
  // 导航栏
  nav: [
    { label: "首页", href: "/" },
    { label: "文档", href: "/docs" },
    { label: "导航", href: "/navigate" },
    { label: "关于", href: "/about" },
  ],
  // 菜单
  menu: [
    { label: "归档", href: "/" },
    { label: "标签", href: "/" },
    { label: "友链", href: "/" },
    { label: "RSS", href: "/" },
  ],
  // 顶部图标组（可按需扩展）
  icons: [
    {
      label: "GitHub",
      href: "https://github.com/refinex-lab/Refinex-Blog",
      icon: "github",
    },
  ],
  // iconfont（可选）：填入地址后会自动注入到页面 head
  iconfont: {
    // scriptUrl: "https://at.alicdn.com/t/c/font_XXXXXX_XXXXXX.js",
    // cssUrl: "https://at.alicdn.com/t/c/font_XXXXXX_XXXXXX.css",
  },
  // 主题配置
  theme: {
    // 是否启用主题切换
    enableToggle: true,
    // 默认主题模式
    defaultMode: "system",
  },
  footer: {
    copyright: "© 2026 Refinex Blog. All rights reserved.",
    meta: ["后端技术 · 架构思考 · 体验设计"],
    links: [
      { label: "隐私政策", href: "/" },
      { label: "使用条款", href: "/" },
      { label: "联系我", href: "/" },
    ],
  },
};
