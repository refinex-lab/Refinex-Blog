import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronDown,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";
import { siteConfig } from "../../config/site";
import { contentDocs } from "../../docs/contentIndex";
import { getDocHref } from "../../docs/utils";
import { searchDocsByQuery } from "../../docs/search";

const SEARCH_ENGINES = [
  { id: "site", label: "站内", hint: "搜索站内文章" },
  { id: "google", label: "Google", hint: "跳转 Google 搜索" },
  { id: "bing", label: "Bing", hint: "跳转 Bing 搜索" },
] as const;

type SearchEngine = (typeof SEARCH_ENGINES)[number]["id"];

type RecentDoc = (typeof contentDocs)[number];

const toTimestamp = (value?: string) => {
  if (!value) return 0;
  const ts = Date.parse(value);
  return Number.isFinite(ts) ? ts : 0;
};

const formatDate = (value?: string) => {
  if (!value) return undefined;
  const ts = Date.parse(value);
  if (!Number.isFinite(ts)) return value;
  return new Date(ts).toISOString().slice(0, 10);
};

const highlight = (text: string, query: string) => {
  const q = query.trim();
  if (!q) return text;
  const lower = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const idx = lower.indexOf(lowerQ);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-[var(--accent-color)]/30 px-0.5 text-inherit">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
};

export const HomePage = () => {
  const navigate = useNavigate();
  const [engine, setEngine] = useState<SearchEngine>("site");
  const [engineOpen, setEngineOpen] = useState(false);
  const [query, setQuery] = useState("");
  const engineRef = useRef<HTMLDivElement | null>(null);

  const activeEngine = SEARCH_ENGINES.find((item) => item.id === engine);
  const searchIconSrc =
    engine === "google"
      ? "/navigate-icons/google-search-icon.svg"
      : engine === "bing"
        ? "/navigate-icons/bing-search-icon.svg"
        : undefined;

  useEffect(() => {
    if (!engineOpen) return;
    const handleClick = (event: MouseEvent) => {
      if (!engineRef.current) return;
      if (!engineRef.current.contains(event.target as Node)) {
        setEngineOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEngineOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [engineOpen]);

  const searchResults = useMemo(() => {
    if (engine !== "site") return [];
    const q = query.trim();
    if (!q) return [];
    return searchDocsByQuery(q, 6).filter(
      (hit) => hit.id.startsWith("md:") || hit.id.startsWith("mdx:")
    );
  }, [engine, query]);

  const recentDocs = useMemo<RecentDoc[]>(() => {
    return [...contentDocs]
      .map((doc) => ({
        doc,
        ts: toTimestamp(doc.updatedAt) || toTimestamp(doc.createdAt),
      }))
      .sort((a, b) => b.ts - a.ts)
      .slice(0, 10)
      .map((item) => item.doc);
  }, []);

  const categoryStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const doc of contentDocs) {
      const key = doc.slug.split("/")[0] ?? "";
      if (!key) continue;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, []);

  const totalDocs = contentDocs.length;
  const totalCategories = new Set(contentDocs.map((doc) => doc.slug.split("/")[0])).size;

  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    if (engine === "site") {
      if (searchResults[0]) {
        navigate(searchResults[0].href);
      } else {
        navigate("/docs");
      }
      return;
    }
    const baseUrl =
      engine === "google"
        ? "https://www.google.com/search?q="
        : "https://www.bing.com/search?q=";
    window.open(
      `${baseUrl}${encodeURIComponent(trimmed)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-6 py-10">
      <section className="relative overflow-visible rounded-[28px] border-black/5 bg-white/80 p-0 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="pointer-events-none absolute -left-10 top-[-120px] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.18),rgba(255,255,255,0))] blur-3xl" />
        <div className="pointer-events-none absolute right-[-80px] top-[20%] h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(34,197,94,0.16),rgba(255,255,255,0))] blur-3xl" />

        <div className="relative space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                <Sparkles className="h-3.5 w-3.5" />
                Home
              </div>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
                {siteConfig.home?.title ?? siteConfig.title}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                {siteConfig.home?.subtitle ?? siteConfig.subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {siteConfig.home?.primaryAction ? (
                  <Link
                    to={siteConfig.home.primaryAction.href}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                  >
                    {siteConfig.home.primaryAction.label}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                ) : null}
                {siteConfig.home?.secondaryAction ? (
                  <Link
                    to={siteConfig.home.secondaryAction.href}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-black/5 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
                  >
                    {siteConfig.home.secondaryAction.label}
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white/70 px-4 py-3 text-xs text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em]">Docs</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {totalDocs}
                </div>
              </div>
              <div className="h-8 w-px bg-black/10 dark:bg-white/10" />
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em]">Categories</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {totalCategories}
                </div>
              </div>
            </div>
          </div>

          <form
            className="relative"
            onSubmit={(event) => {
              event.preventDefault();
              handleSearch();
            }}
          >
            <div className="flex w-full items-center overflow-visible rounded-2xl border border-black/10 bg-white shadow-sm transition-colors focus-within:border-black/20 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-white/25">
              <div ref={engineRef} className="relative z-30">
                <button
                  type="button"
                  onClick={() => setEngineOpen((prev) => !prev)}
                  className="flex h-12 items-center gap-2 rounded-l-2xl px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-100/80 dark:text-slate-200 dark:hover:bg-white/10"
                  aria-haspopup="listbox"
                  aria-expanded={engineOpen}
                >
                  {searchIconSrc ? (
                    <img
                      src={searchIconSrc}
                      alt=""
                      aria-hidden="true"
                      className="h-4 w-4"
                    />
                  ) : (
                    <Search className="h-4 w-4 text-slate-400 dark:text-slate-300" />
                  )}
                  <span>{activeEngine?.label ?? "站内"}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
                {engineOpen ? (
                  <div
                    role="listbox"
                    className="absolute left-0 z-50 mt-2 w-52 rounded-2xl border border-black/10 bg-white p-2 text-xs shadow-2xl dark:border-white/10 dark:bg-slate-950"
                  >
                    <div className="space-y-1">
                      {SEARCH_ENGINES.map((item) => {
                        const active = item.id === engine;
                        const itemIconSrc =
                          item.id === "google"
                            ? "/navigate-icons/google-search-icon.svg"
                            : item.id === "bing"
                              ? "/navigate-icons/bing-search-icon.svg"
                              : undefined;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setEngine(item.id);
                              setEngineOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                              active
                                ? "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white"
                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-black/5 dark:bg-white/10">
                                {itemIconSrc ? (
                                  <img
                                    src={itemIconSrc}
                                    alt=""
                                    aria-hidden="true"
                                    className="h-3.5 w-3.5"
                                  />
                                ) : (
                                  <Search className="h-3.5 w-3.5 text-slate-400 dark:text-slate-300" />
                                )}
                              </span>
                              <div className="space-y-0.5">
                                <div className="font-semibold">{item.label}</div>
                                <div className="text-[11px] text-slate-400 dark:text-slate-400">
                                  {item.hint}
                                </div>
                              </div>
                            </div>
                            {active ? (
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-200">
                                当前
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="h-8 w-px bg-black/10 dark:bg-white/10" />

              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-300" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={
                    siteConfig.home?.searchPlaceholder ?? "搜索文章标题、描述或关键词…"
                  }
                  aria-label="搜索文章"
                  className="h-12 w-full rounded-none border border-transparent bg-transparent pl-9 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-50 dark:placeholder:text-slate-300/70"
                />
              </div>
            </div>

            {engine === "site" && query.trim() ? (
              <div className="absolute left-0 right-0 mt-3 rounded-2xl border border-black/10 bg-white p-3 text-sm shadow-2xl dark:border-white/10 dark:bg-slate-950">
                {searchResults.length ? (
                  <div className="space-y-1">
                    {searchResults.map((hit) => (
                      <button
                        key={hit.id}
                        type="button"
                        onClick={() => navigate(hit.href)}
                        className="w-full rounded-xl px-3 py-2 text-left transition hover:bg-black/5 dark:hover:bg-white/10"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {highlight(hit.title, query)}
                          </p>
                          {hit.section ? (
                            <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-slate-600 dark:bg-white/10 dark:text-slate-300">
                              {hit.section}
                            </span>
                          ) : null}
                        </div>
                        {hit.snippet ? (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                            {highlight(hit.snippet, query)}
                          </p>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    没有找到匹配结果
                  </div>
                )}
              </div>
            ) : null}
          </form>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              近期更新
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              最近更新或新增的文章
            </p>
          </div>
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
          >
            更多
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentDocs.map((doc) => {
            const category = doc.slug.split("/")[0] ?? "";
            const primaryDate = formatDate(doc.updatedAt) ?? formatDate(doc.createdAt);
            return (
              <Link
                key={doc.slug}
                to={getDocHref(doc.slug)}
                className="group rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-black/10 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="rounded-full bg-black/5 px-2 py-0.5 dark:bg-white/10">
                    {category}
                  </span>
                  {primaryDate ? <span>{primaryDate}</span> : null}
                </div>
                <p className="mt-3 line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
                  {doc.title}
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-300">
                  {doc.description ?? "查看文章内容"}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-black/5 bg-white/80 p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <FileText className="h-4 w-4" />
            热门主题
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">
            快速浏览内容目录中的高频主题
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {categoryStats.map(([name, count]) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 rounded-full border border-black/5 bg-white px-3 py-1 text-xs text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
              >
                {name}
                <span className="text-[10px] text-slate-400 dark:text-slate-400">
                  {count}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-slate-900 p-6 text-white shadow-sm">
          <div className="text-sm font-semibold">快速入口</div>
          <p className="mt-2 text-xs text-white/70">
            继续阅读、探索导航或了解站点信息。
          </p>
          <div className="mt-4 grid gap-3">
            <Link
              to="/docs"
              className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/20"
            >
              文档中心
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/navigate"
              className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/20"
            >
              站点导航
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/about"
              className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/20"
            >
              关于本站
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
