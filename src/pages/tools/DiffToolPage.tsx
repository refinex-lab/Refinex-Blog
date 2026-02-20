import { useEffect, useMemo, useRef, useState } from "react";
import { DiffEditor } from "@monaco-editor/react";
import * as DiffMatchPatch from "diff-match-patch";
import { ArrowLeftRight, Copy, Download, FileUp, GitCompare } from "lucide-react";

const CONTENT_MODES = [
  { id: "text", label: "文本 Diff", language: "markdown" },
  { id: "json", label: "JSON Diff", language: "json" },
] as const;

const VIEW_MODES = [
  { id: "split", label: "Split View" },
  { id: "inline", label: "Inline View" },
] as const;

type ContentMode = (typeof CONTENT_MODES)[number]["id"];
type ViewMode = (typeof VIEW_MODES)[number]["id"];

const DEFAULT_LEFT = `{
  "name": "Refinex Blog",
  "version": 1,
  "owner": {
    "name": "Refinex",
    "active": true
  },
  "tools": [
    {
      "id": "json",
      "title": "JSON 格式化",
      "enabled": true
    }
  ]
}`;

const DEFAULT_RIGHT = `{
  "name": "Refinex Blog",
  "version": 2,
  "owner": {
    "name": "Refinex",
    "active": false,
    "team": "Refinex Lab"
  },
  "tools": [
    {
      "id": "json",
      "title": "JSON 格式化",
      "enabled": true
    },
    {
      "id": "diff",
      "title": "文本差异对比",
      "enabled": true
    }
  ]
}`;

const editorOptions = {
  fontSize: 13,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: "on" as const,
  folding: true,
  showFoldingControls: "always" as const,
  renderWhitespace: "selection" as const,
  formatOnPaste: true,
  formatOnType: true,
  smoothScrolling: true,
  automaticLayout: true,
  scrollbar: {
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
    verticalHasArrows: false,
    horizontalHasArrows: false,
    useShadows: false,
  },
};

const sortJsonKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => sortJsonKeys(item));
  }
  if (value && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        sorted[key] = sortJsonKeys((value as Record<string, unknown>)[key]);
      });
    return sorted;
  }
  return value;
};

const stringifySorted = (value: unknown) => {
  return JSON.stringify(sortJsonKeys(value), null, 2);
};

const downloadText = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const DiffToolPage = () => {
  const [contentMode, setContentMode] = useState<ContentMode>("json");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [leftValue, setLeftValue] = useState(DEFAULT_LEFT);
  const [rightValue, setRightValue] = useState(DEFAULT_RIGHT);
  const [leftFile, setLeftFile] = useState<string | null>(null);
  const [rightFile, setRightFile] = useState<string | null>(null);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [monacoTheme, setMonacoTheme] = useState<"vs" | "vs-dark">(() => {
    if (typeof document === "undefined") return "vs-dark";
    return document.documentElement.classList.contains("dark") ? "vs-dark" : "vs";
  });

  const leftInputRef = useRef<HTMLInputElement | null>(null);
  const rightInputRef = useRef<HTMLInputElement | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const target = document.documentElement;
    const updateTheme = () => {
      setMonacoTheme(target.classList.contains("dark") ? "vs-dark" : "vs");
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(target, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  const flashNotice = (message: string) => {
    setNotice(message);
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
    }, 1600);
  };

  const applyIgnoreCase = (value: string) =>
    ignoreCase ? value.toLowerCase() : value;

  const diffPayload = useMemo(() => {
    if (contentMode !== "json") {
      return {
        left: applyIgnoreCase(leftValue),
        right: applyIgnoreCase(rightValue),
        error: null as string | null,
      };
    }

    const parseOne = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return { value: "", error: null as string | null };
      try {
        const parsed = JSON.parse(trimmed);
        return {
          value: stringifySorted(parsed),
          error: null as string | null,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "JSON 解析失败";
        return { value, error: message };
      }
    };

    const leftParsed = parseOne(leftValue);
    const rightParsed = parseOne(rightValue);
    const error = leftParsed.error || rightParsed.error;

    return {
      left: applyIgnoreCase(leftParsed.value),
      right: applyIgnoreCase(rightParsed.value),
      error,
    };
  }, [contentMode, leftValue, rightValue, ignoreCase]);

  const diffText = useMemo(() => {
    const ctor =
      (DiffMatchPatch as unknown as { default?: new () => any }).default ??
      (DiffMatchPatch as unknown as { diff_match_patch?: new () => any })
        .diff_match_patch ??
      (DiffMatchPatch as unknown as new () => any);
    const dmp = new ctor();
    const normalize = (value: string) => {
      if (!ignoreWhitespace) return value;
      return value.replace(/\s+/g, " ").trim();
    };
    const left = normalize(diffPayload.left);
    const right = normalize(diffPayload.right);
    const diffs = dmp.diff_main(left, right);
    dmp.diff_cleanupSemantic(diffs);
    const patches = dmp.patch_make(left, diffs);
    return dmp.patch_toText(patches);
  }, [diffPayload.left, diffPayload.right, ignoreWhitespace]);

  const handleCopyDiff = async () => {
    if (!diffText.trim()) return;
    try {
      await navigator.clipboard.writeText(diffText);
      flashNotice("已复制 diff");
    } catch {
      flashNotice("复制失败");
    }
  };

  const handleDownloadDiff = () => {
    if (!diffText.trim()) return;
    downloadText(diffText, "diff.patch");
    flashNotice("已下载 diff");
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    side: "left" | "right"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    if (side === "left") {
      setLeftValue(text);
      setLeftFile(file.name);
    } else {
      setRightValue(text);
      setRightFile(file.name);
    }
    event.target.value = "";
  };

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-3 rounded-[20px] border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <GitCompare className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-slate-900 dark:text-white">
                文本差异对比（Diff Viewer）
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                支持文本/JSON diff、文件对比与 Split/Inline 视图
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="inline-flex flex-wrap gap-1 rounded-xl border border-black/10 bg-white/70 p-1 text-xs dark:border-white/10 dark:bg-zinc-950/40">
              {CONTENT_MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setContentMode(item.id)}
                  className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-semibold transition ${
                    contentMode === item.id
                      ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-950 dark:text-white"
                      : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="inline-flex flex-wrap gap-1 rounded-xl border border-black/10 bg-white/70 p-1 text-xs dark:border-white/10 dark:bg-zinc-950/40">
              {VIEW_MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setViewMode(item.id)}
                  className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-semibold transition ${
                    viewMode === item.id
                      ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-950 dark:text-white"
                      : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
          <button
            type="button"
            onClick={() => leftInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
          >
            <FileUp className="h-3.5 w-3.5" />
            左侧导入文件
          </button>
          <button
            type="button"
            onClick={() => rightInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
          >
            <FileUp className="h-3.5 w-3.5" />
            右侧导入文件
          </button>
          <button
            type="button"
            onClick={() => {
              setLeftValue(rightValue);
              setRightValue(leftValue);
              const leftName = leftFile;
              setLeftFile(rightFile);
              setRightFile(leftName);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            交换左右
          </button>
          {leftFile ? (
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/10">
              左侧：{leftFile}
            </span>
          ) : null}
          {rightFile ? (
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/10">
              右侧：{rightFile}
            </span>
          ) : null}
          {diffPayload.error ? (
            <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-red-600 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200">
              {diffPayload.error}
            </span>
          ) : null}
          <label className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(event) => setIgnoreWhitespace(event.target.checked)}
              className="h-3.5 w-3.5"
            />
            忽略空白
          </label>
          <label className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(event) => setIgnoreCase(event.target.checked)}
              className="h-3.5 w-3.5"
            />
            忽略大小写
          </label>
          <button
            type="button"
            onClick={handleCopyDiff}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
          >
            <Copy className="h-3.5 w-3.5" />
            复制 diff
          </button>
          <button
            type="button"
            onClick={handleDownloadDiff}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
          >
            <Download className="h-3.5 w-3.5" />
            下载 diff
          </button>
          {ignoreCase ? (
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
              已统一小写用于对比
            </span>
          ) : null}
          {notice ? (
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
              {notice}
            </span>
          ) : null}
          <input
            ref={leftInputRef}
            type="file"
            accept=".json,.txt,.md,.yaml,.yml,.xml"
            className="hidden"
            onChange={(event) => handleFileChange(event, "left")}
          />
          <input
            ref={rightInputRef}
            type="file"
            accept=".json,.txt,.md,.yaml,.yml,.xml"
            className="hidden"
            onChange={(event) => handleFileChange(event, "right")}
          />
        </div>
      </section>

      <section className="flex min-h-0 flex-1 rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
        <div className="min-h-0 flex-1 overflow-hidden">
          <DiffEditor
            original={diffPayload.left}
            modified={diffPayload.right}
            language={
              CONTENT_MODES.find((item) => item.id === contentMode)?.language ??
              "markdown"
            }
            theme={monacoTheme}
            options={{
              ...editorOptions,
              renderSideBySide: viewMode === "split",
              originalEditable: true,
              diffWordWrap: "on",
              ignoreTrimWhitespace: ignoreWhitespace,
            }}
            height="100%"
            className="diff-tool-editor"
            onMount={(editor) => {
              const original = editor.getOriginalEditor();
              const modified = editor.getModifiedEditor();

              original.onDidChangeModelContent(() => {
                setLeftValue(original.getValue());
              });
              modified.onDidChangeModelContent(() => {
                setRightValue(modified.getValue());
              });
            }}
          />
        </div>
      </section>
    </div>
  );
};
