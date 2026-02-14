import { useEffect, useMemo, useState } from "react";
import { FiArrowUpRight, FiSearch, FiX } from "react-icons/fi";
import { navigateConfig, type NavigateCategory } from "../../config/navigate";
import { Card } from "../../components/ui/Card";
import { IconFont } from "../../components/ui/IconFont";

const ALL_CATEGORY_ID = "all";

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

const SiteIcon = ({
  title,
  iconSrc,
  iconFontId,
}: {
  title: string;
  iconSrc?: string;
  iconFontId?: string;
}) => {
  const [failed, setFailed] = useState(false);
  const [hasSymbol, setHasSymbol] = useState(false);
  const fallback = title.trim().slice(0, 1).toUpperCase();

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
    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white/80 text-sm font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-50">
      {iconSrc && !failed ? (
        <img
          src={iconSrc}
          alt=""
          aria-hidden="true"
          className="h-8 w-8"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : iconFontId && hasSymbol ? (
        <IconFont
          id={iconFontId}
          className="h-8 w-8 text-slate-700 dark:text-slate-50"
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
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${
        disabled
          ? "cursor-not-allowed text-slate-300 dark:text-slate-600"
          : active
            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-slate-50"
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

  const normalizedQuery = query.trim().toLowerCase();

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

  const resultLabel = `${visibleSites.length} / ${navigateConfig.sites.length}`;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-300" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索站点、描述、域名或标签…"
            aria-label="搜索站点"
            className="h-12 w-full rounded-2xl border border-black/10 bg-white/80 pl-11 pr-10 text-sm text-slate-900 shadow-sm backdrop-blur transition-colors placeholder:text-slate-400 focus:border-black/20 focus:outline-none dark:border-white/10 dark:bg-white/10 dark:text-slate-50 dark:placeholder:text-slate-300/70 dark:focus:border-white/25"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="清空搜索"
              className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-black/5 hover:text-slate-700 dark:text-slate-200/70 dark:hover:bg-white/10 dark:hover:text-slate-50"
            >
              <FiX className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-200/70">
          {resultLabel}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-full">
          <Card className="flex h-full flex-col p-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                分类
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-200/70">
                点击切换分类；搜索会跨分类生效。
              </p>
            </div>
            <div className="mt-3 flex-1 space-y-1 overflow-auto pr-1">
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
          </Card>
        </aside>

        <section className="space-y-4">
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
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleSites.map((site) => {
                const hostname = getHostname(site.href);
                const description = truncate(site.description, 56);
                return (
                  <a
                    key={site.id}
                    href={site.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col justify-between rounded-2xl border border-black/5 bg-white/80 p-5 shadow-sm backdrop-blur transition-colors hover:border-black/10 hover:bg-white/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-white/10 dark:bg-white/10 dark:hover:border-white/20 dark:hover:bg-white/15 dark:focus-visible:ring-white/20"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <SiteIcon
                            title={site.title}
                            iconSrc={site.iconSrc}
                            iconFontId={site.iconFontId}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                              {site.title}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-200/70">
                              {hostname}
                            </p>
                          </div>
                        </div>

                        <span className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition group-hover:bg-black/5 group-hover:text-slate-700 dark:text-slate-300/70 dark:group-hover:bg-white/10 dark:group-hover:text-slate-50">
                          <FiArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-100/80">
                        {description}
                      </p>
                    </div>
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
  );
};
