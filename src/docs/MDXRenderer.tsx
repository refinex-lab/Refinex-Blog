import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import { DocHeader } from "./DocHeader";
import { mdxComponents } from "./mdxComponents";
import "./markdown.css";

type MDXContentComponent = ComponentType<{
  components?: unknown;
}>;

export const MDXRenderer = ({
  loader,
  meta,
}: {
  loader: () => Promise<unknown>;
  meta?: {
    title: string;
    description?: string;
    cover?: string;
    author?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}) => {
  const [Content, setContent] = useState<MDXContentComponent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const showHeader = Boolean(
    meta?.cover || meta?.author || meta?.createdAt || meta?.updatedAt
  );

  useEffect(() => {
    let cancelled = false;

    loader()
      .then((mod) => {
        if (cancelled) return;
        setError(null);
        setContent(() => mod as MDXContentComponent);
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "未知错误";
        setError(message);
        setContent(null);
      });

    return () => {
      cancelled = true;
    };
  }, [loader]);

  const content = error ? (
    <div className="py-10 text-sm text-red-700 dark:text-red-300">
      MDX 加载失败：{error}
    </div>
  ) : !Content ? (
    <div className="py-10 text-sm text-zinc-500 dark:text-zinc-400">加载中...</div>
  ) : (
    <Content components={mdxComponents} />
  );

  return (
    <article
      className={`docs-markdown w-full max-w-none pb-20 pt-10 ${
        showHeader ? "docs-with-hero" : ""
      }`}
    >
      {showHeader && meta ? <DocHeader {...meta} /> : null}
      {showHeader ? <div className="docs-content">{content}</div> : content}
    </article>
  );
};
