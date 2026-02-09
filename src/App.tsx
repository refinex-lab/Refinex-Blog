import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  ChevronDown,
  Github,
  Library,
  Moon,
  MessageCircle,
  Rss,
  Sun,
  Twitter,
} from "lucide-react";
import { siteConfig } from "./config/site";
import { ThemeProvider, useTheme } from "./providers/theme";

const ThemeToggle = () => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="切换主题"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
    >
      <Sun
        className={`h-5 w-5 transition duration-300 ${
          isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 opacity-100"
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition duration-300 ${
          isDark ? "scale-100 opacity-100" : "scale-0 -rotate-90 opacity-0"
        }`}
      />
    </button>
  );
};

const LogoMark = () => {
  if (siteConfig.logo.type === "image") {
    return (
      <img
        src={siteConfig.logo.imageSrc}
        alt={`${siteConfig.title} logo`}
        className="h-9 w-auto"
      />
    );
  }

  return (
    <span className="flex h-9 w-9 items-center justify-center text-[var(--accent-color)]">
      <Library className="h-6 w-6" />
    </span>
  );
};

const iconMap = {
  github: Github,
  twitter: Twitter,
  discord: MessageCircle,
  rss: Rss,
};

const IconLink = ({ icon, label, href }: (typeof siteConfig.icons)[number]) => {
  const Icon = iconMap[icon] ?? Github;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
    >
      <Icon className="h-5 w-5" />
    </a>
  );
};

const Header = () => {
  return (
    <header
      className="sticky top-0 z-50 border-b border-black/5 backdrop-blur dark:border-white/10"
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--page-bg) 75%, transparent)",
      }}
    >
      <div className="flex w-full items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <LogoMark />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              {siteConfig.title}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {siteConfig.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
            {siteConfig.nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-lg px-3 py-1 text-slate-600 transition-colors hover:bg-[var(--accent-color)] hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200/70 bg-white/70 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-gray-800/70 dark:text-slate-200 dark:hover:bg-gray-900 dark:hover:text-white"
              >
                更多
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 min-w-[180px] rounded-xl border border-slate-200/70 bg-white/95 p-2 shadow-lg shadow-slate-200/40 backdrop-blur dark:border-white/10 dark:bg-gray-900/95 dark:shadow-black/40"
              >
                {siteConfig.menu.map((item) => (
                  <DropdownMenu.Item key={item.label} asChild>
                    <a
                      href={item.href}
                      className="flex items-center rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                      {item.label}
                    </a>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {siteConfig.icons.map((item) => (
            <IconLink key={item.label} {...item} />
          ))}
          {siteConfig.theme.enableToggle ? <ThemeToggle /> : null}
        </div>
      </div>
    </header>
  );
};

const AppShell = () => {
  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-slate-900 transition-colors duration-300 dark:text-slate-100">
      <Header />
      <main className="mx-auto flex min-h-[calc(100vh-72px)] max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
        <section className="rounded-2xl border border-slate-200/70 bg-white/85 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#3a437a]/70">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-200">
            Latest Draft
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
            现代前端架构中的状态管理策略
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-100/80">
            这里是主内容区域，占位用于后续接入文章列表、CMS 或路由内容。
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-dashed border-slate-200/70 bg-white/60 p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-[#3a437a]/50 dark:text-slate-100/70">
            这里可以注入文章列表、标签筛选、分页等模块。
          </div>
          <aside className="rounded-2xl border border-slate-200/70 bg-[var(--accent-color)] p-6 text-sm text-slate-700 dark:border-white/10 dark:text-white">
            右侧栏可以放置作者信息、近期文章或订阅入口。
          </aside>
        </section>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider defaultTheme={siteConfig.theme.defaultMode}>
      <AppShell />
    </ThemeProvider>
  );
}
