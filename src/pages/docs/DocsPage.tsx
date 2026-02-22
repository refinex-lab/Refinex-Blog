import { useMemo, useRef } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { docsCustomPages } from "../../docs/customPages";
import { DocsSidebar } from "../../docs/DocsSidebar";
import { DocsToc } from "../../docs/DocsToc";
import { MarkdownRenderer } from "../../docs/MarkdownRenderer";
import { MDXRenderer } from "../../docs/MDXRenderer";
import {
  contentDocBySlug,
  docsNavTree,
  flattenDocsNavItems,
  mdxDocComponentLoaderBySlug,
} from "../../docs/contentIndex";

const decodeDocsSlug = (pathname: string) => {
  const rest = pathname.replace(/^\/docs\/?/, "");
  if (!rest) return "";
  return rest
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment))
    .join("/");
};

const allNavItems = flattenDocsNavItems(docsNavTree);

function DocsPrevNext({ slug }: { slug: string }) {
  const idx = allNavItems.findIndex(
    (item) => ("slug" in item && item.slug === slug) || item.id === slug,
  );
  if (idx < 0) return null;

  const prev = idx > 0 ? allNavItems[idx - 1] : null;
  const next = idx < allNavItems.length - 1 ? allNavItems[idx + 1] : null;

  if (!prev && !next) return null;

  return (
    <nav className="flex items-stretch gap-4 border-t border-black/5 pb-16 pt-8 dark:border-white/10">
      {prev ? (
        <Link
          to={prev.href}
          className="group flex flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
        >
          <ChevronLeft className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:-translate-x-0.5 dark:text-slate-500" />
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">上一篇</p>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-700 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white">
              {prev.title}
            </p>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          to={next.href}
          className="group flex flex-1 items-center justify-end gap-3 rounded-xl px-4 py-3 text-right transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
     >
          <div className="min-w-0">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">下一篇</p>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-700 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white">
              {next.title}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 dark:text-slate-500" />
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}

export const DocsPage = () => {
  const location = useLocation();
  const slug = useMemo(() => decodeDocsSlug(location.pathname), [location.pathname]);
  const contentRef = useRef<HTMLDivElement | null>(null);

  if (!slug) {
    return <Navigate to="/docs/overview" replace />;
  }

  const customPage = docsCustomPages.find((page) => page.slug === slug);
  const CustomPageComponent = customPage?.component;
  const contentDoc = contentDocBySlug.get(slug);
  const mdxLoader = mdxDocComponentLoaderBySlug.get(slug);

  const docKey = customPage
    ? `page:${slug}`
    : contentDoc
      ? `${contentDoc.format}:${slug}`
      : `404:${slug}`;

  const content = CustomPageComponent ? (
    <CustomPageComponent />
  ) : contentDoc ? (
    contentDoc.format === "mdx" ? (
      mdxLoader ? (
        <MDXRenderer key={slug} loader={mdxLoader} meta={contentDoc} />
      ) : (
        <div className="mx-auto w-full max-w-5xl pb-20 pt-10">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            MDX module missing
          </h1>
          <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            未找到该 MDX 文档模块：
            <code className="ml-2 rounded bg-black/5 px-2 py-1 dark:bg-white/10">
              {slug}
            </code>
          </p>
        </div>
      )
    ) : (
      <MarkdownRenderer markdown={contentDoc.body} meta={contentDoc} />
    )
  ) : (
    <div className="mx-auto w-full max-w-5xl pb-20 pt-10">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Not found
      </h1>
      <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
        未找到该文档：
        <code className="ml-2 rounded bg-black/5 px-2 py-1 dark:bg-white/10">
          {slug}
        </code>
      </p>
    </div>
  );

  const hideToc = customPage?.fullWidth === true;

  return (
    <div className="w-full">
      <div className={`grid min-h-[calc(100vh-72px)] grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] ${hideToc ? "" : "xl:grid-cols-[280px_minmax(0,1fr)_248px]"}`}>
        <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] border-r border-black/5 bg-white/55 backdrop-blur dark:border-white/10 dark:bg-black/20 md:block">
          <DocsSidebar tree={docsNavTree} />
        </aside>

        <div ref={contentRef} className="min-w-0 px-5 md:px-10 xl:px-12">
          {content}
          {!customPage && contentDoc && <DocsPrevNext slug={slug} />}
        </div>

        {!hideToc && (
          <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] bg-white/40 backdrop-blur dark:bg-black/10 xl:block">
            <DocsToc contentRef={contentRef} docKey={docKey} />
          </aside>
        )}
      </div>
    </div>
  );
};
