import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  ChevronDown,
  Github,
  Library,
  Moon,
  MessageCircle,
  Rss,
  Sparkles,
  Sun,
  Twitter,
} from "lucide-react";
import { siteConfig } from "./config/site";
import { ThemeProvider } from "./providers/ThemeProvider";
import { useTheme } from "./providers/useTheme";
import { AboutPage } from "./pages/about/AboutPage";
import { AiHubPage } from "./pages/ai/AiHubPage";
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
          <Link
            to={siteConfig.logo.href}
            className="flex items-center gap-4"
            aria-label={`${siteConfig.title} 首页`}
          >
            <LogoMark />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                {siteConfig.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {siteConfig.subtitle}
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
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
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="font-medium text-slate-700 dark:text-white">
                {siteConfig.footer.copyright}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-300">
                {siteConfig.footer.meta.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {siteConfig.footer.links.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </div>
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
