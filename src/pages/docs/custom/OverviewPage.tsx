import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Clock, BookOpen, Layers, Search, TrendingUp, Calendar, Tag, ArrowRight } from "lucide-react";
import {
  docsNavTree,
  flattenDocsNavItems,
  contentDocs,
  contentDocBySlug,
} from "../../../docs/contentIndex";
import { getDocHref } from "../../../docs/utils";
import { searchDocsByQuery } from "../../../docs/search";
import type { DocsNavFolder } from "../../../docs/types";

const formatDate = (date?: string) => {
  if (!date) return undefined;
  try {
    return new Date(date).toLocaleDateString("zh-CN", {
      year: "numeric", month: "2-digit", day: "2-digit",
    });
  } catch { return undefined; }
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

function DocSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return searchDocsByQuery(q, 8).filter(
      (hit) => hit.id.startsWith("md:") || hit.id.startsWith("mdx:"),
    );
  }, [query]);

  const showResults = focused && query.trim().length > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults[0]) {
      navigate(searchResults[0].href);
      setQuery("");
      setFocused(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center rounded-xl border border-black/10 bg-white/80 shadow-sm backdrop-blur transition-colors focus-within:border-black/20 dark:border-slate-700/60 dark:bg-slate-900/70 dark:focus-within:border-slate-500/80">
          <Search className="ml-3.5 h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="搜索文章标题、描述或关键词…"
            aria-label="搜索文章"
            className="h-11 w-full bg-transparent pl-2.5 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-50"
          />
        </div>
      </form>

      {showResults && (
        <div className="absolute left-0 right-0 z-20 mt-2 max-h-[400px] overflow-y-auto rounded-xl border border-black/10 bg-white/95 p-2 shadow-xl backdrop-blur dark:border-slate-700/60 dark:bg-slate-900/95">
          {searchResults.length > 0 ? (
            <div className="space-y-0.5">
              {searchResults.map((hit) => (
                <button
                  key={hit.id}
                  type="button"
                  onClick={() => {
                    navigate(hit.href);
                    setQuery("");
                    setFocused(false);
                  }}
                  className="w-full rounded-lg px-3 py-2.5 text-left transition hover:bg-black/5 dark:hover:bg-slate-800/70"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {highlight(hit.title, query)}
                    </p>
                    {hit.section && (
                      <span className="shrink-0 rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-slate-800/90 dark:text-slate-400">
                        {hit.section}
                      </span>
                    )}
                  </div>
                  {hit.snippet && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                      {highlight(hit.snippet, query)}
                    </p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-6 text-center text-xs text-slate-400">
              没有找到匹配结果
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const OverviewPage = () => {
  const [activeTab, setActiveTab] = useState<"recent" | "categories">("recent");

  const topFolders = useMemo(
    () => docsNavTree.children.filter(
      (c): c is DocsNavFolder => c.type === "folder",
    ),
    [],
  );

  const stats = useMemo(() => {
    const totalDocs = contentDocs.length;
    const categoryCount = topFolders.length;
    const latestUpdate = contentDocs.reduce<string | undefined>((latest, doc) => {
      const d = doc.updatedAt ?? doc.createdAt;
      if (!d) return latest;
      if (!latest) return d;
      return d > latest ? d : latest;
    }, undefined);
    return { totalDocs, categoryCount, latestUpdate };
  }, [topFolders]);

  const recentDocs = useMemo(() => {
    return [...contentDocs]
      .filter((d) => d.updatedAt || d.createdAt)
      .sort((a, b) => {
        const da = a.updatedAt ?? a.createdAt ?? "";
        const db = b.updatedAt ?? b.createdAt ?? "";
        return db.localeCompare(da);
      })
      .slice(0, 12);
  }, []);

  const categoriesWithDocs = useMemo(() => {
    return topFolders.map((folder) => {
      const items = flattenDocsNavItems(folder);
      const docs = items
        .map((item) => {
          if (item.type === "doc" && "slug" in item) {
            return contentDocBySlug.get(item.slug);
          }
          return undefined;
        })
        .filter((d): d is NonNullable<typeof d> => !!d);

      const latestDoc = docs
        .filter((d) => d.updatedAt || d.createdAt)
        .sort((a, b) => {
          const da = a.updatedAt ?? a.createdAt ?? "";
          const db = b.updatedAt ?? b.createdAt ?? "";
          return db.localeCompare(da);
        })[0];

      return {
        folder,
        count: items.length,
        latestDoc,
      };
    });
  }, [topFolders]);

  return (
    <article className="w-full max-w-none space-y-8 pb-20 pt-10">
      {/* Header */}
      <header className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          Documentation
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          文档中心
        </h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
          浏览所有技术文档，快速找到你需要的内容。
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
            <BookOpen className="h-3.5 w-3.5" />
            {stats.totalDocs} 篇文章
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
            <Layers className="h-3.5 w-3.5" />
            {stats.categoryCount} 个分类
          </span>
          {stats.latestUpdate && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
              <Clock className="h-3.5 w-3.5" />
              最近更新 {formatDate(stats.latestUpdate)}
            </span>
          )}
        </div>
      </header>

      {/* Search */}
      <DocSearch />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab("recent")}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "recent"
              ? "text-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <TrendingUp className="mr-1.5 inline-block h-4 w-4" />
          近期更新
          {activeTab === "recent" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-color)]" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("categories")}
          className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "categories"
              ? "text-slate-900 dark:text-white"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Tag className="mr-1.5 inline-block h-4 w-4" />
          分类浏览
          {activeTab === "categories" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-color)]" />
          )}
        </button>
      </div>

      {/* Recent Updates */}
      {activeTab === "recent" && recentDocs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentDocs.map((doc) => {
            const category = doc.slug.split("/")[0] ?? "";
            const date = formatDate(doc.updatedAt) ?? formatDate(doc.createdAt);
            return (
              <Link
                key={doc.slug}
                to={getDocHref(doc.slug)}
                className="group relative flex flex-col gap-3 rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-black/10 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <Tag className="h-3 w-3" />
                    {category}
                  </span>
                  {date && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                      <Calendar className="h-3 w-3" />
                      {date}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-slate-950 dark:text-white dark:group-hover:text-white">
                    {doc.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {doc.description ?? "查看文章内容"}
                  </p>
                </div>
                <div className="pointer-events-none absolute bottom-3 right-3 inline-flex translate-y-1 items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 dark:bg-slate-800">
                  阅读
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Categories */}
      {activeTab === "categories" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {categoriesWithDocs.map(({ folder, count, latestDoc }) => {
            const firstItem = flattenDocsNavItems(folder)[0];
            const href = firstItem?.href ?? "#";
            const latestDate = latestDoc
              ? formatDate(latestDoc.updatedAt) ?? formatDate(latestDoc.createdAt)
              : undefined;

            return (
              <Link
                key={folder.id}
                to={href}
                className="group relative flex flex-col gap-4 rounded-2xl border border-black/5 bg-white/80 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-black/10 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-950 dark:text-white">
                      {folder.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {count} 篇文章
                    </p>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <BookOpen className="h-6 w-6" />
                  </div>
                </div>

                {latestDoc && (
                  <div className="rounded-lg border border-black/5 bg-slate-50/50 p-3 dark:border-white/10 dark:bg-white/5">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      最新文章
                    </p>
                    <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-900 dark:text-white">
                      {latestDoc.title}
                    </p>
                    {latestDate && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {latestDate}
                      </p>
                    )}
                  </div>
                )}

                <div className="pointer-events-none absolute bottom-4 right-4 inline-flex translate-y-1 items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 dark:bg-slate-800">
                  浏览
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </article>
  );
};
