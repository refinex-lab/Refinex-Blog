import { useEffect, useMemo, useRef, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import { JSONPath } from "jsonpath-plus";
import jsonToTS from "json-to-ts";
import YAML from "yaml";
import { XMLBuilder } from "fast-xml-parser";
import { AlertTriangle, Braces, Copy, Download, Trash2 } from "lucide-react";

const MODES = [
  { id: "format", label: "格式化 JSON", language: "json" },
  { id: "minify", label: "压缩 JSON", language: "json" },
  { id: "ts", label: "JSON → TypeScript", language: "typescript" },
  { id: "java", label: "JSON → Java", language: "java" },
  { id: "yaml", label: "JSON → YAML", language: "yaml" },
  { id: "xml", label: "JSON → XML", language: "xml" },
  { id: "jsonpath", label: "JSONPath 查询", language: "json" },
] as const;

type ModeId = (typeof MODES)[number]["id"];

type JavaField = {
  name: string;
  type: string;
};

type JavaClass = {
  name: string;
  fields: JavaField[];
};

const DEFAULT_JSON = `{
  "name": "Refinex Blog",
  "version": 1,
  "owner": {
    "name": "Refinex",
    "active": true,
    "tags": ["dev", "architecture"]
  },
  "tools": [
    {
      "id": "json",
      "title": "JSON 格式化",
      "enabled": true
    },
    {
      "id": "diff",
      "title": "文本对比",
      "enabled": false
    }
  ]
}`;

const DEFAULT_JSONPATH = "$.tools[*].title";

const JAVA_KEYWORDS = new Set([
  "abstract",
  "assert",
  "boolean",
  "break",
  "byte",
  "case",
  "catch",
  "char",
  "class",
  "const",
  "continue",
  "default",
  "do",
  "double",
  "else",
  "enum",
  "extends",
  "final",
  "finally",
  "float",
  "for",
  "goto",
  "if",
  "implements",
  "import",
  "instanceof",
  "int",
  "interface",
  "long",
  "native",
  "new",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "short",
  "static",
  "strictfp",
  "super",
  "switch",
  "synchronized",
  "this",
  "throw",
  "throws",
  "transient",
  "try",
  "void",
  "volatile",
  "while",
]);

const toPascalCase = (value: string) => {
  const cleaned = value.replace(/[^a-zA-Z0-9]+/g, " ").trim();
  if (!cleaned) return "AutoClass";
  const parts = cleaned.split(/\s+/g);
  const result = parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  if (/^\d/.test(result)) return `Class${result}`;
  return result;
};

const toCamelCase = (value: string) => {
  const cleaned = value.replace(/[^a-zA-Z0-9]+/g, " ").trim();
  if (!cleaned) return "field";
  const parts = cleaned.split(/\s+/g);
  const result = parts
    .map((part, index) =>
      index === 0
        ? part.charAt(0).toLowerCase() + part.slice(1)
        : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join("");
  if (/^\d/.test(result)) return `field${result}`;
  if (JAVA_KEYWORDS.has(result)) return `${result}Value`;
  return result;
};

const singularize = (value: string) => {
  if (value.endsWith("ies")) return `${value.slice(0, -3)}y`;
  if (value.endsWith("ses")) return value.slice(0, -2);
  if (value.endsWith("s") && value.length > 1) return value.slice(0, -1);
  return value;
};

const buildJavaClasses = (data: unknown) => {
  const classes = new Map<string, JavaClass>();
  const order: string[] = [];
  let usesList = false;

  const addClass = (name: string, value: unknown) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return;
    if (classes.has(name)) return;

    const entries = Object.entries(value as Record<string, unknown>);
    const fields: JavaField[] = entries.map(([key, fieldValue]) => {
      const fieldName = toCamelCase(key);
      const fieldType = inferType(fieldValue, key);
      return { name: fieldName, type: fieldType };
    });

    classes.set(name, { name, fields });
    order.push(name);

    entries.forEach(([key, fieldValue]) => {
      if (fieldValue && typeof fieldValue === "object") {
        if (Array.isArray(fieldValue)) {
          const sample = fieldValue.find((item) => item && typeof item === "object");
          if (sample && typeof sample === "object" && !Array.isArray(sample)) {
            addClass(toPascalCase(singularize(key)), sample);
          }
        } else {
          addClass(toPascalCase(key), fieldValue);
        }
      }
    });
  };

  const inferType = (value: unknown, key: string): string => {
    if (value === null || value === undefined) return "Object";
    if (Array.isArray(value)) {
      usesList = true;
      const sample = value.find((item) => item !== null && item !== undefined);
      if (!sample) return "List<Object>";
      const itemType = inferType(sample, singularize(key));
      return `List<${itemType}>`;
    }
    if (typeof value === "object") {
      const className = toPascalCase(key);
      addClass(className, value);
      return className;
    }
    if (typeof value === "string") return "String";
    if (typeof value === "number") return Number.isInteger(value) ? "Long" : "Double";
    if (typeof value === "boolean") return "Boolean";
    return "Object";
  };

  const normalizedRoot =
    data && typeof data === "object" && !Array.isArray(data)
      ? data
      : { value: data };

  addClass("RootObject", normalizedRoot);

  const lines: string[] = [];
  if (usesList) {
    lines.push("import java.util.List;", "");
  }

  order.forEach((className, index) => {
    const cls = classes.get(className);
    if (!cls) return;
    lines.push(`public class ${cls.name} {`);
    cls.fields.forEach((field) => {
      lines.push(`  private ${field.type} ${field.name};`);
    });
    lines.push("}");
    if (index < order.length - 1) {
      lines.push("");
    }
  });

  return lines.join("\n").trim();
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

const OUTPUT_EDITOR_OPTIONS = {
  ...editorOptions,
  readOnly: true,
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

const fileNameByMode = (mode: ModeId) => {
  switch (mode) {
    case "ts":
      return "output.ts";
    case "java":
      return "Output.java";
    case "yaml":
      return "output.yml";
    case "xml":
      return "output.xml";
    case "jsonpath":
      return "output.json";
    case "minify":
    case "format":
    default:
      return "output.json";
  }
};

export const JsonToolPage = () => {
  const [mode, setMode] = useState<ModeId>("format");
  const [input, setInput] = useState(DEFAULT_JSON);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [jsonPath, setJsonPath] = useState(DEFAULT_JSONPATH);
  const [autoFormat, setAutoFormat] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [monacoTheme, setMonacoTheme] = useState<"vs" | "vs-dark">(() => {
    if (typeof document === "undefined") return "vs-dark";
    return document.documentElement.classList.contains("dark") ? "vs-dark" : "vs";
  });
  const noticeTimerRef = useRef<number | null>(null);

  const activeMode = useMemo(() => MODES.find((item) => item.id === mode), [mode]);

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

  const handleCopyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      flashNotice("已复制输出");
    } catch {
      flashNotice("复制失败");
    }
  };

  const handleDownloadOutput = () => {
    if (!output) return;
    downloadText(output, fileNameByMode(mode));
    flashNotice("已下载输出");
  };

  const handleClearInput = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  useEffect(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(trimmed);
      let result = "";

      switch (mode) {
        case "format":
          result = JSON.stringify(parsed, null, 2);
          break;
        case "minify":
          result = JSON.stringify(parsed);
          break;
        case "ts":
          result = jsonToTS(parsed, { rootName: "RootObject" }).join("\n\n");
          break;
        case "java":
          result = buildJavaClasses(parsed);
          break;
        case "yaml":
          result = YAML.stringify(parsed);
          break;
        case "xml": {
          const builder = new XMLBuilder({
            ignoreAttributes: false,
            format: true,
            suppressEmptyNode: true,
          });
          result = builder.build({ root: parsed });
          break;
        }
        case "jsonpath": {
          if (!jsonPath.trim()) {
            throw new Error("JSONPath 不能为空");
          }
          const data = JSONPath({ path: jsonPath, json: parsed });
          result = JSON.stringify(data, null, 2);
          break;
        }
        default:
          result = JSON.stringify(parsed, null, 2);
      }

      if (autoFormat && mode === "format") {
        setInput(result);
      }
      setOutput(result);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "JSON 解析失败";
      setError(message);
      setOutput("");
    }
  }, [input, mode, jsonPath, autoFormat]);

  return (
    <div className="flex h-[calc(100vh-72px)] w-full flex-col gap-4 px-4 py-4">
      <section className="flex flex-col gap-3 rounded-[20px] border border-black/5 bg-white/80 p-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/5 text-slate-700 dark:bg-white/10 dark:text-white">
              <Braces className="h-5 w-5" />
            </div>
            <div className="text-base font-semibold text-slate-900 dark:text-white">
              JSON 格式化与转换
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex flex-wrap gap-1 rounded-xl border border-black/10 bg-white/70 p-1 text-xs dark:border-white/10 dark:bg-zinc-950/40">
              {MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-semibold transition ${
                    mode === item.id
                      ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-950 dark:text-white"
                      : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleCopyOutput}
                className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
              >
                <Copy className="h-3.5 w-3.5" />
                复制输出
              </button>
              <button
                type="button"
                onClick={handleDownloadOutput}
                className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
              >
                <Download className="h-3.5 w-3.5" />
                下载文件
              </button>
              <button
                type="button"
                onClick={handleClearInput}
                className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/70 px-3 py-1 font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:border-white/30"
              >
                <Trash2 className="h-3.5 w-3.5" />
                清空输入
              </button>
              {notice ? (
                <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-white/10 dark:bg-white/10 dark:text-slate-300">
                  {notice}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {mode === "jsonpath" ? (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-300">
              JSONPath 查询
            </label>
            <input
              value={jsonPath}
              onChange={(event) => setJsonPath(event.target.value)}
              className="h-10 w-full rounded-2xl border border-black/10 bg-white/80 px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-200 dark:focus:border-slate-500 dark:focus:ring-slate-600"
            />
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-300">
          {mode === "xml" ? (
            <span className="text-[11px] text-slate-400">
              XML 输出会默认包裹 root 节点
            </span>
          ) : (
            <span />
          )}
          <label className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 dark:border-white/10 dark:bg-white/10">
            <input
              type="checkbox"
              checked={autoFormat}
              onChange={(event) => setAutoFormat(event.target.checked)}
              className="h-3.5 w-3.5"
            />
            自动格式化输入
          </label>
        </div>
      </section>

      <section className="grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
        <div className="flex min-h-0 flex-col rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-300">
            <span>输入</span>
            <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10">JSON</span>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <MonacoEditor
              value={input}
              onChange={(value) => setInput(value ?? "")}
              height="100%"
              language="json"
              theme={monacoTheme}
              options={editorOptions}
              className="json-tool-editor"
            />
          </div>
          {error ? (
            <div className="flex items-center gap-2 border-t border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-200">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-col rounded-2xl border border-black/5 bg-white/80 shadow-sm dark:border-white/10 dark:bg-slate-950/50">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-2 text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-300">
            <span>输出</span>
            <span className="rounded-full bg-black/5 px-2 py-1 dark:bg-white/10">
              {activeMode?.language ?? "text"}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <MonacoEditor
              value={output}
              height="100%"
              language={activeMode?.language ?? "text"}
              theme={monacoTheme}
              options={OUTPUT_EDITOR_OPTIONS}
              className="json-tool-editor"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
