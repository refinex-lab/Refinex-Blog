import { useEffect, useMemo, useRef, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import { Braces, Copy, Sparkles } from "lucide-react";

const COMMON_PATTERNS = [
  {
    id: "email",
    label: "邮箱",
    pattern: "^[\\w.-]+@[\\w.-]+\\.[A-Za-z]{2,}$",
    flags: "i",
    sample: "hello@refinex.com\nteam@refinex.io",
  },
  {
    id: "phone",
    label: "手机号",
    pattern: "^(?:\\+?86)?1\\d{10}$",
    flags: "",
    sample: "13800138000\n+8615000000000",
  },
  {
    id: "url",
    label: "URL",
    pattern: "https?:\\/\\/[\\w.-]+(?:\\/[^\\s]*)?",
    flags: "i",
    sample: "https://refinex.com\nhttp://example.org/docs",
  },
  {
    id: "ip",
    label: "IPv4",
    pattern:
      "^(?:(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)$",
    flags: "",
    sample: "192.168.1.1\n8.8.8.8",
  },
  {
    id: "date",
    label: "日期 YYYY-MM-DD",
    pattern: "\\b\\d{4}-\\d{2}-\\d{2}\\b",
    flags: "",
    sample: "2025-01-01\n2026-02-14",
  },
  {
    id: "uuid",
    label: "UUID",
    pattern:
      "\\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\b",
    flags: "i",
    sample: "550e8400-e29b-41d4-a716-446655440000",
  },
];

const BUILDER_TYPES = [
  { id: "digits", label: "数字", token: "\\d" },
  { id: "letters", label: "字母", token: "[A-Za-z]" },
  { id: "alnum", label: "字母/数字", token: "[A-Za-z0-9]" },
  { id: "word", label: "单词字符", token: "\\w" },
  { id: "hex", label: "十六进制", token: "[0-9a-fA-F]" },
  { id: "any", label: "任意字符", token: "." },
];

type BuilderType = (typeof BUILDER_TYPES)[number]["id"];

type FlagSet = {
  g: boolean;
  i: boolean;
  m: boolean;
  s: boolean;
  u: boolean;
};

type MatchResult = {
  index: number;
  match: string;
  groups: string[];
  namedGroups: Record<string, string>;
};

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

const DEFAULT_TEXT = `Hello Refinex\nrefinex@example.com\n2026-02-14\nUUID: 550e8400-e29b-41d4-a716-446655440000`;

const flagsToString = (flags: FlagSet) =>
  Object.entries(flags)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key)
    .join("");

const parseFlags = (value: string): FlagSet => ({
  g: value.includes("g"),
  i: value.includes("i"),
  m: value.includes("m"),
  s: value.includes("s"),
  u: value.includes("u"),
});

export const RegexToolPage = () => {
  const [pattern, setPattern] = useState("\\b\\w+\\b");
  const [flags, setFlags] = useState<FlagSet>({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
  });
  const [text, setText] = useState(DEFAULT_TEXT);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  const [builderType, setBuilderType] = useState<BuilderType>("digits");
  const [minLen, setMinLen] = useState(1);
  const [maxLen, setMaxLen] = useState(10);
  const [useAnchors, setUseAnchors] = useState(false);

  const editorRef = useRef<import("monaco-editor").editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import("monaco-editor") | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const [monacoTheme, setMonacoTheme] = useState<"vs" | "vs-dark">(() => {
    if (typeof document === "undefined") return "vs-dark";
    return document.documentElement.classList.contains("dark") ? "vs-dark" : "vs";
  });

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

  const flagString = useMemo(() => flagsToString(flags), [flags]);

  const matches = useMemo<MatchResult[]>(() => {
    if (!pattern) {
      setError(null);
      return [];
    }
    try {
      const effectiveFlags = flagString.includes("g") ? flagString : `${flagString}g`;
      const regex = new RegExp(pattern, effectiveFlags);
      const results: MatchResult[] = [];
      let match: RegExpExecArray | null;
      let guard = 0;
      while ((match = regex.exec(text)) !== null) {
        if (guard > 500) break;
        const groups = match.slice(1);
        results.push({
          index: match.index,
          match: match[0],
          groups,
          namedGroups: (match.groups ?? {}) as Record<string, string>,
        });
        if (match[0] === "") {
          regex.lastIndex += 1;
        }
        guard += 1;
      }
      setError(null);
      return results;
    } catch (err) {
      const message = err instanceof Error ? err.message : "正则解析失败";
      setError(message);
      return [];
    }
  }, [pattern, flagString, text]);

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const model = editor.getModel();
    if (!model) return;

    if (error || matches.length === 0) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      return;
    }

    const newDecorations = matches
      .filter((item) => item.match.length > 0)
      .slice(0, 200)
      .map((item) => {
        const start = model.getPositionAt(item.index);
        const end = model.getPositionAt(item.index + item.match.length);
        return {
          range: new monaco.Range(
            start.lineNumber,
            start.column,
            end.lineNumber,
            end.column
          ),
          options: {
            inlineClassName: "regex-match-inline",
            className: "regex-match",
          },
        };
      });

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
  }, [matches, error, monacoTheme]);

  const handleCopyMatches = async () => {
    if (matches.length === 0) return;
    try {
      const payload = matches.map((item) => item.match).join("\n");
      await navigator.clipboard.writeText(payload);
      flashNotice("已复制匹配结果");
    } catch {
      flashNotice("复制失败");
    }
  };

  const handleApplyCommon = (id: string) => {
    const preset = COMMON_PATTERNS.find((item) => item.id === id);
    if (!preset) return;
    setPattern(preset.pattern);
    setFlags(parseFlags(preset.flags));
    if (preset.sample) {
      setText(preset.sample);
    }
  };

  const generatedPattern = useMemo(() => {
    const token = BUILDER_TYPES.find((item) => item.id === builderType)?.token ??
      "\\d";
    const min = Math.max(0, Math.floor(minLen));
    const max = Math.max(min, Math.floor(maxLen));
    const quantifier = max === min ? `{${min}}` : `{${min},${max}}`;
    const body = `${token}${quantifier}`;
    return `${useAnchors ? "^" : ""}${body}${useAnchors ? "$" : ""}`;
  }, [builderType, minLen, maxLen, useAnchors]);

  const applyGeneratedPattern = () => {
    setPattern(generatedPattern);
    flashNotice("已应用生成的正则");
  };

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-3 rounded-[20px] border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <Braces className="h-5 w-5" />
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white">
              正则表达式测试器
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
              /{pattern}/{flagString || "-"}
            </div>
            <button
              type="button"
              onClick={handleCopyMatches}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Copy className="h-3.5 w-3.5" />
              复制匹配
            </button>
            {notice ? (
              <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                {notice}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-300">
              正则表达式
            </label>
            <input
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
              className="h-11 w-full rounded-2xl border border-black/10 bg-white/80 px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
            />
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200">
                {error}
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-300">
              Flags
            </label>
            <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-200">
              {(
                [
                  { id: "g", label: "g 全局" },
                  { id: "i", label: "i 忽略大小写" },
                  { id: "m", label: "m 多行" },
                  { id: "s", label: "s 任意字符" },
                  { id: "u", label: "u Unicode" },
                ] as const
              ).map((item) => (
                <label
                  key={item.id}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold dark:border-white/10 dark:bg-white/10"
                >
                  <input
                    type="checkbox"
                    checked={flags[item.id]}
                    onChange={(event) =>
                      setFlags((prev) => ({
                        ...prev,
                        [item.id]: event.target.checked,
                      }))
                    }
                    className="h-3.5 w-3.5"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-300">
            常用正则
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_PATTERNS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleApplyCommon(item.id)}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-300">
            正则生成器
          </label>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-200">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/10">
              类型
              <select
                value={builderType}
                onChange={(event) => setBuilderType(event.target.value as BuilderType)}
                className="h-7 rounded-md border border-transparent bg-transparent px-2 text-xs text-slate-700 outline-none dark:text-slate-200"
              >
                {BUILDER_TYPES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/10">
              长度
              <input
                type="number"
                value={minLen}
                onChange={(event) => setMinLen(Number(event.target.value))}
                className="h-7 w-14 rounded-md border border-transparent bg-transparent px-2 text-xs text-slate-700 outline-none dark:text-slate-200"
              />
              ~
              <input
                type="number"
                value={maxLen}
                onChange={(event) => setMaxLen(Number(event.target.value))}
                className="h-7 w-14 rounded-md border border-transparent bg-transparent px-2 text-xs text-slate-700 outline-none dark:text-slate-200"
              />
            </div>
            <label className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold dark:border-white/10 dark:bg-white/10">
              <input
                type="checkbox"
                checked={useAnchors}
                onChange={(event) => setUseAnchors(event.target.checked)}
                className="h-3.5 w-3.5"
              />
              ^$
            </label>
            <button
              type="button"
              onClick={applyGeneratedPattern}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
            >
              <Sparkles className="h-3.5 w-3.5" />
              应用生成
            </button>
            <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
              {generatedPattern}
            </span>
          </div>
        </div>
      </section>

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex min-h-0 flex-col rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-300">
            <span>测试文本</span>
            <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10">Monaco</span>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <MonacoEditor
              value={text}
              onChange={(value) => setText(value ?? "")}
              height="100%"
              language="markdown"
              theme={monacoTheme}
              options={editorOptions}
              className="regex-tool-editor"
              onMount={(editor, monaco) => {
                editorRef.current = editor;
                monacoRef.current = monaco;
              }}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-300">
            <span>匹配结果</span>
            <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10">
              {matches.length} 条
            </span>
          </div>
          <div className="tool-scrollbar min-h-0 flex-1 overflow-auto p-4">
            {matches.length === 0 ? (
              <div className="text-sm text-slate-500 dark:text-slate-300">
                暂无匹配结果
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((item, index) => (
                  <div
                    key={`${item.index}-${index}`}
                    className="rounded-xl border border-black/5 bg-white/80 p-3 text-xs text-slate-600 shadow-sm dark:border-white/10 dark:bg-slate-950/50 dark:text-slate-200"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-300">
                      <span>#{index + 1}</span>
                      <span>index: {item.index}</span>
                    </div>
                    <div className="mt-2 rounded-lg bg-black/5 px-2 py-1 text-sm font-semibold text-slate-800 dark:bg-white/10 dark:text-white">
                      {item.match || "(空匹配)"}
                    </div>
                    {item.groups.length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {item.groups.map((group, groupIndex) => (
                          <div key={`${index}-${groupIndex}`} className="flex items-center gap-2">
                            <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] dark:bg-white/10">
                              Group {groupIndex + 1}
                            </span>
                            <span className="text-xs text-slate-600 dark:text-slate-200">
                              {group || "(空)"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {Object.keys(item.namedGroups).length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {Object.entries(item.namedGroups).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] dark:bg-white/10">
                              {key}
                            </span>
                            <span className="text-xs text-slate-600 dark:text-slate-200">
                              {value || "(空)"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
