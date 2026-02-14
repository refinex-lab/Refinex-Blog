import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowUpRight,
  FiCheck,
  FiChevronDown,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { navigateConfig, type NavigateCategory } from "../../config/navigate";
import { Card } from "../../components/ui/Card";
import { IconFont } from "../../components/ui/IconFont";

const ALL_CATEGORY_ID = "all";

type SearchEngine = "site" | "google" | "bing";

const SEARCH_ENGINES: {
  id: SearchEngine;
  label: string;
  hint: string;
}[] = [
  { id: "site", label: "站内", hint: "搜索站点资源" },
  { id: "google", label: "Google", hint: "跳转 Google 搜索" },
  { id: "bing", label: "Bing", hint: "跳转 Bing 搜索" },
];

const truncate = (value: string, max: number) => {
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(0, max)).trimEnd()}…`;
};

const getHostname = (href: string) => {
  try {
    return new URL(href).hostname;
  } catch {
    return href;
  }
};

const hasIconFontSymbol = (iconFontId: string) => {
  if (typeof document === "undefined") return false;
  // iconfont Symbol mode injects <symbol id="icon-xxx" .../>
  return Boolean(document.getElementById(iconFontId));
};

const isImageSource = (value?: string) => {
  if (!value) return false;
  if (/^https?:\/\//i.test(value)) return true;
  if (value.startsWith("/") || value.startsWith("./") || value.startsWith("../")) {
    return true;
  }
  if (value.startsWith("data:")) return true;
  return value.includes(".");
};

const SiteIcon = ({
  title,
  iconSrc,
  iconFontId,
  iconFontClass,
  size = 48,
}: {
  title: string;
  iconSrc?: string;
  iconFontId?: string;
  iconFontClass?: string;
  size?: number;
}) => {
  const [failed, setFailed] = useState(false);
  const [hasSymbol, setHasSymbol] = useState(false);
  const fallback = title.trim().slice(0, 1).toUpperCase();
  const resolvedFontClass = iconFontClass ?? iconFontId;
  const resolvedIconSrc = isImageSource(iconSrc) ? iconSrc : undefined;
  const fallbackFontClass =
    !resolvedIconSrc && iconSrc && !iconFontClass ? iconSrc : undefined;
  const iconSize = Math.round(size * 0.66);
  const fontSize = Math.round(size * 0.58);

  useEffect(() => {
    if (!iconFontId) {
      return;
    }

    let cancelled = false;
    const check = () => {
      if (cancelled) return;
      setHasSymbol(hasIconFontSymbol(iconFontId));
    };

    check();
    const timer = window.setTimeout(check, 800);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [iconFontId]);

  return (
    <div
      className="flex items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white/80 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-slate-50"
      style={{ width: size, height: size }}
    >
      {resolvedIconSrc && !failed ? (
        <img
          src={resolvedIconSrc}
          alt=""
          aria-hidden="true"
          style={{ width: iconSize, height: iconSize }}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : iconFontId && hasSymbol ? (
        <IconFont
          id={iconFontId}
          className="text-slate-700 dark:text-slate-50"
          style={{ width: iconSize, height: iconSize }}
        />
      ) : resolvedFontClass || fallbackFontClass ? (
        <i
          aria-hidden="true"
          className={`iconfont ${resolvedFontClass ?? fallbackFontClass} text-slate-700 dark:text-slate-50`}
          style={{ fontSize }}
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  );
};

const CategoryButton = ({
  label,
  count,
  active,
  disabled,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
        disabled
          ? "cursor-not-allowed text-slate-300 dark:text-slate-600"
          : active
            ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-slate-50"
      }`}
    >
      <span className="truncate">{label}</span>
      <span
        className={`ml-3 inline-flex min-w-9 items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
          active
            ? "bg-white/70 text-slate-700 dark:bg-white/10 dark:text-slate-100"
            : "bg-black/5 text-slate-500 dark:bg-white/10 dark:text-slate-200/70"
        }`}
      >
        {count}
      </span>
    </button>
  );
};

export const NavigatePage = () => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORY_ID);
  const [engine, setEngine] = useState<SearchEngine>("site");
  const [engineOpen, setEngineOpen] = useState(false);
  const engineRef = useRef<HTMLDivElement | null>(null);

  const isSiteSearch = engine === "site";
  const normalizedQuery = isSiteSearch ? query.trim().toLowerCase() : "";
  const activeEngine = SEARCH_ENGINES.find((item) => item.id === engine);

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

  const categories = useMemo(() => {
    const allCategory: NavigateCategory = {
      id: ALL_CATEGORY_ID,
      label: "全部",
      description: "按分类浏览你常用的站点",
    };

    return [allCategory, ...navigateConfig.categories];
  }, []);

  const queryFilteredSites = useMemo(() => {
    if (!normalizedQuery) return navigateConfig.sites;

    return navigateConfig.sites.filter((site) => {
      const haystack = [
        site.title,
        site.description,
        getHostname(site.href),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  const categoryCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const site of queryFilteredSites) {
      map.set(site.categoryId, (map.get(site.categoryId) ?? 0) + 1);
    }
    map.set(ALL_CATEGORY_ID, queryFilteredSites.length);
    return map;
  }, [queryFilteredSites]);

  const visibleSites = useMemo(() => {
    const list =
      activeCategory === ALL_CATEGORY_ID
        ? queryFilteredSites
        : queryFilteredSites.filter((site) => site.categoryId === activeCategory);

    return [...list].sort((a, b) => {
      const pinnedDiff = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
      if (pinnedDiff !== 0) return pinnedDiff;
      return a.title.localeCompare(b.title);
    });
  }, [activeCategory, queryFilteredSites]);

  const handleSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    if (engine === "site") {
      setActiveCategory(ALL_CATEGORY_ID);
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

  const searchPlaceholder = isSiteSearch
    ? "搜索站点、描述、域名或标签…"
    : `在 ${activeEngine?.label ?? "搜索引擎"} 输入关键词`;

  const searchIconSrc =
    engine === "google"
      ? "/navigate-icons/google-search-icon.svg"
      : engine === "bing"
        ? "/navigate-icons/bing-search-icon.svg"
        : undefined;

  const pinnedSites = useMemo(
    () => navigateConfig.sites.filter((site) => site.pinned).slice(0, 6),
    []
  );

  return (
    <>
      <div className="mx-auto flex h-[calc(100vh-72px)] w-full max-w-[1200px] flex-col gap-4 overflow-hidden px-6 py-6 lg:py-8">
        <div className="p-0">
          <form
            className="flex flex-col gap-3"
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
                    <FiSearch className="h-4 w-4 text-slate-400 dark:text-slate-300" />
                  )}
                  <span>{activeEngine?.label ?? "站内"}</span>
                  <FiChevronDown className="h-3 w-3 opacity-60" />
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
                                  <FiSearch className="h-3.5 w-3.5 text-slate-400 dark:text-slate-300" />
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
                              <FiCheck className="h-3.5 w-3.5 text-slate-500 dark:text-slate-200" />
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
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-300" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label="搜索站点"
                  className="h-12 w-full rounded-none border border-transparent bg-transparent pl-9 pr-12 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-50 dark:placeholder:text-slate-300/70"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="清空搜索"
                    className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-black/5 hover:text-slate-700 dark:text-slate-200/70 dark:hover:bg-white/10 dark:hover:text-slate-50"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>

          </form>
        </div>

        <div className="grid h-full min-h-0 gap-6 lg:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="h-full">
          <Card className="flex h-full min-h-0 flex-col gap-4 overflow-hidden p-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                分类筛选
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-200/70">
                {isSiteSearch
                  ? "搜索会跨分类生效"
                  : "外部搜索不影响本页列表"}
              </p>
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const count = categoryCountMap.get(cat.id) ?? 0;
                const disabled = cat.id !== ALL_CATEGORY_ID && count === 0;
                return (
                  <CategoryButton
                    key={cat.id}
                    label={cat.label}
                    count={count}
                    active={activeCategory === cat.id}
                    disabled={disabled}
                    onClick={() => setActiveCategory(cat.id)}
                  />
                );
              })}
            </div>
            {pinnedSites.length ? (
              <div className="shrink-0 border-t border-black/5 pt-4 text-xs text-slate-500 dark:border-white/10 dark:text-slate-300">
                <p className="mb-2 font-semibold text-slate-700 dark:text-slate-200">
                  置顶站点
                </p>
                <div className="space-y-2">
                  {pinnedSites.map((site) => (
                    <a
                      key={site.id}
                      href={site.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/80 dark:hover:text-white"
                    >
                      <SiteIcon
                        title={site.title}
                        iconSrc={site.iconSrc}
                        iconFontId={site.iconFontId}
                        iconFontClass={site.iconFontClass}
                        size={32}
                      />
                      <span className="truncate text-xs font-semibold">
                        {site.title}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
        </Card>
      </aside>

        <section className="h-full space-y-4 overflow-y-auto pr-1">
          {activeCategory !== ALL_CATEGORY_ID ? (
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {categories.find((item) => item.id === activeCategory)?.label}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-200/70">
                {
                  categories.find((item) => item.id === activeCategory)
                    ?.description
                }
              </p>
            </div>
          ) : null}

          {visibleSites.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {visibleSites.map((site) => {
                const hostname = getHostname(site.href);
                const description = truncate(site.description, 56);
                return (
                  <a
                    key={site.id}
                    href={site.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative flex h-full flex-col justify-between rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-black/10 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-white/10 dark:bg-white/10 dark:hover:border-white/20 dark:hover:bg-white/15 dark:focus-visible:ring-white/20"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <SiteIcon
                            title={site.title}
                            iconSrc={site.iconSrc}
                            iconFontId={site.iconFontId}
                            iconFontClass={site.iconFontClass}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-semibold text-slate-900 dark:text-slate-50">
                              {site.title}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-200/70">
                              {hostname}
                            </p>
                          </div>
                        </div>

                      </div>

                      <p className="mt-3 line-clamp-2 text-[13px] leading-6 text-slate-600 dark:text-slate-100/80">
                        {description}
                      </p>
                    </div>
                    <span className="pointer-events-none absolute bottom-3 right-3 inline-flex translate-y-1 items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 dark:bg-white dark:text-slate-900">
                      前往
                      <FiArrowUpRight className="h-3 w-3" />
                    </span>
                  </a>
                );
              })}
            </div>
          ) : (
            <Card className="p-8">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                没有找到匹配的站点
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-200/70">
                试试更短的关键字，或切换到「全部」。
              </p>
              {query ? (
                <div className="mt-4">
                  <button
                    type="button"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                    onClick={() => {
                      setQuery("");
                      setActiveCategory(ALL_CATEGORY_ID);
                    }}
                  >
                    清空筛选
                  </button>
                </div>
              ) : null}
            </Card>
          )}
          </section>
        </div>
      </div>
    </>
  );
};
