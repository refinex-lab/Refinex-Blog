import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  ChevronDown,
  Github,
  Library,
  Moon,
  Menu,
  MessageCircle,
  Rss,
  Sparkles,
  Sun,
  Twitter,
  X,
} from "lucide-react";
import { useState } from "react";
import { siteConfig } from "./config/site";
import { ThemeProvider } from "./providers/ThemeProvider";
import { useTheme } from "./providers/useTheme";
import { AboutPage } from "./pages/about/AboutPage";
import { AiHubPage } from "./pages/ai/AiHubPage";
import { FriendsPage } from "./pages/friends/FriendsPage";
import { ToolsPage } from "./pages/tools/ToolsPage";
import { JsonToolPage } from "./pages/tools/JsonToolPage";
import { DiffToolPage } from "./pages/tools/DiffToolPage";
import { Base64ToolPage } from "./pages/tools/Base64ToolPage";
import { UrlEncodeToolPage } from "./pages/tools/UrlEncodeToolPage";
import { JwtToolPage } from "./pages/tools/JwtToolPage";
import { UuidToolPage } from "./pages/tools/UuidToolPage";
import { HashToolPage } from "./pages/tools/HashToolPage";
import { RegexToolPage } from "./pages/tools/RegexToolPage";
import { CronToolPage } from "./pages/tools/CronToolPage";
import { TimestampToolPage } from "./pages/tools/TimestampToolPage";
import { DateCalcToolPage } from "./pages/tools/DateCalcToolPage";
import { ImageConvertToolPage } from "./pages/tools/ImageConvertToolPage";
import { ImageCompressToolPage } from "./pages/tools/ImageCompressToolPage";
import { ImageBase64ToolPage } from "./pages/tools/ImageBase64ToolPage";
import { ColorPickerToolPage } from "./pages/tools/ColorPickerToolPage";
import { HttpStatusToolPage } from "./pages/tools/HttpStatusToolPage";
import { IpToolPage } from "./pages/tools/IpToolPage";
import { UserAgentToolPage } from "./pages/tools/UserAgentToolPage";
import { SignatureToolPage } from "./pages/tools/SignatureToolPage";
import { CalculatorToolPage } from "./pages/tools/CalculatorToolPage";
import { WhiteboardToolPage } from "./pages/tools/WhiteboardToolPage";
import { LinuxToolPage } from "./pages/tools/LinuxToolPage";
import { MimeToolPage } from "./pages/tools/MimeToolPage";
import { HttpHeaderToolPage } from "./pages/tools/HttpHeaderToolPage";
import { HomePage } from "./pages/home/HomePage";
import { NavigatePage } from "./pages/navigate/NavigatePage";
import { DocsPage } from "./pages/docs/DocsPage";
import { IconFontAssets } from "./components/ui/IconFontAssets";

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

const MobileMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="打开菜单"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-0 top-0 z-50 h-full w-[85vw] max-w-sm border-r border-black/5 bg-white p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left dark:border-white/10 dark:bg-slate-950">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-white">
              菜单
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                aria-label="关闭菜单"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <nav className="mt-8 flex flex-col gap-1">
            {siteConfig.nav.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="my-2 h-px bg-black/5 dark:bg-white/10" />
            {siteConfig.menu.map((item) =>
              item.href.startsWith("/") ? (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                >
                  {item.label}
                </a>
              )
            )}
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center justify-between rounded-xl border border-black/5 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-slate-900/50">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                社交链接
              </span>
              <div className="flex items-center gap-2">
                {siteConfig.icons.map((item) => (
                  <IconLink key={item.label} {...item} />
                ))}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
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
      <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to={siteConfig.logo.href}
            className="flex items-center gap-2 sm:gap-4"
            aria-label={`${siteConfig.title} 首页`}
          >
            <LogoMark />
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                {siteConfig.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {siteConfig.subtitle}
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 text-sm font-medium md:flex">
            {siteConfig.nav.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1 transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop More Menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="hidden items-center gap-2 rounded-lg border border-slate-200/70 bg-white/70 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-gray-800/70 dark:text-slate-200 dark:hover:bg-gray-900 dark:hover:text-white md:inline-flex"
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
                    {item.href.startsWith("/") ? (
                      <Link
                        to={item.href}
                        className="flex items-center rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-gray-800 dark:hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a
                        href={item.href}
                        className="flex items-center rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-gray-800 dark:hover:text-white"
                      >
                        {item.label}
                      </a>
                    )}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* AI Entry - Always visible */}
          <NavLink
            to="/ai"
            aria-label="AI 入口"
            className={({ isActive }) =>
              `inline-flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                isActive
                  ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              }`
            }
          >
            <Sparkles className="h-5 w-5" />
          </NavLink>

          {/* Desktop Social Icons */}
          <div className="hidden items-center gap-2 md:flex">
            {siteConfig.icons.map((item) => (
              <IconLink key={item.label} {...item} />
            ))}
          </div>

          {/* Theme Toggle - Always visible */}
          {siteConfig.theme.enableToggle ? <ThemeToggle /> : null}

          {/* Mobile Menu */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
};

const AppShell = () => {
  const location = useLocation();
  const isDocs = location.pathname.startsWith("/docs");


  return (
    <div className="min-h-screen bg-[var(--page-bg)] text-slate-900 transition-colors duration-300 dark:text-slate-100">
      <IconFontAssets
        scriptUrl={siteConfig.iconfont?.scriptUrl}
        cssUrl={siteConfig.iconfont?.cssUrl}
      />
      <Header />
      <main className="flex min-h-[calc(100vh-72px)] flex-1 flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ai" element={<AiHubPage />} />
          <Route path="/docs/*" element={<DocsPage />} />
          <Route path="/navigate" element={<NavigatePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/json" element={<JsonToolPage />} />
          <Route path="/tools/diff" element={<DiffToolPage />} />
          <Route path="/tools/base64" element={<Base64ToolPage />} />
          <Route path="/tools/url-encode" element={<UrlEncodeToolPage />} />
          <Route path="/tools/jwt" element={<JwtToolPage />} />
          <Route path="/tools/uuid" element={<UuidToolPage />} />
          <Route path="/tools/hash" element={<HashToolPage />} />
          <Route path="/tools/regex" element={<RegexToolPage />} />
          <Route path="/tools/cron" element={<CronToolPage />} />
          <Route path="/tools/timestamp" element={<TimestampToolPage />} />
          <Route path="/tools/date-calc" element={<DateCalcToolPage />} />
          <Route path="/tools/image-convert" element={<ImageConvertToolPage />} />
          <Route path="/tools/image-compress" element={<ImageCompressToolPage />} />
          <Route path="/tools/image-base64" element={<ImageBase64ToolPage />} />
          <Route path="/tools/color-picker" element={<ColorPickerToolPage />} />
          <Route path="/tools/http-status" element={<HttpStatusToolPage />} />
          <Route path="/tools/ip" element={<IpToolPage />} />
          <Route path="/tools/user-agent" element={<UserAgentToolPage />} />
          <Route path="/tools/signature" element={<SignatureToolPage />} />
          <Route path="/tools/calculator" element={<CalculatorToolPage />} />
          <Route path="/tools/whiteboard" element={<WhiteboardToolPage />} />
          <Route path="/tools/linux" element={<LinuxToolPage />} />
          <Route path="/tools/mime" element={<MimeToolPage />} />
          <Route path="/tools/http-header" element={<HttpHeaderToolPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/friends" element={<FriendsPage />} />
        </Routes>
      </main>
      {isDocs ? null : (
        <footer
          className="border-t border-black/5 py-8 text-sm text-slate-500 backdrop-blur dark:border-white/10 dark:text-slate-200"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--page-bg) 75%, transparent)",
          }}
        >
          <div className="mx-auto w-full max-w-6xl px-6">
            {/* 上段：版权信息 + 页脚链接 */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1.5">
                <p className="font-medium text-slate-700 dark:text-white">
                  {siteConfig.footer.copyright}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {siteConfig.footer.meta.join(" · ")}
                </p>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {siteConfig.footer.links.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            {/* 下段：备案信息居中 */}
            {(siteConfig.footer.icp || siteConfig.footer.gaba) && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-black/5 pt-5 text-xs text-slate-400 dark:border-white/5 dark:text-slate-500">
                {siteConfig.footer.icp && (
                  <a
                    href={siteConfig.footer.icp.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <img src="/footer/icp.png" alt="ICP" className="h-4 w-4 object-contain opacity-70" />
                    {siteConfig.footer.icp.number}
                  </a>
                )}
                {siteConfig.footer.icp && siteConfig.footer.gaba && (
                  <span className="hidden h-3 w-px bg-slate-300 dark:bg-slate-700 sm:block" />
                )}
                {siteConfig.footer.gaba && (
                  <a
                    href={siteConfig.footer.gaba.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <img src="/footer/gaba.png" alt="网安备案" className="h-4 w-4 object-contain opacity-70" />
                    {siteConfig.footer.gaba.number}
                  </a>
                )}
              </div>
            )}
          </div>
        </footer>
      )}
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
