import { useEffect, useId, useState } from "react";
import { Check, Code2, Copy, Eye, Maximize2 } from "lucide-react";
import { useTheme } from "../providers/useTheme";
import { InteractivePreviewDialog } from "./InteractivePreviewDialog";

let mermaidInitialized = false;

const baseMermaidConfig = {
  startOnLoad: false,
  securityLevel: "loose" as const,
  // Prevent Mermaid from forcing `max-width: 100%` which makes diagrams look tiny
  // in a shrink-to-fit container. We'll handle overflow with horizontal scroll.
  flowchart: { useMaxWidth: false },
  sequence: { useMaxWidth: false },
  gantt: { useMaxWidth: false },
  class: { useMaxWidth: false },
  state: { useMaxWidth: false },
  er: { useMaxWidth: false },
  journey: { useMaxWidth: false },
  mindmap: { useMaxWidth: false },
  timeline: { useMaxWidth: false },
  gitGraph: { useMaxWidth: false },
};

export const MermaidBlock = ({ chart }: { chart: string }) => {
  const { resolvedTheme } = useTheme();
  const [mode, setMode] = useState<"preview" | "source">("preview");
  const [copied, setCopied] = useState(false);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const renderId = useId().replaceAll(":", "");

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        if (!mermaidInitialized) {
          mermaid.initialize({
            ...baseMermaidConfig,
            theme: resolvedTheme === "dark" ? "dark" : "default",
            fontFamily:
              "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
          });
          mermaidInitialized = true;
        } else {
          mermaid.initialize({
            ...baseMermaidConfig,
            theme: resolvedTheme === "dark" ? "dark" : "default",
          });
        }

        const uniqueId = `mermaid-${renderId}-${Date.now()}`;
        const { svg: nextSvg } = await mermaid.render(uniqueId, chart);

        if (cancelled) return;
        setSvg(nextSvg);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "未知错误";
        setError(`Mermaid 渲染失败：${message}`);
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [chart, renderId, resolvedTheme]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chart);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const isSource = mode === "source";

  return (
    <div className="docs-mermaid overflow-hidden rounded-2xl border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-3 border-b border-black/5 px-4 py-2 text-[12px] text-zinc-500 dark:border-white/10 dark:text-zinc-400">
        <span className="font-medium tracking-wide">mermaid</span>

        <div className="flex items-center gap-1">
          <InteractivePreviewDialog
            label="Mermaid"
            trigger={
              <button
                type="button"
                disabled={!svg || !!error}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-50"
                aria-label="放大预览 Mermaid"
                title="放大"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            }
          >
            {error ? (
              <div className="p-4 text-sm text-red-100">{error}</div>
            ) : !svg ? (
              <div className="p-4 text-sm text-white/70">Mermaid 渲染中...</div>
            ) : (
              <div className="p-4">
                <div className="min-w-full">
                  <div dangerouslySetInnerHTML={{ __html: svg }} />
                </div>
              </div>
            )}
          </InteractivePreviewDialog>

          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              !isSource
                ? "bg-black/5 text-zinc-900 dark:bg-white/10 dark:text-zinc-100"
                : "text-zinc-500 hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-50"
            }`}
            aria-label="预览 Mermaid"
            title="预览"
          >
            <Eye className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setMode("source")}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              isSource
                ? "bg-black/5 text-zinc-900 dark:bg-white/10 dark:text-zinc-100"
                : "text-zinc-500 hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-50"
            }`}
            aria-label="查看 Mermaid 源码"
            title="源码"
          >
            <Code2 className="h-4 w-4" />
          </button>

          {isSource ? (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-50"
              aria-label="复制 Mermaid 源码"
              title={copied ? "Copied" : "Copy"}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          ) : null}
        </div>
      </div>

      {isSource ? (
        <pre className="m-0 overflow-x-auto px-4 py-4 text-[13px] leading-6 text-zinc-900 dark:text-zinc-100">
          <code>{chart}</code>
        </pre>
      ) : error ? (
        <div className="p-4 text-sm text-red-700 dark:text-red-300">{error}</div>
      ) : !svg ? (
        <div className="p-4 text-sm text-zinc-500 dark:text-zinc-400">Mermaid 渲染中...</div>
      ) : (
        <div className="overflow-x-auto p-4 text-center">
          <div
            className="inline-block text-left"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      )}
    </div>
  );
};
